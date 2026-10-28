const express = require('express');
const router = express.Router();
const {
  getAllAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  togglePin,
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getAllAnnouncements);
router.post('/', protect, authorize('hr'), createAnnouncement);
router.delete('/:id', protect, authorize('hr'), deleteAnnouncement);
router.put('/:id/pin', protect, authorize('hr'), togglePin);

module.exports = router;
