import jwt from 'jsonwebtoken';
import { env } from '../config/environment';
import { AuthenticationError } from './error.util';

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET as any, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  } as any);
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET as any, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  } as any);
};

export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET as any) as JWTPayload;
  } catch (error) {
    throw new AuthenticationError('Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET as any) as JWTPayload;
  } catch (error) {
    throw new AuthenticationError('Invalid or expired refresh token');
  }
};
