const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { len: [10, 15] },
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Virtual field: pass the plain password in here when creating a user.
  // It never gets stored — the beforeCreate hook hashes it into passwordHash.
  passwordInput: {
    type: DataTypes.VIRTUAL,
  },
  // Used by the eligibility engine — kept flat & simple on purpose
  age: DataTypes.INTEGER,
  gender: DataTypes.ENUM('male', 'female', 'other'),
  annualIncome: DataTypes.FLOAT,
  state: DataTypes.STRING,
  occupation: DataTypes.STRING, // e.g. 'farmer', 'student', 'self-employed', 'unemployed'
  category: DataTypes.ENUM('general', 'obc', 'sc', 'st', 'other'),
  isPregnantOrLactating: { type: DataTypes.BOOLEAN, defaultValue: false },
  hasBankAccount: { type: DataTypes.BOOLEAN, defaultValue: false },
  languagePref: { type: DataTypes.STRING, defaultValue: 'en' },
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.passwordInput) {
        user.passwordHash = await bcrypt.hash(user.passwordInput, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.passwordInput) {
        user.passwordHash = await bcrypt.hash(user.passwordInput, 10);
      }
    },
  },
});

User.prototype.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

// Strip sensitive fields when sending user objects back to the client
User.prototype.toSafeJSON = function () {
  const { passwordHash, ...safe } = this.toJSON();
  return safe;
};

module.exports = User;
