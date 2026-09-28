import { openDB } from 'idb';
import { v4 as uuidv4 } from 'uuid';

/*
  This is the client-side half of the offline-sync story.

  When a user marks a lesson complete (or partially watched) while offline,
  we don't try to hit the network — we just write an event into IndexedDB
  immediately, tagged with a UUID we generate here (clientEventId). The UI
  updates instantly from this local record, so the app never feels "stuck"
  waiting on a network call that might not succeed.

  When connectivity returns (see hooks/useSync.js), we read all unsynced
  events and POST them in a batch to /api/sync/push. The backend uses that
  same clientEventId to dedupe, so even if this sync runs twice (flaky
  reconnect, app closed mid-sync), we never create duplicate progress.
*/

const DB_NAME = 'saksham-offline-db';
const STORE_NAME = 'progress-events';
export const PROGRESS_QUEUED_EVENT = 'saksham:progress-queued';

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      const store = db.createObjectStore(STORE_NAME, { keyPath: 'clientEventId' });
      store.createIndex('synced', 'synced');
    },
  });
}

export async function queueProgressEvent({ lessonId, completed, progressPercent }) {
  const db = await getDB();
  const event = {
    clientEventId: uuidv4(),
    lessonId,
    completed,
    progressPercent,
    occurredAt: new Date().toISOString(),
    synced: 0, // 0 = false, 1 = true — IndexedDB indexes booleans inconsistently across browsers
  };
  await db.put(STORE_NAME, event);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(PROGRESS_QUEUED_EVENT));
  }
  return event;
}

export async function getUnsyncedEvents() {
  const db = await getDB();
  const all = await db.getAll(STORE_NAME);
  return all.filter((e) => e.synced === 0);
}

export async function markEventsSynced(clientEventIds) {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  for (const id of clientEventIds) {
    const event = await tx.store.get(id);
    if (event) {
      event.synced = 1;
      await tx.store.put(event);
    }
  }
  await tx.done;
}

export async function getAllLocalProgress() {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}
