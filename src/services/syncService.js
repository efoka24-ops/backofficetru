/**
 * Service de synchronisation intelligent
 * Détecte et résout les incohérences entre frontend et backend
 */

import { logger } from './logger';

class SyncService {
  constructor() {
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://tru-backend-o1zc.onrender.com';
    this.syncInProgress = false;
  }

  /**
   * Trouver un match entre deux éléments (par ID, nom, ou email)
   */
  findMatch(frontendItem, backendData) {
    // Chercher par ID d'abord
    let match = backendData.find(b => b.id === frontendItem.id);
    if (match) return match;

    // Chercher par nom et email (en cas d'IDs différents)
    match = backendData.find(b => 
      b.name?.toLowerCase() === frontendItem.name?.toLowerCase() &&
      b.email === frontendItem.email
    );
    if (match) return match;

    // Chercher par nom seulement
    match = backendData.find(b =>
      b.name?.toLowerCase() === frontendItem.name?.toLowerCase()
    );
    return match;
  }

  /**
   * Comparer les données entre deux sources
   */
  compareData(frontendData, backendData) {
    const differences = [];
    const matchedBackendIds = new Set();

    // Vérifier les éléments dans frontend
    frontendData.forEach(item => {
      const backendItem = this.findMatch(item, backendData);
      
      if (!backendItem) {
        differences.push({
          type: 'MISSING_IN_BACKEND',
          id: item.id,
          name: item.name,
          frontendData: item,
          backendData: null,
          severity: 'HIGH'
        });
      } else {
        matchedBackendIds.add(backendItem.id);
        
        if (!this.isEqual(item, backendItem)) {
          differences.push({
            type: 'MISMATCH',
            id: backendItem.id,  // Use backend ID for updates
            name: item.name,
            frontendData: item,
            backendData: backendItem,
            differences: this.findDifferences(item, backendItem),
            severity: 'MEDIUM'
          });
        }
      }
    });

    // Vérifier les éléments dans backend mais pas dans frontend
    backendData.forEach(item => {
      if (!matchedBackendIds.has(item.id)) {
        differences.push({
          type: 'MISSING_IN_FRONTEND',
          id: item.id,
          name: item.name,
          frontendData: null,
          backendData: item,
          severity: 'MEDIUM'
        });
      }
    });

    return differences;
  }

