/**
 * Service de logging centralisé pour le backoffice
 * Envoie les logs au backend pour archivage et débogage
 */

const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS'
};

const LOG_COLORS = {
  DEBUG: '#666',
  INFO: '#0066cc',
  WARN: '#ff9900',
  ERROR: '#cc0000',
  SUCCESS: '#00cc00'
};

class Logger {
  constructor(backendUrl) {
    this.backendUrl = backendUrl || import.meta.env.VITE_BACKEND_URL || 'https://tru-backend-o1zc.onrender.com';
    this.logs = [];
    this.maxLocalLogs = 100; // Garder les 100 derniers logs en local
  }

  /**
   * Log général - niveau et message
   */
  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Ajouter au tableau local
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLocalLogs) {
      this.logs.shift();
    }

    // Afficher dans la console avec couleurs
    const style = `color: ${LOG_COLORS[level]}; font-weight: bold; font-size: 12px;`;
    console.log(`%c[${level}] ${message}`, style, data || '');

    // Envoyer au backend
    this.sendToBackend(logEntry);

    return logEntry;
  }

  /**
   * Niveau INFO
   */
  info(message, data = null) {
    return this.log(LOG_LEVELS.INFO, message, data);
  }

  /**
   * Niveau DEBUG
   */
  debug(message, data = null) {
    return this.log(LOG_LEVELS.DEBUG, message, data);
  }

  /**
   * Niveau WARN
   */
  warn(message, data = null) {
    return this.log(LOG_LEVELS.WARN, message, data);
  }

  /**
   * Niveau ERROR
   */
  error(message, data = null) {
    return this.log(LOG_LEVELS.ERROR, message, data);
  }

  /**
   * Niveau SUCCESS
   */
  success(message, data = null) {
    return this.log(LOG_LEVELS.SUCCESS, message, data);
  }

  /**
   * Log les opérations d'API (requête et réponse)
   */
  logApiCall(method, endpoint, status, duration, error = null) {
    const message = `${method} ${endpoint}`;
    const data = {
      method,
      endpoint,
      status,
      duration: `${duration}ms`,
      error: error ? error.message : null
    };

    if (error || status >= 400) {
      this.error(message, data);
    } else {
      this.success(message, data);
    }

    return data;
  }

  /**
   * Log les opérations CRUD
   */
  logCrudOperation(operation, entity, id, success, message, error = null) {
    const logMessage = `${operation.toUpperCase()} ${entity}${id ? ' #' + id : ''}`;
    const data = {
      operation,
      entity,
      id,
      success,
      message,
      error: error ? error.message : null
    };

    if (success) {
      this.success(logMessage, data);
    } else {
      this.error(logMessage, data);
    }

    return data;
  }

  /**
   * Envoyer les logs au backend
   */
  async sendToBackend(logEntry) {
    try {
      await fetch(`${this.backendUrl}/api/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logEntry)
      }).catch(err => {
        // Ne pas bloquer si l'envoi échoue
        console.warn('⚠️ Impossible d\'envoyer les logs au backend:', err.message);
      });
    } catch (err) {
      // Silencieusement échouer si problème de réseau
    }
  }

  /**
   * Récupérer les logs locaux
   */
  getLocalLogs() {
    return this.logs;
  }

  /**
   * Récupérer les logs du backend
   */
  async getBackendLogs(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.level) params.append('level', filters.level);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);

      const response = await fetch(`${this.backendUrl}/api/logs?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des logs:', error);
      return [];
    }
  }

  /**
   * Effacer les logs locaux
   */
  clearLocalLogs() {
    this.logs = [];
  }

  /**
   * Exporter les logs au format JSON
   */
  exportLogs(filename = 'logs.json') {
    const dataStr = JSON.stringify(this.logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}

// Créer une instance globale
export const logger = new Logger();

export default Logger;
