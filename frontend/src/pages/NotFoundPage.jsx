import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

const NotFoundPage = () => {
  const { user } = useAuth();

  const getHomeRoute = () => {
    if (!user) return '/';
    if (user.role === 'hr') return '/dashboard/hr';
    if (user.role === 'manager') return '/dashboard/manager';
    return '/dashboard/employee';
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-3">
      <div className="card-modern p-5 text-center" style={{ maxWidth: '480px' }}>
        <div
          className="icon-wrapper mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: '64px', height: '64px', backgroundColor: '#fee2e2', color: '#991b1b' }}
        >
          <ShieldAlert size={36} />
        </div>
        <h1 className="fw-bolder display-4 text-dark mb-1">404</h1>
        <h4 className="fw-bold text-secondary mb-2">Page Not Found</h4>
        <p className="text-muted small mb-4">
          The requested StaffSync destination or HR resource does not exist or may have been moved.
        </p>

        <Link to={getHomeRoute()} className="btn btn-primary-gradient px-4 py-2">
          <Home size={18} className="me-2" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
