const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { mockNotifications } = require('../data/mockData');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get current user notifications
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      try {
        const notifications = await Notification.find({ recipient: req.user._id })
          .sort({ createdAt: -1 })
          .limit(20);

        const unreadCount = await Notification.countDocuments({
          recipient: req.user._id,
          isRead: false,
        });

        return res.json({
          success: true,
          unreadCount,
          data: notifications,
        });
      } catch (e) {}
    }

    res.json({
      success: true,
      unreadCount: mockNotifications.filter((n) => !n.isRead).length,
      data: mockNotifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      try {
        const notification = await Notification.findById(req.params.id);
        if (notification) {
          notification.isRead = true;
          await notification.save();
          return res.json({ success: true, data: notification });
        }
      } catch (e) {}
    }

    const n = mockNotifications.find((item) => item._id.toString() === req.params.id.toString());
    if (n) n.isRead = true;

    res.json({ success: true, data: n });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      try {
        await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
        return res.json({ success: true, message: 'All notifications marked as read' });
      } catch (e) {}
    }

    mockNotifications.forEach((n) => (n.isRead = true));
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
