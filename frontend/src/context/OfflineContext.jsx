import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { offlineStorage } from '../services/offlineStorage';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const OfflineContext = createContext();

export function OfflineProvider({ children }) {
  const { user, updatePoints } = useAuth();
  const [browserOnline, setBrowserOnline] = useState(navigator.onLine);
  const [simulateOffline, setSimulateOffline] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncMessage, setLastSyncMessage] = useState(null);

  const isOnline = browserOnline && !simulateOffline;

  // Refresh pending count
  const refreshPendingCount = useCallback(async () => {
    try {
      const pending = await offlineStorage.getPendingSyncActions();
      setPendingSyncCount(pending.length);
    } catch (e) {
      setPendingSyncCount(0);
    }
  }, []);

  // Listen to browser network changes
  useEffect(() => {
    const handleOnline = () => setBrowserOnline(true);
    const handleOffline = () => setBrowserOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    refreshPendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshPendingCount]);

  // Sync queued items to server
  const syncNow = useCallback(async () => {
    if (!isOnline || !user || isSyncing) return;

    try {
      setIsSyncing(true);
      const pending = await offlineStorage.getPendingSyncActions();
      if (pending.length === 0) {
        setLastSyncMessage('సింక్ చేయడానికి కొత్త సమాచారం ఏమీ లేదు (Already up to date)');
        return;
      }

      const res = await api.syncOfflineQueue(user.id, pending);
      if (res.success) {
        await offlineStorage.clearPendingSyncActions();
        setPendingSyncCount(0);
        if (res.new_total_points) {
          updatePoints(res.new_total_points);
        }
        setLastSyncMessage(res.message || 'సర్వర్‌తో విజయవంతంగా సింక్ అయ్యింది!');
      }
    } catch (err) {
      console.warn('Sync failed:', err);
      setLastSyncMessage('సింక్ విఫలమైంది, దయచేసి ఇంటర్నెట్ సరిచూసుకోండి.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setLastSyncMessage(null), 4000);
    }
  }, [isOnline, user, isSyncing, updatePoints]);

  // Auto-sync when reconnecting
  useEffect(() => {
    if (isOnline && pendingSyncCount > 0) {
      syncNow();
    }
  }, [isOnline, pendingSyncCount, syncNow]);

  const toggleOfflineSimulation = () => {
    setSimulateOffline(prev => !prev);
  };

  return (
    <OfflineContext.Provider value={{
      isOnline,
      simulateOffline,
      toggleOfflineSimulation,
      pendingSyncCount,
      refreshPendingCount,
      syncNow,
      isSyncing,
      lastSyncMessage
    }}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  return useContext(OfflineContext);
}
