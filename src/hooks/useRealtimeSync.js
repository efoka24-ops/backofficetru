/**
 * Hook pour utiliser le service de synchronisation en temps réel
 * Gère les mises à jour avec préservation des données
 */

import { useState, useCallback } from 'react';
import { realtimeSyncService } from '../services/realtimeSyncService';
import { logger } from '../services/logger';

export function useRealtimeSync() {
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const sync = useCallback(async (endpoint, method = 'PUT', data = {}, options = {}) => {
    try {
      setSyncing(true);
      setSyncError(null);

      const result = await realtimeSyncService.updateWithPreservation(
        endpoint,
        method,
        data,
        options
      );

      setLastSyncTime(new Date());
      logger.log(`[useRealtimeSync] Successfully synced ${endpoint}`);
      
      return result;
    } catch (error) {
      const errorMessage = error.message || 'Unknown sync error';
      setSyncError(errorMessage);
      logger.error(`[useRealtimeSync] Sync failed:`, error);
      throw error;
    } finally {
      setSyncing(false);
    }
  }, []);

  const syncSettings = useCallback(async (settings) => {
    return sync('/api/settings', 'PUT', settings, {
      preserveFields: ['createdAt', 'updatedBy'],
      onlyUpdateIfChanged: true,
      notifyFrontend: true,
    });
  }, [sync]);

  const syncTeam = useCallback(async (teamMembers) => {
    return sync('/api/team', 'PUT', teamMembers, {
      preserveFields: ['createdAt', 'joinDate'],
      onlyUpdateIfChanged: true,
      notifyFrontend: true,
    });
  }, [sync]);

  const syncServices = useCallback(async (services) => {
    return sync('/api/services', 'PUT', services, {
      preserveFields: ['createdAt', 'views', 'rating'],
      onlyUpdateIfChanged: true,
      notifyFrontend: true,
    });
  }, [sync]);

  const syncSolutions = useCallback(async (solutions) => {
    return sync('/api/solutions', 'PUT', solutions, {
      preserveFields: ['createdAt', 'views', 'category'],
      onlyUpdateIfChanged: true,
      notifyFrontend: true,
    });
  }, [sync]);

  return {
    sync,
    syncSettings,
    syncTeam,
    syncServices,
    syncSolutions,
    syncing,
    syncError,
    lastSyncTime,
    clearError: () => setSyncError(null),
  };
}
