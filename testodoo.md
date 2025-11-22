# StockMaster Pro 📦 
### The Modern Inventory Management System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-v20-green.svg)
![React](https://img.shields.io/badge/react-v18-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)

**StockMaster Pro** is a modular, double-entry inventory management system designed to digitize and streamline stock operations. Unlike simple counters, StockMaster uses a **transactional stock ledger** to ensure full traceability of every item that enters or leaves the warehouse.

---

## 📸 Screenshots

| Dashboard Overview | Stock Moves Ledger |
|:------------------:|:------------------:|
| ![Dashboard Screenshot](https://via.placeholder.com/600x300?text=Dashboard+Snapshot) | ![Ledger Screenshot](https://via.placeholder.com/600x300?text=Stock+Ledger+View) |

---

## 🚀 Features

### 🏭 Core Operations
- **Double-Entry Ledger:** Every stock change is recorded as a move from Source → Destination.
- **Multi-Warehouse:** Manage stock across multiple physical locations and virtual zones (e.g., "Scrap", "Vendor").
- **Workflow Management:**
    - **Receipts:** Vendor → Warehouse
    - **Deliveries:** Warehouse → Customer
    - **Internal Transfers:** Rack A → Rack B

### 📊 Intelligence & Analytics
- **Real-time Dashboard:** Track Total Stock, Low Stock Alerts, and Pending Operations.
- **Smart Filters:** Filter by Document Type, Status (Draft/Done), or Category.
- **Audit Trail:** Complete history of who moved what and when.

### 🔐 Security & Tech
- **Role-Based Access Control (RBAC):** Separate views for Admins, Managers, and Warehouse Staff.
- **JWT Authentication:** Secure session management with Redis.

---

## 🛠 Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18 + TypeScript | Built with Vite for speed; uses RTK Query for caching. |
| **State** | Redux Toolkit | Manages global UI state and data fetching. |
| **Backend** | Node.js + Express | RESTful API architecture. |
| **Database** | PostgreSQL + Prisma | Relational data integrity with type-safe ORM. |
| **Caching** | Redis | Used for session storage and high-speed caching. |
| **DevOps** | Docker | Containerized environment for easy deployment. |

---

## ⚡ Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js v20+ (if running manually)

### Option 1: Using Docker (Recommended) 🐳

Get the entire stack (Frontend + Backend + DB + Redis) running in one command.

```bash
# 1. Clone repository
git clone [https://github.com/your-username/stockmaster-pro.git](https://github.com/your-username/stockmaster-pro.git)
cd stockmaster-pro

# 2. Setup Environment Variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Start Services
docker-compose up -d --build

# 4. Run Database Migrations & Seed Data
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed
```

**Access the App:**
- 🖥️ **Frontend:** [http://localhost:3000](http://localhost:3000)
- 🔌 **API:** [http://localhost:5000](http://localhost:5000)
- 📖 **Swagger Documentation:** [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

### Option 2: Manual Setup 🛠️

<details>
<summary>Click to view Manual Setup Instructions</summary>

#### Backend
```bash
cd backend
npm install
cp .env.example .env
# Ensure your local PostgreSQL is running and credentials are in .env
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
</details>

---

## 📂 Project Structure

```bash
stockmaster-pro/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Route logic
│   │   ├── services/      # Business logic (Stock Moves, Calculations)
│   │   ├── prisma/        # Database Schema & Seeds
│   │   └── routes/        # API Definitions
├── frontend/
│   ├── src/
│   │   ├── features/      # Slices: Auth, Inventory, Operations
│   │   ├── components/    # Reusable UI components
│   │   └── pages/         # Application Views
├── docker-compose.yml
└── README.md
```

---

## 🔑 Default Login Credentials

To test the Role-Based Access Control, use these seeded accounts:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@stockmaster.com` | `Admin123!` | Full Access (Settings, Users, Inventory) |
| **Manager** | `manager@stockmaster.com` | `Admin123!` | Operations & Reports Only |

---

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.