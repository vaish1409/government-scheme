const { Lesson, UserProgress } = require('../models');

// @route  GET /api/lessons?category=&language=
// This is what the PWA calls to know what's available to cache offline.
async function getLessons(req, res, next) {
  try {
    const where = { isActive: true };
    if (req.query.category) where.category = req.query.category;
    if (req.query.language) where.language = req.query.language;

    const lessons = await Lesson.findAll({
      where,
      order: [['category', 'ASC'], ['orderIndex', 'ASC']],
    });

    res.json({ count: lessons.length, lessons });
  } catch (err) {
    next(err);
  }
}

async function getLessonById(req, res, next) {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    res.json({ lesson });
  } catch (err) {
    next(err);
  }
}

// @route  GET /api/lessons/progress
// Returns the logged-in user's completion status across all lessons —
// used to render progress bars / badges once back online.
async function getMyProgress(req, res, next) {
  try {
    const progress = await UserProgress.findAll({
      where: { userId: req.user.id },
      include: [{ model: Lesson, attributes: ['id', 'title', 'category'] }],
      order: [['occurredAt', 'DESC']],
    });
    res.json({ count: progress.length, progress });
  } catch (err) {
    next(err);
  }
}

async function createLesson(req, res, next) {
  try {
    const lesson = await Lesson.create(req.body);
    res.status(201).json({ lesson });
  } catch (err) {
    next(err);
  }
}

module.exports = { getLessons, getLessonById, getMyProgress, createLesson };
