import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Users,
  CheckCircle,
  AlertCircle,
  Award,
  CalendarCheck,
  Check,
  X,
  Clock,
  ArrowRight,
} from 'lucide-react';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState('Approved');
  const [managerComment, setManagerComment] = useState('');
  const [alertMsg, setAlertMsg] = useState({ text: '', type: '' });

  const fetchStats = async () => {
    try {
      const res = await api.get('/reports/manager-dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load manager dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const openReviewModal = (leave, status) => {
    setSelectedLeave(leave);
    setReviewStatus(status);
    setManagerComment('');
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;

    setActionLoading(true);
    try {
      const res = await api.put(`/leaves/${selectedLeave._id}/review`, {
        status: reviewStatus,
        managerComment,
      });

      if (res.data.success) {
        setAlertMsg({
          text: `Leave request has been ${reviewStatus.toLowerCase()} successfully`,
          type: 'success',
        });
        setReviewModalOpen(false);
        await fetchStats();
      }
    } catch (err) {
      setAlertMsg({
        text: err.response?.data?.message || 'Failed to review leave',
        type: 'danger',
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen={true} text="Loading team oversight dashboard..." />;
  }

  return (
    <div className="container-fluid py-4 px-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bolder text-dark mb-1">
            Manager Control Center 👔
          </h2>
          <p className="text-muted mb-0">
            Overview and team supervision for {user?.name}
          </p>
        </div>

        <div className="d-flex gap-2">
          <Link to="/leaves" className="btn btn-outline-primary">
            <CalendarCheck size={16} className="me-1" /> All Leave Requests
          </Link>
          <Link to="/attendance" className="btn btn-outline-secondary">
            <Clock size={16} className="me-1" /> Team Attendance
          </Link>
        </div>
      </div>

      {alertMsg.text && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show mb-4`} role="alert">
          {alertMsg.text}
          <button type="button" className="btn-close" onClick={() => setAlertMsg({ text: '', type: '' })} />
        </div>
      )}

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Team Size"
            value={stats?.teamSize || 0}
            subtitle="Direct & department members"
            icon={Users}
            color="primary"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Present Today"
            value={stats?.teamPresentToday || 0}
            subtitle="Logged into work"
            icon={CheckCircle}
            color="success"
            badgeText={stats?.teamSize > 0 ? `${Math.round(((stats?.teamPresentToday || 0) / stats.teamSize) * 100)}%` : '0%'}
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Pending Leaves"
            value={stats?.pendingLeavesCount || 0}
            subtitle="Requiring your action"
            icon={AlertCircle}
            color="warning"
            badgeText={stats?.pendingLeavesCount > 0 ? 'Action Needed' : 'All Clear'}
            badgeColor={stats?.pendingLeavesCount > 0 ? 'warning' : 'success'}
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Active Trainings"
            value={stats?.activeTrainingsCount || 0}
            subtitle="Ongoing departmental programs"
            icon={Award}
            color="purple"
          />
        </div>
      </div>

      {/* Pending Leave Approvals Section */}
      <div className="card-modern p-4 mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h5 className="fw-bold mb-0">Team Leave Requests Awaiting Review</h5>
            <small className="text-muted">Approve or reject leave applications submitted by team members</small>
          </div>
          <span className="badge badge-soft-warning px-3 py-1">
            {stats?.pendingLeaves?.length || 0} Pending
          </span>
        </div>

        {stats?.pendingLeaves?.length === 0 ? (
          <div className="text-center py-4 bg-light rounded-3 text-muted">
            <CheckCircle size={32} className="text-success mb-2" />
            <p className="mb-0 fw-semibold">Great job! No pending leave requests to review.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-modern align-middle mb-0">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {stats?.pendingLeaves?.map((lv) => (
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
                      <small className="text-dark fw-semibold">
                        {new Date(lv.startDate).toLocaleDateString()} &rarr; {new Date(lv.endDate).toLocaleDateString()}
                      </small>
                    </td>
                    <td>
                      <span className="fw-bold text-dark">{lv.daysCount} Day(s)</span>
                    </td>
                    <td>
                      <span className="text-muted small" title={lv.reason}>
                        {lv.reason?.length > 40 ? `${lv.reason.substring(0, 40)}...` : lv.reason}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        <button
                          className="btn btn-sm btn-success d-flex align-items-center gap-1"
                          onClick={() => openReviewModal(lv, 'Approved')}
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                          onClick={() => openReviewModal(lv, 'Rejected')}
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

      {/* Lower Row: Team Attendance Today & Team Directory */}
      <div className="row g-4">
        {/* Team Attendance Today */}
        <div className="col-lg-6">
          <div className="card-modern p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0">Team Attendance Today</h5>
              <Link to="/attendance" className="text-primary small text-decoration-none fw-semibold">
                Full Log <ArrowRight size={14} />
              </Link>
            </div>

            {stats?.teamAttendanceToday?.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                No team check-ins recorded yet today.
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {stats?.teamAttendanceToday?.map((rec) => (
                  <div
                    key={rec._id}
                    className="p-3 bg-light rounded-3 d-flex align-items-center justify-content-between"
                  >
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={
                          rec.employee?.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(rec.employee?.name || 'User')}&background=4f46e5&color=fff`
                        }
                        alt={rec.employee?.name}
                        className="rounded-circle"
                        style={{ width: '36px', height: '36px', objectFit: 'cover' }}
                      />
                      <div>
                        <div className="fw-bold text-dark small">{rec.employee?.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          Check-in: {new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span
                        className={`badge badge-soft-${
                          rec.status === 'Present' ? 'success' : rec.status === 'Late' ? 'warning' : 'info'
                        } px-2 py-1`}
                      >
                        {rec.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Team Members List */}
        <div className="col-lg-6">
          <div className="card-modern p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0">Team Members Directory</h5>
              <Link to="/employees" className="text-primary small text-decoration-none fw-semibold">
                Manage Team <ArrowRight size={14} />
              </Link>
            </div>

            <div className="d-flex flex-column gap-2">
              {stats?.teamEmployees?.map((emp) => (
                <div
                  key={emp._id}
                  className="p-3 border rounded-3 d-flex align-items-center justify-content-between bg-white"
                >
                  <div className="d-flex align-items-center gap-2">
                    <img
                      src={
                        emp.user?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.user?.name || 'User')}&background=4f46e5&color=fff`
                      }
                      alt={emp.user?.name}
                      className="rounded-circle"
                      style={{ width: '36px', height: '36px', objectFit: 'cover' }}
                    />
                    <div>
                      <div className="fw-bold text-dark small">{emp.user?.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {emp.designation} &bull; {emp.employeeId}
                      </div>
                    </div>
                  </div>

                  <span className="badge bg-light text-secondary border small">
                    {emp.phone || 'No phone'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalOpen && selectedLeave && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  {reviewStatus} Leave Request: {selectedLeave.employee?.name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setReviewModalOpen(false)}
                />
              </div>
              <form onSubmit={handleReviewSubmit}>
                <div className="modal-body">
                  <div className="p-3 bg-light rounded-3 mb-3">
                    <div className="small text-muted mb-1">Request Details:</div>
                    <div className="fw-semibold">
                      {selectedLeave.leaveType} Leave ({selectedLeave.daysCount} Day(s))
                    </div>
                    <div className="small text-secondary">
                      {new Date(selectedLeave.startDate).toLocaleDateString()} to{' '}
                      {new Date(selectedLeave.endDate).toLocaleDateString()}
                    </div>
                    <div className="small text-dark mt-2">
                      <strong>Reason:</strong> "{selectedLeave.reason}"
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Manager Feedback / Comments (Optional)
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder={
                        reviewStatus === 'Approved'
                          ? 'e.g. Approved. Please ensure handoff before leaving.'
                          : 'e.g. Due to ongoing sprint release, please reschedule.'
                      }
                      value={managerComment}
                      onChange={(e) => setManagerComment(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setReviewModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn btn-${reviewStatus === 'Approved' ? 'success' : 'danger'}`}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing...' : `Confirm ${reviewStatus}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
