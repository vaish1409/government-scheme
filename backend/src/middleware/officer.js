/**
 * Very small gate for the officer/counsellor dashboard.
 *
 * Set OFFICER_KEY in .env and send it as the `x-officer-key` header. This is
 * enough for a prototype demo; a production build should use real accounts and
 * roles (state officer, district officer, counsellor) instead of one shared key.
 */
function officerOnly(req, res, next) {
  const expected = process.env.OFFICER_KEY;
  if (!expected) {
    return res.status(503).json({ message: 'Officer access is not configured (set OFFICER_KEY).' });
  }
  if (req.headers['x-officer-key'] !== expected) {
    return res.status(401).json({ message: 'Officer key missing or wrong.' });
  }
  next();
}

module.exports = { officerOnly };
