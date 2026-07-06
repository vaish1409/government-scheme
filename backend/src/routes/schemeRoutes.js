const express = require('express');
const {
  getSchemes,
  getSchemeBySlug,
  createScheme,
  updateScheme,
} = require('../controllers/schemeController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getSchemes);
router.get('/:slug', getSchemeBySlug);

// In a production app, wrap these two in an isAdmin middleware check
router.post('/', protect, createScheme);
router.patch('/:id', protect, updateScheme);

module.exports = router;
