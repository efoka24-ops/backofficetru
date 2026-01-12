/**
 * Service de synchronisation - Zustand + localStorage + Backend
 * 
 * STRATÉGIE DE PERSISTANCE:
 * 1. PRIMARY: localStorage (via Zustand persist middleware) - TOUJOURS ACTIF
 * 2. BACKUP: Backend API - synchronisation automatique toutes les 30s
 * 3. FALLBACK: data.example.json - utilisé si localStorage est vide
 * 
 * ✅ Les données sont TOUJOURS sauvegardées en localStorage
 * ✅ Synchronisation automatique avec le backend (non-bloquante)
 * ✅ Fonctionne hors-ligne complètement via localStorage
 */

import { logger } from './logger';

class SyncService {
  constructor() {
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    this.syncInProgress = false;
    this.lastSyncTime = 0;
    this.syncInterval = null;
  }

  /**
   * Démarrer la synchronisation périodique avec le backend
   * NOTE: Ceci est OPTIONNEL - les données sont déjà persistantes en localStorage
   */
  startPeriodicSync(store) {
    console.log('🔄 Démarrage de la synchro automatique (toutes les 30s)...');
    console.log('   💾 localStorage: ACTIF (source primaire)');
    console.log('   🌐 Backend: OPTIONNEL (synchronisation)');

    this.syncInterval = setInterval(() => {
      const now = Date.now();
      if (now - this.lastSyncTime >= 30000) {
        this.syncToBackend(store);
      }
    }, 30000);
  }

