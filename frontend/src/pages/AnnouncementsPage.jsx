import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Megaphone,
  Pin,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Tag,
  CheckCircle,
} from 'lucide-react';

const AnnouncementsPage = () => {
  const { user } = useAuth();
  const isHR = user?.role === 'hr';

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [category, setCategory] = useState('All');
  const [priority, setPriority] = useState('All');

  // Modal State (HR)
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'General',
    priority: 'Medium',
    targetAudience: 'All',
    isPinned: false,
  });

  const [alertMsg, setAlertMsg] = useState({ text: '', type: '' });

  const fetchAnnouncements = async () => {
    try {
      const params = {};
      if (category !== 'All') params.category = category;
      if (priority !== 'All') params.priority = priority;

      const res = await api.get('/announcements', { params });
      if (res.data.success) {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [category, priority]);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setAlertMsg({ text: '', type: '' });

    try {
      const res = await api.post('/announcements', form);
      if (res.data.success) {
        setAlertMsg({ text: 'Announcement broadcasted successfully!', type: 'success' });
        setModalOpen(false);
        setForm({
          title: '',
          content: '',
          category: 'General',
          priority: 'Medium',
          targetAudience: 'All',
          isPinned: false,
        });
        await fetchAnnouncements();
      }
    } catch (err) {
      setAlertMsg({
        text: err.response?.data?.message || 'Failed to post announcement',
        type: 'danger',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePin = async (id) => {
    try {
      const res = await api.put(`/announcements/${id}/pin`);
      if (res.data.success) {
        fetchAnnouncements();
      }
    } catch (err) {
      console.error('Error toggling pin:', err);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const res = await api.delete(`/announcements/${id}`);
      if (res.data.success) {
        setAlertMsg({ text: 'Announcement deleted successfully', type: 'info' });
        fetchAnnouncements();
      }
    } catch (err) {
      setAlertMsg({
        text: err.response?.data?.message || 'Failed to delete announcement',
        type: 'danger',
      });
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen={true} text="Loading announcements..." />;
  }

  return (
    <div className="container-fluid py-4 px-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bolder text-dark mb-1">Company Announcements</h2>
          <p className="text-muted mb-0">Stay informed on organizational news, policies, and company events</p>
        </div>

        {isHR && (
          <button
            className="btn btn-primary-gradient"
            onClick={() => setModalOpen(true)}
          >
            <Plus size={16} className="me-1" /> Post Announcement
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
          <option value="General">General</option>
          <option value="Policy">Policy</option>
          <option value="Holiday">Holiday</option>
          <option value="Event">Event</option>
          <option value="Urgent">Urgent</option>
        </select>

        <select
          className="form-select bg-white border"
          style={{ width: 'auto' }}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="All">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>
      </div>

      {/* Announcements Feed */}
      <div className="row g-4">
        {announcements.length === 0 ? (
          <div className="col-12 text-center py-5">
            <div className="p-5 bg-white rounded-4 border">
              <Megaphone size={40} className="text-muted mb-3" />
              <h5 className="fw-bold">No Announcements Found</h5>
              <p className="text-muted small mb-0">There are currently no active announcements matching your filters.</p>
            </div>
          </div>
        ) : (
          announcements.map((item) => (
            <div key={item._id} className="col-lg-6">
              <div
                className={`card-modern p-4 h-100 position-relative ${
                  item.isPinned ? 'border-primary border-2' : ''
                }`}
              >
                {/* Pin indicator */}
                {item.isPinned && (
                  <div
                    className="position-absolute top-0 end-0 bg-primary text-white px-3 py-1 rounded-bottom-start small fw-bold d-flex align-items-center gap-1"
                    style={{ fontSize: '0.75rem' }}
                  >
                    <Pin size={12} /> PINNED
                  </div>
                )}

                <div className="d-flex align-items-center gap-2 mb-2">
                  <span
                    className={`badge badge-soft-${
                      item.priority === 'Urgent'
                        ? 'danger'
                        : item.priority === 'High'
                        ? 'warning'
                        : 'primary'
                    }`}
                  >
                    {item.priority === 'Urgent' && <span className="pulse-indicator me-1"></span>}
                    {item.priority} Priority
                  </span>
                  <span className="badge bg-light text-secondary border">{item.category}</span>
                </div>

                <h5 className="fw-bold text-dark mb-2 mt-1">{item.title}</h5>

                <p className="text-muted small mb-4" style={{ lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                  {item.content}
                </p>

                <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-auto">
                  <div className="d-flex align-items-center gap-2">
                    <img
                      src={
                        item.postedBy?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(item.postedBy?.name || 'Staff')}&background=4f46e5&color=fff`
                      }
                      alt={item.postedBy?.name}
                      className="rounded-circle"
                      style={{ width: '28px', height: '28px', objectFit: 'cover' }}
                    />
                    <div style={{ fontSize: '0.8rem' }}>
                      <span className="fw-semibold text-dark d-block lh-1">{item.postedBy?.name}</span>
                      <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {isHR && (
                    <div className="d-flex gap-1">
                      <button
                        className={`btn btn-sm ${item.isPinned ? 'btn-primary' : 'btn-light border'} p-1 px-2`}
                        onClick={() => handleTogglePin(item._id)}
                        title={item.isPinned ? 'Unpin' : 'Pin to top'}
                      >
                        <Pin size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-light border text-danger p-1 px-2"
                        onClick={() => handleDeleteAnnouncement(item._id)}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Post Announcement Modal (HR) */}
      {modalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Post Company Announcement</h5>
                <button type="button" className="btn-close" onClick={() => setModalOpen(false)} />
              </div>
              <form onSubmit={handleCreateAnnouncement}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Annual Health Checkup Schedule"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Category</label>
                      <select
                        className="form-select"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                      >
                        <option value="General">General</option>
                        <option value="Policy">Policy</option>
                        <option value="Holiday">Holiday</option>
                        <option value="Event">Event</option>
                        <option value="Celebration">Celebration</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Priority</label>
                      <select
                        className="form-select"
                        value={form.priority}
                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Content *</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Write announcement details here..."
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="pinCheck"
                      checked={form.isPinned}
                      onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                    />
                    <label className="form-check-label small text-secondary" htmlFor="pinCheck">
                      Pin this announcement to top of dashboard and feed
                    </label>
                  </div>
                </div>

                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-gradient" disabled={actionLoading}>
                    {actionLoading ? 'Broadcasting...' : 'Broadcast Announcement'}
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

export default AnnouncementsPage;
