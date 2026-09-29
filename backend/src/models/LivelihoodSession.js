const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

/**
 * One finished voice interview (only saved when the person gives consent).
 *
 * What is stored: the structured profile, the recommended course ids and a few
 * counters the officer dashboard needs. What is NOT stored: audio, and any
 * name. A phone number is stored only if the person chooses to give one so a
 * counsellor can call back.
 */
const LivelihoodSession = sequelize.define('LivelihoodSession', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  channel: { type: DataTypes.ENUM('web', 'ivr', 'whatsapp'), defaultValue: 'web' },
  lang: { type: DataTypes.STRING, defaultValue: 'en' },
  state: DataTypes.STRING,
  profile: { type: DataTypes.JSONB, allowNull: false }, // structured answers
  recommendedCourseIds: { type: DataTypes.JSONB, defaultValue: [] }, // best first
  primaryTrade: DataTypes.STRING, // trade of the top course
  skillGaps: { type: DataTypes.JSONB, defaultValue: [] }, // skills the top course would add (English)
  needsReview: { type: DataTypes.BOOLEAN, defaultValue: false },
  reviewReasons: { type: DataTypes.JSONB, defaultValue: [] },
  contactPhone: DataTypes.STRING, // optional
  consent: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  counsellorStatus: {
    type: DataTypes.ENUM('pending', 'confirmed', 'changed'),
    defaultValue: 'pending',
  },
  // what happened after the recommendation: feeds the placement funnel
  followUpStatus: {
    type: DataTypes.ENUM('none', 'enrolled', 'completed', 'placed', 'dropped'),
    defaultValue: 'none',
  },
  isDemo: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

module.exports = LivelihoodSession;
