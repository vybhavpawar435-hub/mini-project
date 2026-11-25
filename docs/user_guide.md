# HemoSync — Blood Bank & Donor Slot Management System
## Complete Interactive User Guide & Demonstration Manual

---

### System Status & Access

All 5 core microservices are live and healthy:

| Component | Port | Technology | Purpose | Status |
|---|---|---|---|---|
| **Frontend Web UI** | `5173` | React 18, Vite, Tailwind CSS | Control & Request Dashboard | **ONLINE** |
| **Backend API** | `3000` | Node.js, Express, JWT, bcrypt | Business logic, API Gateway, Auth | **ONLINE** |
| **OS Scheduler Engine** | `5001` | C++17, Multithreading, Mutex/Sem | FCFS, Priority & Round Robin Queue | **ONLINE** |
| **DSA Matcher Engine** | `5002` | C++17, Graph, BFS/DFS, AVL Tree | Blood Compatibility Graph Engine | **ONLINE** |
| **Relational Database** | `3306` | MySQL (InnoDB, BCNF) | ACID transactions, inventory batches | **ONLINE** |

Web Application URL: **[http://localhost:5173/](http://localhost:5173/)**

---

### Quick Demo Accounts

All demo accounts share the standard password: `password123`. The login screen also features **1-click quick-fill buttons** for each role:

| Role | Demo Email | Password | Primary Responsibilities |
|---|---|---|---|
| **Administrator** | `admin@bloodbank.com` | `password123` | Switch OS scheduling algorithm, run 50-thread concurrency tests, monitor system logs & inventory |
| **Staff Member** | `staff@bloodbank.com` | `password123` | Check in waiting donors, record donations, commit units into stock |
| **Donor** | `donor1@bloodbank.com` | `password123` | Browse slots, book with priority, view queue status, cancel booking |
| **Requester** | `requester@bloodbank.com` | `password123` | Request blood units with urgency levels, check compatible stock, track fulfillment |

---

### Step-by-Step Role Walkthroughs

#### 1. Donor Role (`donor1@bloodbank.com`)
1. **Login**: Click the red **Donor** button on the login screen or enter `donor1@bloodbank.com` / `password123`.
2. **Dashboard Overview**:
   - View your blood type badge (e.g. `O+`), total lifetime donations, and eligibility countdown.
3. **Book an Appointment**:
   - Scroll down to **Available Donation Slots**.
   - Pick a slot at any center (e.g., *Main Blood Bank Center*).
   - Select your urgency / priority level (1 = Urgent emergency donor, 5 = Routine donor).
   - Click **Confirm Booking**. The OS Engine will place your request through mutex-guarded reservation.
4. **Track Booking Status**:
   - Under **Active Appointments**, view your real-time status badge:
     - `waiting` → In scheduler queue awaiting verification.
     - `confirmed` → Slot reserved and ready for donation.
     - `donated` → Unit collected and stored in DBMS inventory.
5. **Cancel Booking**:
   - Click the red **Cancel** button on any upcoming slot to release capacity back to waiting donors.

---

#### 2. Staff Role (`staff@bloodbank.com`)
1. **Login**: Click the blue **Staff** button on the login screen.
2. **Today's Donor Queue**:
   - View donors arriving at donation centers.
   - Filter by status (`waiting`, `confirmed`, `all`).
3. **Confirm Arrival**:
   - When a donor arrives, click **Confirm Arrival** to transition their state from `waiting` to `confirmed`.
4. **Record Completed Donation**:
   - When donation is finished, click **Record Donation**.
   - Enter blood pressure, hemoglobin level (e.g., `14.5 g/dL`), and collected units (typically `1 unit = 450 mL`).
   - Click **Save Donation**. 
   - *Under the hood*: An ACID transaction commits the record, marks the appointment `donated`, and inserts a fresh batch into `blood_inventory` with a 42-day expiry date!
5. **Inventory Monitoring**:
   - View current real-time stock levels of all 8 blood groups (A+, A-, B+, B-, AB+, AB-, O+, O-).

---

#### 3. Blood Requester Role (`requester@bloodbank.com`)
1. **Login**: Click the amber **Requester** button on the login screen.
2. **Submit a Blood Request**:
   - Choose the patient's blood group (e.g., `B-`).
   - Enter required units (e.g., `2 units`).
   - Select urgency level (`Normal`, `Urgent`, or `Critical`).
   - Choose the receiving hospital name.
   - Click **Submit Blood Request**.
3. **Live Compatibility Check**:
   - The UI automatically queries the C++ DSA Compatibility engine to display all medically compatible blood groups (e.g., for `B-`, both `B-` and `O-` are compatible).
   - Shows existing inventory stock for every compatible group in real time.
4. **Track Request Lifecycle**:
   - Track request statuses: `pending` → `fulfilled` (with specific batch IDs deducted via FIFO).

---

#### 4. Administrator Role (`admin@bloodbank.com`)
1. **Login**: Click the purple **Admin** button on the login screen.
2. **Executive Overview Cards**:
   - Total registered donors, confirmed appointments, available inventory units, and open requests.
3. **Engine 01 Control — OS Scheduler**:
   - Navigate to **OS Scheduler** tab in the sidebar.
   - Switch active scheduling algorithm on the fly:
     - **FCFS (First-Come, First-Served)**: Strict chronological arrival order.
     - **Priority Scheduling**: Prioritizes emergency blood type needs (Level 1 over Level 5).
     - **Round Robin**: Time-sliced round-robin dispatching with configurable time quantum (e.g., 3s).
   - Click **Save Algorithm** to update the running C++ engine.
4. **Concurrency Stress Test Simulation**:
   - Click **Run 50-Thread Simulation** to trigger 50 concurrent C++ POSIX threads competing for limited slot capacity.
   - Observe mutex locks and semaphores preventing double-booking: exactly 1 booking succeeds while 49 are safely rejected with zero race conditions.
5. **System Audit Logs**:
   - View chronological BCNF audit trail tracking every booking, status transition, inventory update, and role login with timestamp and IP address.

---

### Exploring the Academic Engines

From the top navigation bar or sidebar, explore the dedicated interactive visualizers:

1. **Compatibility Explorer (`/engines/compatibility`)**:
   - Select any Donor group and Recipient group.
   - Visualizes red blood cell antigen/antibody compatibility.
   - Runs live BFS and DFS graph traversals from the C++ Directed Graph engine.
2. **Scheduler Simulator (`/engines/scheduler`)**:
   - Visualizes the active queue, average waiting time calculations, and state transition machine:
     `REGISTERED` ➔ `WAITING` ➔ `CONFIRMED` ➔ `DONATED` (or `CANCELLED`).
3. **DBMS Inventory Explorer (`/engines/inventory`)**:
   - Inspects raw inventory batches, barcode tracking numbers, collection dates, and expiry countdowns (42-day RBC shelf life).
