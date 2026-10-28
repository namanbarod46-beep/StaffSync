import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get('expired');

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setFormError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setFormError('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (res.user.role === 'hr') {
        navigate('/dashboard/hr');
      } else if (res.user.role === 'manager') {
        navigate('/dashboard/manager');
      } else {
        navigate('/dashboard/employee');
      }
    } else {
      setFormError(res.message);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    setFormError('');

    const res = await login(demoEmail, demoPassword);
    setLoading(false);

    if (res.success) {
      if (res.user.role === 'hr') {
        navigate('/dashboard/hr');
      } else if (res.user.role === 'manager') {
        navigate('/dashboard/manager');
      } else {
        navigate('/dashboard/employee');
      }
    } else {
      setFormError(res.message);
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center py-5 px-3">
      <div className="card-modern p-4 p-md-5" style={{ maxWidth: '480px', width: '100%' }}>
        {/* Brand Header */}
        <div className="text-center mb-4">
          <div
            className="bg-primary text-white rounded-3 d-inline-flex align-items-center justify-content-center mb-2 shadow"
            style={{ width: '48px', height: '48px' }}
          >
            <Shield size={28} />
          </div>
          <h3 className="fw-bolder text-dark mb-1">
            Staff<span className="text-primary">Sync</span>
          </h3>
          <p className="text-muted small">Sign in to your Human Resource Management portal</p>
        </div>

        {isExpired && (
          <div className="alert alert-warning small d-flex align-items-center py-2">
            <AlertCircle size={16} className="me-2 flex-shrink-0" />
            Your session has expired. Please sign in again.
          </div>
        )}

        {formError && (
          <div className="alert alert-danger small d-flex align-items-center py-2">
            <AlertCircle size={16} className="me-2 flex-shrink-0" />
            {formError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <Mail size={18} />
              </span>
              <input
                type="email"
                className="form-control border-start-0 ps-0"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label small fw-semibold text-secondary mb-0">Password</label>
            </div>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <Lock size={18} />
              </span>
              <input
                type="password"
                className="form-control border-start-0 ps-0"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary-gradient w-100 py-2"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" />
            ) : (
              <ArrowRight size={18} className="me-1" />
            )}
            Sign In to StaffSync
          </button>
        </form>

        {/* Demo Quick Logins */}
        <div className="border-top pt-3">
          <div className="text-center mb-2">
            <span className="badge bg-light text-muted border small px-3 py-1">
              Quick 1-Click Demo Evaluation Logins
            </span>
          </div>

          <div className="d-grid gap-2">
            <button
              type="button"
              className="btn btn-outline-danger btn-sm text-start d-flex align-items-center justify-content-between py-2"
              onClick={() => handleQuickLogin('hr@staffsync.com', 'password123')}
              disabled={loading}
            >
              <div>
                <strong className="d-block text-danger">🛡️ HR Director Demo</strong>
                <small className="text-muted">hr@staffsync.com (Full Admin Privileges)</small>
              </div>
              <UserCheck size={16} />
            </button>

            <button
              type="button"
              className="btn btn-outline-warning btn-sm text-start d-flex align-items-center justify-content-between py-2"
              onClick={() => handleQuickLogin('manager.tech@staffsync.com', 'password123')}
              disabled={loading}
            >
              <div>
                <strong className="d-block text-warning-emphasis">👔 Manager Demo</strong>
                <small className="text-muted">manager.tech@staffsync.com (Team Oversight)</small>
              </div>
              <UserCheck size={16} />
            </button>

            <button
              type="button"
              className="btn btn-outline-primary btn-sm text-start d-flex align-items-center justify-content-between py-2"
              onClick={() => handleQuickLogin('employee@staffsync.com', 'password123')}
              disabled={loading}
            >
              <div>
                <strong className="d-block text-primary">👤 Employee Demo</strong>
                <small className="text-muted">employee@staffsync.com (John Doe)</small>
              </div>
              <UserCheck size={16} />
            </button>
          </div>
        </div>

        <div className="text-center mt-4">
          <span className="small text-muted">Don't have an account? </span>
          <Link to="/register" className="small fw-bold text-primary text-decoration-none">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
