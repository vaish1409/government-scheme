const express = require('express');
const {
  getLessons,
  getLessonById,
  getMyProgress,
  createLesson,
} = require('../controllers/lessonController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getLessons);
router.get('/progress', protect, getMyProgress);
router.get('/:id', getLessonById);
router.post('/', protect, createLesson); // admin in production

module.exports = router;
