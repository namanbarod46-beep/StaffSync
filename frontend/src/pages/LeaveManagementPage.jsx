import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  CalendarDays,
  CalendarCheck,
  CheckCircle,
  Clock,
  Plus,
  Check,
  X,
  Filter,
  Trash2,
} from 'lucide-react';

const LeaveManagementPage = () => {
  const { user } = useAuth();
  const isHR = user?.role === 'hr';
  const isManager = user?.role === 'manager';

  const [activeTab, setActiveTab] = useState('my');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // My leaves & balance
  const [myLeaves, setMyLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({ annual: 15, sick: 10, casual: 7 });

  // Organization/Team leaves (HR/Manager)
  const [allLeaves, setAllLeaves] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');

  // Apply Leave Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({
    leaveType: 'Casual',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  // Review Modal state (HR/Manager)
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('Approved');
  const [managerComment, setManagerComment] = useState('');

  const [alertMsg, setAlertMsg] = useState({ text: '', type: '' });

  // Calculate days count
  const calculateDays = (start, end) => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  const fetchMyLeaves = async () => {
    try {
      const res = await api.get('/leaves/my');
      if (res.data.success) {
        setMyLeaves(res.data.data);
        if (res.data.leaveBalance) setLeaveBalance(res.data.leaveBalance);
      }
    } catch (err) {
      console.error('Error fetching my leaves:', err);
    }
  };

  const fetchAllLeaves = async () => {
    try {
      const params = {};
      if (filterStatus !== 'All') params.status = filterStatus;
      if (filterType !== 'All') params.leaveType = filterType;

      const res = await api.get('/leaves', { params });
      if (res.data.success) {
        setAllLeaves(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching all leaves:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    const load = async () => {
      await fetchMyLeaves();
      if (isHR || isManager) {
        await fetchAllLeaves();
      }
      setLoading(false);
    };
    load();
  }, [filterStatus, filterType]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setAlertMsg({ text: '', type: '' });

    try {
      const res = await api.post('/leaves', applyForm);
      if (res.data.success) {
        setAlertMsg({ text: 'Leave application submitted successfully!', type: 'success' });
        setApplyModalOpen(false);
        setApplyForm({
          leaveType: 'Casual',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          reason: '',
        });
        await fetchMyLeaves();
        if (isHR || isManager) await fetchAllLeaves();
      }
    } catch (err) {
      setAlertMsg({
        text: err.response?.data?.message || 'Failed to submit leave application',
        type: 'danger',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelLeave = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this pending leave request?')) return;
    try {
      const res = await api.delete(`/leaves/${id}`);
      if (res.data.success) {
        setAlertMsg({ text: 'Leave request cancelled successfully', type: 'info' });
        await fetchMyLeaves();
        if (isHR || isManager) await fetchAllLeaves();
      }
    } catch (err) {
      setAlertMsg({
        text: err.response?.data?.message || 'Failed to cancel leave',
        type: 'danger',
      });
    }
  };

  const openReviewModal = (lv, status) => {
    setSelectedLeave(lv);
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
        await fetchAllLeaves();
        await fetchMyLeaves();
      }
    } catch (err) {
      setAlertMsg({
        text: err.response?.data?.message || 'Failed to process leave review',
        type: 'danger',
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen={true} text="Loading leave management..." />;
  }

  return (
    <div className="container-fluid py-4 px-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bolder text-dark mb-1">Leave Management</h2>
          <p className="text-muted mb-0">Apply for leaves, monitor approval workflows, and check balance allowances</p>
        </div>

        <button
          className="btn btn-primary-gradient"
          onClick={() => setApplyModalOpen(true)}
        >
          <Plus size={16} className="me-1" /> Apply for Leave
        </button>
      </div>

      {alertMsg.text && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show mb-4`} role="alert">
          {alertMsg.text}
          <button type="button" className="btn-close" onClick={() => setAlertMsg({ text: '', type: '' })} />
        </div>
      )}

      {/* Leave Balances Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-4">
          <div className="card-modern p-3 border-start border-primary border-4 bg-white">
            <div className="text-muted small fw-bold text-uppercase">Annual Leave</div>
            <div className="h2 fw-bolder text-dark my-1">{leaveBalance.annual} Days</div>
            <small className="text-muted">Paid vacation allowance</small>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card-modern p-3 border-start border-warning border-4 bg-white">
            <div className="text-muted small fw-bold text-uppercase">Sick Leave</div>
            <div className="h2 fw-bolder text-dark my-1">{leaveBalance.sick} Days</div>
            <small className="text-muted">Medical & health leaves</small>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card-modern p-3 border-start border-success border-4 bg-white">
            <div className="text-muted small fw-bold text-uppercase">Casual Leave</div>
            <div className="h2 fw-bolder text-dark my-1">{leaveBalance.casual} Days</div>
            <small className="text-muted">Personal & urgent matters</small>
          </div>
        </div>
      </div>

      {/* Tabs for HR / Manager */}
      {(isHR || isManager) && (
        <ul className="nav nav-pills mb-4 gap-2">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'review' ? 'active' : 'bg-white border text-dark'}`}
              onClick={() => setActiveTab('review')}
            >
              {isHR ? 'All Organization Leave Requests' : 'Team Leave Requests to Review'}
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'my' ? 'active' : 'bg-white border text-dark'}`}
              onClick={() => setActiveTab('my')}
            >
              My Personal Leave Applications
            </button>
          </li>
        </ul>
      )}

      {/* Tab 1: Review Requests (HR/Manager) */}
      {(isHR || isManager) && activeTab === 'review' && (
        <div className="card-modern p-4">
          {/* Filters */}
          <div className="row g-3 mb-3">
            <div className="col-md-3">
              <label className="form-label small fw-semibold text-secondary">Status Filter</label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending Only</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold text-secondary">Type Filter</label>
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="All">All Leave Types</option>
                <option value="Annual">Annual</option>
                <option value="Sick">Sick</option>
                <option value="Casual">Casual</option>
                <option value="Maternity/Paternity">Maternity/Paternity</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-modern align-middle mb-0">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Department</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allLeaves.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      No leave requests match the current filters.
                    </td>
                  </tr>
                ) : (
                  allLeaves.map((lv) => (
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
                            <div className="text-muted small">{lv.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{lv.department}</span>
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
                        <span className="text-muted small" title={lv.reason}>
                          {lv.reason?.length > 30 ? `${lv.reason.substring(0, 30)}...` : lv.reason}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge badge-soft-${
                            lv.status === 'Approved' ? 'success' : lv.status === 'Rejected' ? 'danger' : 'warning'
                          } px-2 py-1`}
                        >
                          {lv.status}
                        </span>
                      </td>
                      <td className="text-end">
                        {lv.status === 'Pending' ? (
                          <div className="d-inline-flex gap-1">
                            <button
                              className="btn btn-sm btn-success py-1 px-2"
                              title="Approve"
                              onClick={() => openReviewModal(lv, 'Approved')}
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger py-1 px-2"
                              title="Reject"
                              onClick={() => openReviewModal(lv, 'Rejected')}
                            >
                              <X size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <small className="text-muted fst-italic">
                            Reviewed by {lv.reviewedBy?.name?.split(' ')[0] || 'Manager'}
                          </small>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: My Personal Leaves */}
      {(!isHR && !isManager || activeTab === 'my') && (
        <div className="card-modern p-4">
          <h5 className="fw-bold mb-3">My Leave Application History</h5>
          <div className="table-responsive">
            <table className="table table-modern align-middle mb-0">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Reviewer Feedback</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {myLeaves.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      You haven't submitted any leave applications yet.
                    </td>
                  </tr>
                ) : (
                  myLeaves.map((lv) => (
                    <tr key={lv._id}>
                      <td className="fw-bold">{lv.leaveType}</td>
                      <td>{new Date(lv.startDate).toLocaleDateString()}</td>
                      <td>{new Date(lv.endDate).toLocaleDateString()}</td>
                      <td>{lv.daysCount} d</td>
                      <td className="text-muted small">{lv.reason}</td>
                      <td>
                        <span
                          className={`badge badge-soft-${
                            lv.status === 'Approved' ? 'success' : lv.status === 'Rejected' ? 'danger' : 'warning'
                          } px-2 py-1`}
                        >
                          {lv.status}
                        </span>
                      </td>
                      <td className="small text-muted">
                        {lv.managerComment ? `"${lv.managerComment}"` : '-'}
                      </td>
                      <td className="text-end">
                        {lv.status === 'Pending' && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleCancelLeave(lv._id)}
                            title="Cancel request"
                          >
                            <Trash2 size={14} /> Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {applyModalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Apply for Leave</h5>
                <button type="button" className="btn-close" onClick={() => setApplyModalOpen(false)} />
              </div>
              <form onSubmit={handleApplySubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Leave Type *</label>
                    <select
                      className="form-select"
                      value={applyForm.leaveType}
                      onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
                    >
                      <option value="Casual">Casual Leave (Available: {leaveBalance.casual} d)</option>
                      <option value="Sick">Sick Leave (Available: {leaveBalance.sick} d)</option>
                      <option value="Annual">Annual Vacation (Available: {leaveBalance.annual} d)</option>
                      <option value="Maternity/Paternity">Maternity / Paternity</option>
                      <option value="Unpaid">Unpaid Leave</option>
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Start Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={applyForm.startDate}
                        onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">End Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={applyForm.endDate}
                        min={applyForm.startDate}
                        onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="p-2 bg-light rounded-3 mb-3 text-secondary small">
                    Requested Duration: <strong>{calculateDays(applyForm.startDate, applyForm.endDate)} Day(s)</strong>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Reason for Leave *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Please clearly explain why you need time off..."
                      value={applyForm.reason}
                      onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setApplyModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-gradient" disabled={actionLoading}>
                    {actionLoading ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && selectedLeave && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  {reviewStatus} Leave for {selectedLeave.employee?.name}
                </h5>
                <button type="button" className="btn-close" onClick={() => setReviewModalOpen(false)} />
              </div>
              <form onSubmit={handleReviewSubmit}>
                <div className="modal-body">
                  <div className="p-3 bg-light rounded-3 mb-3">
                    <div>
                      <strong>Type:</strong> {selectedLeave.leaveType} ({selectedLeave.daysCount} days)
                    </div>
                    <div>
                      <strong>Dates:</strong> {new Date(selectedLeave.startDate).toLocaleDateString()} to{' '}
                      {new Date(selectedLeave.endDate).toLocaleDateString()}
                    </div>
                    <div className="mt-1">
                      <strong>Reason:</strong> "{selectedLeave.reason}"
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Feedback / Remark (Optional)
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={managerComment}
                      onChange={(e) => setManagerComment(e.target.value)}
                      placeholder="e.g. Approved. Please hand over pending tasks."
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setReviewModalOpen(false)}>
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

export default LeaveManagementPage;
