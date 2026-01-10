/**
 * Exemple d'intégration - Page de paramètres avec synchronisation en temps réel
 * Montre comment utiliser le service de synchronisation dans une vraie application
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { logger } from '../services/logger';
import Button from '../components/ui/button';
import Input from '../components/ui/input';

export function SettingsPageWithSync() {
  const { syncSettings, syncing, syncError, clearError, lastSyncTime } = useRealtimeSync();
  const [settings, setSettings] = useState({
    companyName: 'TRU Group',
    email: 'contact@tru.com',
    phone: '+33 1 23 45 67 89',
    address: 'Paris, France',
    timezone: 'Europe/Paris',
  });
  const [originalSettings, setOriginalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  // Détecter les changements
  useEffect(() => {
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      logger.log('[SettingsPage] Saving settings:', settings);
      
      await syncSettings(settings);
      
      // Mettre à jour les paramètres originaux après succès
      setOriginalSettings(settings);
      setHasChanges(false);
      
      // Afficher un message de succès
      showSuccessNotification('Paramètres sauvegardés avec succès');
    } catch (error) {
      logger.error('[SettingsPage] Error saving settings:', error);
    }
  };

  const handleReset = () => {
    setSettings(originalSettings);
    setHasChanges(false);
    clearError();
  };

  const showSuccessNotification = (message) => {
    // Vous pouvez ajouter un toast ou une notification ici
    console.log('✓', message);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-8"
      >
        <h1 className="text-3xl font-bold mb-2">Paramètres</h1>
        <p className="text-slate-600 mb-8">
          Gérez les paramètres de votre entreprise. Les modifications sont synchronisées en temps réel.
        </p>

        {/* État de synchronisation */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {syncing ? (
                <>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-700">Synchronisation en cours...</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-700">Synchronisé</span>
                </>
              )}
            </div>
            {lastSyncTime && (
              <span className="text-sm text-slate-600">
                Dernière mise à jour : {lastSyncTime.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Message d'erreur */}
        {syncError && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-700 font-medium mb-2">Erreur de synchronisation</p>
            <p className="text-red-600 text-sm mb-2">{syncError}</p>
            <button
              onClick={clearError}
              className="text-sm text-red-600 hover:text-red-700 underline"
            >
              Fermer
            </button>
          </motion.div>
        )}

        {/* Formulaire */}
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nom de l'entreprise
            </label>
            <Input
              value={settings.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              disabled={syncing}
              placeholder="Entrez le nom de l'entreprise"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={settings.email}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={syncing}
              placeholder="contact@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Téléphone
            </label>
            <Input
              value={settings.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              disabled={syncing}
              placeholder="+33 1 23 45 67 89"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Adresse
            </label>
            <Input
              value={settings.address}
              onChange={(e) => handleChange('address', e.target.value)}
              disabled={syncing}
              placeholder="Paris, France"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Fuseau horaire
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              disabled={syncing}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Europe/Paris">Europe/Paris</option>
              <option value="Europe/London">Europe/London</option>
              <option value="US/Eastern">US/Eastern</option>
              <option value="US/Pacific">US/Pacific</option>
            </select>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || syncing}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {syncing ? 'Sauvegarde en cours...' : 'Sauvegarder les modifications'}
            </Button>

            {hasChanges && (
              <Button
                onClick={handleReset}
                disabled={syncing}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700"
              >
                Annuler
              </Button>
            )}
          </div>
        </form>

        {/* Info préservation des données */}
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">✓ Préservation des données</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>✓ Les dates de création sont préservées</li>
            <li>✓ L'auteur des modifications est enregistré</li>
            <li>✓ Les données non modifiées ne sont pas affectées</li>
            <li>✓ L'historique des changements est conservé</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

export default SettingsPageWithSync;