  /**
   * Vérifier l'égalité entre deux objets (ignorer certains champs)
   */
  isEqual(obj1, obj2) {
    const ignoreFields = ['receivedAt', 'createdAt', 'updatedAt', 'timestamp'];
    
    const keys1 = Object.keys(obj1).filter(k => !ignoreFields.includes(k));
    const keys2 = Object.keys(obj2).filter(k => !ignoreFields.includes(k));

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
        return false;
      }
    }

    return true;
  }

  /**
   * Trouver les différences spécifiques entre deux objets
   */
  findDifferences(obj1, obj2) {
    const differences = [];
    const allKeys = new Set([
      ...Object.keys(obj1),
      ...Object.keys(obj2)
    ]);

    allKeys.forEach(key => {
      const val1 = obj1[key];
      const val2 = obj2[key];

      if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        differences.push({
          field: key,
          frontendValue: val1,
          backendValue: val2
        });
      }
    });

    return differences;
  }

  /**
   * Synchroniser un élément vers le backend
   */
  async syncToBackend(data) {
    logger.info(`Synchronisation vers backend: ${data.name}`, { id: data.id });
    
    try {
      const url = `${this.backendUrl}/api/team/${data.id}`;
      const payload = {
        name: data.name,
        title: data.title || data.role || '',
        bio: data.bio || data.description || '',
        email: data.email || '',
        phone: data.phone || '',
        image: data.image || data.photo || '',
        specialties: data.specialties || [],
        certifications: data.certifications || [],
        linked_in: data.linked_in || data.linkedin || '',
        is_founder: data.is_founder || false
      };

      console.log(`PUT ${url}`, payload);
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      logger.success(`Synchronisation réussie vers backend: ${data.name}`, { id: data.id });
      return {
        success: true,
        message: `✅ ${data.name} synchronisé vers le backend`,
        data: result
      };
    } catch (error) {
      console.error('Sync to backend error:', error);
      logger.error(`Erreur synchronisation backend: ${data.name}`, { error: error.message });
      return {
        success: false,
        message: `❌ Erreur: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Créer l'élément dans le backend
   */
  async createInBackend(data) {
    logger.info(`Création dans backend: ${data.name}`, { id: data.id });
    
    try {
      const url = `${this.backendUrl}/api/team`;
      const payload = {
        name: data.name,
        title: data.title || data.role || '',
        bio: data.bio || data.description || '',
        email: data.email || '',
        phone: data.phone || '',
        image: data.image || data.photo || '',
        specialties: data.specialties || [],
        certifications: data.certifications || [],
        linked_in: data.linked_in || data.linkedin || '',
        is_founder: data.is_founder || false
      };

      console.log(`POST ${url}`, payload);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      logger.success(`Création réussie dans backend: ${data.name}`, { id: data.id });
      return {
        success: true,
        message: `✅ ${data.name} créé dans le backend`,
        data: result
      };
    } catch (error) {
      console.error('Create in backend error:', error);
      logger.error(`Erreur création backend: ${data.name}`, { error: error.message });
      return {
        success: false,
        message: `❌ Erreur: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Récupérer les données du backend
   */
  async fetchBackendTeam() {
    try {
      console.log(`Fetching backend team from: ${this.backendUrl}/api/team`);
      const response = await fetch(`${this.backendUrl}/api/team`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Backend team data received:', data);
      logger.info('Équipe backend récupérée', { count: data.length });
      return data;
    } catch (error) {
      console.error('Erreur fetch backend team:', error);
      logger.error('Impossible de récupérer équipe du backend', { 
        error: error.message,
        url: `${this.backendUrl}/api/team`
      });
      return [];
    }
  }

  /**
   * Générer un rapport de synchronisation
   */
  generateReport(differences) {
    const report = {
      timestamp: new Date().toISOString(),
      totalDifferences: differences.length,
      byType: {
        MISSING_IN_BACKEND: differences.filter(d => d.type === 'MISSING_IN_BACKEND').length,
        MISSING_IN_FRONTEND: differences.filter(d => d.type === 'MISSING_IN_FRONTEND').length,
        MISMATCH: differences.filter(d => d.type === 'MISMATCH').length
      },
      bySeverity: {
        HIGH: differences.filter(d => d.severity === 'HIGH').length,
        MEDIUM: differences.filter(d => d.severity === 'MEDIUM').length,
        LOW: differences.filter(d => d.severity === 'LOW').length
      },
      differences
    };

    return report;
  }

  /**
   * Appliquer une résolution
   */
  async applyResolution(difference, resolution) {
    try {
      if (resolution === 'USE_FRONTEND') {
        // Envoyer la version frontend au backend (update ou create)
        if (difference.type === 'MISSING_IN_BACKEND') {
          // Créer dans le backend avec l'ID du frontend
          return await this.createInBackend({
            ...difference.frontendData,
            id: difference.id  // Utiliser l'ID du frontend pour la création
          });
        } else if (difference.type === 'MISMATCH') {
          // Mettre à jour avec l'ID du backend
          return await this.syncToBackend({
            ...difference.frontendData,
            id: difference.id  // Utiliser l'ID du backend pour l'update
          });
        }
      } else if (resolution === 'USE_BACKEND') {
        // Garder la version backend (rien à faire)
        return {
          success: true,
          message: `✅ Garde la version backend: ${difference.name}`
        };
      } else if (resolution === 'CREATE_IN_BACKEND') {
        // Créer l'élément dans le backend
        return await this.createInBackend({
          ...difference.frontendData,
          id: difference.id
        });
      } else if (resolution === 'DELETE_IN_FRONTEND') {
        // Marquer pour suppression (juste loguer)
        logger.warn(`Élément marqué pour suppression frontend: ${difference.name}`);
        return {
          success: true,
          message: `⚠️ Marqué pour suppression du frontend: ${difference.name}`
        };
      }
    } catch (error) {
      console.error('Error applying resolution:', error);
      return {
        success: false,
        message: `❌ Erreur: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Synchroniser plusieurs éléments en batch
   */
  async syncBatch(resolutions) {
    if (this.syncInProgress) {
      return { success: false, message: 'Synchronisation déjà en cours' };
    }

    this.syncInProgress = true;
    const results = [];

    try {
      for (const { difference, resolution } of resolutions) {
        const result = await this.applyResolution(difference, resolution);
        results.push({
          id: difference.id,
          name: difference.name,
          ...result
        });
        // Petit délai entre les requêtes
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      logger.success('Synchronisation batch complète', {
        totalItems: resolutions.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      });

      return {
        success: true,
        message: `✅ ${results.filter(r => r.success).length}/${results.length} éléments synchronisés`,
        results
      };
    } catch (error) {
      logger.error('Erreur synchronisation batch', { error: error.message });
      return {
        success: false,
        message: `❌ Erreur: ${error.message}`,
        results
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Auto-résolution intelligente (si possible)
   */
  suggestAutoResolution(difference) {
    switch (difference.type) {
      case 'MISSING_IN_BACKEND':
        // L'élément existe en frontend mais pas en backend → créer en backend
        return 'CREATE_IN_BACKEND';
      
      case 'MISSING_IN_FRONTEND':
        // L'élément existe en backend mais pas en frontend → ignorer (frontend récupère du backend)
        return null;
      
      case 'MISMATCH':
        // Comparer les timestamps ou utiliser backend comme source de vérité
        return 'USE_BACKEND';
      
      default:
        return null;
    }
  }
}

export const syncService = new SyncService();
export default SyncService;
