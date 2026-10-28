import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Users,
  Clock,
  CalendarCheck,
  Award,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'hr') return '/dashboard/hr';
    if (user.role === 'manager') return '/dashboard/manager';
    return '/dashboard/employee';
  };

  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      {/* Navbar */}
      <header className="bg-white border-bottom py-3">
        <div className="container d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <div
              className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center"
              style={{ width: '40px', height: '40px' }}
            >
              <Shield size={24} />
            </div>
            <span className="fw-bolder fs-4 text-dark">
              Staff<span className="text-primary">Sync</span>
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            {isAuthenticated ? (
              <Link to={getDashboardPath()} className="btn btn-primary-gradient px-4">
                Go to Dashboard <ArrowRight size={16} className="ms-1" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-secondary px-3">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary-gradient px-3">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-5 bg-white border-bottom">
        <div className="container py-4 text-center">
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-light border mb-4">
            <Sparkles size={16} className="text-primary" />
            <span className="small fw-semibold text-secondary">
              Modern Enterprise Human Resource Management Solution
            </span>
          </div>

          <h1 className="display-4 fw-bolder text-dark mb-3">
            Streamline Workforce Operations with{' '}
            <span className="text-primary">StaffSync</span>
          </h1>

          <p className="lead text-muted mx-auto mb-4" style={{ maxWidth: '750px' }}>
            A comprehensive, modern MERN-stack platform providing tailored workflows for
            HR Administrators, Department Managers, and Employees. Digitize attendance,
            leave requests, performance development, and internal communications effortlessly.
          </p>

          <div className="d-flex justify-content-center gap-3 mb-5">
            <Link to="/login" className="btn btn-primary-gradient btn-lg px-4 py-2">
              Explore Live Demo <ArrowRight size={18} className="ms-1" />
            </Link>
            <a href="#features" className="btn btn-outline-dark btn-lg px-4 py-2">
              View Core Modules
            </a>
          </div>

          {/* Feature Highlights Grid */}
          <div className="row g-4 text-start mt-2" id="features">
            <div className="col-md-4">
              <div className="card-modern p-4 h-100">
                <div
                  className="icon-wrapper mb-3 rounded-3 d-flex align-items-center justify-content-center"
                  style={{ width: '48px', height: '48px', backgroundColor: '#e0e7ff', color: '#4338ca' }}
                >
                  <Users size={24} />
                </div>
                <h5 className="fw-bold mb-2">Employee Directory</h5>
                <p className="text-muted small mb-0">
                  Centralized records with departments, designations, skills tracking, salary, and
                  hierarchical reporting managers.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card-modern p-4 h-100">
                <div
                  className="icon-wrapper mb-3 rounded-3 d-flex align-items-center justify-content-center"
                  style={{ width: '48px', height: '48px', backgroundColor: '#d1fae5', color: '#065f46' }}
                >
                  <Clock size={24} />
                </div>
                <h5 className="fw-bold mb-2">Smart Attendance</h5>
                <p className="text-muted small mb-0">
                  Instant check-in and check-out with automatic late calculation, daily hours tracking,
                  and company-wide reporting.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card-modern p-4 h-100">
                <div
                  className="icon-wrapper mb-3 rounded-3 d-flex align-items-center justify-content-center"
                  style={{ width: '48px', height: '48px', backgroundColor: '#fef3c7', color: '#92400e' }}
                >
                  <CalendarCheck size={24} />
                </div>
                <h5 className="fw-bold mb-2">Leave Workflow</h5>
                <p className="text-muted small mb-0">
                  Leave applications with real-time balance validation, multi-tier approvals, and
                  automated employee notifications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role-based capabilities */}
      <section className="py-5">
        <div className="container py-3">
          <div className="text-center mb-5">
            <h2 className="fw-bolder">Designed for Every Stakeholder</h2>
            <p className="text-muted">Distinct access levels and tailored dashboards</p>
          </div>

          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card-modern p-4 h-100 border-top border-primary border-3">
                <span className="badge badge-soft-primary mb-3">Self-Service</span>
                <h4 className="fw-bold mb-3">Employees</h4>
                <ul className="list-unstyled text-muted small d-flex flex-column gap-2 mb-0">
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                    <span>One-click daily check-in and check-out</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                    <span>Apply for leaves and track approval status</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                    <span>Enroll in skill development & corporate training</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                    <span>View company-wide announcements and alerts</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card-modern p-4 h-100 border-top border-warning border-3">
                <span className="badge badge-soft-warning mb-3">Team Oversight</span>
                <h4 className="fw-bold mb-3">Managers</h4>
                <ul className="list-unstyled text-muted small d-flex flex-column gap-2 mb-0">
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                    <span>Review & approve/reject team leave requests</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                    <span>Monitor daily team attendance & punctuality</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                    <span>Schedule training programs for department staff</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                    <span>View direct report details and skills directory</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card-modern p-4 h-100 border-top border-danger border-3">
                <span className="badge badge-soft-danger mb-3">Full Administration</span>
                <h4 className="fw-bold mb-3">HR Directors</h4>
                <ul className="list-unstyled text-muted small d-flex flex-column gap-2 mb-0">
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                    <span>Manage all employee & manager profiles</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                    <span>Broadcast announcements with priority tags</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                    <span>Real-time headcount & attendance analytics</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                    <span>Manual attendance overrides & leave governance</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-top py-4 text-center">
        <div className="container">
          <p className="text-muted small mb-0">
            StaffSync &copy; {new Date().getFullYear()} - Modern Human Resource Management Solution.
            Built with MERN Stack.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
