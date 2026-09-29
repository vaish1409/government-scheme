const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

/**
 * One in-progress conversation on a channel that has no browser to hold
 * state in (a phone call, a WhatsApp thread). The web app keeps profile +
 * attempts in React state and sends them with every request; a phone call or
 * a WhatsApp message can't do that, so we keep the same shape here instead.
 *
 * channel + externalId is the identity of a conversation:
 *   - ivr:      externalId = Twilio CallSid (one row per call; hanging up
 *               and calling again starts clean, which is normal IVR UX)
 *   - whatsapp: externalId = the "whatsapp:+91..." From address (one row per
 *               phone number; the conversation can continue across separate
 *               messages, even a day later, like a real chat thread)
 *
 * status:
 *   lang_pending    just created, we've sent the language menu, waiting for
 *                   their reply to it
 *   active          mid-interview; questionId names the pending question
 *   awaiting_consent  interview finished, waiting for yes/no on saving
 *
 * There is no 'done' status: once consent is answered (or an interview is
 * restarted) the row is deleted, so the next message always starts a fresh
 * findOrCreate. That keeps the state machine small and avoids ever reusing
 * a stale, half-finished profile by accident.
 */
const ChannelSession = sequelize.define('ChannelSession', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  channel: { type: DataTypes.ENUM('ivr', 'whatsapp'), allowNull: false },
  externalId: { type: DataTypes.STRING, allowNull: false },
  contactPhone: DataTypes.STRING, // human-readable caller/sender number, kept for the consent SMS/reply
  lang: DataTypes.STRING, // null until the language step is answered
  status: {
    type: DataTypes.ENUM('lang_pending', 'active', 'awaiting_consent'),
    defaultValue: 'lang_pending',
  },
  questionId: DataTypes.STRING, // null before the first question and once done
  profile: { type: DataTypes.JSONB, defaultValue: {} },
  attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  timestamps: true,
  indexes: [{ unique: true, fields: ['channel', 'externalId'] }],
});

module.exports = ChannelSession;
