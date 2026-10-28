const express = require('express');
const router = express.Router();
const {
  getAllTrainings,
  createTraining,
  enrollTraining,
  updateTraining,
  deleteTraining,
} = require('../controllers/trainingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getAllTrainings);
router.post('/', protect, authorize('hr', 'manager'), createTraining);
router.post('/:id/enroll', protect, enrollTraining);
router.put('/:id', protect, authorize('hr', 'manager'), updateTraining);
router.delete('/:id', protect, authorize('hr'), deleteTraining);

module.exports = router;
