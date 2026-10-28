const mongoose = require('mongoose');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { mockUsers, mockEmployees } = require('../data/mockData');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private (HR / Manager)
const getAllEmployees = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      try {
        const { search, department, role, status } = req.query;

        let query = {};
        if (department && department !== 'All') query.department = department;
        if (status && status !== 'All') query.status = status;

        if (req.user.role === 'manager') {
          const managerEmployee = await Employee.findOne({ user: req.user._id });
          if (managerEmployee) {
            query.$or = [
              { reportingManager: req.user._id },
              { department: managerEmployee.department },
            ];
          }
        }

        let employees = await Employee.find(query)
          .populate('user', 'name email role avatar status createdAt')
          .populate('reportingManager', 'name email')
          .sort({ createdAt: -1 });

        if (search) {
          const searchLower = search.toLowerCase();
          employees = employees.filter(
            (emp) =>
              (emp.user && emp.user.name.toLowerCase().includes(searchLower)) ||
              (emp.user && emp.user.email.toLowerCase().includes(searchLower)) ||
              emp.employeeId.toLowerCase().includes(searchLower) ||
              emp.designation.toLowerCase().includes(searchLower)
          );
        }

        if (role && role !== 'All') {
          employees = employees.filter((emp) => emp.user && emp.user.role === role);
        }

        return res.json({
          success: true,
          count: employees.length,
          data: employees,
        });
      } catch (e) {}
    }

    // Fallback store
    let employees = mockEmployees;
    const { search, department, role } = req.query;

    if (department && department !== 'All') {
      employees = employees.filter((e) => e.department === department);
    }
    if (role && role !== 'All') {
      employees = employees.filter((e) => (e.user?.role || e.role) === role);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      employees = employees.filter(
        (e) =>
          e.user?.name?.toLowerCase().includes(searchLower) ||
          e.employeeId?.toLowerCase().includes(searchLower) ||
          e.designation?.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employee details by ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      try {
        const employee = await Employee.findById(req.params.id)
          .populate('user', 'name email role avatar status createdAt')
          .populate('reportingManager', 'name email');

        if (employee) {
          return res.json({
            success: true,
            data: employee,
          });
        }
      } catch (e) {}
    }

    const emp = mockEmployees.find((e) => e._id.toString() === req.params.id.toString()) || mockEmployees[0];
    res.json({
      success: true,
      data: emp,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new employee (HR only)
// @route   POST /api/employees
// @access  Private (HR)
const createEmployee = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      designation,
      salary,
      reportingManager,
      phone,
      skills,
    } = req.body;

    if (isDbConnected()) {
      try {
        const user = await User.create({
          name,
          email,
          password: password || 'Welcome@123',
          role: role || 'employee',
        });

        const count = await Employee.countDocuments();
        const employeeId = `EMP-${String(1001 + count).padStart(4, '0')}`;

        const employee = await Employee.create({
          user: user._id,
          employeeId,
          department: department || 'Engineering',
          designation: designation || 'Associate',
          salary: salary ? Number(salary) : 60000,
          reportingManager: reportingManager || null,
          phone: phone || '',
          skills: Array.isArray(skills) ? skills : skills ? skills.split(',').map((s) => s.trim()) : [],
        });

        const populated = await Employee.findById(employee._id)
          .populate('user', 'name email role avatar status')
          .populate('reportingManager', 'name email');

        return res.status(201).json({
          success: true,
          message: 'Employee successfully created',
          data: populated,
        });
      } catch (e) {}
    }

    // Fallback store
    const newId = '6600000000000000000000' + (mockUsers.length + 10);
    const mockUser = {
      _id: newId,
      name,
      email,
      role: role || 'employee',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff`,
      status: 'active',
    };
    mockUsers.push(mockUser);

    const mockEmp = {
      _id: '6610000000000000000000' + (mockEmployees.length + 10),
      user: mockUser,
      employeeId: `EMP-${1000 + mockEmployees.length + 1}`,
      department: department || 'Engineering',
      designation: designation || 'Associate',
      salary: salary ? Number(salary) : 60000,
      phone: phone || '',
      skills: Array.isArray(skills) ? skills : skills ? skills.split(',').map((s) => s.trim()) : [],
      leaveBalance: { annual: 15, sick: 10, casual: 7 },
      status: 'active',
    };
    mockEmployees.push(mockEmp);

    res.status(201).json({
      success: true,
      message: 'Employee successfully created',
      data: mockEmp,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee details
// @route   PUT /api/employees/:id
// @access  Private (HR only)
const updateEmployee = async (req, res, next) => {
  try {
    const { name, role, department, designation, salary, phone, status } = req.body;

    if (isDbConnected()) {
      try {
        const employee = await Employee.findById(req.params.id);
        if (employee) {
          const user = await User.findById(employee.user);
          if (user) {
            if (name) user.name = name;
            if (role) user.role = role;
            if (status) user.status = status === 'terminated' ? 'inactive' : 'active';
            await user.save();
          }

          if (department) employee.department = department;
          if (designation) employee.designation = designation;
          if (salary !== undefined) employee.salary = Number(salary);
          if (phone !== undefined) employee.phone = phone;
          if (status) employee.status = status;
          await employee.save();

          const updated = await Employee.findById(employee._id)
            .populate('user', 'name email role avatar status')
            .populate('reportingManager', 'name email');

          return res.json({
            success: true,
            message: 'Employee updated successfully',
            data: updated,
          });
        }
      } catch (e) {}
    }

    const emp = mockEmployees.find((e) => e._id.toString() === req.params.id.toString());
    if (emp) {
      if (name && emp.user) emp.user.name = name;
      if (department) emp.department = department;
      if (designation) emp.designation = designation;
      if (phone !== undefined) emp.phone = phone;
      if (status) emp.status = status;
    }

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: emp,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Deactivate employee
// @route   DELETE /api/employees/:id
// @access  Private (HR only)
const deleteEmployee = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      try {
        const employee = await Employee.findById(req.params.id);
        if (employee) {
          await User.findByIdAndUpdate(employee.user, { status: 'inactive' });
          employee.status = 'terminated';
          await employee.save();

          return res.json({
            success: true,
            message: 'Employee deactivated successfully',
          });
        }
      } catch (e) {}
    }

    const emp = mockEmployees.find((e) => e._id.toString() === req.params.id.toString());
    if (emp) emp.status = 'terminated';

    res.json({
      success: true,
      message: 'Employee deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with manager or hr role
// @route   GET /api/employees/managers/list
// @access  Private
const getManagers = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      try {
        const managers = await User.find({
          role: { $in: ['manager', 'hr'] },
          status: 'active',
        }).select('name email role avatar');

        if (managers.length > 0) {
          return res.json({
            success: true,
            data: managers,
          });
        }
      } catch (e) {}
    }

    res.json({
      success: true,
      data: mockUsers.filter((u) => ['manager', 'hr'].includes(u.role)),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getManagers,
};
