import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Users,
  Clock,
  CalendarCheck,
  Award,
  UserPlus,
  Megaphone,
  BarChart3,
  Check,
  X,
  Building,
  ArrowRight,
} from 'lucide-react';

const HRDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ text: '', type: '' });

  const fetchHRStats = async () => {
    try {
      const res = await api.get('/reports/hr-dashboard');
      if (res.data.success) {
        setData(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load HR dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHRStats();
  }, []);

  const handleQuickReviewLeave = async (leaveId, status) => {
    setActionLoading(true);
    try {
      const res = await api.put(`/leaves/${leaveId}/review`, {
        status,
        managerComment: `Reviewed and ${status.toLowerCase()} by HR Director`,
      });
      if (res.data.success) {
        setAlertMsg({
          text: `Leave request has been ${status.toLowerCase()} successfully`,
          type: 'success',
        });
        await fetchHRStats();
      }
    } catch (err) {
      setAlertMsg({
        text: err.response?.data?.message || 'Action failed',
        type: 'danger',
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen={true} text="Loading HR Enterprise Dashboard..." />;
  }

  const attendance = data?.attendance || {};

  return (
    <div className="container-fluid py-4 px-4">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h2 className="fw-bolder text-dark mb-0">HR Enterprise Dashboard</h2>
            <span className="badge badge-soft-danger px-2 py-1">Executive Admin</span>
          </div>
          <p className="text-muted mb-0 mt-1">
            Welcome, {user?.name}. Manage organizational health, talent records, and policies.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="d-flex flex-wrap gap-2">
          <Link to="/employees" className="btn btn-primary-gradient">
            <UserPlus size={16} className="me-1" /> Manage Employees
          </Link>
          <Link to="/announcements" className="btn btn-outline-danger">
            <Megaphone size={16} className="me-1" /> Broadcast Announcement
          </Link>
          <Link to="/reports" className="btn btn-outline-secondary">
            <BarChart3 size={16} className="me-1" /> View Full Reports
          </Link>
        </div>
      </div>

      {alertMsg.text && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show mb-4`} role="alert">
          {alertMsg.text}
          <button type="button" className="btn-close" onClick={() => setAlertMsg({ text: '', type: '' })} />
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Total Headcount"
            value={data?.totalUsers || 0}
            subtitle={`${data?.totalEmployees} Staff, ${data?.totalManagers} Managers`}
            icon={Users}
            color="primary"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Today's Attendance"
            value={`${attendance.attendanceRate || 0}%`}
            subtitle={`${attendance.totalLoggedToday || 0} Logged / ${data?.totalUsers || 0} Total`}
            icon={Clock}
            color="success"
            badgeText={attendance.attendanceRate >= 80 ? 'Optimal' : 'Moderate'}
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Pending Leaves"
            value={data?.leaves?.pending || 0}
            subtitle={`${data?.leaves?.approved || 0} approved this cycle`}
            icon={CalendarCheck}
            color="warning"
            badgeText={data?.leaves?.pending > 0 ? 'Review Needed' : 'Zero Pending'}
            badgeColor={data?.leaves?.pending > 0 ? 'warning' : 'success'}
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Active Programs"
            value={data?.trainings?.active || 0}
            subtitle="Training & development sessions"
            icon={Award}
            color="purple"
          />
        </div>
      </div>

      {/* Middle Row: Department Breakdown & Today's Attendance Roster */}
      <div className="row g-4 mb-4">
        {/* Department Breakdown */}
        <div className="col-lg-6">
          <div className="card-modern p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <Building size={18} className="text-primary" />
                <h5 className="fw-bold mb-0">Department Distribution</h5>
              </div>
              <Link to="/employees" className="text-primary small text-decoration-none fw-semibold">
                View Directory <ArrowRight size={14} />
              </Link>
            </div>

            <div className="d-flex flex-column gap-3">
              {data?.departmentStats?.map((dept) => {
                const percentage = data?.totalUsers > 0 ? Math.round((dept.count / data.totalUsers) * 100) : 0;
                return (
                  <div key={dept._id} className="p-2">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-semibold text-dark small">{dept._id}</span>
                      <span className="small text-muted fw-bold">
                        {dept.count} Members ({percentage}%)
                      </span>
                    </div>
                    <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                      <div
                        className="progress-bar bg-primary"
                        role="progressbar"
                        style={{ width: `${percentage}%` }}
                        aria-valuenow={percentage}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Today's Attendance Overview */}
        <div className="col-lg-6">
          <div className="card-modern p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <Clock size={18} className="text-success" />
                <h5 className="fw-bold mb-0">Today's Attendance Status</h5>
              </div>
              <Link to="/attendance" className="text-primary small text-decoration-none fw-semibold">
                Manage Attendance <ArrowRight size={14} />
              </Link>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <div className="p-3 bg-light rounded-3 text-center border-start border-success border-4">
                  <div className="h3 fw-bold text-success mb-0">{attendance.presentCount || 0}</div>
                  <small className="text-muted fw-semibold">Present On-Time</small>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 bg-light rounded-3 text-center border-start border-warning border-4">
                  <div className="h3 fw-bold text-warning mb-0">{attendance.lateCount || 0}</div>
                  <small className="text-muted fw-semibold">Late Arrivals</small>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 bg-light rounded-3 text-center border-start border-info border-4">
                  <div className="h3 fw-bold text-info mb-0">{attendance.halfDayCount || 0}</div>
                  <small className="text-muted fw-semibold">Half-Day Shifts</small>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 bg-light rounded-3 text-center border-start border-danger border-4">
                  <div className="h3 fw-bold text-danger mb-0">{attendance.absentCount || 0}</div>
                  <small className="text-muted fw-semibold">Not Checked In</small>
                </div>
              </div>
            </div>

            <div className="p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
              <span className="small text-muted">Organization Daily Attendance Rate</span>
              <span className="fw-bold text-primary fs-5">{attendance.attendanceRate || 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Organization Pending Leaves Approvals */}
      <div className="card-modern p-4 mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h5 className="fw-bold mb-0">Pending Leave Applications</h5>
            <small className="text-muted">Direct executive approval or status oversight</small>
          </div>
          <Link to="/leaves" className="text-primary small text-decoration-none fw-semibold">
            All Leaves <ArrowRight size={14} />
          </Link>
        </div>

        {data?.recentLeaves?.length === 0 ? (
          <div className="text-center py-4 text-muted small bg-light rounded-3">
            No pending leave requests across the company.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-modern align-middle mb-0">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th className="text-end">HR Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentLeaves?.map((lv) => (
                  <tr key={lv._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={
                            lv.employee?.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(lv.employee?.name || 'User')}&background=4f46e5&color=fff`
                          }
                          alt={lv.employee?.name}
                          className="rounded-circle"
                          style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                        />
                        <div>
                          <div className="fw-bold text-dark">{lv.employee?.name}</div>
                          <div className="text-muted small">{lv.employee?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-soft-primary">{lv.leaveType}</span>
                    </td>
                    <td>
                      <small className="text-dark">
                        {new Date(lv.startDate).toLocaleDateString()} to {new Date(lv.endDate).toLocaleDateString()}
                      </small>
                    </td>
                    <td>
                      <strong>{lv.daysCount} d</strong>
                    </td>
                    <td>
                      <span className="text-muted small">{lv.reason}</span>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        <button
                          className="btn btn-sm btn-success d-flex align-items-center gap-1"
                          onClick={() => handleQuickReviewLeave(lv._id, 'Approved')}
                          disabled={actionLoading}
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                          onClick={() => handleQuickReviewLeave(lv._id, 'Rejected')}
                          disabled={actionLoading}
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HRDashboard;
