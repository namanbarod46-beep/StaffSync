const mongoose = require('mongoose');
const Announcement = require('../models/Announcement');
const { mockAnnouncements, mockUsers } = require('../data/mockData');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
const getAllAnnouncements = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      try {
        const { category, priority } = req.query;
        let query = {};
        if (category && category !== 'All') query.category = category;
        if (priority && priority !== 'All') query.priority = priority;

        const announcements = await Announcement.find(query)
          .populate('postedBy', 'name email role avatar')
          .sort({ isPinned: -1, createdAt: -1 });

        return res.json({
          success: true,
          count: announcements.length,
          data: announcements,
        });
      } catch (e) {}
    }

    let list = mockAnnouncements;
    const { category, priority } = req.query;
    if (category && category !== 'All') list = list.filter((a) => a.category === category);
    if (priority && priority !== 'All') list = list.filter((a) => a.priority === priority);

    res.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create announcement (HR only)
// @route   POST /api/announcements
// @access  Private (HR)
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, priority, category, targetAudience, isPinned } = req.body;

    if (isDbConnected()) {
      try {
        const announcement = await Announcement.create({
          title,
          content,
          priority: priority || 'Medium',
          category: category || 'General',
          targetAudience: targetAudience || 'All',
          isPinned: Boolean(isPinned),
          postedBy: req.user._id,
        });

        const populated = await Announcement.findById(announcement._id).populate('postedBy', 'name email role');
        return res.status(201).json({
          success: true,
          message: 'Announcement posted successfully',
          data: populated,
        });
      } catch (e) {}
    }

    const newMock = {
      _id: '6640000000000000000000' + (mockAnnouncements.length + 1),
      title,
      content,
      priority: priority || 'Medium',
      category: category || 'General',
      targetAudience: targetAudience || 'All',
      isPinned: Boolean(isPinned),
      postedBy: req.user,
      createdAt: new Date(),
    };
    mockAnnouncements.unshift(newMock);

    res.status(201).json({
      success: true,
      message: 'Announcement posted successfully',
      data: newMock,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (HR only)
const deleteAnnouncement = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      try {
        const announcement = await Announcement.findById(req.params.id);
        if (announcement) {
          await announcement.deleteOne();
          return res.json({
            success: true,
            message: 'Announcement deleted successfully',
          });
        }
      } catch (e) {}
    }

    const idx = mockAnnouncements.findIndex((a) => a._id.toString() === req.params.id.toString());
    if (idx !== -1) mockAnnouncements.splice(idx, 1);

    res.json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle pin announcement
// @route   PUT /api/announcements/:id/pin
// @access  Private (HR only)
const togglePin = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      try {
        const announcement = await Announcement.findById(req.params.id);
        if (announcement) {
          announcement.isPinned = !announcement.isPinned;
          await announcement.save();
          return res.json({
            success: true,
            message: `Announcement ${announcement.isPinned ? 'pinned' : 'unpinned'} successfully`,
            data: announcement,
          });
        }
      } catch (e) {}
    }

    const a = mockAnnouncements.find((item) => item._id.toString() === req.params.id.toString());
    if (a) a.isPinned = !a.isPinned;

    res.json({
      success: true,
      message: 'Announcement pin updated',
      data: a,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  togglePin,
};
