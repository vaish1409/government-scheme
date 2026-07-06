const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

/*
  Why clientEventId exists:
  When a user completes a lesson offline, the PWA generates a UUID for that
  event *on the device* before it ever reaches the server. When the device
  comes back online and syncs, we upsert on clientEventId instead of
  blindly inserting — so if the same sync request is retried (flaky network,
  duplicate background-sync trigger), we don't create duplicate progress rows.
  This is the core idempotency mechanism for offline-first sync.
*/

const UserProgress = sequelize.define('UserProgress', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  clientEventId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
  userId: { type: DataTypes.UUID, allowNull: false },
  lessonId: { type: DataTypes.UUID, allowNull: false },
  completed: { type: DataTypes.BOOLEAN, defaultValue: false },
  progressPercent: { type: DataTypes.INTEGER, defaultValue: 0 }, // 0-100, for partial listens
  // When the action actually happened on the device (may be well before syncedAt)
  occurredAt: { type: DataTypes.DATE, allowNull: false },
  // When the server received/processed it
  syncedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId', 'lessonId'] },
  ],
});

module.exports = UserProgress;
