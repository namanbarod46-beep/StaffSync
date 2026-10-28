import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Briefcase,
  Building,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const EmployeesPage = () => {
  const { user } = useAuth();
  const isHR = user?.role === 'hr';

  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [role, setRole] = useState('All');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Form states
  const [newEmployeeForm, setNewEmployeeForm] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'employee',
    department: 'Engineering',
    designation: 'Software Engineer',
    salary: 75000,
    reportingManager: '',
    phone: '',
    skills: 'React, Node.js',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    role: 'employee',
    department: 'Engineering',
    designation: '',
    salary: 0,
    reportingManager: '',
    phone: '',
    status: 'active',
  });

  const [alertMsg, setAlertMsg] = useState({ text: '', type: '' });

  const fetchEmployees = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (department !== 'All') params.department = department;
      if (role !== 'All') params.role = role;

      const res = await api.get('/employees', { params });
      if (res.data.success) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await api.get('/employees/managers/list');
      if (res.data.success) {
        setManagers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching managers:', err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchEmployees(), fetchManagers()]);
      setLoading(false);
    };
    load();
  }, [department, role]);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setAlertMsg({ text: '', type: '' });

    try {
      const res = await api.post('/employees', newEmployeeForm);
      if (res.data.success) {
        setAlertMsg({ text: 'Employee created successfully!', type: 'success' });
        setAddModalOpen(false);
        setNewEmployeeForm({
          name: '',
          email: '',
          password: 'password123',
          role: 'employee',
          department: 'Engineering',
          designation: 'Software Engineer',
          salary: 75000,
          reportingManager: '',
          phone: '',
          skills: 'React, Node.js',
        });
        await fetchEmployees();
      }
    } catch (err) {
      setAlertMsg({
        text: err.response?.data?.message || 'Failed to create employee',
        type: 'danger',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (emp) => {
    setSelectedEmployee(emp);
    setEditForm({
      name: emp.user?.name || '',
      role: emp.user?.role || 'employee',
      department: emp.department || 'Engineering',
      designation: emp.designation || '',
      salary: emp.salary || 0,
      reportingManager: emp.reportingManager?._id || '',
      phone: emp.phone || '',
      status: emp.status || 'active',
    });
    setEditModalOpen(true);
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    setActionLoading(true);
    try {
      const res = await api.put(`/employees/${selectedEmployee._id}`, editForm);
      if (res.data.success) {
        setAlertMsg({ text: 'Employee updated successfully', type: 'success' });
        setEditModalOpen(false);
        await fetchEmployees();
      }
    } catch (err) {
      setAlertMsg({
        text: err.response?.data?.message || 'Failed to update employee',
        type: 'danger',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEmployee = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate ${name}?`)) return;

    try {
      const res = await api.delete(`/employees/${id}`);
      if (res.data.success) {
        setAlertMsg({ text: 'Employee deactivated successfully', type: 'info' });
        await fetchEmployees();
      }
    } catch (err) {
      setAlertMsg({
        text: err.response?.data?.message || 'Failed to deactivate employee',
        type: 'danger',
      });
    }
  };

  const openViewModal = (emp) => {
    setSelectedEmployee(emp);
    setViewModalOpen(true);
  };

  if (loading) {
    return <LoadingSpinner fullScreen={true} text="Loading employee directory..." />;
  }

  return (
    <div className="container-fluid py-4 px-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bolder text-dark mb-1">
            {isHR ? 'Staff & Talent Directory' : 'My Team Members'}
          </h2>
          <p className="text-muted mb-0">
            {isHR
              ? 'Complete organization employee database with roles, compensation, and management hierarchy'
              : 'Direct reports and department members'}
          </p>
        </div>

        {isHR && (
          <button
            className="btn btn-primary-gradient"
            onClick={() => setAddModalOpen(true)}
          >
            <Plus size={16} className="me-1" /> Add New Employee
          </button>
        )}
      </div>

      {alertMsg.text && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show mb-4`} role="alert">
          {alertMsg.text}
          <button type="button" className="btn-close" onClick={() => setAlertMsg({ text: '', type: '' })} />
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card-modern p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-white text-muted">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, ID, title, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyUp={(e) => e.key === 'Enter' && fetchEmployees()}
              />
            </div>
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Sales & Marketing">Sales & Marketing</option>
              <option value="Product & Design">Product & Design</option>
              <option value="Finance & Accounts">Finance & Accounts</option>
              <option value="Operations">Operations</option>
            </select>
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="employee">Employees</option>
              <option value="manager">Managers</option>
              <option value="hr">HR Directors</option>
            </select>
          </div>

          <div className="col-md-2 text-md-end">
            <button className="btn btn-outline-primary w-100" onClick={fetchEmployees}>
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="card-modern p-4">
        <div className="table-responsive">
          <table className="table table-modern align-middle mb-0">
            <thead>
              <tr>
                <th>Employee</th>
                <th>ID</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Role</th>
                <th>Reporting Manager</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    No employees found matching the specified criteria.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={
                            emp.user?.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.user?.name || 'User')}&background=4f46e5&color=fff`
                          }
                          alt={emp.user?.name}
                          className="rounded-circle"
                          style={{ width: '38px', height: '38px', objectFit: 'cover' }}
                        />
                        <div>
                          <div className="fw-bold text-dark">{emp.user?.name}</div>
                          <div className="text-muted small">{emp.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">{emp.employeeId}</span>
                    </td>
                    <td>{emp.department}</td>
                    <td>{emp.designation}</td>
                    <td>
                      <span
                        className={`badge badge-soft-${
                          emp.user?.role === 'hr'
                            ? 'danger'
                            : emp.user?.role === 'manager'
                            ? 'warning'
                            : 'primary'
                        } text-capitalize`}
                      >
                        {emp.user?.role}
                      </span>
                    </td>
                    <td>
                      <small className="text-muted">
                        {emp.reportingManager?.name || 'Executive / None'}
                      </small>
                    </td>
                    <td>
                      <span
                        className={`badge badge-soft-${
                          emp.status === 'active' ? 'success' : 'danger'
                        } text-capitalize`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        <button
                          className="btn btn-sm btn-light border p-1 rounded-2"
                          title="View Profile"
                          onClick={() => openViewModal(emp)}
                        >
                          <Eye size={16} className="text-secondary" />
                        </button>
                        {isHR && (
                          <>
                            <button
                              className="btn btn-sm btn-light border p-1 rounded-2 text-primary"
                              title="Edit"
                              onClick={() => openEditModal(emp)}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn btn-sm btn-light border p-1 rounded-2 text-danger"
                              title="Deactivate"
                              onClick={() => handleDeleteEmployee(emp._id, emp.user?.name)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal (HR) */}
      {addModalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Add New Employee Record</h5>
                <button type="button" className="btn-close" onClick={() => setAddModalOpen(false)} />
              </div>
              <form onSubmit={handleCreateEmployee}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Full Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Rachel Adams"
                        value={newEmployeeForm.name}
                        onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Work Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="e.g. rachel.adams@staffsync.com"
                        value={newEmployeeForm.email}
                        onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Default Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        value={newEmployeeForm.password}
                        onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Role</label>
                      <select
                        className="form-select"
                        value={newEmployeeForm.role}
                        onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, role: e.target.value })}
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="hr">HR Administrator</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Department</label>
                      <select
                        className="form-select"
                        value={newEmployeeForm.department}
                        onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, department: e.target.value })}
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Sales & Marketing">Sales & Marketing</option>
                        <option value="Product & Design">Product & Design</option>
                        <option value="Finance & Accounts">Finance & Accounts</option>
                        <option value="Operations">Operations</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Job Title / Designation *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Senior Software Engineer"
                        value={newEmployeeForm.designation}
                        onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, designation: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Annual Salary ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={newEmployeeForm.salary}
                        onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, salary: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Reporting Manager</label>
                      <select
                        className="form-select"
                        value={newEmployeeForm.reportingManager}
                        onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, reportingManager: e.target.value })}
                      >
                        <option value="">None (Top Executive)</option>
                        {managers.map((m) => (
                          <option key={m._id} value={m._id}>
                            {m.name} ({m.role.toUpperCase()})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="+1 (555) 000-0000"
                        value={newEmployeeForm.phone}
                        onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Skills (Comma-separated)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="React, Node.js, SQL"
                        value={newEmployeeForm.skills}
                        onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, skills: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setAddModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-gradient" disabled={actionLoading}>
                    {actionLoading ? 'Creating...' : 'Create Employee Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal (HR) */}
      {editModalOpen && selectedEmployee && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Edit Employee: {selectedEmployee.employeeId}</h5>
                <button type="button" className="btn-close" onClick={() => setEditModalOpen(false)} />
              </div>
              <form onSubmit={handleUpdateEmployee}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">System Role</label>
                      <select
                        className="form-select"
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="hr">HR Administrator</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Department</label>
                      <select
                        className="form-select"
                        value={editForm.department}
                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Sales & Marketing">Sales & Marketing</option>
                        <option value="Product & Design">Product & Design</option>
                        <option value="Finance & Accounts">Finance & Accounts</option>
                        <option value="Operations">Operations</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Designation</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.designation}
                        onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Salary ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editForm.salary}
                        onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Reporting Manager</label>
                      <select
                        className="form-select"
                        value={editForm.reportingManager}
                        onChange={(e) => setEditForm({ ...editForm, reportingManager: e.target.value })}
                      >
                        <option value="">None (Top Executive)</option>
                        {managers.map((m) => (
                          <option key={m._id} value={m._id}>
                            {m.name} ({m.role.toUpperCase()})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Account Status</label>
                      <select
                        className="form-select"
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      >
                        <option value="active">Active</option>
                        <option value="on_leave">On Leave</option>
                        <option value="terminated">Terminated / Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setEditModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-gradient" disabled={actionLoading}>
                    {actionLoading ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {viewModalOpen && selectedEmployee && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Employee Profile Dossier</h5>
                <button type="button" className="btn-close" onClick={() => setViewModalOpen(false)} />
              </div>
              <div className="modal-body p-4">
                <div className="text-center mb-3">
                  <img
                    src={
                      selectedEmployee.user?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedEmployee.user?.name || 'User')}&background=4f46e5&color=fff`
                    }
                    alt={selectedEmployee.user?.name}
                    className="rounded-circle mb-2"
                    style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                  />
                  <h5 className="fw-bolder mb-0 text-dark">{selectedEmployee.user?.name}</h5>
                  <p className="text-muted small mb-1">{selectedEmployee.designation}</p>
                  <span className="badge badge-soft-primary">{selectedEmployee.department}</span>
                </div>

                <div className="p-3 bg-light rounded-3 mb-3">
                  <div className="row g-2 small">
                    <div className="col-6">
                      <span className="text-muted d-block">Employee ID:</span>
                      <strong>{selectedEmployee.employeeId}</strong>
                    </div>
                    <div className="col-6">
                      <span className="text-muted d-block">System Role:</span>
                      <strong className="text-capitalize">{selectedEmployee.user?.role}</strong>
                    </div>
                    <div className="col-6">
                      <span className="text-muted d-block">Work Email:</span>
                      <strong>{selectedEmployee.user?.email}</strong>
                    </div>
                    <div className="col-6">
                      <span className="text-muted d-block">Phone:</span>
                      <strong>{selectedEmployee.phone || 'N/A'}</strong>
                    </div>
                    <div className="col-6">
                      <span className="text-muted d-block">Date of Joining:</span>
                      <strong>{new Date(selectedEmployee.dateOfJoining).toLocaleDateString()}</strong>
                    </div>
                    <div className="col-6">
                      <span className="text-muted d-block">Reporting Manager:</span>
                      <strong>{selectedEmployee.reportingManager?.name || 'Executive'}</strong>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-3">
                  <label className="form-label small fw-bold text-dark">Technical & Professional Skills</label>
                  <div className="d-flex flex-wrap gap-1">
                    {selectedEmployee.skills?.length > 0 ? (
                      selectedEmployee.skills.map((sk, idx) => (
                        <span key={idx} className="badge bg-white text-primary border">
                          {sk}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted small">No skills listed</span>
                    )}
                  </div>
                </div>

                {/* Leave Balances */}
                {selectedEmployee.leaveBalance && (
                  <div>
                    <label className="form-label small fw-bold text-dark">Remaining Leave Balances</label>
                    <div className="d-flex justify-content-between p-2 bg-light rounded">
                      <span>Annual: <strong>{selectedEmployee.leaveBalance.annual} d</strong></span>
                      <span>Sick: <strong>{selectedEmployee.leaveBalance.sick} d</strong></span>
                      <span>Casual: <strong>{selectedEmployee.leaveBalance.casual} d</strong></span>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer border-top">
                <button type="button" className="btn btn-light" onClick={() => setViewModalOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;
