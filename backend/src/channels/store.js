const { ChannelSession } = require('../models');

/**
 * Loads the conversation for this channel + externalId, or starts a new one.
 * `created` tells the caller whether this is truly the first contact (so it
 * knows to send the language menu instead of treating the message as an answer).
 */
async function findOrCreateSession(channel, externalId, contactPhone) {
  const [session, created] = await ChannelSession.findOrCreate({
    where: { channel, externalId },
    defaults: { channel, externalId, contactPhone, status: 'lang_pending', profile: {}, attempts: 0 },
  });
  return { session, created };
}

/** Applies a partial update and saves. Always pass a *new* profile object
 * (never mutate the one already on `session`) so Sequelize's dirty-checking
 * on the JSONB column reliably picks up the change. */
async function saveSession(session, patch) {
  Object.assign(session, patch);
  await session.save();
  return session;
}

/** Ends the conversation (after consent is answered, or on an explicit
 * restart command) so the next inbound message always starts clean. */
async function destroySession(session) {
  await session.destroy();
}

module.exports = { findOrCreateSession, saveSession, destroySession };
