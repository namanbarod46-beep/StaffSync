const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
  cancelLeave,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, applyLeave);
router.get('/my', protect, getMyLeaves);
router.get('/', protect, authorize('hr', 'manager'), getAllLeaves);
router.put('/:id/review', protect, authorize('hr', 'manager'), reviewLeave);
router.delete('/:id', protect, cancelLeave);

module.exports = router;
