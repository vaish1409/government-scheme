const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const EligibilityCheck = sequelize.define('EligibilityCheck', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: { type: DataTypes.UUID, allowNull: false },
  answersSnapshot: { type: DataTypes.JSONB, allowNull: false }, // the profile used at check time
  eligibleSchemeIds: { type: DataTypes.JSONB, defaultValue: [] },
  checkedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps: true,
});

module.exports = EligibilityCheck;
