## 🔐 RBAC Dynamic Permission System

A full-stack Role-Based Access Control system with dynamic, granular permissions. 

### 🌐 Live Demo: [http://204.197.173.139:3001](http://204.197.173.139:3001)

---

## 🔑 Login Credentials

| Role | Email | Password |
|:---|:---|:---|
| **Super Admin** | `superadmin@tayebur.com` | `superadmin123` |
| **Manager** | `tayeb.bd.personal.10@gmail.com` | `1qaz2wsx` |
| **Agent** | `tayeb.bd.personal@gmail.com` | `1qaz2wsx` |
| **Customer** | `tayeb.customer@gmail.com` | `1qaz2wsx` |

> Super Admin has full access to all features. Manager has role-based limited access (configurable by Super Admin).

---
 
## 🛠 Tech Stack

| Frontend | Backend |
|:---|:---|
| Next.js 16 (App Router) | Node.js + Express |
| TypeScript | TypeScript |
| Tailwind CSS v4 + shadcn/ui | MongoDB + Mongoose |
| Redux Toolkit | Redis (ioredis) |
| React Hook Form + Zod | JWT + bcrypt |
| Recharts | Socket.IO, Multer, Nodemailer |
| Axios + Socket.IO Client | Winston Logger, PDFKit |

---

## 📁 Project Structure

```
RBAC_Dynamic_Permission_System/
├── client/                       # Next.js 16 Frontend
│   └── src/
│       ├── app/
│       │   ├── (dashboard)/      # Protected pages (dashboard, leads, orders, tasks, etc.)
│       │   ├── auth/             # Login, Register, Forgot Password
│       │   └── 403/              # Forbidden page
│       ├── components/           # UI components, layout (Header, Sidebar), RequirePermission
│       ├── hooks/                # usePermission, useInfiniteQuery, useSmartFilter
│       ├── lib/                  # API client, fetcher, utilities
│       ├── store/                # Redux store + authSlice
│       ├── schemas/              # Zod validation schemas
│       └── types/                # TypeScript types
│
├── server/                       # Express Backend
│   └── src/
│       ├── app/
│       │   ├── middlewares/      # auth, requirePermission, globalErrorHandler, validateRequest
│       │   ├── modules/          # auth, users, leads, orders, tasks, tickets, reports,
│       │   │                     # permissions, user-permissions, audit-logs, admin, cache, export
│       │   └── routes/           # Route aggregator
│       ├── config/               # Environment config
│       ├── seeds/                # Super Admin auto-seeder
│       ├── socket/               # Socket.IO handlers
│       └── server.ts             # Entry point
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 16 — [nodejs.org](https://nodejs.org/)
- **MongoDB** — [mongodb.com](https://www.mongodb.com/) (or MongoDB Atlas)
- **Redis** — [redis.io](https://redis.io/)

### 1. Clone the Repository

```bash
git clone https://github.com/TayeburRahman/RBAC_Dynamic_Permission_System.git
cd RBAC_Dynamic_Permission_System
```

### 2. Setup Server

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URL, Redis URL, and other configs
npm run dev                # Starts on http://localhost:5000
```

### 3. Setup Client

```bash
cd client
npm install
cp .env.example .env
# Edit .env if needed (defaults work for local dev)
npm run dev                # Starts on http://localhost:3000
```

---

## 🔧 Environment Variables

### Server (`server/.env`)

```env
APP_NAME=RBAC Dynamic Permission System
PORT=5000
BASE_URL=0.0.0.0
NODE_DEV=development

# Database
MONGO_URL=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/rbac_dynamic_permission_system
REDIS_URL=redis://localhost:6379

# Auth
BCRYPT_SALT_ROUNDS=12
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=30d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=365d
ACTIVATION_SECRET=your-activation-secret

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SERVICE=gmail
SMTP_MAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Stripe
STRIPE_SECRET_KEY=your-stripe-key

# Super Admin (auto-created on first run)
SUPER_ADMIN_EMAIL=superadmin@tayebur.com
SUPER_ADMIN_PASSWORD=superadmin123
SUPER_ADMIN_NAME=Super Admin
SUPER_ADMIN_PHONE=+971555555555
```

### Client (`client/.env`)

```env
NEXT_PUBLIC_BASE_API=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 👥 User Roles

| Role | Description |
|:---|:---|
| **SUPER_ADMIN** | Full system access — all permissions auto-synced |
| **ADMIN** | Administrative access, configurable by Super Admin |
| **MANAGER** | Team & operations oversight, configurable permissions |
| **AGENT** | Handles leads, tasks, tickets — configurable permissions |
| **CUSTOMER** | Customer portal — limited to own data |

---

## 📝 License

ISC License

---

<p align="center">Built with ❤️ by <a href="https://github.com/TayeburRahman">Tayebur Rahman</a></p>