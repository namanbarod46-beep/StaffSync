import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, User, Briefcase, Phone, AlertCircle, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: 'Engineering',
    designation: 'Software Developer',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setFormError('Please fill out all required fields');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setFormError('');

    const res = await register(formData);
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
      <div className="card-modern p-4 p-md-5" style={{ maxWidth: '540px', width: '100%' }}>
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
          <p className="text-muted small">Create an organization account to get started</p>
        </div>

        {formError && (
          <div className="alert alert-danger small d-flex align-items-center py-2 mb-3">
            <AlertCircle size={16} className="me-2 flex-shrink-0" />
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3 mb-3">
            <div className="col-12">
              <label className="form-label small fw-semibold text-secondary">Full Name *</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  name="name"
                  className="form-control border-start-0 ps-0"
                  placeholder="e.g. Alex Morgan"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="col-12">
              <label className="form-label small fw-semibold text-secondary">Work Email *</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  name="email"
                  className="form-control border-start-0 ps-0"
                  placeholder="alex.morgan@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="col-12">
              <label className="form-label small fw-semibold text-secondary">Password *</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  name="password"
                  className="form-control border-start-0 ps-0"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Role</label>
              <select
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR Administrator</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Department</label>
              <select
                name="department"
                className="form-select"
                value={formData.department}
                onChange={handleChange}
              >
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Product & Design">Product & Design</option>
                <option value="Finance & Accounts">Finance & Accounts</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Designation</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Briefcase size={18} />
                </span>
                <input
                  type="text"
                  name="designation"
                  className="form-control border-start-0 ps-0"
                  placeholder="Job Title"
                  value={formData.designation}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold text-secondary">Phone Number</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Phone size={18} />
                </span>
                <input
                  type="text"
                  name="phone"
                  className="form-control border-start-0 ps-0"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary-gradient w-100 py-2 mt-2"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" />
            ) : (
              <ArrowRight size={18} className="me-1" />
            )}
            Complete Registration
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="small text-muted">Already registered? </span>
          <Link to="/login" className="small fw-bold text-primary text-decoration-none">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
