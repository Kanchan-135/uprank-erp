# Uprank ERP - Unified Multi-Tenant School Management Platform

A production-ready, full-stack School Enterprise Resource Planning (ERP) platform built with **Next.js 14**, **Tailwind CSS**, **Prisma ORM**, and **SQLite / PostgreSQL**.

The system provides dedicated portals, granular access control, and complete workflows for **5 distinct personas**:
1. 🛡️ **Super Admin**: Multi-tenant institutional management, tenant provisioning wizard, global analytics, and security audit trail.
2. 🏛️ **School Admin**: Institution configuration, student admissions & guardian mapping, faculty management, fee heads & collection reconciliation, timetable scheduling, and campus-wide circulars.
3. 👩‍🏫 **Teacher / Faculty**: Classroom attendance roll call (with bulk mark & date selection), digital gradebook with automated letter-grade calculation, assignment distribution, and personal schedule.
4. 🎓 **Student**: Personalized lecture timetable, attendance progress meter, exam report card with printable transcripts, fee status & payment receipts, and homework submission.
5. 👨‍👩‍👦 **Parent / Guardian**: Multi-child switcher, real-time ward attendance monitor, digital fee settlement portal with simulated instant online payment & verifiable receipt generation, and absence leave request tracking.

---

## 🔐 Initial Institutional Accounts

The database comes pre-seeded with realistic school data, classes, subjects, exam results, fee invoices, attendance logs, and timetables.

Users log in securely using their institutional email address and assigned password (`password123`):

| Role | Name | Email Address | Assigned Portal |
| :--- | :--- | :--- | :--- |
| **Super Admin** | Arthur Pendleton | `superadmin@erp.com` | `/super-admin/dashboard` |
| **School Admin** | Dr. Jonathan Vance | `admin@greenwood.edu` | `/admin/dashboard` |
| **Teacher** | Sarah Jenkins | `sarah.jenkins@greenwood.edu` | `/teacher/dashboard` |
| **Student** | Alex Morgan | `alex.morgan@greenwood.edu` | `/student/dashboard` |
| **Parent** | Robert Morgan | `robert.morgan@greenwood.edu` | `/parent/dashboard` |

> 🔒 **Enterprise RBAC Lockdown**: All routes are guarded at the server edge by `src/middleware.ts`. Each user account is strictly restricted to its assigned portal. Cross-role access attempts and unauthenticated visits are blocked and automatically redirected.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node 20)
- npm or yarn

### 2. Installation & Setup
```bash
# Clone or navigate to the repository
cd School-erp

# Install dependencies
npm install

# Initialize Database & Run Migrations
npx prisma db push

# Seed realistic demonstration data
npm run db:seed
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Deployment

The application includes an optimized multi-stage `Dockerfile` and `docker-compose.yml` for 1-command containerized deployment:

```bash
# Build and run the container
docker compose up -d --build
```
The application will be accessible at `http://localhost:3000`.

---

## 🏗️ Architecture & Technology Stack

- **Frontend & Routing**: Next.js 14 (App Router), React 18, Tailwind CSS, Lucide React Icons.
- **Backend**: Next.js Server Components, Server Actions, REST API Handlers.
- **Database & ORM**: Prisma ORM with SQLite (zero-config local storage), easily switchable to PostgreSQL via `DATABASE_URL` in `.env`.
- **Security & RBAC**: JWT session verification (`jsonwebtoken`), password hashing (`bcryptjs`), HTTP-only cookies, role-based route middleware guards.
- **Documents & Printing**: Dedicated CSS print stylesheets for official institution Report Cards and Fee Receipts with institutional branding.

---

## 📂 Project Structure

```
School-erp/
├── prisma/
│   ├── schema.prisma        # Complete database schema (25 models)
│   └── seed.ts              # Rich seed script with all 5 role personas
├── public/                  # Static assets
├── src/
│   ├── app/
│   │   ├── api/             # REST API endpoints for all roles
│   │   │   ├── auth/        # Login, logout, session check, demo login
│   │   │   ├── super-admin/ # Multi-tenant overview, schools CRUD, audit logs
│   │   │   ├── admin/       # Students, teachers, academics, fees, timetable, notices
│   │   │   ├── teacher/     # Attendance roll call, gradebook, assignments, timetable
│   │   │   ├── student/     # Daily schedule, attendance %, grades, fees, tasks
│   │   │   └── parent/      # Multi-child ward stats, online fee pay, leave requests
│   │   ├── super-admin/     # Super Admin portal pages
│   │   ├── admin/           # School Admin portal pages
│   │   ├── teacher/         # Teacher portal pages
│   │   ├── student/         # Student portal pages
│   │   ├── parent/          # Parent portal pages
│   │   ├── login/           # SaaS login page with 1-click role buttons
│   │   └── globals.css      # Design system variables & print styles
│   ├── components/
│   │   ├── layout/          # Dynamic Sidebar, Header with Role Switcher, DashboardLayout
│   │   ├── common/          # StatsCard, badges, modals
│   │   └── reports/         # Printable Report Card & Printable Fee Receipt
│   ├── context/
│   │   └── AuthContext.tsx  # Global auth state & instant role switching
│   ├── lib/
│   │   ├── prisma.ts        # Prisma client singleton
│   │   ├── auth.ts          # JWT & bcrypt utilities
│   │   └── utils.ts         # Formatting currency, dates, letter grades
│   └── types/               # TypeScript interfaces
├── Dockerfile               # Multi-stage production container build
├── docker-compose.yml       # Production docker-compose configuration
└── package.json
```

---

## 📜 License
This project is licensed under the MIT License.
