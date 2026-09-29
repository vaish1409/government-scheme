const twilio = require('twilio');

/**
 * Twilio signs every webhook request with X-Twilio-Signature, computed over
 * the exact public URL Twilio called plus the posted form fields. We rebuild
 * that same URL and check it — this stops anyone else from POSTing fake call
 * or message events at these endpoints.
 *
 * Before TWILIO_AUTH_TOKEN is set, verification is skipped with a console
 * warning (so the bridge is testable locally / with the Twilio CLI before
 * a real number is configured). Once the token is set, an invalid or missing
 * signature is rejected. Set PUBLIC_BASE_URL to the app's public https URL
 * if it sits behind a proxy that changes req.protocol/host (Render, Railway,
 * ngrok) — Twilio signs the URL it actually called, not an internal one.
 */
function verifyTwilioSignature(req, res, next) {
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!token) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('TWILIO_AUTH_TOKEN not set — skipping webhook signature check (fine for local testing only).');
    }
    return next();
  }

  const signature = req.headers['x-twilio-signature'];
  const base = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
  const url = base.replace(/\/$/, '') + req.originalUrl;

  const valid = signature && twilio.validateRequest(token, signature, url, req.body || {});
  if (!valid) {
    console.warn(`Rejected webhook with invalid Twilio signature for ${url}`);
    return res.status(403).send('Invalid signature');
  }
  return next();
}

module.exports = { verifyTwilioSignature };
