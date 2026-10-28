import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Clock,
  CalendarCheck,
  Award,
  Calendar,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Megaphone,
  Briefcase,
} from 'lucide-react';

const EmployeeDashboard = () => {
  const { user, refreshUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alertMsg, setAlertMsg] = useState({ text: '', type: '' });

  // Update live clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/reports/employee-dashboard');
      if (res.data.success) {
        setDashboardData(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load employee dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCheckIn = async () => {
    setActionLoading(true);
    setAlertMsg({ text: '', type: '' });
    try {
      const res = await api.post('/attendance/check-in');
      if (res.data.success) {
        setAlertMsg({ text: res.data.message, type: 'success' });
        await fetchDashboard();
        refreshUser();
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
        await fetchDashboard();
        refreshUser();
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

  if (loading) {
    return <LoadingSpinner fullScreen={true} text="Loading your dashboard..." />;
  }

  const todayRecord = dashboardData?.todayAttendance;
  const leaveBalance = dashboardData?.profile?.leaveBalance || { annual: 15, sick: 10, casual: 7 };

  return (
    <div className="container-fluid py-4 px-4">
      {/* Welcome Header */}
      <div className="row align-items-center mb-4">
        <div className="col-md-7">
          <h2 className="fw-bolder text-dark mb-1">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-muted mb-0">
            {dashboardData?.profile?.designation} &bull; {dashboardData?.profile?.department} &bull; ID: {dashboardData?.profile?.employeeId || 'EMP-SYNC'}
          </p>
        </div>

        <div className="col-md-5 text-md-end mt-3 mt-md-0">
          <Link to="/leaves" className="btn btn-primary-gradient me-2">
            <CalendarCheck size={16} className="me-1" /> Apply for Leave
          </Link>
          <Link to="/attendance" className="btn btn-outline-secondary">
            <Clock size={16} className="me-1" /> View Logs
          </Link>
        </div>
      </div>

      {alertMsg.text && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show mb-4`} role="alert">
          {alertMsg.text}
          <button type="button" className="btn-close" onClick={() => setAlertMsg({ text: '', type: '' })} />
        </div>
      )}

      {/* Top Section: Punch Card + Stat Cards */}
      <div className="row g-4 mb-4">
        {/* Attendance Punch In/Out Card */}
        <div className="col-lg-4">
          <div className="card-modern p-4 h-100 bg-white border-0 shadow-sm d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-uppercase small fw-bold text-muted">Daily Punch Clock</span>
                <span className="badge bg-light text-dark border">
                  {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>

              <div className="text-center my-3">
                <h1 className="fw-bolder display-6 text-dark tracking-tight">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </h1>

                {/* Status indicator */}
                <div className="mt-2">
                  {!todayRecord ? (
                    <span className="badge badge-soft-warning py-1 px-3">
                      Not Checked In Yet
                    </span>
                  ) : todayRecord.checkOut ? (
                    <span className="badge badge-soft-info py-1 px-3">
                      Shift Completed ({todayRecord.totalHours} hrs)
                    </span>
                  ) : (
                    <span className="badge badge-soft-success py-1 px-3">
                      ● Active Shift (Checked in at {new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Check-In / Check-Out Buttons */}
            <div className="mt-3">
              {!todayRecord ? (
                <button
                  className="btn btn-primary-gradient w-100 py-2 fw-bold"
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Recording Check-in...' : 'Punch In / Check In'}
                </button>
              ) : !todayRecord.checkOut ? (
                <button
                  className="btn btn-warning w-100 py-2 fw-bold text-dark"
                  onClick={handleCheckOut}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Recording Check-out...' : 'Punch Out / Check Out'}
                </button>
              ) : (
                <div className="text-center text-muted small bg-light py-2 rounded">
                  <CheckCircle size={16} className="text-success me-1 inline" /> Today's attendance recorded
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="col-lg-8">
          <div className="row g-3 h-100">
            <div className="col-sm-4">
              <StatCard
                title="Annual Leave"
                value={`${leaveBalance.annual} Days`}
                subtitle="Available balance"
                icon={Calendar}
                color="primary"
              />
            </div>
            <div className="col-sm-4">
              <StatCard
                title="Sick Leave"
                value={`${leaveBalance.sick} Days`}
                subtitle="Available balance"
                icon={CalendarCheck}
                color="warning"
              />
            </div>
            <div className="col-sm-4">
              <StatCard
                title="Casual Leave"
                value={`${leaveBalance.casual} Days`}
                subtitle="Available balance"
                icon={Briefcase}
                color="success"
              />
            </div>
            <div className="col-sm-6">
              <StatCard
                title="Pending Leaves"
                value={dashboardData?.pendingLeavesCount || 0}
                subtitle="Under review by manager"
                icon={AlertTriangle}
                color="purple"
              />
            </div>
            <div className="col-sm-6">
              <StatCard
                title="Enrolled Trainings"
                value={dashboardData?.enrolledTrainings?.length || 0}
                subtitle="Upcoming & active programs"
                icon={Award}
                color="info"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Recent Leaves & Announcements */}
      <div className="row g-4">
        {/* Recent Leave Applications */}
        <div className="col-lg-7">
          <div className="card-modern p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0">My Recent Leave Requests</h5>
              <Link to="/leaves" className="text-primary small text-decoration-none fw-semibold">
                View All <ArrowRight size={14} />
              </Link>
            </div>

            {dashboardData?.userLeaves?.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                No leave requests found. You haven't applied for any leaves yet.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-modern align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Dates</th>
                      <th>Days</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData?.userLeaves?.map((lv) => (
                      <tr key={lv._id}>
                        <td>
                          <span className="fw-semibold">{lv.leaveType}</span>
                        </td>
                        <td>
                          {new Date(lv.startDate).toLocaleDateString()} - {new Date(lv.endDate).toLocaleDateString()}
                        </td>
                        <td>{lv.daysCount} d</td>
                        <td>
                          <span
                            className={`badge badge-soft-${
                              lv.status === 'Approved'
                                ? 'success'
                                : lv.status === 'Rejected'
                                ? 'danger'
                                : 'warning'
                            } px-2 py-1`}
                          >
                            {lv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Company Announcements Feed */}
        <div className="col-lg-5">
          <div className="card-modern p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <Megaphone size={18} className="text-primary" />
                <h5 className="fw-bold mb-0">Announcements</h5>
              </div>
              <Link to="/announcements" className="text-primary small text-decoration-none fw-semibold">
                View All <ArrowRight size={14} />
              </Link>
            </div>

            <div className="d-flex flex-column gap-3">
              {dashboardData?.recentAnnouncements?.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  No company announcements posted yet.
                </div>
              ) : (
                dashboardData?.recentAnnouncements?.map((a) => (
                  <div key={a._id} className="p-3 bg-light rounded-3 border-start border-primary border-3">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="fw-bold text-dark small">{a.title}</span>
                      {a.priority === 'Urgent' && (
                        <span className="badge badge-soft-danger small">Urgent</span>
                      )}
                    </div>
                    <p className="text-muted small mb-1" style={{ fontSize: '0.8rem' }}>
                      {a.content?.substring(0, 100)}...
                    </p>
                    <div className="d-flex align-items-center justify-content-between text-secondary" style={{ fontSize: '0.7rem' }}>
                      <span>Posted by {a.postedBy?.name || 'HR Team'}</span>
                      <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
