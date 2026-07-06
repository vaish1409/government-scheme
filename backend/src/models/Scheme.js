const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

/*
  eligibilityRules shape (consumed by utils/rulesEngine.js):
  {
    "all": [
      { "fact": "age", "operator": "greaterThanInclusive", "value": 18 },
      { "fact": "annualIncome", "operator": "lessThanInclusive", "value": 250000 }
    ],
    "any": [
      { "fact": "occupation", "operator": "equal", "value": "farmer" },
      { "fact": "isPregnantOrLactating", "operator": "equal", "value": true }
    ]
  }
  "all" = every condition must pass. "any" = at least one must pass. Both optional.
*/

const Scheme = sequelize.define('Scheme', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  category: {
    type: DataTypes.ENUM('health', 'finance', 'agriculture', 'education', 'women', 'other'),
    allowNull: false,
  },
  description: DataTypes.TEXT,
  benefits: DataTypes.TEXT,
  applyUrl: DataTypes.STRING,
  documentsRequired: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  eligibilityRules: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: { all: [] },
  },
  applicableStates: {
    // empty array = applicable to all states
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  timestamps: true,
});

module.exports = Scheme;
