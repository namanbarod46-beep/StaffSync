import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import HRDashboard from './pages/HRDashboard';
import AttendancePage from './pages/AttendancePage';
import LeaveManagementPage from './pages/LeaveManagementPage';
import EmployeesPage from './pages/EmployeesPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import TrainingsPage from './pages/TrainingsPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Authenticated Layout with Sidebar and Navbar
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="d-flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content flex-grow-1 w-100">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="pb-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Root Dashboard Redirector based on user role
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'hr') return <Navigate to="/dashboard/hr" replace />;
  if (user.role === 'manager') return <Navigate to="/dashboard/manager" replace />;
  return <Navigate to="/dashboard/employee" replace />;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes inside Dashboard Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardRedirect />} />

              {/* Role-Specific Dashboards */}
              <Route path="/dashboard/employee" element={<EmployeeDashboard />} />
              <Route
                path="/dashboard/manager"
                element={<ManagerDashboard />}
              />
              <Route
                path="/dashboard/hr"
                element={<HRDashboard />}
              />

              {/* Core HR Modules */}
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/leaves" element={<LeaveManagementPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/trainings" element={<TrainingsPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
