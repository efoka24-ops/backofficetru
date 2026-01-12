/**
 * Debug Console pour localStorage et persistance
 * À utiliser dans le navigateur: localStorage.debug()
 */

export const setupDebugConsole = () => {
  window.debugTruStore = {
    /**
     * Vérifier l'état actuel du localStorage
     */
    checkStorage: () => {
      const store = localStorage.getItem('tru-backoffice-store');
      if (!store) {
        console.log('❌ localStorage est VIDE');
        return null;
      }
      
      const data = JSON.parse(store);
      console.log('✅ localStorage CONTIENT:', {
        version: data.version,
        lastModified: new Date(data.lastModified || 0).toLocaleString(),
        dataSize: (new Blob([store]).size / 1024).toFixed(2) + 'KB',
        state: {
          teamSize: data.state?.team?.length || 0,
          servicesSize: data.state?.services?.length || 0,
          solutionsSize: data.state?.solutions?.length || 0,
          testimonials: data.state?.testimonials?.length || 0,
          contactsSize: data.state?.contacts?.length || 0
        }
      });
      
      return data;
    },

    /**
     * Afficher tout le contenu du localStorage
     */
    dumpStorage: () => {
      const store = localStorage.getItem('tru-backoffice-store');
      if (!store) {
        console.log('❌ localStorage est VIDE');
        return;
      }
      
      const data = JSON.parse(store);
      console.log('📦 DUMP localStorage:', data);
    },

    /**
     * Tester la persistance - ajouter une donnée et vérifier
     */
    testPersistence: async () => {
      console.log('🧪 Test de persistance...');
      
      const testData = {
        test: true,
        timestamp: new Date().toISOString(),
        value: Math.random()
      };
      
      // Mettre les données en localStorage
      localStorage.setItem('tru-test-data', JSON.stringify(testData));
      console.log('✅ Donnée de test écrite:', testData);
      
      // Relire
      const read = JSON.parse(localStorage.getItem('tru-test-data'));
      console.log('✅ Donnée relue:', read);
      
      if (JSON.stringify(testData) === JSON.stringify(read)) {
        console.log('✅ TEST RÉUSSI: localStorage fonctionne correctement');
        localStorage.removeItem('tru-test-data');
        return true;
      } else {
        console.error('❌ TEST ÉCHOUÉ: localStorage ne sauvegarde pas correctement');
        return false;
      }
    },

    /**
     * Vider le localStorage (ATTENTION: SUPPRIME TOUTES LES DONNÉES)
     */
    clearStorage: () => {
      if (confirm('⚠️  ATTENTION: Cela supprimera TOUTES les données sauvegardées. Continuer?')) {
        localStorage.removeItem('tru-backoffice-store');
        console.log('🗑️  localStorage vidé');
      }
    },

    /**
     * Exporter les données en JSON
     */
    exportData: () => {
      const store = localStorage.getItem('tru-backoffice-store');
      if (!store) {
        console.log('❌ Rien à exporter');
        return;
      }
      
      const data = JSON.parse(store);
      const blob = new Blob([JSON.stringify(data.state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tru-backup-${new Date().toISOString()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      console.log('✅ Données exportées');
    },

    /**
     * Importer les données depuis un fichier
     */
    importData: async (file) => {
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        // Vérifier la structure
        if (!data.team || !data.services) {
          throw new Error('Format de fichier invalide');
        }
        
        // Sauvegarder
        const storeData = {
          state: data,
          version: 1,
          lastModified: Date.now()
        };
        
        localStorage.setItem('tru-backoffice-store', JSON.stringify(storeData));
        console.log('✅ Données importées avec succès');
        window.location.reload();
      } catch (error) {
        console.error('❌ Erreur import:', error);
      }
    },

    /**
     * Afficher l'aide
     */
    help: () => {
      console.log(`
🔍 COMMANDES DEBUG:
  debugTruStore.checkStorage()      - Vérifier l'état du localStorage
  debugTruStore.dumpStorage()       - Afficher le contenu complet
  debugTruStore.testPersistence()   - Tester si localStorage fonctionne
  debugTruStore.clearStorage()      - Vider le localStorage (⚠️ DANGER)
  debugTruStore.exportData()        - Télécharger les données
  debugTruStore.importData(file)    - Importer les données depuis un fichier
  debugTruStore.help()              - Afficher cette aide
      `);
    }
  };

  console.log('🛠️  Debug console activée. Tapez: debugTruStore.help()');
};
