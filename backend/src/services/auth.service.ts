import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/hash.util';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util';
import { AuthenticationError, ConflictError } from '../utils/error.util';
import redis from '../config/redis';

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
  }) {
    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await prisma.users.create({
      data: {
        email: data.email,
        password_hash: passwordHash,
        first_name: data.firstName,
        last_name: data.lastName,
        role: data.role || 'staff',
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        is_active: true,
        created_at: true,
      },
    });

    return user;
  }

  async login(email: string, password: string) {
    // Find user
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user || !user.is_active) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Update last login
    await prisma.users.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    // Generate tokens
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);

    // Verify user still exists and is active
    const user = await prisma.users.findUnique({
      where: { id: payload.id },
    });

    if (!user || !user.is_active) {
      throw new AuthenticationError('User not found or inactive');
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return { accessToken: newAccessToken };
  }

  // Request password reset: generate OTP and store in Redis (10 minutes)
  async requestPasswordReset(email: string) {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      // Do not reveal user existence
      return { ok: true };
    }

    const otp = generateOTP();
    const key = `pwdreset:${email}`;
    // store OTP with TTL 10 minutes
    await redis.set(key, otp, 'EX', 600);

    // In production: send OTP via email/SMS. For dev, return otp so frontend/dev can show it.
    return { ok: true, otp };
  }

  async resetPasswordWithOTP(email: string, otp: string, newPassword: string) {
    const key = `pwdreset:${email}`;
    const stored = await redis.get(key);
    if (!stored || stored !== otp) {
      throw new AuthenticationError('Invalid or expired OTP');
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    const hashed = await hashPassword(newPassword);
    await prisma.users.update({ where: { id: user.id }, data: { password_hash: hashed } });
    await redis.del(key);

    return { ok: true };
  }
}
