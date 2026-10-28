const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Please specify department'],
      enum: [
        'Engineering',
        'Human Resources',
        'Sales & Marketing',
        'Product & Design',
        'Finance & Accounts',
        'Operations',
        'Customer Support',
      ],
      default: 'Engineering',
    },
    designation: {
      type: String,
      required: [true, 'Please specify designation'],
      trim: true,
    },
    dateOfJoining: {
      type: Date,
      default: Date.now,
    },
    reportingManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    salary: {
      type: Number,
      default: 60000,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      country: { type: String, default: 'USA' },
    },
    emergencyContact: {
      name: { type: String, default: '' },
      relationship: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    skills: {
      type: [String],
      default: [],
    },
    leaveBalance: {
      annual: { type: Number, default: 15 },
      sick: { type: Number, default: 10 },
      casual: { type: Number, default: 7 },
    },
    status: {
      type: String,
      enum: ['active', 'on_leave', 'terminated'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Employee', employeeSchema);
