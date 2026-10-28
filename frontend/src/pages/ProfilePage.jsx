import React, { useState } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Briefcase,
  Key,
  CheckCircle,
  AlertCircle,
  Calendar,
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const empProfile = user?.employeeProfile || {};

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: empProfile.phone || '',
    street: empProfile.address?.street || '',
    city: empProfile.address?.city || '',
    state: empProfile.address?.state || '',
    zipCode: empProfile.address?.zipCode || '',
    emergencyName: empProfile.emergencyContact?.name || '',
    emergencyRel: empProfile.emergencyContact?.relationship || '',
    emergencyPhone: empProfile.emergencyContact?.phone || '',
    skills: empProfile.skills ? empProfile.skills.join(', ') : '',
  });

  // Password Form state
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [alertMsg, setAlertMsg] = useState({ text: '', type: '' });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlertMsg({ text: '', type: '' });

    try {
      const payload = {
        name: profileForm.name,
        phone: profileForm.phone,
        address: {
          street: profileForm.street,
          city: profileForm.city,
          state: profileForm.state,
          zipCode: profileForm.zipCode,
        },
        emergencyContact: {
          name: profileForm.emergencyName,
          relationship: profileForm.emergencyRel,
          phone: profileForm.emergencyPhone,
        },
        skills: profileForm.skills
          ? profileForm.skills.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      };

      const res = await updateUserProfile(payload);
      if (res.success) {
        setAlertMsg({ text: 'Profile updated successfully!', type: 'success' });
      } else {
        setAlertMsg({ text: res.message || 'Failed to update profile', type: 'danger' });
      }
    } catch (err) {
      setAlertMsg({ text: 'Error updating profile', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      setAlertMsg({ text: 'New passwords do not match!', type: 'danger' });
      return;
    }

    if (passForm.newPassword.length < 6) {
      setAlertMsg({ text: 'New password must be at least 6 characters long', type: 'danger' });
      return;
    }

    setLoading(true);
    setAlertMsg({ text: '', type: '' });

    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });

      if (res.data.success) {
        setAlertMsg({ text: 'Password changed successfully!', type: 'success' });
        setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setAlertMsg({
        text: err.response?.data?.message || 'Failed to update password',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4 px-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bolder text-dark mb-1">My Account & Profile</h2>
        <p className="text-muted mb-0">Manage your contact details, emergency information, and account security</p>
      </div>

      {alertMsg.text && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show mb-4`} role="alert">
          {alertMsg.text}
          <button type="button" className="btn-close" onClick={() => setAlertMsg({ text: '', type: '' })} />
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Official Profile Card */}
        <div className="col-lg-4">
          <div className="card-modern p-4 text-center bg-white mb-4">
            <img
              src={
                user?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4f46e5&color=fff`
              }
              alt={user?.name}
              className="rounded-circle mb-3 border shadow-sm"
              style={{ width: '90px', height: '90px', objectFit: 'cover' }}
            />
            <h4 className="fw-bolder text-dark mb-1">{user?.name}</h4>
            <p className="text-muted small mb-2">{empProfile.designation || 'Staff Member'}</p>
            <span className="badge badge-soft-primary px-3 py-1 mb-3">
              {empProfile.department || 'General'}
            </span>

            <div className="border-top pt-3 text-start small d-flex flex-column gap-2 text-secondary">
              <div>
                <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>EMPLOYEE ID</span>
                <strong className="text-dark">{empProfile.employeeId || 'EMP-SYNC'}</strong>
              </div>
              <div>
                <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>EMAIL</span>
                <strong className="text-dark">{user?.email}</strong>
              </div>
              <div>
                <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>SYSTEM ROLE</span>
                <strong className="text-dark text-capitalize">{user?.role}</strong>
              </div>
              <div>
                <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>REPORTING MANAGER</span>
                <strong className="text-dark">{empProfile.reportingManager?.name || 'Executive Level'}</strong>
              </div>
              <div>
                <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>DATE JOINED</span>
                <strong className="text-dark">
                  {empProfile.dateOfJoining ? new Date(empProfile.dateOfJoining).toLocaleDateString() : 'N/A'}
                </strong>
              </div>
            </div>
          </div>

          {/* Leave Balances Widget */}
          {empProfile.leaveBalance && (
            <div className="card-modern p-3 bg-white">
              <h6 className="fw-bold mb-3">Available Leave Balances</h6>
              <div className="d-flex justify-content-between p-2 bg-light rounded mb-2 small">
                <span>Annual Vacation:</span>
                <strong>{empProfile.leaveBalance.annual} Days</strong>
              </div>
              <div className="d-flex justify-content-between p-2 bg-light rounded mb-2 small">
                <span>Medical / Sick:</span>
                <strong>{empProfile.leaveBalance.sick} Days</strong>
              </div>
              <div className="d-flex justify-content-between p-2 bg-light rounded small">
                <span>Casual:</span>
                <strong>{empProfile.leaveBalance.casual} Days</strong>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Editable Tabs */}
        <div className="col-lg-8">
          <div className="card-modern p-4 bg-white">
            <ul className="nav nav-tabs border-bottom mb-4">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'profile' ? 'active fw-bold text-primary' : 'text-secondary'}`}
                  onClick={() => setActiveTab('profile')}
                >
                  Edit Personal Details
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'security' ? 'active fw-bold text-primary' : 'text-secondary'}`}
                  onClick={() => setActiveTab('security')}
                >
                  Change Password & Security
                </button>
              </li>
            </ul>

            {activeTab === 'profile' ? (
              <form onSubmit={handleProfileSubmit}>
                <h5 className="fw-bold mb-3">Contact Information</h5>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="+1 (555) 000-0000"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold text-secondary">Street Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="123 Corporate Blvd"
                      value={profileForm.street}
                      onChange={(e) => setProfileForm({ ...profileForm, street: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-secondary">City</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="San Francisco"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-secondary">State / Province</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="CA"
                      value={profileForm.state}
                      onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-secondary">Zip Code</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="94107"
                      value={profileForm.zipCode}
                      onChange={(e) => setProfileForm({ ...profileForm, zipCode: e.target.value })}
                    />
                  </div>
                </div>

                <h5 className="fw-bold mb-3">Emergency Contact</h5>
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-secondary">Contact Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Full Name"
                      value={profileForm.emergencyName}
                      onChange={(e) => setProfileForm({ ...profileForm, emergencyName: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-secondary">Relationship</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Spouse, Parent"
                      value={profileForm.emergencyRel}
                      onChange={(e) => setProfileForm({ ...profileForm, emergencyRel: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-secondary">Emergency Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="+1 (555) 999-0000"
                      value={profileForm.emergencyPhone}
                      onChange={(e) => setProfileForm({ ...profileForm, emergencyPhone: e.target.value })}
                    />
                  </div>
                </div>

                <h5 className="fw-bold mb-3">Skills & Expertise</h5>
                <div className="mb-4">
                  <label className="form-label small fw-semibold text-secondary">Skills (Comma-separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="React, Node.js, Express, UI Design"
                    value={profileForm.skills}
                    onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                  />
                  <div className="form-text small">Separate each skill with a comma</div>
                </div>

                <button type="submit" className="btn btn-primary-gradient px-4" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit} style={{ maxWidth: '480px' }}>
                <h5 className="fw-bold mb-3">Change Account Password</h5>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Current Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passForm.currentPassword}
                    onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">New Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Minimum 6 characters"
                    value={passForm.newPassword}
                    onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-secondary">Confirm New Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passForm.confirmPassword}
                    onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary-gradient px-4" disabled={loading}>
                  {loading ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
