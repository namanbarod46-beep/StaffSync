const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyAttendance,
  getAllAttendance,
  markAttendanceManual,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.get('/today', protect, getTodayStatus);
router.get('/my', protect, getMyAttendance);
router.get('/', protect, authorize('hr', 'manager'), getAllAttendance);
router.post('/manual', protect, authorize('hr'), markAttendanceManual);

module.exports = router;
