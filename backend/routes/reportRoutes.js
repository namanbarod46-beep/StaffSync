const express = require('express');
const router = express.Router();
const {
  getHRDashboardStats,
  getManagerDashboardStats,
  getEmployeeDashboardStats,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/hr-dashboard', protect, authorize('hr'), getHRDashboardStats);
router.get('/manager-dashboard', protect, authorize('manager', 'hr'), getManagerDashboardStats);
router.get('/employee-dashboard', protect, getEmployeeDashboardStats);

module.exports = router;
