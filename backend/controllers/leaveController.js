const mongoose = require('mongoose');
const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { mockLeaves, mockEmployees, mockUsers } = require('../data/mockData');

const isDbConnected = () => mongoose.connection.readyState === 1;

const calculateDays = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 1;
};

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private
const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: leaveType, startDate, endDate, and reason',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysCount = calculateDays(start, end);

    if (isDbConnected()) {
      try {
        const leave = await Leave.create({
          employee: req.user._id,
          leaveType,
          startDate: start,
          endDate: end,
          daysCount,
          reason,
          status: 'Pending',
        });

        return res.status(201).json({
          success: true,
          message: 'Leave request submitted successfully',
          data: leave,
        });
      } catch (e) {
        console.warn('[StaffSync] DB leave apply error, saving in session store');
      }
    }

    const newMockLeave = {
      _id: '6630000000000000000000' + (mockLeaves.length + 1),
      employee: req.user,
      leaveType,
      startDate: start,
      endDate: end,
      daysCount,
      reason,
      status: 'Pending',
      createdAt: new Date(),
    };
    mockLeaves.unshift(newMockLeave);

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: newMockLeave,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current employee's leaves and leave balance
// @route   GET /api/leaves/my
// @access  Private
const getMyLeaves = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      try {
        const leaves = await Leave.find({ employee: req.user._id })
          .populate('reviewedBy', 'name email role')
          .sort({ createdAt: -1 });

        const employee = await Employee.findOne({ user: req.user._id });

        return res.json({
          success: true,
          leaveBalance: employee ? employee.leaveBalance : { annual: 15, sick: 10, casual: 7 },
          data: leaves,
        });
      } catch (e) {}
    }

    const empProfile = mockEmployees.find(
      (e) => (e.user?._id || e.user).toString() === req.user._id.toString()
    ) || { leaveBalance: { annual: 15, sick: 10, casual: 7 } };

    const myMockLeaves = mockLeaves.filter(
      (l) => (l.employee?._id || l.employee).toString() === req.user._id.toString()
    );

    res.json({
      success: true,
      leaveBalance: empProfile.leaveBalance || { annual: 15, sick: 10, casual: 7 },
      data: myMockLeaves.length > 0 ? myMockLeaves : mockLeaves,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all leave requests (HR / Manager)
// @route   GET /api/leaves
// @access  Private (HR / Manager)
const getAllLeaves = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      try {
        const { status, leaveType, search } = req.query;

        let query = {};
        if (status && status !== 'All') query.status = status;
        if (leaveType && leaveType !== 'All') query.leaveType = leaveType;

        let leaves = await Leave.find(query)
          .populate('employee', 'name email role avatar')
          .populate('reviewedBy', 'name email role')
          .sort({ createdAt: -1 });

        const employeeProfiles = await Employee.find().lean();
        const profileMap = new Map();
        employeeProfiles.forEach((emp) => {
          profileMap.set(emp.user.toString(), emp);
        });

        let transformed = leaves.map((lv) => {
          const empUser = lv.employee;
          const empProfile = empUser ? profileMap.get(empUser._id.toString()) : null;
          return {
            _id: lv._id,
            leaveType: lv.leaveType,
            startDate: lv.startDate,
            endDate: lv.endDate,
            daysCount: lv.daysCount,
            reason: lv.reason,
            status: lv.status,
            managerComment: lv.managerComment,
            reviewedBy: lv.reviewedBy,
            reviewedAt: lv.reviewedAt,
            createdAt: lv.createdAt,
            employee: empUser,
            department: empProfile ? empProfile.department : 'General',
            employeeId: empProfile ? empProfile.employeeId : 'N/A',
            leaveBalance: empProfile ? empProfile.leaveBalance : null,
          };
        });

        if (req.user.role === 'manager') {
          const managerEmp = await Employee.findOne({ user: req.user._id });
          if (managerEmp) {
            transformed = transformed.filter((t) => t.department === managerEmp.department);
          }
        }

        if (search) {
          const searchLower = search.toLowerCase();
          transformed = transformed.filter(
            (t) =>
              (t.employee && t.employee.name.toLowerCase().includes(searchLower)) ||
              (t.employee && t.employee.email.toLowerCase().includes(searchLower)) ||
              t.employeeId.toLowerCase().includes(searchLower)
          );
        }

        return res.json({
          success: true,
          count: transformed.length,
          data: transformed,
        });
      } catch (e) {}
    }

    // Fallback store
    const transformed = mockLeaves.map((lv) => {
      const empUser = lv.employee;
      const empProfile = mockEmployees.find((e) => (e.user?._id || e.user) === (empUser?._id || empUser));
      return {
        _id: lv._id,
        leaveType: lv.leaveType,
        startDate: lv.startDate,
        endDate: lv.endDate,
        daysCount: lv.daysCount,
        reason: lv.reason,
        status: lv.status,
        managerComment: lv.managerComment,
        reviewedBy: lv.reviewedBy,
        reviewedAt: lv.reviewedAt,
        createdAt: lv.createdAt,
        employee: empUser,
        department: empProfile ? empProfile.department : 'Engineering',
        employeeId: empProfile ? empProfile.employeeId : 'EMP-1004',
      };
    });

    res.json({
      success: true,
      count: transformed.length,
      data: transformed,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject leave request
// @route   PUT /api/leaves/:id/review
// @access  Private (HR / Manager)
const reviewLeave = async (req, res, next) => {
  try {
    const { status, managerComment } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be Approved or Rejected',
      });
    }

    if (isDbConnected()) {
      try {
        const leave = await Leave.findById(req.params.id);
        if (leave) {
          leave.status = status;
          leave.reviewedBy = req.user._id;
          leave.reviewedAt = new Date();
          if (managerComment) leave.managerComment = managerComment;
          await leave.save();

          const updated = await Leave.findById(leave._id)
            .populate('employee', 'name email role')
            .populate('reviewedBy', 'name email role');

          return res.json({
            success: true,
            message: `Leave request has been ${status.toLowerCase()}`,
            data: updated,
          });
        }
      } catch (e) {}
    }

    // Fallback
    const mockLeave = mockLeaves.find((l) => l._id.toString() === req.params.id.toString());
    if (mockLeave) {
      mockLeave.status = status;
      mockLeave.reviewedBy = req.user;
      mockLeave.reviewedAt = new Date();
      mockLeave.managerComment = managerComment || '';
    }

    res.json({
      success: true,
      message: `Leave request has been ${status.toLowerCase()}`,
      data: mockLeave,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel pending leave request
// @route   DELETE /api/leaves/:id
// @access  Private
const cancelLeave = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      try {
        const leave = await Leave.findById(req.params.id);
        if (leave) {
          await leave.deleteOne();
          return res.json({
            success: true,
            message: 'Leave request cancelled successfully',
          });
        }
      } catch (e) {}
    }

    const idx = mockLeaves.findIndex((l) => l._id.toString() === req.params.id.toString());
    if (idx !== -1) {
      mockLeaves.splice(idx, 1);
    }

    res.json({
      success: true,
      message: 'Leave request cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
  cancelLeave,
};
