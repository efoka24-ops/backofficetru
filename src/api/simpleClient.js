/**
 * Simple API Client - Sans dépendance externe
 * Communication directe avec le backend
 */

const baseURL = import.meta.env.VITE_BACKEND_URL || 'https://back.trugroup.cm';
// Remove trailing slash if present, then ensure /api is present
const cleanURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
const BACKEND_URL = `${cleanURL}/api`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiClient = {
  // ÉQUIPE
  async getTeam() {
    try {
      const response = await fetch(`${BACKEND_URL}/team`);
      if (!response.ok) throw new Error('Erreur récupération équipe');
      return await response.json();
    } catch (error) {
      console.error('❌ Erreur getTeam:', error);
      return [];
    }
  },

  async createTeamMember(data) {
    try {
      const response = await fetch(`${BACKEND_URL}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erreur création membre');
      return await response.json();
    } catch (error) {
      console.error('❌ Erreur createTeamMember:', error);
      throw error;
    }
  },

  async updateTeamMember(id, data) {
    try {
      const response = await fetch(`${BACKEND_URL}/team/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erreur modification membre');
      return await response.json();
    } catch (error) {
      console.error('❌ Erreur updateTeamMember:', error);
      throw error;
    }
  },

  async deleteTeamMember(id) {
    try {
      const response = await fetch(`${BACKEND_URL}/team/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Erreur suppression membre');
      return await response.json();
    } catch (error) {
      console.error('❌ Erreur deleteTeamMember:', error);
      throw error;
    }
  },

  // SERVICES
  async getServices() {
    try {
      const response = await fetch(`${BACKEND_URL}/services`);
      if (!response.ok) throw new Error('Erreur récupération services');
      return await response.json();
    } catch (error) {
      console.error('❌ Erreur getServices:', error);
      return [];
    }
  },

  async createService(data) {
    try {
      const response = await fetch(`${BACKEND_URL}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erreur création service');
      return await response.json();
    } catch (error) {
      console.error('❌ Erreur createService:', error);
      throw error;
    }
  },

  async updateService(id, data) {
    try {
      const response = await fetch(`${BACKEND_URL}/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erreur modification service');
      return await response.json();
    } catch (error) {
      console.error('❌ Erreur updateService:', error);
      throw error;
    }
  },

  async deleteService(id) {
    try {
      const response = await fetch(`${BACKEND_URL}/services/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Erreur suppression service');
      return await response.json();
    } catch (error) {
      console.error('❌ Erreur deleteService:', error);
      throw error;
    }
  },

  // SOLUTIONS
  async getSolutions() {
    try {
      const response = await fetch(`${BACKEND_URL}/solutions`);
      if (!response.ok) throw new Error('Erreur récupération solutions');
      return await response.json();
    } catch (error) {
      console.error('❌ Erreur getSolutions:', error);
      return [];
    }
  },

  async createSolution(data) {
    try {
      const response = await fetch(`${BACKEND_URL}/solutions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erreur création solution');
      return await response.json();
    } catch (error) {
      console.error('❌ Erreur createSolution:', error);
      throw error;
    }
  },

  async updateSolution(id, data) {
    try {
      const response = await fetch(`${BACKEND_URL}/solutions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erreur modification solution');
      return await response.json();
    } catch (error) {
      console.error('❌ Erreur updateSolution:', error);
      throw error;
    }
  },

  async deleteSolution(id) {
    try {
      const response = await fetch(`${BACKEND_URL}/solutions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Erreur suppression solution');
      return await response.json();
    } catch (error) {
      console.error('❌ Erreur deleteSolution:', error);
      throw error;
    }
  },

  // CONTACTS/TÉMOIGNAGES
  async getContacts() {
    try {
      const response = await fetch(`${BACKEND_URL}/contacts`, {
        headers: {
          ...getAuthHeaders(),
        },
      });
      if (!response.ok) throw new Error('Erreur récupération contacts');
      return await response.json();
    } catch (error) {
      console.error('❌ Erreur getContacts:', error);
      return [];
    }
  },

  async updateContact(id, data) {
    try {
      const response = await fetch(`${BACKEND_URL}/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erreur modification contact');
      return await response.json();
    } catch (error) {
      console.error('❌ Erreur updateContact:', error);
      throw error;
    }
  },

  async deleteContact(id) {
    try {
      const response = await fetch(`${BACKEND_URL}/contacts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Erreur suppression contact');
      return await response.json();
    } catch (error) {
      console.error('❌ Erreur deleteContact:', error);
      throw error;
    }
  },

  // SYNCHRONISATION
  async notifyFrontend(action, type, data) {
    // En production, les notifications ne sont pas nécessaires
    // Le frontend récupère les données du backend via les hooks
    // Cette fonction est gardée pour la compatibilité
    try {
      const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'https://admin.trugroup.cm';
      // Dans une app réelle, on pourrait utiliser WebSocket ou Server-Sent Events
      // Pour l'instant, on log juste l'action
      console.log('📢 Frontend sync notification:', { action, type, frontendUrl });
    } catch (error) {
      // Silencieusement ignorer les erreurs
      console.debug('Frontend notification:', error.message);
    }
  }
};
