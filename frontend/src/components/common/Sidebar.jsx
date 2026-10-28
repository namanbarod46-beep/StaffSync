import React from 'react';
  import { NavLink, useNavigate } from 'react-router-dom';
  import { useAuth } from '../../context/AuthContext';
  import {
    LayoutDashboard,
    Clock,
    CalendarDays,
    Users,
    GraduationCap,
    Megaphone,
    BarChart3,
    UserCheck,
    LogOut,
    Shield,
    X,
  } from 'lucide-react';

  const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
      logout();
      navigate('/login');
    };

    const getDashboardPath = () => {
      if (user?.role === 'hr') return '/dashboard/hr';
      if (user?.role === 'manager') return '/dashboard/manager';
      return '/dashboard/employee';
    };

    return (
      <aside className={`app-sidebar ${isOpen ? 'show' : ''}`}>
        {/* Brand Header */}
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary border-opacity-25">
          <div className="d-flex align-items-center gap-2">
            <div
              className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center"
              style={{ width: '38px', height: '38px' }}
            >
              <Shield size={22} />
            </div>
            <div>
              <div className="fw-bolder fs-5 text-white lh-1">StaffSync</div>
              <small className="text-secondary" style={{ fontSize: '0.75rem' }}>
                HR Management Solution
              </small>
            </div>
          </div>
          <button
            className="btn btn-sm text-white d-lg-none p-1"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="p-3 flex-grow-1 overflow-auto">
          <div className="text-uppercase text-secondary fw-bold px-2 mb-2" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
            Main Menu
          </div>

          <div className="d-flex flex-direction-column gap-1">
            <NavLink
              to={getDashboardPath()}
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/attendance"
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Clock size={18} />
              <span>Attendance</span>
            </NavLink>

            <NavLink
              to="/leaves"
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <CalendarDays size={18} />
              <span>Leave Management</span>
            </NavLink>

            {(user?.role === 'hr' || user?.role === 'manager') && (
              <NavLink
                to="/employees"
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Users size={18} />
                <span>{user?.role === 'hr' ? 'All Employees' : 'My Team'}</span>
              </NavLink>
            )}

            <NavLink
              to="/trainings"
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <GraduationCap size={18} />
              <span>Training Programs</span>
            </NavLink>

            <NavLink
              to="/announcements"
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Megaphone size={18} />
              <span>Announcements</span>
            </NavLink>

            {user?.role === 'hr' && (
              <NavLink
                to="/reports"
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <BarChart3 size={18} />
                <span>Reports & Analytics</span>
              </NavLink>
            )}

            <div className="text-uppercase text-secondary fw-bold px-2 mt-4 mb-2" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              Account
            </div>

            <NavLink
              to="/profile"
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <UserCheck size={18} />
              <span>My Profile</span>
            </NavLink>
          </div>
        </div>

        {/* User Card / Footer */}
        <div className="p-3 border-top border-secondary border-opacity-25 bg-black bg-opacity-25">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2 overflow-hidden">
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4f46e5&color=fff`
                }
                alt={user?.name}
                className="rounded-circle"
                style={{ width: '34px', height: '34px', objectFit: 'cover' }}
              />
              <div className="text-truncate">
                <div className="text-white small fw-bold text-truncate">{user?.name}</div>
                <div className="text-secondary small text-capitalize" style={{ fontSize: '0.75rem' }}>
                  {user?.role}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-sm btn-outline-danger border-0 p-1 rounded-2"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    );
  };

  export default Sidebar;
