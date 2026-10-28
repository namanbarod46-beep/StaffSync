const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a training title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide training description'],
    },
    category: {
      type: String,
      enum: ['Technical', 'Leadership', 'Compliance', 'Soft Skills', 'Productivity'],
      default: 'Technical',
    },
    trainer: {
      type: String,
      required: [true, 'Please provide trainer name'],
      trim: true,
    },
    department: {
      type: String,
      default: 'All',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    maxParticipants: {
      type: Number,
      default: 30,
    },
    enrolledEmployees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed'],
      default: 'Upcoming',
    },
    locationUrl: {
      type: String,
      default: 'Virtual (Google Meet / Zoom)',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Training', trainingSchema);
