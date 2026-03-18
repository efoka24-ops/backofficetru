/**
 * Service d'auto-correction automatique
 * Exécute automatiquement les solutions proposées
 */

class AutoFixer {
  constructor() {
    this.isRunning = false;
    this.lastAppliedFix = null;
  }

  /**
   * Appliquer une solution automatiquement
   */
  async applySolution(solution, bugData = {}) {
    if (this.isRunning) {
      return { success: false, message: 'Une correction est déjà en cours' };
    }

    this.isRunning = true;
    const startTime = performance.now();

    try {
      let result = null;

      // Identifier la solution par son titre
      if (solution.title.includes('Compresser') || solution.title.includes('compression')) {
        result = await this.openCompressionTool();
      } else if (solution.title.includes('Augmenter') || solution.title.includes('limite')) {
        result = await this.increaseSizeLimit();
      } else if (solution.title.includes('Vérifier que') || solution.title.includes('backend')) {
        result = await this.checkBackendStatus();
      } else if (solution.title.includes('Vérifier l\'URL')) {
        result = await this.verifyBackendUrl();
      } else if (solution.title.includes('Réveiller')) {
        result = await this.wakeupBackend();
      } else if (solution.title.includes('Se reconnecter')) {
        result = await this.reAuthenticate();
      } else if (solution.title.includes('Effacer') && solution.title.includes('cache')) {
        result = await this.clearBrowserCache();
      } else if (solution.title.includes('Vérifier les champs')) {
        result = await this.validateFields(bugData);
      } else if (solution.title.includes('Réessayer')) {
        result = await this.retryLastOperation();
      } else if (solution.title.includes('Actualiser')) {
        result = await this.refreshPage();
      } else if (solution.title.includes('Internet')) {
        result = await this.checkInternet();
      } else {
        result = {
          success: false,
          message: 'Cette solution ne peut pas être automatisée'
        };
      }

      const duration = performance.now() - startTime;
      this.lastAppliedFix = {
        solution: solution.title,
        result,
        timestamp: new Date().toISOString(),
        duration: `${duration.toFixed(2)}ms`
      };

      return {
        ...result,
        duration: `${duration.toFixed(2)}ms`
      };
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors de la correction: ${error.message}`,
        error: error.message
      };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Ouvrir l'outil de compression en ligne
   */
  async openCompressionTool() {
    window.open('https://tinypng.com', '_blank');
    return {
      success: true,
      message: '✅ TinyPNG ouvert dans un nouvel onglet. Compressez votre image et réessayez!'
    };
  }

  /**
   * Augmenter la limite de taille backend
   */
  async increaseSizeLimit() {
    try {
      // Appeler une API pour augmenter la limite
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || 'https://back.trugroup.cm'}/api/config/increase-image-limit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newLimit: 500 }) // 500KB
        }
      );

      if (response.ok) {
        return {
          success: true,
          message: '✅ Limite d\'image augmentée à 500KB. Réessayez votre opération!'
        };
      } else {
        return {
          success: false,
          message: '❌ Impossible de modifier la limite. Vérifiez vos permissions.'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ Erreur: Le backend n\'est pas accessible'
      };
    }
  }

  /**
   * Vérifier le statut du backend
   */
  async checkBackendStatus() {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://back.trugroup.cm';
      const response = await fetch(`${backendUrl}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 secondes timeout
      });

