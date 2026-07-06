const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Lesson = sequelize.define('Lesson', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  category: {
    type: DataTypes.ENUM('finance', 'maternal_health', 'general_health', 'digital_literacy'),
    allowNull: false,
  },
  mediaType: { type: DataTypes.ENUM('audio', 'video'), allowNull: false },
  mediaUrl: { type: DataTypes.STRING, allowNull: false }, // e.g. S3/Cloudinary URL
  thumbnailUrl: DataTypes.STRING,
  durationSeconds: DataTypes.INTEGER,
  language: { type: DataTypes.STRING, defaultValue: 'en' }, // 'en', 'hi', 'kn', etc.
  orderIndex: { type: DataTypes.INTEGER, defaultValue: 0 }, // controls display order within category
  fileSizeKb: DataTypes.INTEGER, // helps frontend decide whether to auto-download on slow networks
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  timestamps: true,
});

module.exports = Lesson;
