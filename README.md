# StaffSync - Modern Human Resource Management Solution

StaffSync is an enterprise-grade, comprehensive web-based Human Resource Management System (HRMS) built on the **MERN Stack** (MongoDB, Express.js, React.js, and Node.js). It streamlines and automates core organizational workflows—employee record management, automated daily attendance tracking, leave request and approval workflows, corporate training programs, company-wide announcements, and executive workforce analytics—with strict Role-Based Access Control (RBAC).

---

## 🌟 Key Highlights & Core Modules

### 1. 🛡️ HR Administration & Governance
- **Talent & Employee Directory**: Add new employee records, assign departments, designations, compensation, and hierarchical reporting managers.
- **Attendance Oversight**: Monitor daily organization-wide punctuality, view on-time vs. late rates, filter by department, and record manual attendance adjustments.
- **Leave Governance**: Full administrative override and review of all organization leave applications.
- **Company Announcements**: Broadcast organizational updates, policy changes, and events with priority tags and pinned bulletins.
- **Executive Reports & Analytics**: Real-time workforce metrics, departmental headcount distribution, and leave utilization analytics.

### 2. 👔 Manager Team Supervision
- **Team Dashboard**: Supervise direct reports, view real-time team attendance today, and track punctuality.
- **Leave Request Approvals**: 1-click review (Approve / Reject) with custom manager remarks and feedback.
- **Training Management**: Organize and assign corporate skill development courses for departmental team members.

### 3. 👤 Employee Self-Service
- **Smart Punch Clock**: One-click Check-in and Check-out with automatic late detection (after 09:30 AM) and live worked hours calculation.
- **Leave Management**: Apply for leaves (Annual, Sick, Casual, Maternity, Unpaid) with real-time balance checks and dynamic day counting.
- **Training Development**: Browse corporate training programs and self-enroll/unenroll in 1 click.
- **Profile Self-Management**: Update personal contact info, emergency contacts, skills, and account password.
- **Interactive Notifications**: Live notification updates for leave status, announcements, and training registrations.

---

## 🗄️ Database Architecture (MongoDB Schemas)

StaffSync implements 7 normalized MongoDB collections:
- `users`: Authentication records, email, hashed passwords (bcrypt), and roles (`employee`, `manager`, `hr`).
- `employees`: Extended employment profile, employee ID, department, designation, salary, reporting manager, emergency contact, skills, and leave balances.
- `attendances`: Daily attendance logs, check-in/out timestamps, total hours, and status (`Present`, `Late`, `Half-day`, `Absent`).
- `leaves`: Leave applications, type, dates, days count, reason, status (`Pending`, `Approved`, `Rejected`), and manager comments.
- `announcements`: Corporate notices, priority (`Low`, `Medium`, `High`, `Urgent`), category, target audience, and pin status.
- `trainings`: Skill programs, instructor, department, dates, enrolled employees list, and max participants.
- `notifications`: User-specific notification inbox with read/unread statuses.

---

## 🔑 Pre-Configured Demo Credentials

The database seeder pre-populates demo accounts with diverse roles and realistic historical logs. On the **Login Page**, you can also use the **Quick 1-Click Demo Buttons** to log in instantly without typing:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **HR Director** | `hr@staffsync.com` | `password123` | Full enterprise administrative privileges |
| **Engineering Manager** | `manager.tech@staffsync.com` | `password123` | Engineering team oversight & leave approvals |
| **Sales Manager** | `manager.sales@staffsync.com` | `password123` | Sales team oversight & leave approvals |
| **Employee (Senior Dev)** | `employee@staffsync.com` | `password123` | Employee self-service (John Doe) |
| **Employee (Frontend)** | `jane.smith@staffsync.com` | `password123` | Employee self-service (Jane Smith) |

---

## 💻 Step-by-Step Instructions to Run on CMD (Command Prompt)

