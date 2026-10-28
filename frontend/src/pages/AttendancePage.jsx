import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Clock,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  TrendingUp,
} from 'lucide-react';

const AttendancePage = () => {
  const { user } = useAuth();
  const isHR = user?.role === 'hr';
  const isManager = user?.role === 'manager';

  const [activeTab, setActiveTab] = useState(isHR || isManager ? 'all' : 'my');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // My Attendance state
  const [myRecords, setMyRecords] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [todayRecord, setTodayRecord] = useState(null);

  // All Attendance state (HR/Manager)
  const [allRecords, setAllRecords] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Manual Attendance Modal (HR only)
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [employeesList, setEmployeesList] = useState([]);
  const [manualForm, setManualForm] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    checkIn: '09:00',
    checkOut: '17:30',
    totalHours: 8.5,
    notes: 'Manual entry by HR',
  });

  const [alertMsg, setAlertMsg] = useState({ text: '', type: '' });

  const fetchMyAttendance = async () => {
    try {
      const [recRes, todayRes] = await Promise.all([
        api.get('/attendance/my'),
        api.get('/attendance/today'),
      ]);

      if (recRes.data.success) {
        setMyRecords(recRes.data.data);
        setMyStats(recRes.data.stats);
      }
      if (todayRes.data.success) {
        setTodayRecord(todayRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching my attendance:', err);
    }
  };

  const fetchAllAttendance = async () => {
    try {
      const params = {};
      if (filterDate) params.date = filterDate;
      if (filterDepartment !== 'All') params.department = filterDepartment;
      if (filterStatus !== 'All') params.status = filterStatus;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/attendance', { params });
      if (res.data.success) {
        setAllRecords(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching all attendance:', err);
    }
  };

  const fetchEmployeesList = async () => {
    if (isHR) {
      try {
        const res = await api.get('/employees');
        if (res.data.success) {
          setEmployeesList(res.data.data);
          if (res.data.data.length > 0 && !manualForm.employeeId) {
            setManualForm((prev) => ({ ...prev, employeeId: res.data.data[0].user?._id }));
          }
        }
      } catch (err) {
        console.error('Error fetching employees list:', err);
      }
    }
  };

  useEffect(() => {
    setLoading(true);
    const load = async () => {
      await fetchMyAttendance();
      if (isHR || isManager) {
        await fetchAllAttendance();
      }
      if (isHR) {
        await fetchEmployeesList();
      }
      setLoading(false);
    };
    load();
  }, [filterDate, filterDepartment, filterStatus]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    setAlertMsg({ text: '', type: '' });
    try {
      const res = await api.post('/attendance/check-in');
      if (res.data.success) {
        setAlertMsg({ text: res.data.message, type: 'success' });
        await fetchMyAttendance();
        if (isHR || isManager) await fetchAllAttendance();
      }
    } catch (err) {
      setAlertMsg({
        text: err.response?.data?.message || 'Check-in failed',
        type: 'danger',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setAlertMsg({ text: '', type: '' });
    try {
      const res = await api.post('/attendance/check-out');
      if (res.data.success) {
        setAlertMsg({ text: res.data.message, type: 'success' });
        await fetchMyAttendance();
        if (isHR || isManager) await fetchAllAttendance();
      }
    } catch (err) {
      setAlertMsg({
        text: err.response?.data?.message || 'Check-out failed',
        type: 'danger',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const [cinH, cinM] = manualForm.checkIn.split(':');
      const cinDate = new Date(manualForm.date);
      cinDate.setHours(parseInt(cinH), parseInt(cinM), 0);

      const [coutH, coutM] = manualForm.checkOut.split(':');
      const coutDate = new Date(manualForm.date);
      coutDate.setHours(parseInt(coutH), parseInt(coutM), 0);

      const res = await api.post('/attendance/manual', {
        employeeId: manualForm.employeeId,
        date: manualForm.date,
        status: manualForm.status,
        checkIn: cinDate,
        checkOut: coutDate,
        totalHours: manualForm.totalHours,
        notes: manualForm.notes,
      });

      if (res.data.success) {
        setAlertMsg({ text: 'Manual attendance recorded successfully', type: 'success' });
        setManualModalOpen(false);
        await fetchAllAttendance();
      }
    } catch (err) {
      setAlertMsg({
        text: err.response?.data?.message || 'Failed to record manual attendance',
        type: 'danger',
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen={true} text="Loading Attendance records..." />;
  }

  return (
    <div className="container-fluid py-4 px-4">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bolder text-dark mb-1">Attendance Management</h2>
          <p className="text-muted mb-0">Track daily work hours, punctuality, and attendance records</p>
        </div>

        {isHR && (
          <button
            className="btn btn-primary-gradient"
            onClick={() => setManualModalOpen(true)}
          >
            <Plus size={16} className="me-1" /> Record Manual Attendance
          </button>
        )}
      </div>

      {alertMsg.text && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show mb-4`} role="alert">
          {alertMsg.text}
          <button type="button" className="btn-close" onClick={() => setAlertMsg({ text: '', type: '' })} />
        </div>
      )}

      {/* Check In / Out Widget Banner */}
      <div className="card-modern p-4 mb-4 bg-white">
        <div className="row align-items-center">
          <div className="col-md-7">
            <div className="d-flex align-items-center gap-3">
              <div
                className="icon-wrapper rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: '48px', height: '48px', backgroundColor: '#e0e7ff', color: '#4338ca' }}
              >
                <Clock size={24} />
              </div>
              <div>
                <h5 className="fw-bold mb-1">Today's Shift Status</h5>
                <p className="text-muted small mb-0">
                  {!todayRecord ? (
                    'You have not checked in for today yet.'
                  ) : todayRecord.checkOut ? (
                    `Shift complete. Checked in at ${new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, checked out at ${new Date(todayRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Total: ${todayRecord.totalHours} hrs.`
                  ) : (
                    `Checked in at ${new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Current Status: ${todayRecord.status}.`
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-5 text-md-end mt-3 mt-md-0">
            {!todayRecord ? (
              <button
                className="btn btn-primary-gradient px-4 py-2"
                onClick={handleCheckIn}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Punch In / Check In'}
              </button>
            ) : !todayRecord.checkOut ? (
              <button
                className="btn btn-warning px-4 py-2 fw-bold text-dark"
                onClick={handleCheckOut}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Punch Out / Check Out'}
              </button>
            ) : (
              <span className="badge badge-soft-success py-2 px-3 fs-6">
                <CheckCircle size={16} className="me-1 inline" /> Completed for Today
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs if HR/Manager */}
      {(isHR || isManager) && (
        <ul className="nav nav-pills mb-4 gap-2">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'all' ? 'active' : 'bg-white border text-dark'}`}
              onClick={() => setActiveTab('all')}
            >
              {isHR ? 'Organization-wide Attendance' : 'Team Attendance'}
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'my' ? 'active' : 'bg-white border text-dark'}`}
              onClick={() => setActiveTab('my')}
            >
              My Personal Attendance Logs
            </button>
          </li>
        </ul>
      )}

      {/* Tab 1: Organization/Team Attendance (HR/Manager) */}
      {(isHR || isManager) && activeTab === 'all' && (
        <div className="card-modern p-4">
          {/* Filters Bar */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <label className="form-label small fw-semibold text-secondary">Date</label>
              <input
                type="date"
                className="form-control"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-semibold text-secondary">Department</label>
              <select
                className="form-select"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Product & Design">Product & Design</option>
                <option value="Finance & Accounts">Finance & Accounts</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-semibold text-secondary">Status</label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Half-day">Half-day</option>
                <option value="Absent">Absent</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-semibold text-secondary">Search</label>
              <div className="input-group">
                <span className="input-group-text bg-white text-muted">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Name, ID, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyUp={(e) => e.key === 'Enter' && fetchAllAttendance()}
                />
              </div>
            </div>
          </div>

          {/* Roster Table */}
          <div className="table-responsive">
            <table className="table table-modern align-middle mb-0">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Total Hours</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {allRecords.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      No attendance records found matching current filters.
                    </td>
                  </tr>
                ) : (
                  allRecords.map((rec) => (
                    <tr key={rec._id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={
                              rec.employee?.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(rec.employee?.name || 'User')}&background=4f46e5&color=fff`
                            }
                            alt={rec.employee?.name}
                            className="rounded-circle"
                            style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                          />
                          <div>
                            <div className="fw-bold text-dark">{rec.employee?.name}</div>
                            <div className="text-muted small">
                              {rec.employeeId} &bull; {rec.designation}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{rec.department}</span>
                      </td>
                      <td>{new Date(rec.date).toLocaleDateString()}</td>
                      <td>
                        {rec.checkIn
                          ? new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '--:--'}
                      </td>
                      <td>
                        {rec.checkOut
                          ? new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '--:--'}
                      </td>
                      <td>
                        <span className="fw-bold text-dark">{rec.totalHours || 0} hrs</span>
                      </td>
                      <td>
                        <span
                          className={`badge badge-soft-${
                            rec.status === 'Present'
                              ? 'success'
                              : rec.status === 'Late'
                              ? 'warning'
                              : rec.status === 'Half-day'
                              ? 'info'
                              : 'danger'
                          } px-2 py-1`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td>
                        <small className="text-muted">{rec.notes || '-'}</small>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: My Personal Attendance */}
      {(!isHR && !isManager || activeTab === 'my') && (
        <div className="card-modern p-4">
          {/* Quick Stats */}
          {myStats && (
            <div className="row g-3 mb-4">
              <div className="col-sm-3">
                <div className="p-3 bg-light rounded-3 text-center">
                  <div className="h3 fw-bold text-primary mb-0">{myStats.totalDaysLogged}</div>
                  <small className="text-muted fw-semibold">Days Logged</small>
                </div>
              </div>
              <div className="col-sm-3">
                <div className="p-3 bg-light rounded-3 text-center">
                  <div className="h3 fw-bold text-success mb-0">{myStats.totalPresent}</div>
                  <small className="text-muted fw-semibold">On-Time Days</small>
                </div>
              </div>
              <div className="col-sm-3">
                <div className="p-3 bg-light rounded-3 text-center">
                  <div className="h3 fw-bold text-warning mb-0">{myStats.totalLate}</div>
                  <small className="text-muted fw-semibold">Late Arrivals</small>
                </div>
              </div>
              <div className="col-sm-3">
                <div className="p-3 bg-light rounded-3 text-center">
                  <div className="h3 fw-bold text-info mb-0">{myStats.totalHours} hrs</div>
                  <small className="text-muted fw-semibold">Total Hours Worked</small>
                </div>
              </div>
            </div>
          )}

          <h5 className="fw-bold mb-3">Attendance History</h5>
          <div className="table-responsive">
            <table className="table table-modern align-middle mb-0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Working Hours</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {myRecords.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      No attendance logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  myRecords.map((r) => (
                    <tr key={r._id}>
                      <td className="fw-semibold">
                        {new Date(r.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td>
                        {r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                      </td>
                      <td>
                        {r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                      </td>
                      <td>
                        <strong>{r.totalHours || 0} hrs</strong>
                      </td>
                      <td>
                        <span
                          className={`badge badge-soft-${
                            r.status === 'Present'
                              ? 'success'
                              : r.status === 'Late'
                              ? 'warning'
                              : r.status === 'Half-day'
                              ? 'info'
                              : 'danger'
                          } px-2 py-1`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="text-muted small">{r.notes || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Entry Modal (HR) */}
      {manualModalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Record Manual Attendance</h5>
                <button type="button" className="btn-close" onClick={() => setManualModalOpen(false)} />
              </div>
              <form onSubmit={handleManualSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Select Employee *</label>
                    <select
                      className="form-select"
                      value={manualForm.employeeId}
                      onChange={(e) => setManualForm({ ...manualForm, employeeId: e.target.value })}
                      required
                    >
                      {employeesList.map((emp) => (
                        <option key={emp._id} value={emp.user?._id}>
                          {emp.user?.name} ({emp.employeeId} - {emp.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={manualForm.date}
                        onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Status *</label>
                      <select
                        className="form-select"
                        value={manualForm.status}
                        onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
                      >
                        <option value="Present">Present</option>
                        <option value="Late">Late</option>
                        <option value="Half-day">Half-day</option>
                        <option value="Absent">Absent</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-4">
                      <label className="form-label small fw-semibold text-secondary">Check-In</label>
                      <input
                        type="time"
                        className="form-control"
                        value={manualForm.checkIn}
                        onChange={(e) => setManualForm({ ...manualForm, checkIn: e.target.value })}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small fw-semibold text-secondary">Check-Out</label>
                      <input
                        type="time"
                        className="form-control"
                        value={manualForm.checkOut}
                        onChange={(e) => setManualForm({ ...manualForm, checkOut: e.target.value })}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small fw-semibold text-secondary">Total Hours</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        value={manualForm.totalHours}
                        onChange={(e) => setManualForm({ ...manualForm, totalHours: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Notes</label>
                    <input
                      type="text"
                      className="form-control"
                      value={manualForm.notes}
                      onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                      placeholder="e.g. Approved adjustment, client visit"
                    />
                  </div>
                </div>

                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setManualModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-gradient" disabled={actionLoading}>
                    {actionLoading ? 'Saving...' : 'Save Attendance Record'}
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

export default AttendancePage;
