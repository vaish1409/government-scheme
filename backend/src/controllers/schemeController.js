const { Scheme } = require('../models');

// @route  GET /api/schemes
// Public listing — supports ?category= filter, used by the "browse schemes" screen
async function getSchemes(req, res, next) {
  try {
    const where = { isActive: true };
    if (req.query.category) where.category = req.query.category;

    const schemes = await Scheme.findAll({ where, order: [['name', 'ASC']] });
    res.json({ count: schemes.length, schemes });
  } catch (err) {
    next(err);
  }
}

// @route  GET /api/schemes/:slug
async function getSchemeBySlug(req, res, next) {
  try {
    const scheme = await Scheme.findOne({ where: { slug: req.params.slug, isActive: true } });
    if (!scheme) return res.status(404).json({ message: 'Scheme not found' });
    res.json({ scheme });
  } catch (err) {
    next(err);
  }
}

// @route  POST /api/schemes  (admin only, in a real app gate this behind a role check)
async function createScheme(req, res, next) {
  try {
    const scheme = await Scheme.create(req.body);
    res.status(201).json({ scheme });
  } catch (err) {
    next(err);
  }
}

// @route  PATCH /api/schemes/:id
async function updateScheme(req, res, next) {
  try {
    const scheme = await Scheme.findByPk(req.params.id);
    if (!scheme) return res.status(404).json({ message: 'Scheme not found' });

    await scheme.update(req.body);
    res.json({ scheme });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSchemes, getSchemeBySlug, createScheme, updateScheme };