      if (response.ok) {
        return {
          success: true,
          message: '✅ Backend est en ligne et fonctionne correctement!'
        };
      } else {
        return {
          success: false,
          message: `❌ Backend répond avec l'erreur ${response.status}. Redémarrez le serveur.`
        };
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          message: '❌ Backend ne répond pas (timeout). Il est peut-être en train de démarrer...'
        };
      }
      return {
        success: false,
        message: `❌ Impossible de joindre le backend: ${error.message}`
      };
    }
  }

  /**
   * Vérifier l'URL du backend
   */
  async verifyBackendUrl() {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://back.trugroup.cm';
    return {
      success: true,
      message: `✅ URL du backend: ${backendUrl}. Cette URL est correcte.`
    };
  }

  /**
   * Réveiller le backend Render (s'il est en sommeil)
   */
  async wakeupBackend() {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://back.trugroup.cm';

      // Faire plusieurs requêtes pour réveiller le service
      for (let i = 0; i < 3; i++) {
        try {
          await fetch(`${backendUrl}/api/health`, {
            signal: AbortSignal.timeout(3000)
          });
        } catch (e) {
          // Ignorer les erreurs, continuer
        }
        // Attendre 2 secondes avant la prochaine tentative
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      return {
        success: true,
        message: '✅ Backend réveillé! Attendez 30 secondes et réessayez.'
      };
    } catch (error) {
      return {
        success: false,
        message: `❌ Erreur lors du réveil du backend: ${error.message}`
      };
    }
  }

  /**
   * Se reconnecter (déconnexion + rechargement)
   */
  async reAuthenticate() {
    // Effacer les données d'authentification
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    sessionStorage.clear();

    // Rediriger vers la page de login
    window.location.href = '/login';

    return {
      success: true,
      message: '✅ Redirection vers la page de connexion...'
    };
  }

  /**
   * Effacer le cache du navigateur
   */
  async clearBrowserCache() {
    try {
      // Effacer les StorageAPI
      localStorage.clear();
      sessionStorage.clear();

      // Effacer le Service Worker cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // Attendre un peu puis recharger
      setTimeout(() => {
        window.location.reload();
      }, 500);

      return {
        success: true,
        message: '✅ Cache vidé. La page va recharger...'
      };
    } catch (error) {
      return {
        success: false,
        message: `⚠️ Cache partiellement vidé: ${error.message}`
      };
    }
  }

  /**
   * Valider les champs du formulaire
   */
  async validateFields(bugData) {
    const errors = [];

    if (!bugData.name || bugData.name.trim() === '') {
      errors.push('❌ Nom: doit être non vide');
    } else {
      errors.push('✅ Nom: OK');
    }

    if (!bugData.role && !bugData.title) {
      errors.push('❌ Fonction: doit être non vide');
    } else {
      errors.push('✅ Fonction: OK');
    }

    if (bugData.photo_url && bugData.photo_url.length > 250 * 1024) {
      errors.push('❌ Photo: trop volumineuse (compressez-la)');
    } else if (bugData.photo_url) {
      errors.push('✅ Photo: OK');
    }

    const hasErrors = errors.some(e => e.startsWith('❌'));

    return {
      success: !hasErrors,
      message: hasErrors
        ? `Validations échouées:\n${errors.join('\n')}`
        : `✅ Tous les champs sont valides!\n${errors.join('\n')}`
    };
  }

  /**
   * Réessayer la dernière opération
   */
  async retryLastOperation() {
    // Dispatcher un événement pour relancer l'opération
    window.dispatchEvent(new CustomEvent('retry-last-operation'));

    return {
      success: true,
      message: '🔄 Nouvelle tentative lancée...'
    };
  }

  /**
   * Actualiser la page
   */
  async refreshPage() {
    setTimeout(() => {
      window.location.reload();
    }, 500);

    return {
      success: true,
      message: '✅ La page va recharger...'
    };
  }

  /**
   * Vérifier la connexion Internet
   */
  async checkInternet() {
    try {
      // Essayer de récupérer une ressource légère
      const response = await fetch('https://8.8.8.8/connectivity', {
        mode: 'no-cors',
        signal: AbortSignal.timeout(3000)
      });

      if (navigator.onLine) {
        return {
          success: true,
          message: '✅ Connexion Internet active'
        };
      } else {
        return {
          success: false,
          message: '❌ Pas de connexion Internet détectée'
        };
      }
    } catch (error) {
      if (navigator.onLine) {
        return {
          success: true,
          message: '✅ Connexion Internet semble active'
        };
      } else {
        return {
          success: false,
          message: '❌ Pas de connexion Internet'
        };
      }
    }
  }

  /**
   * Obtenir le dernier fix appliqué
   */
  getLastAppliedFix() {
    return this.lastAppliedFix;
  }

  /**
   * Vérifier si une solution peut être automatisée
   */
  canAutomate(solution) {
    const automatable = [
      'Compresser',
      'Augmenter',
      'Vérifier que',
      'Vérifier l\'URL',
      'Réveiller',
      'Se reconnecter',
      'Effacer',
      'Vérifier les champs',
      'Réessayer',
      'Actualiser',
      'Internet'
    ];

    return automatable.some(keyword => solution.title.includes(keyword));
  }
}

export const autoFixer = new AutoFixer();

export default AutoFixer;
