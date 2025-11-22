# StockMaster Pro - Inventory Management System

Complete inventory management system with real-time stock tracking, multi-warehouse support, and document workflow management.

## Tech Stack

### Backend
- Node.js 20 + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- Redis
- JWT Authentication

### Frontend
- React 18 + TypeScript
- Redux Toolkit + RTK Query
- React Router v6
- Vite

## Quick Start

### Using Docker (Recommended)

```bash
# Clone repository
git clone <repository-url>
cd stockmaster-pro

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit .env files with your configuration

# Start all services
docker-compose up -d --build

# Run migrations and seed
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed

# Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# API Docs: http://localhost:5000/api-docs
```

### Manual Setup

#### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env file
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

#### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env file
npm run dev
```

## Default Login Credentials

- **Admin**: admin@stockmaster.com / Admin123!
- **Manager**: manager@stockmaster.com / Admin123!

## Documentation

See `docs/StockMaster-Complete-Architecture.pdf` for complete technical documentation.

## Features

- ✅ Multi-user authentication with role-based access
- ✅ Product management with categories
- ✅ Multi-warehouse inventory tracking
- ✅ Receipt, Delivery, Transfer, Adjustment workflows
- ✅ Stock reservation system
- ✅ Real-time KPI dashboard
- ✅ Low stock alerts
- ✅ Complete audit trail
- ✅ Stock movement history

## License

MIT