### Prerequisites
Make sure you have installed on your computer:
1. **Node.js** (v16 or above): [Download Node.js](https://nodejs.org/)
2. **MongoDB**: Local MongoDB Community Server [Download MongoDB](https://www.mongodb.com/try/download/community) OR a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud database URI.

---

### Step 1: Open Command Prompt
Press `Win + R`, type `cmd`, and press Enter. Navigate to your project folder:
```cmd
cd c:\Users\HP\Documents\Project
```

---

### Step 2: Configure Environment Variables
Verify your backend `.env` file exists at `backend/.env` with your MongoDB connection string:
```properties
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/staffsync_db
JWT_SECRET=staffsync_super_secret_jwt_key_2026_modern_hrms
JWT_EXPIRE=30d
NODE_ENV=development
```
*(If using MongoDB Atlas, replace `MONGODB_URI` with your cloud connection string).*

---

### Step 3: Install Dependencies
Run the installation command for the root, backend, and frontend packages:

```cmd
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

---

### Step 4: Seed the Database with Realistic Demo Data
Populate the database with all test users, attendance history, pending leave applications, announcements, and training programs:

```cmd
npm run seed
```
You will see:
```text
[StaffSync Seeder] Connecting to MongoDB...
[StaffSync] Database Seeded Successfully!
```

---

### Step 5: Start the Application

#### Option A: Run Both Backend & Frontend Simultaneously (Recommended)
From the root project directory:
```cmd
npm run dev
```

#### Option B: Run in Separate CMD Windows
**Window 1 (Backend API):**
```cmd
cd c:\Users\HP\Documents\Project\backend
npm run dev
```
*API Server will start on `http://localhost:5000`*

**Window 2 (Frontend React App):**
```cmd
cd c:\Users\HP\Documents\Project\frontend
npm run dev
```
*Frontend will launch on `http://localhost:3000`*

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🚀 Step-by-Step Instructions to Upload to GitHub

Follow these exact commands in CMD to upload this project to your GitHub account:

### Step 1: Initialize Git Repository
In your project root directory (`c:\Users\HP\Documents\Project`):
```cmd
cd c:\Users\HP\Documents\Project
git init
```

### Step 2: Configure Git User (If not configured already)
```cmd
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 3: Stage and Commit the Files
```cmd
git add .
git commit -m "Initial commit: Complete StaffSync HRMS MERN platform"
```

### Step 4: Create a New Repository on GitHub
1. Go to [https://github.com/new](https://github.com/new) in your web browser.
2. Name the repository: `staffsync-hrms` (or any preferred name).
3. Set visibility to **Public**.
4. **Do NOT check** "Initialize this repository with a README, .gitignore, or license" (we already have them created).
5. Click **Create repository**.

### Step 5: Link and Push to GitHub
Copy your repository URL from GitHub (e.g., `https://github.com/<your-username>/staffsync-hrms.git`) and run:
```cmd
git branch -M main
git remote add origin https://github.com/<your-username>/staffsync-hrms.git
git push -u origin main
```

---

## 🌐 Adding Demo and GitHub Links for Mentors / Evaluators

When submitting your project on your evaluation platform:
1. **GitHub Link**: Paste your repository URL:
   `https://github.com/<your-username>/staffsync-hrms`
2. **Live Demo Deployment (Optional)**:
   - Backend can be deployed on [Render.com](https://render.com) or [Railway.app](https://railway.app).
   - Frontend can be deployed on [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
   - Database hosted on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Paste the generated Vercel/Render public URL as your **Demo Link**.

---

## 📂 Project Structure

```
Project/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection & error recovery
│   ├── controllers/
│   │   ├── authController.js         # Register, Login, Me, Profile update, Change password
│   │   ├── employeeController.js     # Directory, Add/Edit/Deactivate employee, Managers
│   │   ├── attendanceController.js   # Punch In/Out, Logs, Manual adjustments
│   │   ├── leaveController.js        # Apply, Balance validation, Approvals, Remarks
│   │   ├── announcementController.js # Broadcast announcements, Pinning, Categories
│   │   ├── trainingController.js     # Courses, Schedule, Enrollment
│   │   ├── reportController.js       # Executive KPI stats, Analytics & Reports
│   │   └── notificationController.js # Inbox, Read status, Unread badges
│   ├── middleware/
│   │   ├── authMiddleware.js         # JWT verification & RBAC authorization
│   │   └── errorMiddleware.js        # Global error and validation handler
│   ├── models/
│   │   ├── User.js                   # Auth schema & bcrypt hooks
│   │   ├── Employee.js               # Detailed employee profiles
│   │   ├── Attendance.js             # Daily attendance & work hours
│   │   ├── Leave.js                  # Leave requests & approval status
│   │   ├── Announcement.js           # Bulletins & Priority tags
│   │   ├── Training.js               # Corporate workshops & attendees
│   │   └── Notification.js           # In-app alert notifications
│   ├── routes/                       # Express RESTful route declarations
│   ├── seeds/
│   │   └── seed.js                   # Complete realistic database seeder
│   ├── .env                          # Environment configuration
│   ├── server.js                     # Server entrypoint
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosConfig.js        # Axios instance with JWT interceptor
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx        # Top navigation with live notification drawer
│   │   │   │   ├── Sidebar.jsx       # Responsive role-based navigation sidebar
│   │   │   │   ├── ProtectedRoute.jsx# Client-side RBAC guard
│   │   │   │   ├── StatCard.jsx      # KPI metric card component
│   │   │   │   └── LoadingSpinner.jsx# Smooth spinner
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Global authentication state
│   │   │   └── NotificationContext.jsx # Real-time notification poller
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx       # Marketing hero page with module showcase
│   │   │   ├── LoginPage.jsx         # Login with 1-click Demo credentials
│   │   │   ├── RegisterPage.jsx      # Organization self-registration
│   │   │   ├── EmployeeDashboard.jsx # Punch clock, personal stats, announcements
│   │   │   ├── ManagerDashboard.jsx  # Team attendance, leave approval queue
│   │   │   ├── HRDashboard.jsx       # Headcount KPIs, organization attendance, actions
│   │   │   ├── AttendancePage.jsx    # Punch widget, monthly logs, org roster, manual entry
│   │   │   ├── LeaveManagementPage.jsx # Balances, apply modal, review queue
│   │   │   ├── EmployeesPage.jsx     # Staff directory, Add/Edit/View dossier modals
│   │   │   ├── AnnouncementsPage.jsx # Company feed, priority badges, broadcast modal
│   │   │   ├── TrainingsPage.jsx     # Skill workshops, 1-click enrollment, schedule modal
│   │   │   ├── ReportsPage.jsx       # Headcount graphs, punctuality ratios, print
│   │   │   ├── ProfilePage.jsx       # Contact edit, skills, password change
│   │   │   └── NotFoundPage.jsx      # 404 handler
│   │   ├── App.jsx                   # Route configurations & layout
│   │   ├── index.css                 # Modern enterprise UI styling
│   │   └── main.jsx
│   ├── index.html                    # Bootstrap 5 & typography links
│   ├── vite.config.js                # Vite build & proxy settings
│   └── package.json
├── .gitignore
├── package.json                      # Monorepo root scripts (dev, seed, install-all)
└── README.md                         # Complete project documentation
```

---

## 🛡️ License
This project is open-source and available under the [MIT License](LICENSE).
