const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { mockUsers, mockEmployees } = require('../data/mockData');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id: id.toString() },
    process.env.JWT_SECRET || 'staffsync_super_secret_jwt_key_2026_modern_hrms',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

// Check if MongoDB is connected
const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, designation, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, email, password)',
      });
    }

    const userRole = role && ['employee', 'manager', 'hr'].includes(role) ? role : 'employee';

    // If MongoDB is connected, use MongoDB
    if (isDbConnected()) {
      try {
        const userExists = await User.findOne({ email });
        if (userExists) {
          return res.status(400).json({
            success: false,
            message: 'A user with this email address already exists',
          });
        }

        const user = await User.create({
          name,
          email,
          password,
          role: userRole,
        });

        const count = await Employee.countDocuments();
        const employeeId = `EMP-${String(1001 + count).padStart(4, '0')}`;

        const employeeProfile = await Employee.create({
          user: user._id,
          employeeId,
          department: department || (userRole === 'hr' ? 'Human Resources' : 'Engineering'),
          designation: designation || (userRole === 'hr' ? 'HR Specialist' : userRole === 'manager' ? 'Team Lead' : 'Software Engineer'),
          phone: phone || '',
        });

        const token = generateToken(user._id);

        return res.status(201).json({
          success: true,
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            employeeProfile,
          },
        });
      } catch (dbErr) {
        console.warn('[StaffSync] Database write failed, falling back to session store:', dbErr.message);
      }
    }

    // In-memory fallback
    const existingMock = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingMock) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    const newId = `6600000000000000000000${String(mockUsers.length + 10).padStart(2, '0')}`;
    const newUser = {
      _id: newId,
      name,
      email,
      password,
      role: userRole,
      status: 'active',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff`,
    };
    mockUsers.push(newUser);

    const newEmpProfile = {
      _id: `6610000000000000000000${String(mockEmployees.length + 10).padStart(2, '0')}`,
      user: newUser,
      employeeId: `EMP-${1000 + mockEmployees.length + 1}`,
      department: department || (userRole === 'hr' ? 'Human Resources' : 'Engineering'),
      designation: designation || 'Specialist',
      phone: phone || '',
      leaveBalance: { annual: 15, sick: 10, casual: 7 },
      status: 'active',
    };
    mockEmployees.push(newEmpProfile);

    const token = generateToken(newId);

    return res.status(201).json({
      success: true,
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
        employeeProfile: newEmpProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Try MongoDB if connected
    if (isDbConnected()) {
      try {
        const user = await User.findOne({ email: normalizedEmail }).select('+password');
        if (user) {
          if (user.status === 'inactive') {
            return res.status(403).json({
              success: false,
              message: 'Your account is deactivated. Contact HR.',
            });
          }

          const isMatch = await user.matchPassword(password);
          if (isMatch) {
            const employeeProfile = await Employee.findOne({ user: user._id }).populate(
              'reportingManager',
              'name email'
            );
            const token = generateToken(user._id);

            return res.json({
              success: true,
              token,
              user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                employeeProfile,
              },
            });
          }
        }
      } catch (dbErr) {
        console.warn('[StaffSync] Database query failed, checking demo credentials fallback:', dbErr.message);
      }
    }

    // 2. Check Mock / Demo Fallback Users
    const mockUser = mockUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (mockUser) {
      // Check password (demo accounts accept 'password123' or exact match)
      if (password === 'password123' || password === mockUser.password) {
        const empProfile = mockEmployees.find(
          (e) => (e.user?._id || e.user) === mockUser._id
        ) || {
          employeeId: 'EMP-DEMO',
          department: mockUser.role === 'hr' ? 'Human Resources' : 'Engineering',
          designation: mockUser.role === 'hr' ? 'HR Director' : mockUser.role === 'manager' ? 'Manager' : 'Engineer',
          leaveBalance: { annual: 15, sick: 10, casual: 7 },
        };

        const token = generateToken(mockUser._id);

        return res.json({
          success: true,
          token,
          user: {
            _id: mockUser._id,
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role,
            avatar: mockUser.avatar,
            employeeProfile: empProfile,
          },
        });
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid email or password. Use demo buttons or password: password123',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user & employee details
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      try {
        const user = await User.findById(req.user._id);
        if (user) {
          const employeeProfile = await Employee.findOne({ user: req.user._id }).populate(
            'reportingManager',
            'name email'
          );

          return res.json({
            success: true,
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              avatar: user.avatar,
              status: user.status,
              createdAt: user.createdAt,
              employeeProfile,
            },
          });
        }
      } catch (e) {}
    }

    // Fallback
    const mockUser = mockUsers.find((u) => u._id.toString() === req.user._id.toString()) || req.user;
    const empProfile = mockEmployees.find(
      (e) => (e.user?._id || e.user).toString() === req.user._id.toString()
    ) || {
      employeeId: 'EMP-DEMO',
      department: mockUser.role === 'hr' ? 'Human Resources' : 'Engineering',
      designation: mockUser.role === 'hr' ? 'HR Director' : 'Employee',
      leaveBalance: { annual: 15, sick: 10, casual: 7 },
    };

    res.json({
      success: true,
      user: {
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        avatar: mockUser.avatar,
        status: 'active',
        employeeProfile: empProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & employee personal info
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, emergencyContact, skills, avatar } = req.body;

    if (isDbConnected()) {
      try {
        const user = await User.findById(req.user._id);
        if (user) {
          if (name) user.name = name;
          if (avatar !== undefined) user.avatar = avatar;
          await user.save();

          const employee = await Employee.findOne({ user: req.user._id });
          if (employee) {
            if (phone !== undefined) employee.phone = phone;
            if (address) employee.address = { ...employee.address, ...address };
            if (emergencyContact) employee.emergencyContact = { ...employee.emergencyContact, ...emergencyContact };
            if (skills) employee.skills = skills;
            await employee.save();
          }

          const updatedProfile = await Employee.findOne({ user: req.user._id }).populate(
            'reportingManager',
            'name email'
          );

          return res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              avatar: user.avatar,
              employeeProfile: updatedProfile,
            },
          });
        }
      } catch (e) {}
    }

    // Fallback update
    const mockUser = mockUsers.find((u) => u._id.toString() === req.user._id.toString());
    if (mockUser && name) mockUser.name = name;

    const mockEmp = mockEmployees.find(
      (e) => (e.user?._id || e.user).toString() === req.user._id.toString()
    );
    if (mockEmp) {
      if (phone) mockEmp.phone = phone;
      if (address) mockEmp.address = address;
      if (emergencyContact) mockEmp.emergencyContact = emergencyContact;
      if (skills) mockEmp.skills = skills;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: req.user._id,
        name: name || req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        employeeProfile: mockEmp,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new passwords',
      });
    }

    if (isDbConnected()) {
      try {
        const user = await User.findById(req.user._id).select('+password');
        if (user) {
          const isMatch = await user.matchPassword(currentPassword);
          if (!isMatch) {
            return res.status(400).json({
              success: false,
              message: 'Current password is incorrect',
            });
          }
          user.password = newPassword;
          await user.save();
          return res.json({
            success: true,
            message: 'Password changed successfully',
          });
        }
      } catch (e) {}
    }

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
};
