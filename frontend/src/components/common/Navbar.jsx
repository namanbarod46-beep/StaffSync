import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Bell,
  User,
  LogOut,
  Menu,
  CheckCircle,
  Calendar,
  Award,
  Megaphone,
} from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'hr':
        return <span className="badge badge-soft-danger px-2 py-1">HR Director</span>;
      case 'manager':
        return <span className="badge badge-soft-warning px-2 py-1">Manager</span>;
      default:
        return <span className="badge badge-soft-primary px-2 py-1">Employee</span>;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'leave':
        return <Calendar size={16} className="text-warning me-2 flex-shrink-0" />;
      case 'training':
        return <Award size={16} className="text-primary me-2 flex-shrink-0" />;
      case 'announcement':
        return <Megaphone size={16} className="text-danger me-2 flex-shrink-0" />;
      default:
        return <CheckCircle size={16} className="text-success me-2 flex-shrink-0" />;
    }
  };

  return (
    <nav className="navbar navbar-expand bg-white border-bottom sticky-top px-3 py-2">
      <div className="container-fluid px-0">
        <button
          className="btn btn-light d-lg-none me-2"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
        >
          <Menu size={20} />
        </button>

        <div className="d-flex align-items-center">
          <span className="fw-bold text-dark fs-5 d-none d-sm-inline">
            Staff<span className="text-primary">Sync</span>
          </span>
          <span className="badge bg-light text-muted border ms-2 d-none d-md-inline">
            HRM v1.0
          </span>
        </div>

        <div className="ms-auto d-flex align-items-center gap-3">
          {/* Notifications Dropdown */}
          <div className="position-relative">
            <button
              className="btn btn-light rounded-circle p-2 position-relative"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              title="Notifications"
            >
              <Bell size={19} className="text-secondary" />
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className="dropdown-menu dropdown-menu-end show shadow-lg border-0 p-0"
                style={{
                  width: '320px',
                  position: 'absolute',
                  right: 0,
                  top: '120%',
                  zIndex: 1050,
                  borderRadius: '12px',
                  maxHeight: '420px',
                  overflowY: 'auto',
                }}
              >
                <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-light rounded-top">
                  <h6 className="mb-0 fw-bold">Notifications</h6>
                  {unreadCount > 0 && (
                    <button
                      className="btn btn-link btn-sm p-0 text-decoration-none small text-primary fw-semibold"
                      onClick={markAllAsRead}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="p-2">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted small">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`p-2 rounded mb-1 text-decoration-none cursor-pointer ${
                          n.isRead ? 'bg-white' : 'bg-light'
                        }`}
                        style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                        onClick={() => {
                          markAsRead(n._id);
                          if (n.link) {
                            navigate(n.link);
                            setShowNotifications(false);
                          }
                        }}
                      >
                        <div className="d-flex align-items-start">
                          {getNotificationIcon(n.type)}
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="fw-semibold small text-dark">
                                {n.title}
                              </span>
                              {!n.isRead && (
                                <span className="badge bg-primary rounded-circle p-1"></span>
                              )}
                            </div>
                            <p className="text-muted small mb-0 text-truncate" style={{ maxWidth: '230px' }}>
                              {n.message}
                            </p>
                            <span className="text-secondary" style={{ fontSize: '0.7rem' }}>
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="position-relative">
            <button
              className="btn btn-light d-flex align-items-center gap-2 border-0 bg-transparent py-1 px-2"
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
            >
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4f46e5&color=fff`
                }
                alt={user?.name}
                className="rounded-circle border"
                style={{ width: '36px', height: '36px', objectFit: 'cover' }}
              />
              <div className="text-start d-none d-md-block">
                <div className="fw-semibold small text-dark lh-sm">{user?.name}</div>
                <div className="mt-1">{getRoleBadge(user?.role)}</div>
              </div>
            </button>

            {showUserMenu && (
              <div
                className="dropdown-menu dropdown-menu-end show shadow-lg border-0 p-2"
                style={{
                  minWidth: '220px',
                  position: 'absolute',
                  right: 0,
                  top: '120%',
                  zIndex: 1050,
                  borderRadius: '12px',
                }}
              >
                <div className="px-3 py-2 border-bottom mb-2">
                  <div className="fw-bold text-dark">{user?.name}</div>
                  <div className="text-muted small text-truncate">{user?.email}</div>
                  <div className="text-muted small mt-1">
                    ID: {user?.employeeProfile?.employeeId || 'EMP-SYNC'}
                  </div>
                </div>

                <Link
                  to="/profile"
                  className="dropdown-item d-flex align-items-center gap-2 rounded py-2"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User size={16} className="text-primary" />
                  <span>My Profile</span>
                </Link>

                <div className="dropdown-divider my-2"></div>

                <button
                  className="dropdown-item d-flex align-items-center gap-2 rounded py-2 text-danger"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
