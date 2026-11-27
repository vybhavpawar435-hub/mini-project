# 🩸 HemoSync – Blood Bank & Donor Slot Management System

> A full-stack blood bank management system built as a college mini-project, integrating four core Computer Science concepts: **Operating Systems**, **Data Structures & Algorithms**, **Database Management Systems**, and **Web Development**.

---

## 📌 Project Overview

HemoSync is a web-based platform that manages:
- Donor registration and appointment scheduling
- Blood group compatibility matching
- Blood inventory and hospital request management
- Role-based dashboards for Admin, Staff, Donor, and Requester

---

## 🧩 System Architecture – 4 Engines

| Engine | Concept | Technology | Port |
|--------|---------|------------|------|
| **OS Scheduler** | Donor slot scheduling using FCFS, Priority & Round Robin algorithms with Semaphore-based concurrency | C++ (custom HTTP server) | 5001 |
| **DSA Compatibility** | Blood group compatibility matching using a Directed Graph | C++ (custom HTTP server) | 5002 |
| **DBMS** | Blood inventory, appointment, and request management with ACID transactions | MySQL / MariaDB | 3306 |
| **WEB** | Full-stack dashboard with role-based authentication | React + Node.js/Express | 5173 / 3000 |

---

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons  
**Backend:** Node.js, Express.js, mysql2, JWT Authentication  
**Database:** MySQL / MariaDB (via XAMPP)  
**C++ Engines:** MinGW g++, Winsock2 (Windows HTTP servers)

---

## 👥 User Roles

| Role | Access |
|------|--------|
| **Admin** | Full system access — manage users, inventory, hospital requests, OS scheduler |
| **Staff** | View & manage donor appointments, record donations |
| **Donor** | Book donation slots, view history |
| **Requester** | Submit hospital blood requests, check compatibility |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [XAMPP](https://www.apachefriends.org/) (for MySQL)
- Windows OS (C++ engines use Winsock2)

### 1. Clone the repository
```bash
git clone https://github.com/vybhavpawar435-hub/mini-project.git
cd mini-project
```

### 2. Set up the database
1. Start XAMPP and launch MySQL
2. Open phpMyAdmin → Create database: `blood_bank_system`
3. Import the schema: `database/schema.sql`
4. Import seed data: `database/seeds.sql`

### 3. Configure backend environment
```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials and JWT secret
```

### 4. Install dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 5. Start all services

**Option A – All at once (Windows)**
```powershell
# From project root (PowerShell)
.\run-all.ps1
```

**Option B – Manually**
```powershell
# Terminal 1 – MySQL (via XAMPP dashboard or:)
& "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone

# Terminal 2 – OS Scheduler Engine
& ".\engines\os-scheduler\scheduler_engine.exe" 5001

# Terminal 3 – DSA Compatibility Engine
& ".\engines\dsa-compatibility\compatibility_engine.exe" 5002

# Terminal 4 – Backend API
cd backend; node src/server.js

# Terminal 5 – Frontend
cd frontend; npm run dev
```

### 6. Open in browser
```
http://localhost:5173
```

---

## 🔐 Default Credentials (Development Only)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hemosync.com | admin123 |
| Staff | staff@hemosync.com | staff123 |
| Donor | donor@hemosync.com | donor123 |

> ⚠️ Change these credentials before any production use.

---

## 📂 Project Structure

```
blood-bank-system/
├── backend/                  # Node.js / Express API
│   ├── src/
│   │   ├── routes/           # auth, requests, inventory, scheduler, compatibility
│   │   ├── middleware/       # JWT auth, role-based access control
│   │   └── utils/            # db pool, audit logger
│   ├── .env.example
│   └── package.json
│
├── frontend/                 # React + Vite SPA
│   ├── src/
│   │   ├── pages/            # AdminDashboard, StaffDashboard, DonorDashboard, ...
│   │   ├── components/       # Navbar, Sidebar, StatusBadge, SchedulerVisualizer
│   │   ├── context/          # AuthContext (JWT)
│   │   └── services/         # axios API client
│   └── package.json
│
├── engines/
│   ├── os-scheduler/         # C++ FCFS/Priority/RoundRobin + Semaphore engine
│   └── dsa-compatibility/    # C++ Directed Graph blood compatibility engine
│
├── database/                 # SQL schema and seed files
├── docs/                     # Engine workflow documentation
├── run-all.ps1               # One-click startup script
└── README.md
```

---

## ✨ Key Features

- ✅ Secure JWT-based login with role-based access control
- ✅ Hospital blood request workflow: **Pending → Approved → Fulfilled**
- ✅ FIFO-based blood inventory deduction (by expiry date)
- ✅ DSA compatibility matching (allocates compatible donor groups, not just exact match)
- ✅ OS Scheduling simulation (FCFS, Priority, Round Robin) with semaphore concurrency
- ✅ Real-time slot capacity tracking
- ✅ Audit trail for all critical actions
- ✅ Responsive design (desktop & mobile)

---

## 📄 Documentation

Detailed workflow explanations for each engine are in the `docs/` folder:
- `ENGINE_01_OS_SCHEDULER.txt`
- `ENGINE_02_DSA_COMPATIBILITY.txt`
- `ENGINE_03_DBMS_INVENTORY.txt`
- `ENGINE_04_WEB_DASHBOARD.txt`

---

## 👨‍💻 Team

> Mini-project submitted for academic evaluation.

---

## 📝 License

This project is for educational purposes only.
