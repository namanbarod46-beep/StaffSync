import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatCard from '../components/common/StatCard';
import {
  BarChart3,
  Users,
  Clock,
  CalendarCheck,
  Award,
  Download,
  Building,
  PieChart,
} from 'lucide-react';

const ReportsPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/reports/hr-dashboard');
        if (res.data.success) {
          setData(res.data.stats);
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner fullScreen={true} text="Generating HR analytics..." />;
  }

  const attendance = data?.attendance || {};
  const leaves = data?.leaves || {};

  return (
    <div className="container-fluid py-4 px-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bolder text-dark mb-1">HR Reports & Executive Analytics</h2>
          <p className="text-muted mb-0">Organizational workforce distribution, punctuality metrics, and leave trends</p>
        </div>

        <button className="btn btn-outline-secondary" onClick={handlePrint}>
          <Download size={16} className="me-1" /> Export / Print Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Total Active Headcount"
            value={data?.totalUsers || 0}
            subtitle={`${data?.totalEmployees} Staff & ${data?.totalManagers} Managers`}
            icon={Users}
            color="primary"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Organization Attendance"
            value={`${attendance.attendanceRate || 0}%`}
            subtitle={`${attendance.totalLoggedToday || 0} checked in today`}
            icon={Clock}
            color="success"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Leave Utilization"
            value={`${leaves.total || 0} Total`}
            subtitle={`${leaves.approved || 0} Approved / ${leaves.pending || 0} Pending`}
            icon={CalendarCheck}
            color="warning"
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

      {/* Analytics Breakdown Row */}
      <div className="row g-4 mb-4">
        {/* Department Headcount */}
        <div className="col-lg-6">
          <div className="card-modern p-4 h-100">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Building size={20} className="text-primary" />
              <h5 className="fw-bold mb-0">Headcount by Department</h5>
            </div>

            <div className="table-responsive">
              <table className="table table-modern align-middle mb-0">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Count</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.departmentStats?.map((dept) => {
                    const share = data?.totalUsers > 0 ? Math.round((dept.count / data.totalUsers) * 100) : 0;
                    return (
                      <tr key={dept._id}>
                        <td className="fw-semibold">{dept._id}</td>
                        <td>{dept.count} Members</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="progress flex-grow-1" style={{ height: '6px' }}>
                              <div
                                className="progress-bar bg-primary"
                                style={{ width: `${share}%` }}
                              ></div>
                            </div>
                            <span className="small text-muted">{share}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Leave Distribution */}
        <div className="col-lg-6">
          <div className="card-modern p-4 h-100">
            <div className="d-flex align-items-center gap-2 mb-3">
              <PieChart size={20} className="text-success" />
              <h5 className="fw-bold mb-0">Leave Applications by Category</h5>
            </div>

            <div className="table-responsive">
              <table className="table table-modern align-middle mb-0">
                <thead>
                  <tr>
                    <th>Leave Category</th>
                    <th>Volume</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.leaveTypeStats?.map((lt) => {
                    const totalLeaves = leaves.total || 1;
                    const share = Math.round((lt.count / totalLeaves) * 100);
                    return (
                      <tr key={lt._id}>
                        <td className="fw-semibold">{lt._id} Leave</td>
                        <td>{lt.count} Requests</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="progress flex-grow-1" style={{ height: '6px' }}>
                              <div
                                className="progress-bar bg-success"
                                style={{ width: `${share}%` }}
                              ></div>
                            </div>
                            <span className="small text-muted">{share}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Metrics Deep Dive */}
      <div className="card-modern p-4">
        <h5 className="fw-bold mb-3">Today's Attendance Roster Breakdown</h5>
        <div className="row g-3">
          <div className="col-sm-3">
            <div className="p-3 bg-light rounded-3 text-center border-start border-success border-4">
              <span className="text-muted small fw-bold">ON-TIME ARRIVALS</span>
              <div className="h2 fw-bolder text-success mt-1">{attendance.presentCount || 0}</div>
              <small className="text-muted">Clocked in before 09:30 AM</small>
            </div>
          </div>
          <div className="col-sm-3">
            <div className="p-3 bg-light rounded-3 text-center border-start border-warning border-4">
              <span className="text-muted small fw-bold">LATE ARRIVALS</span>
              <div className="h2 fw-bolder text-warning mt-1">{attendance.lateCount || 0}</div>
              <small className="text-muted">Clocked in after 09:30 AM</small>
            </div>
          </div>
          <div className="col-sm-3">
            <div className="p-3 bg-light rounded-3 text-center border-start border-info border-4">
              <span className="text-muted small fw-bold">HALF-DAY SHIFTS</span>
              <div className="h2 fw-bolder text-info mt-1">{attendance.halfDayCount || 0}</div>
              <small className="text-muted">Under 4.5 working hours</small>
            </div>
          </div>
          <div className="col-sm-3">
            <div className="p-3 bg-light rounded-3 text-center border-start border-danger border-4">
              <span className="text-muted small fw-bold">ABSENT / NOT LOGGED</span>
              <div className="h2 fw-bolder text-danger mt-1">{attendance.absentCount || 0}</div>
              <small className="text-muted">No attendance recorded</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
