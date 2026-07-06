const { Scheme, EligibilityCheck } = require('../models');
const { findEligibleSchemes } = require('../utils/rulesEngine');

/**
 * @route  POST /api/eligibility/check
 * @body   A profile object — either the logged-in user's saved profile,
 *         or fresh answers from a one-off quiz (for users checking
 *         anonymously before signing up).
 *
 * This endpoint works both logged-in and logged-out, since letting
 * someone check eligibility BEFORE forcing signup reduces drop-off —
 * a real UX consideration worth mentioning in interviews.
 */
async function checkEligibility(req, res, next) {
  try {
    // Merge: explicit answers in the request body win over the saved profile
    const baseProfile = req.user ? req.user.toSafeJSON() : {};
    const profile = { ...baseProfile, ...req.body };

    const requiredFields = ['age', 'state'];
    const missing = requiredFields.filter((f) => profile[f] === undefined || profile[f] === null);
    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
    }

    const schemes = await Scheme.findAll({ where: { isActive: true } });
    const results = findEligibleSchemes(profile, schemes);

    const eligibleSchemes = results.map((r) => ({
      id: r.scheme.id,
      name: r.scheme.name,
      slug: r.scheme.slug,
      category: r.scheme.category,
      benefits: r.scheme.benefits,
      documentsRequired: r.scheme.documentsRequired,
      applyUrl: r.scheme.applyUrl,
      reason: r.reason,
    }));

    // Save a history record if the user is logged in — powers "schemes I qualify for" tab
    if (req.user) {
      await EligibilityCheck.create({
        userId: req.user.id,
        answersSnapshot: profile,
        eligibleSchemeIds: eligibleSchemes.map((s) => s.id),
      });
    }

    res.json({
      totalSchemesChecked: schemes.length,
      eligibleCount: eligibleSchemes.length,
      eligibleSchemes,
    });
  } catch (err) {
    next(err);
  }
}

// @route  GET /api/eligibility/history  (logged-in users only)
async function getEligibilityHistory(req, res, next) {
  try {
    const history = await EligibilityCheck.findAll({
      where: { userId: req.user.id },
      order: [['checkedAt', 'DESC']],
      limit: 20,
    });
    res.json({ count: history.length, history });
  } catch (err) {
    next(err);
  }
}

module.exports = { checkEligibility, getEligibilityHistory };
