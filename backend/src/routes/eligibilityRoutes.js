const express = require('express');
const { checkEligibility, getEligibilityHistory } = require('../controllers/eligibilityController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Optional auth: attach req.user if a valid token is present, but don't block
// anonymous eligibility checks — see comment in eligibilityController.js
const optionalAuth = async (req, res, next) => {
  if (!req.headers.authorization?.startsWith('Bearer')) return next();
  return protect(req, res, next);
};

router.post('/check', optionalAuth, checkEligibility);
router.get('/history', protect, getEligibilityHistory);

module.exports = router;
