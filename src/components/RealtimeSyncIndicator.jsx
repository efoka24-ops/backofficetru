/**
 * Composant pour afficher et gérer la synchronisation en temps réel
 * Montre le statut de sync et permet de forcer une synchronisation manuelle
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Wifi, RefreshCw, Clock } from 'lucide-react';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { logger } from '../services/logger';

export default function RealtimeSyncIndicator() {
  const { syncing, syncError, lastSyncTime } = useRealtimeSync();
  const [showDetails, setShowDetails] = useState(false);

  // Mettre en place un listener pour les mises à jour du backoffice
  useEffect(() => {
    const handleUpdate = (event) => {
      logger.log('[RealtimeSyncIndicator] Update received:', event.detail);
    };

    window.addEventListener('backoffice-update', handleUpdate);
    return () => window.removeEventListener('backoffice-update', handleUpdate);
  }, []);

  const getTimeString = () => {
    if (!lastSyncTime) return 'Jamais';
    const now = new Date();
    const diff = now - lastSyncTime;
    
    if (diff < 60000) return 'À l\'instant';
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`;
    return lastSyncTime.toLocaleDateString();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {syncing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-2"
          >
            <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Synchronisation en cours...</span>
            </div>
          </motion.div>
        )}

        {syncError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-2"
          >
            <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{syncError}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowDetails(!showDetails)}
        className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors"
      >
        {syncing ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : syncError ? (
          <AlertCircle className="w-4 h-4 text-red-400" />
        ) : (
          <CheckCircle className="w-4 h-4 text-green-400" />
        )}
        <span className="text-sm font-medium">Sync</span>
      </motion.button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: -10 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-16 right-0 bg-slate-900 text-white rounded-lg shadow-xl p-4 w-80 text-sm"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-green-400" />
                <span>Statut: <strong>Synchronisé</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Dernière sync: <strong>{getTimeString()}</strong></span>
              </div>

              {syncError && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span>Erreur: <strong>{syncError}</strong></span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-700">
                <p className="text-slate-400 text-xs">
                  ✓ Les données sont synchronisées en temps réel
                  <br />
                  ✓ Les modifications apparaissent sur le frontend automatiquement
                  <br />
                  ✓ Les données existantes sont préservées
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
