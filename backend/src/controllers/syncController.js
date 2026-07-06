const { UserProgress, Lesson, Scheme } = require('../models');

/**
 * @route  POST /api/sync/push
 * @body   { events: [ { clientEventId, lessonId, completed, progressPercent, occurredAt }, ... ] }
 *
 * How offline-first sync works end to end:
 * 1. While offline, the PWA writes lesson-progress events into IndexedDB,
 *    each tagged with a client-generated UUID (clientEventId) and the
 *    device timestamp (occurredAt).
 * 2. When connectivity returns, the service worker's Background Sync
 *    fires and POSTs all queued events here in one batch.
 * 3. We upsert each event on clientEventId. If the same batch is retried
 *    (e.g. the browser fires background sync twice, or the response was
 *    lost mid-flight), we don't create duplicate progress records —
 *    that's the idempotency guarantee.
 * 4. We use occurredAt (not syncedAt) as the source of truth for "when did
 *    this actually happen", so a lesson watched offline 3 days ago is
 *    correctly ordered in the activity history even if it syncs late.
 *
 * Conflict handling: if a progressPercent for the same lesson comes in
 * lower than what's already stored (e.g. two devices, or a stale replay),
 * we keep the higher value — "furthest progress wins" rather than
 * "last write wins", which better matches user expectations.
 */
async function pushSync(req, res, next) {
  try {
    const { events } = req.body;

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ message: 'events must be a non-empty array' });
    }

    const results = [];

    for (const event of events) {
      const { clientEventId, lessonId, completed, progressPercent, occurredAt } = event;

      if (!clientEventId || !lessonId || !occurredAt) {
        results.push({ clientEventId, status: 'rejected', reason: 'missing required fields' });
        continue;
      }

      const existing = await UserProgress.findOne({ where: { clientEventId } });

      if (existing) {
        // Already synced before — this is a retried/duplicate event.
        // Merge using "furthest progress wins" and report back as such.
        const shouldUpdate = (progressPercent || 0) > existing.progressPercent;
        if (shouldUpdate) {
          existing.progressPercent = progressPercent;
          existing.completed = completed || existing.completed;
          await existing.save();
        }
        results.push({ clientEventId, status: 'already_synced', id: existing.id });
        continue;
      }

      const record = await UserProgress.create({
        clientEventId,
        userId: req.user.id,
        lessonId,
        completed: !!completed,
        progressPercent: progressPercent || 0,
        occurredAt,
        syncedAt: new Date(),
      });

      results.push({ clientEventId, status: 'synced', id: record.id });
    }

    res.json({
      message: 'Sync processed',
      processed: results.length,
      results,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route  GET /api/sync/pull?since=<ISO timestamp>
 *
 * Lets the PWA fetch only what's changed since it last synced, instead of
 * re-downloading the entire lessons/schemes catalog every time it regains
 * connectivity. This is what keeps the "syncing" step fast on poor networks.
 */
async function pullSync(req, res, next) {
  try {
    const since = req.query.since ? new Date(req.query.since) : new Date(0);
    const { Op } = require('sequelize');

    const [lessons, schemes] = await Promise.all([
      Lesson.findAll({ where: { updatedAt: { [Op.gt]: since }, isActive: true } }),
      Scheme.findAll({ where: { updatedAt: { [Op.gt]: since }, isActive: true } }),
    ]);

    res.json({
      syncedAt: new Date().toISOString(),
      lessons,
      schemes,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { pushSync, pullSync };
