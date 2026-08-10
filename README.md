# Multi-Tenant Manufacturing SaaS ERP

A full-stack, enterprise-grade multi-tenant SaaS ERP system for manufacturing & industrial enterprises featuring multi-tenant data isolation, role-based dashboards (20+ RBAC roles), end-to-end manufacturing workflows (BOM, Production Orders, Machinery Maintenance, QR Code tracking), HRMS, automated payroll processing, GST-compliant invoicing, CRM, and AI predictive analytics.

## What’s included
- **Authentication & RBAC**: Role-based access control across 20+ specialized roles (Super Admin, Company Admin, Department Managers, Operational Employees).
- **Multi-Tenant Architecture**: Complete tenant data segregation using indexed `tenantId` schemas, custom subscription tiers, and plan usage enforcement.
- **Manufacturing & Operations**: Multi-level Bill of Materials (BOM), Production Order lifecycles, Machine uptime/calibration logs, and QR Code scanning logs.
- **Inventory & Multi-Warehouse**: Multi-warehouse allocation, SKU management with reorder thresholds, Goods Receipt Notes (GRN), and stock transaction audit trails.
- **HRMS & Automated Payroll**: Employee directory, Shift assignments, Attendance tracking, Comp-Off credits, Leave approvals, Loans/Advances, and monthly automated payroll batch processing.
- **CRM & Sales Pipeline**: Stage-based lead management, Opportunity & Quotation engine with automated tax calculation, and direct Sales Order generation.
- **Finance & GST Billing**: GST-compliant invoicing (CGST, SGST, IGST), Credit/Debit notes, and multi-tenant subscription invoice management.
- **AI Insights & Predictive Analytics**: Server-side AI model services for inventory demand forecasting and machinery predictive maintenance failure risk assessment.
- **Security & Performance**: Hardened Express API with CSP anti-clickjacking headers, HTTP-only JWT cookies, dynamic CORS reflection, and auto-seeding utilities.

## Tech stack
- **Frontend**: React 18, Vite, Redux Toolkit (RTK), React Router v6, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express.js (ES Modules), Mongoose ODM, JWT Authentication, Nodemailer
- **Database**: MongoDB (Multi-Tenant Mongoose Schemas)
- **AI & Analytics**: Server-side AI prediction service layer (Demand Forecasting & Machinery Predictive Maintenance)
- **Billing & Security**: Express Security Middlewares (CSP, CORS, HTTP-only JWT) & GST Engine

## Project structure
```
Saas ERP/
├── Backend/                  # Express API server and services
│   ├── src/
│   │   ├── config/          # Database connection and environment configurations
│   │   ├── controllers/     # Business logic handlers (Auth, HRMS, Manufacturing, CRM, AI, etc.)
│   │   ├── middleware/      # Auth, RBAC, tenant isolation, security headers
│   │   ├── models/          # 40+ Mongoose schemas with tenantId indexing
│   │   ├── routes/          # Express API route modules
│   │   ├── utils/           # Auto-seeding utilities & helper functions
│   │   └── server.js        # Express application entry point & health check
│   ├── .env                 # Environment variables
│   └── package.json
├── Frontend/                 # React 18 SPA client
│   ├── src/
│   │   ├── components/      # Reusable UI components, navigation, layouts
│   │   ├── pages/           # Module views (HRMS, Payroll, Manufacturing, CRM, Billing, AI)
│   │   ├── store/           # Redux Toolkit store and state slices
│   │   ├── App.jsx          # Route definitions & app routing logic
│   │   └── main.jsx         # Vite client entry point
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md                 # System documentation
```

## Getting started

### Prerequisites
- **Node.js**: 18+
- **MongoDB**: Running locally or reachable via URI (e.g., MongoDB Atlas)

### Local development

1. **Install dependencies**:
   For the backend:
   ```bash
   cd Backend
   npm install
   ```
   For the frontend:
   ```bash
   cd Frontend
   npm install
   ```

2. **Configure environment file**:
   Ensure `Backend/.env` is configured with your database, JWT, and server values.

3. **(Optional) Seed initial demo data**:
   ```bash
   cd Backend
   npm run seed
   ```

4. **Start the applications**:
   - Run the backend API server:
     ```bash
     cd Backend
     npm run dev
     ```
   - Run the frontend Vite client:
     ```bash
     cd Frontend
     npm run dev
     ```

The default local URLs are:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Backend Health Check**: http://localhost:5000/api/health

## Useful scripts

### Backend (`Backend/`)
- `npm run dev` — start the backend API server in development mode with Nodemon auto-reload
- `npm run start` — run the backend server in production mode
- `npm run seed` — seed initial enterprise, HRMS, manufacturing, and user data

### Frontend (`Frontend/`)
- `npm run dev` — start the Vite frontend development server
- `npm run build` — compile and build the frontend bundle for production
- `npm run preview` — preview the production build locally

## Environment notes
The backend server expects configuration values in `Backend/.env` such as:
- `MONGODB_URI` — MongoDB connection string
- `PORT` — API server port (default: 5000)
- `JWT_SECRET` — Secret key for signing JSON Web Tokens
- `JWT_EXPIRE` — Token expiry duration (e.g. `7d`)
- `CLIENT_URL` — Allowed client origin URL for CORS (default: `http://localhost:5173`)
- `EMAIL_HOST` — SMTP email host for user invitations & alerts
- `EMAIL_PORT` — SMTP server port
- `EMAIL_USER` — SMTP authentication username
- `EMAIL_PASS` — SMTP authentication password

## Current status
The current implementation includes the core multi-tenant ERP workflows, HRMS, Payroll, Manufacturing, GST Billing, CRM, and AI predictive analytics. The app has been verified locally with a successful frontend build and a healthy backend health check response from `/api/health`.
