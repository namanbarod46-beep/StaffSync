import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  GraduationCap,
  Calendar,
  User,
  Users,
  Video,
  Plus,
  CheckCircle,
  Tag,
  Check,
  X,
  Trash2,
} from 'lucide-react';

const TrainingsPage = () => {
  const { user } = useAuth();
  const isHR = user?.role === 'hr';
  const isManager = user?.role === 'manager';

  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Technical',
    trainer: '',
    department: 'All',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maxParticipants: 30,
    locationUrl: 'Virtual (Google Meet / Zoom)',
  });

  const [alertMsg, setAlertMsg] = useState({ text: '', type: '' });

  const fetchTrainings = async () => {
    try {
      const params = {};
      if (category !== 'All') params.category = category;
      if (status !== 'All') params.status = status;

      const res = await api.get('/trainings', { params });
      if (res.data.success) {
        setTrainings(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching trainings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, [category, status]);

  const handleEnroll = async (id) => {
    setActionLoading(true);
    try {
      const res = await api.post(`/trainings/${id}/enroll`);
      if (res.data.success) {
        setAlertMsg({ text: res.data.message, type: 'success' });
        fetchTrainings();
      }
    } catch (err) {
      setAlertMsg({
        text: err.response?.data?.message || 'Failed to update enrollment',
        type: 'danger',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateTraining = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/trainings', form);
      if (res.data.success) {
        setAlertMsg({ text: 'Training program scheduled successfully!', type: 'success' });
        setModalOpen(false);
        setForm({
          title: '',
          description: '',
          category: 'Technical',
          trainer: '',
          department: 'All',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          maxParticipants: 30,
          locationUrl: 'Virtual (Google Meet / Zoom)',
        });
        fetchTrainings();
      }
    } catch (err) {
      setAlertMsg({
        text: err.response?.data?.message || 'Failed to create training',
        type: 'danger',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTraining = async (id) => {
    if (!window.confirm('Are you sure you want to delete this training program?')) return;
    try {
      const res = await api.delete(`/trainings/${id}`);
      if (res.data.success) {
        setAlertMsg({ text: 'Training deleted successfully', type: 'info' });
        fetchTrainings();
      }
    } catch (err) {
      setAlertMsg({
        text: err.response?.data?.message || 'Failed to delete training',
        type: 'danger',
      });
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen={true} text="Loading training catalog..." />;
  }

  return (
    <div className="container-fluid py-4 px-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bolder text-dark mb-1">Corporate Training & Development</h2>
          <p className="text-muted mb-0">Enroll in technical workshops, leadership programs, and compliance certifications</p>
        </div>

        {(isHR || isManager) && (
          <button
            className="btn btn-primary-gradient"
            onClick={() => setModalOpen(true)}
          >
            <Plus size={16} className="me-1" /> Schedule New Training
          </button>
        )}
      </div>

      {alertMsg.text && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show mb-4`} role="alert">
          {alertMsg.text}
          <button type="button" className="btn-close" onClick={() => setAlertMsg({ text: '', type: '' })} />
        </div>
      )}

      {/* Filter Row */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        <select
          className="form-select bg-white border"
          style={{ width: 'auto' }}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Technical">Technical</option>
          <option value="Leadership">Leadership</option>
          <option value="Compliance">Compliance</option>
          <option value="Soft Skills">Soft Skills</option>
          <option value="Productivity">Productivity</option>
        </select>

        <select
          className="form-select bg-white border"
          style={{ width: 'auto' }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Trainings Grid */}
      <div className="row g-4">
        {trainings.length === 0 ? (
          <div className="col-12 text-center py-5">
            <div className="p-5 bg-white rounded-4 border">
              <GraduationCap size={40} className="text-muted mb-3" />
              <h5 className="fw-bold">No Training Sessions Found</h5>
              <p className="text-muted small mb-0">No corporate programs match the selected filters.</p>
            </div>
          </div>
        ) : (
          trainings.map((t) => {
            const isEnrolled = t.enrolledEmployees?.some(
              (emp) => (emp._id || emp).toString() === user?._id?.toString()
            );

            return (
              <div key={t._id} className="col-lg-6 col-xl-4">
                <div className="card-modern p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="badge badge-soft-primary">{t.category}</span>
                      <span
                        className={`badge badge-soft-${
                          t.status === 'Ongoing' ? 'success' : t.status === 'Completed' ? 'secondary' : 'info'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <h5 className="fw-bold text-dark mb-2">{t.title}</h5>

                    <p className="text-muted small mb-3" style={{ minHeight: '48px' }}>
                      {t.description?.length > 120 ? `${t.description.substring(0, 120)}...` : t.description}
                    </p>

                    <div className="bg-light p-3 rounded-3 mb-3 small d-flex flex-column gap-2 text-secondary">
                      <div className="d-flex align-items-center gap-2">
                        <User size={15} className="text-primary flex-shrink-0" />
                        <span><strong>Instructor:</strong> {t.trainer}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <Calendar size={15} className="text-warning flex-shrink-0" />
                        <span>
                          {new Date(t.startDate).toLocaleDateString()} &ndash; {new Date(t.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <Video size={15} className="text-success flex-shrink-0" />
                        <span className="text-truncate">{t.locationUrl}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <Users size={15} className="text-info flex-shrink-0" />
                        <span>
                          Enrolled: <strong>{t.enrolledEmployees?.length || 0}</strong> / {t.maxParticipants} max
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                    <button
                      className={`btn btn-sm ${
                        isEnrolled ? 'btn-outline-danger' : 'btn-primary-gradient'
                      } px-3`}
                      onClick={() => handleEnroll(t._id)}
                      disabled={actionLoading}
                    >
                      {isEnrolled ? 'Unenroll' : 'Enroll in Program'}
                    </button>

                    {isHR && (
                      <button
                        className="btn btn-sm btn-light border text-danger"
                        onClick={() => handleDeleteTraining(t._id)}
                        title="Delete Training"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Schedule Training Modal */}
      {modalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Schedule Corporate Training Session</h5>
                <button type="button" className="btn-close" onClick={() => setModalOpen(false)} />
              </div>
              <form onSubmit={handleCreateTraining}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">Course Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Advanced System Design & Scalability"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Category</label>
                      <select
                        className="form-select"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                      >
                        <option value="Technical">Technical</option>
                        <option value="Leadership">Leadership</option>
                        <option value="Compliance">Compliance</option>
                        <option value="Soft Skills">Soft Skills</option>
                        <option value="Productivity">Productivity</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Trainer / Instructor *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Dr. Jane Goodall"
                        value={form.trainer}
                        onChange={(e) => setForm({ ...form, trainer: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Start Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">End Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.endDate}
                        min={form.startDate}
                        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Target Department</label>
                      <select
                        className="form-select"
                        value={form.department}
                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                      >
                        <option value="All">All Departments</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Sales & Marketing">Sales & Marketing</option>
                        <option value="Product & Design">Product & Design</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Max Participants</label>
                      <input
                        type="number"
                        className="form-control"
                        value={form.maxParticipants}
                        onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">Location / Virtual Meeting URL</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="https://meet.google.com/xyz or Conference Room B"
                        value={form.locationUrl}
                        onChange={(e) => setForm({ ...form, locationUrl: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">Course Description *</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Provide details on learning objectives and prerequisites..."
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        required
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-gradient" disabled={actionLoading}>
                    {actionLoading ? 'Scheduling...' : 'Confirm Schedule'}
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

export default TrainingsPage;