  /**
   * Arrêter la synchronisation périodique
   */
  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      console.log('⏹️  Synchronisation arrêtée');
    }
  }

  /**
   * Synchroniser l'état Zustand vers le backend (asynchrone, non-bloquant)
   */
  async syncToBackend(store) {
    if (this.syncInProgress) return;

    this.syncInProgress = true;

    try {
      const state = store.getState?.() || store;

      const dataToSync = {
        team: state.team || [],
        services: state.services || [],
        solutions: state.solutions || [],
        testimonials: state.testimonials || [],
        contacts: state.contacts || [],
        news: state.news || [],
        jobs: state.jobs || [],
        applications: state.applications || [],
        projects: state.projects || [],
        settings: state.settings || {}
      };

      const response = await fetch(`${this.backendUrl}/api/sync/all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSync)
      });

      if (response.ok) {
        this.lastSyncTime = Date.now();
        console.log('✅ Données synchronisées avec le backend');
      }
    } catch (error) {
      // ✅ C'est OK - les données sont toujours en localStorage
      console.log('ℹ️  Backend indisponible (données sauvegardées en localStorage)');
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Forcer une synchronisation immédiate
   */
  async forceSyncNow(store) {
    this.lastSyncTime = 0;
    await this.syncToBackend(store);
  }

  /**
   * Charger les données depuis le backend (pour récupération)
   */
  async loadFromBackend() {
    try {
      const response = await fetch(`${this.backendUrl}/api/data`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Données chargées depuis le backend');
        return data;
      }
    } catch (error) {
      console.log('Backend indisponible - utilisation des données localStorage');
    }
    return null;
  }

  /**
   * Exporter les données pour sauvegarde locale
   */
  exportData(state) {
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tru-backoffice-backup-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    console.log('✅ Données exportées');
  }

  /**
   * Importer les données depuis un fichier de sauvegarde
   */
  async importData(file, store) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (store.importData) {
        store.importData(data);
        console.log('✅ Données importées avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      throw error;
    }
  }

  /**
   * Vérifier la santé du stockage localStorage
   */
  checkStorageHealth() {
    try {
      const testKey = 'tru-storage-test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      
      const store = localStorage.getItem('tru-backoffice-store');
      const dataSize = store ? (new Blob([store]).size / 1024).toFixed(2) : 0;
      
      console.log('✅ localStorage ACTIF');
      console.log(`   Taille des données: ${dataSize}KB`);
      
      return {
        healthy: true,
        dataSize: `${dataSize}KB`,
        message: 'localStorage fonctionne correctement'
      };
    } catch (error) {
      console.error('❌ Erreur localStorage:', error);
      return {
        healthy: false,
        error: error.message,
        message: 'localStorage non accessible'
      };
    }
  }

  /**
   * Obtenir des statistiques du stockage
   */
  getStorageStats() {
    const store = localStorage.getItem('tru-backoffice-store');
    if (!store) return { isEmpty: true, stats: {} };

    try {
      const data = JSON.parse(store);
      return {
        isEmpty: false,
        stats: {
          team: data.state?.team?.length || 0,
          services: data.state?.services?.length || 0,
          solutions: data.state?.solutions?.length || 0,
          testimonials: data.state?.testimonials?.length || 0,
          contacts: data.state?.contacts?.length || 0,
          news: data.state?.news?.length || 0,
          jobs: data.state?.jobs?.length || 0,
          applications: data.state?.applications?.length || 0,
          projects: data.state?.projects?.length || 0,
          lastUpdate: data.state?._lastUpdate || 'unknown'
        }
      };
    } catch (error) {
      return {
        isEmpty: false,
        error: error.message,
        stats: {}
      };
    }
  }

  /**
   * Récupérer les données de l'équipe depuis le backend
   */
  async fetchBackendTeam() {
    try {
      const response = await fetch(`${this.backendUrl}/api/team`);
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : data.data || [];
      }
      return [];
    } catch (error) {
      console.log('Backend indisponible - retour tableau vide');
      return [];
    }
  }

  /**
   * Comparer les données frontend et backend
   */
  compareData(frontendData, backendData) {
    const differences = [];
    const frontendMap = new Map(frontendData.map(item => [item.id, item]));
    const backendMap = new Map(backendData.map(item => [item.id, item]));

    // Trouver les différences
    for (const [id, frontendItem] of frontendMap) {
      const backendItem = backendMap.get(id);
      if (!backendItem) {
        differences.push({
          type: 'missing_backend',
          id,
          frontendData: frontendItem,
          message: 'Présent en frontoffice, absent en backend'
        });
      } else if (JSON.stringify(frontendItem) !== JSON.stringify(backendItem)) {
        differences.push({
          type: 'mismatch',
          id,
          frontendData: frontendItem,
          backendData: backendItem,
          message: 'Données incohérentes'
        });
      }
    }

    // Trouver les éléments du backend absents en frontend
    for (const [id, backendItem] of backendMap) {
      if (!frontendMap.has(id)) {
        differences.push({
          type: 'missing_frontend',
          id,
          backendData: backendItem,
          message: 'Présent en backend, absent en frontoffice'
        });
      }
    }

    return differences;
  }

  /**
   * Générer un rapport de synchronisation
   */
  generateReport(differences) {
    const report = {
      totalDifferences: differences.length,
      byType: {},
      differences: differences
    };

    // Compter par type
    differences.forEach(diff => {
      report.byType[diff.type] = (report.byType[diff.type] || 0) + 1;
    });

    return report;
  }

  /**
   * Suggestion auto-résolution
   */
  suggestAutoResolution(difference) {
    switch (difference.type) {
      case 'missing_backend':
        return 'push_to_backend'; // Envoyer le frontend au backend
      case 'missing_frontend':
        return 'pull_from_backend'; // Récupérer depuis le backend
      case 'mismatch':
        return 'manual'; // Nécessite révision manuelle
      default:
        return null;
    }
  }

  /**
   * Synchroniser un batch de résolutions
   */
  async syncBatch(resolutions) {
    try {
      const response = await fetch(`${this.backendUrl}/api/sync/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolutions })
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          message: 'Synchronisation réussie',
          result
        };
      } else {
        return {
          success: false,
          message: 'Erreur synchronisation backend'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

export default new SyncService();
