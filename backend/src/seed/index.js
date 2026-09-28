require('dotenv').config();
const { sequelize, Scheme, Lesson, LivelihoodSession } = require('../models');
const schemes = require('./seedSchemes');
const lessons = require('./seedLessons');
const { buildSessions } = require('./seedSessions');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB. Seeding...');

    for (const scheme of schemes) {
      await Scheme.upsert(scheme, { conflictFields: ['slug'] });
    }
    console.log(`Seeded ${schemes.length} schemes`);

    for (const lesson of lessons) {
      await Lesson.findOrCreate({ where: { title: lesson.title }, defaults: lesson });
    }
    console.log(`Seeded ${lessons.length} lessons`);

    await LivelihoodSession.destroy({ where: { isDemo: true } });
    const demoSessions = buildSessions(150);
    await LivelihoodSession.bulkCreate(demoSessions);
    console.log(`Seeded ${demoSessions.length} demo livelihood sessions`);

    console.log('Seeding complete');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();
