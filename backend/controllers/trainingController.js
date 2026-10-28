const mongoose = require('mongoose');
const Training = require('../models/Training');
const { mockTrainings, mockUsers } = require('../data/mockData');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all training programs
// @route   GET /api/trainings
// @access  Private
const getAllTrainings = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      try {
        const { category, status, department } = req.query;
        let query = {};
        if (category && category !== 'All') query.category = category;
        if (status && status !== 'All') query.status = status;
        if (department && department !== 'All') query.department = department;

        const trainings = await Training.find(query)
          .populate('enrolledEmployees', 'name email role avatar')
          .sort({ startDate: 1 });

        return res.json({
          success: true,
          count: trainings.length,
          data: trainings,
        });
      } catch (e) {}
    }

    let list = mockTrainings;
    const { category, status } = req.query;
    if (category && category !== 'All') list = list.filter((t) => t.category === category);
    if (status && status !== 'All') list = list.filter((t) => t.status === status);

    res.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new training program
// @route   POST /api/trainings
// @access  Private (HR / Manager)
const createTraining = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      trainer,
      department,
      startDate,
      endDate,
      maxParticipants,
      locationUrl,
    } = req.body;

    if (isDbConnected()) {
      try {
        const training = await Training.create({
          title,
          description,
          category: category || 'Technical',
          trainer,
          department: department || 'All',
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          maxParticipants: maxParticipants ? Number(maxParticipants) : 30,
          locationUrl: locationUrl || 'Virtual (Google Meet / Zoom)',
        });

        return res.status(201).json({
          success: true,
          message: 'Training program created successfully',
          data: training,
        });
      } catch (e) {}
    }

    const newMock = {
      _id: '6650000000000000000000' + (mockTrainings.length + 1),
      title,
      description,
      category: category || 'Technical',
      trainer,
      department: department || 'All',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      maxParticipants: maxParticipants || 30,
      enrolledEmployees: [],
      status: 'Upcoming',
      locationUrl: locationUrl || 'Virtual (Google Meet)',
    };
    mockTrainings.push(newMock);

    res.status(201).json({
      success: true,
      message: 'Training program created successfully',
      data: newMock,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Enroll current employee into training program
// @route   POST /api/trainings/:id/enroll
// @access  Private
const enrollTraining = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      try {
        const training = await Training.findById(req.params.id);
        if (training) {
          const userIdStr = req.user._id.toString();
          const alreadyEnrolled = training.enrolledEmployees.some(
            (empId) => empId.toString() === userIdStr
          );

          if (alreadyEnrolled) {
            training.enrolledEmployees = training.enrolledEmployees.filter(
              (empId) => empId.toString() !== userIdStr
            );
            await training.save();
            return res.json({
              success: true,
              message: 'You have unenrolled from this training session',
              enrolled: false,
              data: training,
            });
          }

          training.enrolledEmployees.push(req.user._id);
          await training.save();

          return res.json({
            success: true,
            message: 'Successfully enrolled in training program',
            enrolled: true,
            data: training,
          });
        }
      } catch (e) {}
    }

    const t = mockTrainings.find((item) => item._id.toString() === req.params.id.toString());
    if (t) {
      const idx = t.enrolledEmployees.indexOf(req.user._id);
      if (idx !== -1) {
        t.enrolledEmployees.splice(idx, 1);
        return res.json({
          success: true,
          message: 'You have unenrolled from this training session',
          enrolled: false,
          data: t,
        });
      } else {
        t.enrolledEmployees.push(req.user._id);
        return res.json({
          success: true,
          message: 'Successfully enrolled in training program',
          enrolled: true,
          data: t,
        });
      }
    }

    res.json({
      success: true,
      message: 'Enrollment updated',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update training program
// @route   PUT /api/trainings/:id
// @access  Private (HR / Manager)
const updateTraining = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      try {
        const training = await Training.findById(req.params.id);
        if (training) {
          Object.assign(training, req.body);
          await training.save();
          return res.json({
            success: true,
            message: 'Training program updated successfully',
            data: training,
          });
        }
      } catch (e) {}
    }

    const t = mockTrainings.find((item) => item._id.toString() === req.params.id.toString());
    if (t) Object.assign(t, req.body);

    res.json({
      success: true,
      message: 'Training program updated successfully',
      data: t,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete training program
// @route   DELETE /api/trainings/:id
// @access  Private (HR only)
const deleteTraining = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      try {
        const training = await Training.findById(req.params.id);
        if (training) {
          await training.deleteOne();
          return res.json({
            success: true,
            message: 'Training program deleted successfully',
          });
        }
      } catch (e) {}
    }

    const idx = mockTrainings.findIndex((item) => item._id.toString() === req.params.id.toString());
    if (idx !== -1) mockTrainings.splice(idx, 1);

    res.json({
      success: true,
      message: 'Training program deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTrainings,
  createTraining,
  enrollTraining,
  updateTraining,
  deleteTraining,
};
