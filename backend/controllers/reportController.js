const mongoose = require('mongoose');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Training = require('../models/Training');
const Announcement = require('../models/Announcement');
const {
  mockUsers,
  mockEmployees,
  mockAttendances,
  mockLeaves,
  mockAnnouncements,
  mockTrainings,
} = require('../data/mockData');

const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper to get normalized start and end of day in UTC/local
const getDayBounds = (dateString) => {
  const targetDate = dateString ? new Date(dateString) : new Date();
  const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);
  return { startOfDay, endOfDay };
};

// @desc    Get HR dashboard overview statistics & analytics
// @route   GET /api/reports/hr-dashboard
// @access  Private (HR)
const getHRDashboardStats = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      try {
        const { startOfDay, endOfDay } = getDayBounds();

        const totalUsers = await User.countDocuments({ status: 'active' });
        const totalEmployees = await User.countDocuments({ role: 'employee', status: 'active' });
        const totalManagers = await User.countDocuments({ role: 'manager', status: 'active' });
        const totalHR = await User.countDocuments({ role: 'hr', status: 'active' });

        const todayAttendance = await Attendance.find({
          date: { $gte: startOfDay, $lte: endOfDay },
        });

        const presentCount = todayAttendance.filter((a) => a.status === 'Present').length;
        const lateCount = todayAttendance.filter((a) => a.status === 'Late').length;
        const halfDayCount = todayAttendance.filter((a) => a.status === 'Half-day').length;
        const totalLoggedToday = todayAttendance.length;
        const absentCount = Math.max(0, totalUsers - totalLoggedToday);
        const attendanceRate = totalUsers > 0 ? Math.round((totalLoggedToday / totalUsers) * 100) : 0;

        const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
        const approvedLeaves = await Leave.countDocuments({ status: 'Approved' });
        const rejectedLeaves = await Leave.countDocuments({ status: 'Rejected' });

        const activeTrainings = await Training.countDocuments({
          status: { $in: ['Upcoming', 'Ongoing'] },
        });

        const departmentStats = await Employee.aggregate([
          { $match: { status: 'active' } },
          { $group: { _id: '$department', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]);

        const leaveTypeStats = await Leave.aggregate([
          { $group: { _id: '$leaveType', count: { $sum: 1 } } },
        ]);

        const recentLeaves = await Leave.find({ status: 'Pending' })
          .populate('employee', 'name email avatar')
          .sort({ createdAt: -1 })
          .limit(5);

        const recentAnnouncements = await Announcement.find()
          .populate('postedBy', 'name role')
          .sort({ createdAt: -1 })
          .limit(5);

        return res.json({
          success: true,
          stats: {
            totalUsers,
            totalEmployees,
            totalManagers,
            totalHR,
            attendance: {
              totalLoggedToday,
              presentCount,
              lateCount,
              halfDayCount,
              absentCount,
              attendanceRate,
            },
            leaves: {
              pending: pendingLeaves,
              approved: approvedLeaves,
              rejected: rejectedLeaves,
              total: pendingLeaves + approvedLeaves + rejectedLeaves,
            },
            trainings: {
              active: activeTrainings,
            },
            departmentStats,
            leaveTypeStats,
            recentLeaves,
            recentAnnouncements,
          },
        });
      } catch (e) {
        console.warn('[StaffSync] DB error in getHRDashboardStats, returning fallback data');
      }
    }

    // In-memory Fallback
    res.json({
      success: true,
      stats: {
        totalUsers: mockUsers.length,
        totalEmployees: mockUsers.filter((u) => u.role === 'employee').length,
        totalManagers: mockUsers.filter((u) => u.role === 'manager').length,
        totalHR: mockUsers.filter((u) => u.role === 'hr').length,
        attendance: {
          totalLoggedToday: 2,
          presentCount: 1,
          lateCount: 1,
          halfDayCount: 0,
          absentCount: mockUsers.length - 2,
          attendanceRate: 75,
        },
        leaves: {
          pending: mockLeaves.filter((l) => l.status === 'Pending').length,
          approved: mockLeaves.filter((l) => l.status === 'Approved').length,
          rejected: mockLeaves.filter((l) => l.status === 'Rejected').length,
          total: mockLeaves.length,
        },
        trainings: {
          active: mockTrainings.length,
        },
        departmentStats: [
          { _id: 'Engineering', count: 3 },
          { _id: 'Human Resources', count: 2 },
          { _id: 'Sales & Marketing', count: 2 },
        ],
        leaveTypeStats: [
          { _id: 'Annual', count: 1 },
          { _id: 'Sick', count: 1 },
          { _id: 'Casual', count: 1 },
        ],
        recentLeaves: mockLeaves.filter((l) => l.status === 'Pending'),
        recentAnnouncements: mockAnnouncements,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Manager dashboard statistics
// @route   GET /api/reports/manager-dashboard
// @access  Private (Manager)
const getManagerDashboardStats = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      try {
        const { startOfDay, endOfDay } = getDayBounds();
        const managerEmployee = await Employee.findOne({ user: req.user._id });
        const department = managerEmployee ? managerEmployee.department : 'Engineering';

        const teamEmployees = await Employee.find({
          $or: [{ reportingManager: req.user._id }, { department }],
          user: { $ne: req.user._id },
        }).populate('user', 'name email avatar status');

        const teamUserIds = teamEmployees.map((e) => e.user?._id).filter(Boolean);

        const teamAttendanceToday = await Attendance.find({
          employee: { $in: teamUserIds },
          date: { $gte: startOfDay, $lte: endOfDay },
        }).populate('employee', 'name email avatar');

        const pendingLeaves = await Leave.find({
          employee: { $in: teamUserIds },
          status: 'Pending',
        }).populate('employee', 'name email avatar');

        const activeTrainings = await Training.find({
          department: { $in: [department, 'All'] },
          status: { $in: ['Upcoming', 'Ongoing'] },
        });

        return res.json({
          success: true,
          stats: {
            teamSize: teamEmployees.length,
            teamPresentToday: teamAttendanceToday.length,
            pendingLeavesCount: pendingLeaves.length,
            activeTrainingsCount: activeTrainings.length,
            teamEmployees,
            teamAttendanceToday,
            pendingLeaves,
            activeTrainings,
          },
        });
      } catch (e) {
        console.warn('[StaffSync] DB error in getManagerDashboardStats, using fallback');
      }
    }

    // In-memory fallback
    const teamEmployees = mockEmployees.filter((e) => e.user._id !== req.user._id && (e.department === 'Engineering' || e.reportingManager?._id === req.user._id));
    res.json({
      success: true,
      stats: {
        teamSize: teamEmployees.length,
        teamPresentToday: 2,
        pendingLeavesCount: 1,
        activeTrainingsCount: mockTrainings.length,
        teamEmployees,
        teamAttendanceToday: mockAttendances,
        pendingLeaves: mockLeaves.filter((l) => l.status === 'Pending'),
        activeTrainings: mockTrainings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Employee dashboard statistics
// @route   GET /api/reports/employee-dashboard
// @access  Private (Employee)
const getEmployeeDashboardStats = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      try {
        const { startOfDay, endOfDay } = getDayBounds();

        const employee = await Employee.findOne({ user: req.user._id }).populate(
          'reportingManager',
          'name email'
        );

        const todayAttendance = await Attendance.findOne({
          employee: req.user._id,
          date: { $gte: startOfDay, $lte: endOfDay },
        });

        const recentAttendance = await Attendance.find({ employee: req.user._id })
          .sort({ date: -1 })
          .limit(5);

        const userLeaves = await Leave.find({ employee: req.user._id })
          .sort({ createdAt: -1 })
          .limit(5);

        const pendingLeavesCount = await Leave.countDocuments({
          employee: req.user._id,
          status: 'Pending',
        });

        const enrolledTrainings = await Training.find({
          enrolledEmployees: req.user._id,
        }).sort({ startDate: 1 });

        const recentAnnouncements = await Announcement.find()
          .populate('postedBy', 'name role')
          .sort({ isPinned: -1, createdAt: -1 })
          .limit(4);

        return res.json({
          success: true,
          stats: {
            profile: employee,
            todayAttendance,
            recentAttendance,
            userLeaves,
            pendingLeavesCount,
            enrolledTrainings,
            recentAnnouncements,
          },
        });
      } catch (e) {
        console.warn('[StaffSync] DB error in getEmployeeDashboardStats, using fallback');
      }
    }

    // In-memory Fallback
    const profile = mockEmployees.find((e) => (e.user?._id || e.user).toString() === req.user._id.toString()) || mockEmployees[3];
    const userLeaves = mockLeaves.filter((l) => (l.employee?._id || l.employee).toString() === req.user._id.toString());

    res.json({
      success: true,
      stats: {
        profile,
        todayAttendance: mockAttendances.find((a) => (a.employee?._id || a.employee).toString() === req.user._id.toString()) || null,
        recentAttendance: mockAttendances,
        userLeaves: userLeaves.length > 0 ? userLeaves : mockLeaves,
        pendingLeavesCount: 1,
        enrolledTrainings: mockTrainings,
        recentAnnouncements: mockAnnouncements,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHRDashboardStats,
  getManagerDashboardStats,
  getEmployeeDashboardStats,
};
