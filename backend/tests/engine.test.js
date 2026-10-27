// Run with: npm test   (uses Node's built-in test runner, no extra packages)
const test = require('node:test');
const assert = require('node:assert/strict');

const { processTurn, emptyProfile } = require('../src/livelihood/extract');
const { recommend } = require('../src/livelihood/recommend');

test('interview engine reads state and age from one spoken answer', () => {
  const r = processTurn({
    lang: 'en',
    questionId: 'where',
    transcript: 'I live in Bihar and I am 24 years old',
    profile: emptyProfile(),
    attempts: 0,
  });
  assert.equal(r.profile.age, 24);
  assert.ok(r.profile.state, 'state should be detected');
  assert.ok(r.next, 'engine should ask a next question');
});

test('interview engine rejects an unknown question id', () => {
  assert.throws(
    () => processTurn({ lang: 'en', questionId: 'nope', transcript: 'x', profile: emptyProfile(), attempts: 0 }),
    /Unknown questionId/
  );
});

test('recommender returns ranked courses with reasons', () => {
  const profile = processTurn({
    lang: 'en',
    questionId: 'where',
    transcript: 'I live in Bihar and I am 24 years old',
    profile: emptyProfile(),
    attempts: 0,
  }).profile;

  const out = recommend(profile);
  assert.ok(Array.isArray(out.recommendations));
  assert.ok(out.recommendations.length > 0, 'at least one course recommended');
  assert.equal(out.recommendations[0].rank, 1);
  assert.ok(out.recommendations[0].reasons.length > 0, 'every pick explains why');
});
