/**
 * Service de synchronisation en temps réel
 * Assure que les modifications du backoffice sont visibles immédiatement sur le frontend
 * Préserve les données existantes lors des mises à jour
 */

import { logger } from './logger';

class RealtimeSyncService {
  constructor() {
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://tru-backend-o1zc.onrender.com';
    this.frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'https://trugroup.vercel.app';
    this.syncQueue = [];
    this.isSyncing = false;
  }

  /**
   * Effectuer une mise à jour avec préservation des données
   * @param {string} endpoint - L'endpoint API (ex: /api/team, /api/settings)
   * @param {string} method - GET, POST, PUT, DELETE
   * @param {object} data - Les données à envoyer
   * @param {object} options - Options additionnelles
   */
  async updateWithPreservation(endpoint, method = 'PUT', data = {}, options = {}) {
    try {
      const {
        preserveFields = [], // Champs à préserver
        onlyUpdateIfChanged = true, // Ne mettre à jour que si les données ont changé
        notifyFrontend = true, // Notifier le frontend de la mise à jour
      } = options;

      logger.log(`[RealtimeSync] Updating ${endpoint} with ${method}`);

      // 1. Récupérer les données actuelles
      const existingResponse = await fetch(`${this.backendUrl}${endpoint}`);
      if (!existingResponse.ok) throw new Error(`Failed to fetch existing data from ${endpoint}`);
      const existingData = await existingResponse.json();

      // 2. Fusionner les données en préservant les champs spécifiés
      let finalData = data;
      if (Array.isArray(existingData)) {
        // Si c'est un tableau (ex: team members)
        finalData = this.mergeArrayData(existingData, data, preserveFields);
      } else if (typeof existingData === 'object') {
        // Si c'est un objet (ex: settings)
        finalData = this.mergeObjectData(existingData, data, preserveFields);
      }

      // 3. Vérifier si les données ont réellement changé
      if (onlyUpdateIfChanged && this.isDataEqual(existingData, finalData)) {
        logger.log(`[RealtimeSync] No changes detected for ${endpoint}`);
        return { status: 'no-changes', data: existingData };
      }

      // 4. Envoyer la mise à jour au backend
      const updateResponse = await fetch(`${this.backendUrl}${endpoint}`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(finalData),
      });

      if (!updateResponse.ok) {
        throw new Error(`Failed to update ${endpoint}: ${updateResponse.statusText}`);
      }

      const updatedData = await updateResponse.json();

      // 5. Notifier le frontend via webhook ou API
      if (notifyFrontend) {
        await this.notifyFrontendUpdate(endpoint, updatedData);
      }

      logger.log(`[RealtimeSync] Successfully updated ${endpoint}`);
      return { status: 'success', data: updatedData };

    } catch (error) {
      logger.error(`[RealtimeSync] Error updating ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Fusionner les données de tableau en préservant les entrées existantes
   */
  mergeArrayData(existing, updates, preserveFields = []) {
    if (!Array.isArray(updates)) {
      return existing;
    }

    const merged = [...existing];

    updates.forEach(updateItem => {
      const existingIndex = merged.findIndex(item => 
        item.id === updateItem.id || 
        (item.email && updateItem.email && item.email === updateItem.email)
      );

      if (existingIndex !== -1) {
        // Mettre à jour l'élément existant en préservant certains champs
        merged[existingIndex] = {
          ...merged[existingIndex],
          ...updateItem,
          ...preserveFields.reduce((acc, field) => {
            acc[field] = merged[existingIndex][field];
            return acc;
          }, {}),
        };
      } else {
        // Ajouter le nouvel élément
        merged.push(updateItem);
      }
    });

    return merged;
  }

  /**
   * Fusionner les données d'objet en préservant les champs spécifiés
   */
  mergeObjectData(existing, updates, preserveFields = []) {
    return {
      ...existing,
      ...updates,
      ...preserveFields.reduce((acc, field) => {
        acc[field] = existing[field];
        return acc;
      }, {}),
    };
  }

  /**
   * Comparer deux objets pour vérifier l'égalité
   */
  isDataEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  /**
   * Notifier le frontend d'une mise à jour
   */
  async notifyFrontendUpdate(endpoint, data) {
    try {
      // Envoyer un webhook au frontend (si configuré)
      const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;
      
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'data-updated',
            endpoint: endpoint,
            data: data,
            timestamp: new Date().toISOString(),
          }),
        });
      }

      // Alternatively, envoyer une notification via localStorage (pour la même origine)
      this.broadcastUpdate(endpoint, data);

    } catch (error) {
      logger.warn('[RealtimeSync] Could not notify frontend:', error);
      // Continuer même si la notification échoue
    }
  }

  /**
   * Broadcaster une mise à jour via les événements du navigateur
   */
  broadcastUpdate(endpoint, data) {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('backoffice-update', {
        detail: {
          endpoint: endpoint,
          data: data,
          timestamp: new Date().toISOString(),
        },
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * Récupérer le token d'authentification
   */
  getAuthToken() {
    return localStorage.getItem('authToken') || '';
  }

  /**
   * Ajouter une opération à la queue de synchronisation
   */
  queueSync(endpoint, method, data, options = {}) {
    this.syncQueue.push({ endpoint, method, data, options });
    this.processSyncQueue();
  }

  /**
   * Traiter la queue de synchronisation
   */
  async processSyncQueue() {
    if (this.isSyncing || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;

    while (this.syncQueue.length > 0) {
      const { endpoint, method, data, options } = this.syncQueue.shift();
      try {
        await this.updateWithPreservation(endpoint, method, data, options);
      } catch (error) {
        logger.error(`[RealtimeSync] Failed to process queue item:`, error);
      }
    }

    this.isSyncing = false;
  }

  /**
   * Synchroniser les paramètres/settings
   */
  async syncSettings(settings) {
    return this.updateWithPreservation(
      '/api/settings',
      'PUT',
      settings,
      {
        preserveFields: ['createdAt', 'updatedBy'], // Préserver ces champs
        onlyUpdateIfChanged: true,
        notifyFrontend: true,
      }
    );
  }

  /**
   * Synchroniser l'équipe
   */
  async syncTeam(teamMembers) {
    return this.updateWithPreservation(
      '/api/team',
      'PUT',
      teamMembers,
      {
        preserveFields: ['createdAt', 'joinDate'], // Préserver ces champs
        onlyUpdateIfChanged: true,
        notifyFrontend: true,
      }
    );
  }

  /**
   * Synchroniser les services
   */
  async syncServices(services) {
    return this.updateWithPreservation(
      '/api/services',
      'PUT',
      services,
      {
        preserveFields: ['createdAt', 'views', 'rating'],
        onlyUpdateIfChanged: true,
        notifyFrontend: true,
      }
    );
  }

  /**
   * Synchroniser les solutions
   */
  async syncSolutions(solutions) {
    return this.updateWithPreservation(
      '/api/solutions',
      'PUT',
      solutions,
      {
        preserveFields: ['createdAt', 'views', 'category'],
        onlyUpdateIfChanged: true,
        notifyFrontend: true,
      }
    );
  }
}

export const realtimeSyncService = new RealtimeSyncService();
