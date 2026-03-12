import { useState, useEffect } from 'react';
import { backendClient } from '@/api/backendClient';

export function useSyncStatus() {
  const [syncStatus, setSyncStatus] = useState({
    backend: 'checking',
    frontend: 'checking',
    truSite: 'checking',
    lastSync: null,
    errors: []
  });

  useEffect(() => {
    checkSyncStatus();
    const interval = setInterval(checkSyncStatus, 30000); // Vérifier toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);

  const checkSyncStatus = async () => {
    const newStatus = {
      backend: 'checking',
      frontend: 'checking',
      truSite: 'checking',
      lastSync: new Date(),
      errors: []
    };

    // Vérifier Backend principal
    try {
      await backendClient.checkHealth();
      newStatus.backend = 'connected';
    } catch (error) {
      newStatus.backend = 'offline';
      newStatus.errors.push(`Backend: ${error.message}`);
    }

    // Vérifier Frontend admin (5173)
    try {
      const response = await fetch('http://localhost:5173/api/health', {
        method: 'GET'
      });
      newStatus.frontend = response.ok ? 'connected' : 'error';
    } catch (error) {
      newStatus.frontend = 'offline';
      newStatus.errors.push(`Frontend: ${error.message}`);
    }

    // Vérifier Site TRU (3000)
    try {
      const response = await fetch('http://localhost:3000/api/health', {
        method: 'GET'
      });
      newStatus.truSite = response.ok ? 'connected' : 'error';
    } catch (error) {
      newStatus.truSite = 'offline';
      newStatus.errors.push(`Site TRU: ${error.message}`);
    }

    setSyncStatus(newStatus);
  };

  return syncStatus;
}
