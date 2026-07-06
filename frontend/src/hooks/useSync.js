import { useState, useEffect, useCallback } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { getUnsyncedEvents, markEventsSynced } from '../db/offlineStore';
import { syncApi } from '../api/client';

// 'idle' | 'syncing' | 'synced' | 'error'
export function useSync(isAuthenticated) {
  const isOnline = useOnlineStatus();
  const [status, setStatus] = useState('idle');

  const runSync = useCallback(async () => {
    if (!isOnline || !isAuthenticated) return;

    const pending = await getUnsyncedEvents();
    if (pending.length === 0) return;

    setStatus('syncing');
    try {
      const { data } = await syncApi.push(pending);
      const syncedIds = data.results
        .filter((r) => r.status === 'synced' || r.status === 'already_synced')
        .map((r) => r.clientEventId);
      await markEventsSynced(syncedIds);
      setStatus('synced');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (err) {
      console.error('Sync failed, will retry on next reconnect', err);
      setStatus('error');
    }
  }, [isOnline, isAuthenticated]);

  // Auto-sync whenever we come back online
  useEffect(() => {
    if (isOnline) runSync();
  }, [isOnline, runSync]);

  return { isOnline, status, runSync };
}
