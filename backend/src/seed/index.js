require('dotenv').config();
const { sequelize, Scheme, Lesson } = require('../models');
const schemes = require('./seedSchemes');
const lessons = require('./seedLessons');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB. Seeding...');

    for (const scheme of schemes) {
      await Scheme.upsert(scheme, { conflictFields: ['slug'] });
    }
    console.log(`✅ Seeded ${schemes.length} schemes`);

    for (const lesson of lessons) {
      await Lesson.findOrCreate({ where: { title: lesson.title }, defaults: lesson });
    }
    console.log(`✅ Seeded ${lessons.length} lessons`);

    console.log('🎉 Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
