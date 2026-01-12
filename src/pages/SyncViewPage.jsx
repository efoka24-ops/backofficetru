import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Zap,
  Database,
  Globe,
  ChevronDown
} from 'lucide-react';
import syncService from '@/services/syncService';
import { logger } from '@/services/logger';
import { teamAPI } from '@/services/api';

export default function SyncViewPage() {
  const [report, setReport] = useState(null);
  const [selectedResolutions, setSelectedResolutions] = useState({});
  const [isSyncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState(null);
  const [expandedDiff, setExpandedDiff] = useState(null);
  const [autoResolve, setAutoResolve] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Récupérer les données du backoffice
  const { data: frontendTeam = [] } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      try {
        console.log('🔍 Fetching frontend team data...');
        const response = await teamAPI.getAll();
        const data = response.data || [];
        console.log('✅ Frontend team loaded:', data);
        return data;
      } catch (error) {
        console.error('❌ Error fetching frontend team:', error);
        logger.error('Erreur récupération équipe frontoffice', { error: error.message });
        return [];
      }
    }
  });

  /**
   * Analyser les incohérences
   */
  const analyzeSync = async () => {
    setIsLoading(true);
    try {
      logger.info('Début analyse synchronisation');
      console.log('Frontend team from query:', frontendTeam);
      
      const backendTeam = await syncService.fetchBackendTeam();
      console.log('Backend team fetched:', backendTeam);
      
      if (!Array.isArray(backendTeam)) {
        throw new Error('Backend team is not an array');
      }
      
      if (!Array.isArray(frontendTeam)) {
        throw new Error('Frontend team is not an array');
      }
      
      const differences = syncService.compareData(frontendTeam, backendTeam);
      console.log('Differences found:', differences);
      
      const newReport = syncService.generateReport(differences);
      console.log('Report generated:', newReport);

      setReport(newReport);
      setSyncResults(null);
      setSelectedResolutions({});

      logger.success('Analyse synchronisation complète', {
        differences: newReport.totalDifferences,
        byType: newReport.byType
      });
    } catch (error) {
      console.error('Sync error:', error);
      logger.error('Erreur analyse synchronisation', { error: error.message });
      setReport(null);
      setSyncResults({
        success: false,
        message: `❌ Erreur analyse: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Appliquer les résolutions
   */
  const applySyncResolutions = async () => {
    const resolutions = Object.entries(selectedResolutions)
      .filter(([key]) => {
        const diff = report.differences.find(d => `${d.type}-${d.id}` === key);
        return !!diff;
      })
      .map(([key, resolution]) => {
        const difference = report.differences.find(d => `${d.type}-${d.id}` === key);
        return { difference, resolution };
      });

    if (resolutions.length === 0) {
      logger.warn('Aucune résolution sélectionnée');
      alert('❌ Veuillez sélectionner au moins une résolution');
      return;
    }

    setSyncing(true);
    try {
      console.log('Applying resolutions:', resolutions);
      logger.info(`Début synchronisation de ${resolutions.length} éléments`);
      
      const result = await syncService.syncBatch(resolutions);
      
      console.log('Sync result:', result);
      logger.info('Résultats synchronisation', { result });
      
      setSyncResults(result);
      
      if (result.success) {
        // Réanalyser après synchronisation
        setTimeout(() => analyzeSync(), 1000);
      } else {
        logger.error('Erreur lors de la synchronisation', { result });
      }
    } catch (error) {
      console.error('Sync error:', error);
      logger.error('Erreur synchronisation batch', { error: error.message });
      setSyncResults({
        success: false,
        message: `❌ Erreur: ${error.message}`
      });
    } finally {
      setSyncing(false);
    }
  };

  /**
   * Auto-résoudre intelligemment
   */
  const autoResolveAll = () => {
    const resolutions = {};
    report.differences.forEach(diff => {
      const suggested = syncService.suggestAutoResolution(diff);
      if (suggested) {
        resolutions[`${diff.type}-${diff.id}`] = suggested;
      }
    });
    setSelectedResolutions(resolutions);
    setAutoResolve(true);
  };

  /**
   * Obtenir l'icône du type de différence
   */
  const getTypeIcon = (type) => {
    const icons = {
      MISSING_IN_BACKEND: '⬆️',
      MISSING_IN_FRONTEND: '⬇️',
      MISMATCH: '⚠️'
    };
    return icons[type] || '•';
  };

  /**
   * Obtenir la couleur du type
   */
  const getTypeColor = (type) => {
    const colors = {
      MISSING_IN_BACKEND: 'bg-blue-100 text-blue-700 border-blue-300',
      MISSING_IN_FRONTEND: 'bg-purple-100 text-purple-700 border-purple-300',
      MISMATCH: 'bg-yellow-100 text-yellow-700 border-yellow-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  /**
   * Obtenir la description du type
   */
  const getTypeDescription = (type) => {
    const descriptions = {
      MISSING_IN_BACKEND: 'Existe en frontoffice mais pas en backend',
      MISSING_IN_FRONTEND: 'Existe en backend mais pas en frontoffice',
      MISMATCH: 'Données différentes entre frontoffice et backend'
    };
    return descriptions[type] || '';
  };

  const handleResolutionChange = (key, resolution) => {
    setSelectedResolutions(prev => ({
      ...prev,
      [key]: resolution
    }));
  };

  useEffect(() => {
    // Analyser au chargement
    analyzeSync();
  }, [frontendTeam]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">🔄 Synchronisation des données</h1>
        <p className="text-slate-600">
          Détectez et corrigez les incohérences entre le frontoffice et le backend
        </p>
      </div>

      {/* Boutons d'action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md border border-slate-200 p-6 mb-6"
      >
        <div className="flex flex-wrap gap-3">
          <button
            onClick={analyzeSync}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Analyse en cours...' : 'Analyser'}
          </button>

          {report && report.totalDifferences > 0 && (
            <>
              <button
                onClick={autoResolveAll}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors"
              >
                <Zap className="w-5 h-5" />
                Auto-résoudre
              </button>

              <button
                onClick={applySyncResolutions}
                disabled={isSyncing || Object.keys(selectedResolutions).length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                <Zap className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Synchronisation...' : 'Synchroniser'}
              </button>
            </>
          )}
        </div>

        {report && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-sm font-semibold text-red-700">Total</p>
              <p className="text-2xl font-bold text-red-900">{report.totalDifferences}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm font-semibold text-blue-700">⬆️ À créer en backend</p>
              <p className="text-2xl font-bold text-blue-900">{report.byType.MISSING_IN_BACKEND}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-sm font-semibold text-purple-700">⬇️ À créer en frontoffice</p>
              <p className="text-2xl font-bold text-purple-900">{report.byType.MISSING_IN_FRONTEND}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <p className="text-sm font-semibold text-yellow-700">⚠️ Malappariées</p>
              <p className="text-2xl font-bold text-yellow-900">{report.byType.MISMATCH}</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Résultats de synchronisation */}
      {syncResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg shadow-md border p-6 mb-6 ${
            syncResults.success
              ? 'bg-green-50 border-green-300'
              : 'bg-red-50 border-red-300'
          }`}
        >
          <div className="flex items-start gap-4">
            {syncResults.success ? (
              <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
            )}
            <div className="flex-1">
              <h3 className={`font-bold text-lg mb-2 ${
                syncResults.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {syncResults.message}
              </h3>
              {syncResults.results && (
                <div className="space-y-1 text-sm">
                  {syncResults.results.map((result, idx) => (
                    <div key={idx} className={`flex items-center gap-2 ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.success ? '✅' : '❌'} {result.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Liste des différences */}
      {report && report.totalDifferences > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {report.differences.map((diff, index) => {
            const key = `${diff.type}-${diff.id}`;
            const resolution = selectedResolutions[key];
            const isSelected = !!resolution;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`border rounded-lg overflow-hidden transition-all ${getTypeColor(diff.type)}`}
              >
                {/* Header */}
                <button
                  onClick={() =>
                    setExpandedDiff(expandedDiff === key ? null : key)
                  }
                  className="w-full px-4 py-3 flex items-center justify-between hover:opacity-75 transition-opacity text-left"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{getTypeIcon(diff.type)}</span>
                    <div className="flex-1">
                      <div className="font-semibold">{diff.name}</div>
                      <div className="text-xs opacity-75 mt-0.5">
                        {getTypeDescription(diff.type)}
                      </div>
                    </div>
                  </div>
                  <motion.div
                    animate={{
                      rotate: expandedDiff === key ? 180 : 0
                    }}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>

                {/* Contenu expansible */}
                <AnimatePresence>
                  {expandedDiff === key && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t px-4 py-4 bg-white space-y-4"
                    >
                      {/* Comparaison des données */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Frontoffice */}
                        {diff.frontendData && (
                          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Globe className="w-4 h-4 text-blue-600" />
                              <span className="font-semibold text-blue-900">Frontoffice</span>
                            </div>
                            <pre className="text-xs overflow-auto max-h-40 text-slate-700">
                              {JSON.stringify(diff.frontendData, null, 2)}
                            </pre>
                          </div>
                        )}

                        {/* Backend */}
                        {diff.backendData && (
                          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Database className="w-4 h-4 text-slate-600" />
                              <span className="font-semibold text-slate-900">Backend</span>
                            </div>
                            <pre className="text-xs overflow-auto max-h-40 text-slate-700">
                              {JSON.stringify(diff.backendData, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>

                      {/* Détails des différences */}
                      {diff.differences && diff.differences.length > 0 && (
                        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                          <p className="font-semibold text-yellow-900 mb-2">Champs différents:</p>
                          <div className="space-y-2">
                            {diff.differences.map((fieldDiff, idx) => (
                              <div key={idx} className="text-sm text-yellow-800">
                                <p className="font-medium">{fieldDiff.field}:</p>
                                <div className="grid grid-cols-2 gap-2 ml-2 text-xs">
                                  <div>
                                    <span className="font-semibold">Frontoffice:</span>
                                    <pre className="bg-white p-1 rounded mt-1 overflow-auto max-h-20">
                                      {JSON.stringify(fieldDiff.frontendValue, null, 2)}
                                    </pre>
                                  </div>
                                  <div>
                                    <span className="font-semibold">Backend:</span>
                                    <pre className="bg-white p-1 rounded mt-1 overflow-auto max-h-20">
                                      {JSON.stringify(fieldDiff.backendValue, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sélecteur de résolution */}
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                        <p className="font-semibold text-slate-900 mb-3">Résolution:</p>
                        <div className="space-y-2">
                          {diff.type === 'MISSING_IN_BACKEND' && (
                            <>
                              <label className="flex items-center gap-3 p-2 rounded hover:bg-white cursor-pointer transition-colors">
                                <input
                                  type="radio"
                                  name={`resolution-${key}`}
                                  value="CREATE_IN_BACKEND"
                                  checked={resolution === 'CREATE_IN_BACKEND'}
                                  onChange={(e) =>
                                    handleResolutionChange(key, e.target.value)
                                  }
                                  className="w-4 h-4"
                                />
                                <div>
                                  <span className="font-medium text-slate-900">
                                    ⬆️ Créer dans le backend
                                  </span>
                                  <p className="text-xs text-slate-600">
                                    Envoyer la version frontoffice au backend
                                  </p>
                                </div>
                              </label>
                              <label className="flex items-center gap-3 p-2 rounded hover:bg-white cursor-pointer transition-colors">
                                <input
                                  type="radio"
                                  name={`resolution-${key}`}
                                  value="DELETE_IN_FRONTEND"
                                  checked={resolution === 'DELETE_IN_FRONTEND'}
                                  onChange={(e) =>
                                    handleResolutionChange(key, e.target.value)
                                  }
                                  className="w-4 h-4"
                                />
                                <div>
                                  <span className="font-medium text-slate-900">
                                    🗑️ Supprimer du frontoffice
                                  </span>
                                  <p className="text-xs text-slate-600">
                                    Ignorer cet élément
                                  </p>
                                </div>
                              </label>
                            </>
                          )}

                          {diff.type === 'MISSING_IN_FRONTEND' && (
                            <label className="flex items-center gap-3 p-2 rounded hover:bg-white cursor-pointer transition-colors">
                              <input
                                type="radio"
                                name={`resolution-${key}`}
                                value="USE_BACKEND"
                                checked={resolution === 'USE_BACKEND'}
                                onChange={(e) =>
                                  handleResolutionChange(key, e.target.value)
                                }
                                className="w-4 h-4"
                              />
                              <div>
                                <span className="font-medium text-slate-900">
                                  ⬇️ Garder la version backend
                                </span>
                                <p className="text-xs text-slate-600">
                                  Le frontoffice récupérera les données du backend
                                </p>
                              </div>
                            </label>
                          )}

                          {diff.type === 'MISMATCH' && (
                            <>
                              <label className="flex items-center gap-3 p-2 rounded hover:bg-white cursor-pointer transition-colors">
                                <input
                                  type="radio"
                                  name={`resolution-${key}`}
                                  value="USE_FRONTEND"
                                  checked={resolution === 'USE_FRONTEND'}
                                  onChange={(e) =>
                                    handleResolutionChange(key, e.target.value)
                                  }
                                  className="w-4 h-4"
                                />
                                <div>
                                  <span className="font-medium text-slate-900">
                                    ⬆️ Utiliser version frontoffice
                                  </span>
                                  <p className="text-xs text-slate-600">
                                    Envoyer la version frontoffice au backend
                                  </p>
                                </div>
                              </label>
                              <label className="flex items-center gap-3 p-2 rounded hover:bg-white cursor-pointer transition-colors">
                                <input
                                  type="radio"
                                  name={`resolution-${key}`}
                                  value="USE_BACKEND"
                                  checked={resolution === 'USE_BACKEND'}
                                  onChange={(e) =>
                                    handleResolutionChange(key, e.target.value)
                                  }
                                  className="w-4 h-4"
                                />
                                <div>
                                  <span className="font-medium text-slate-900">
                                    ⬇️ Utiliser version backend
                                  </span>
                                  <p className="text-xs text-slate-600">
                                    Garder la version backend (rien à faire)
                                  </p>
                                </div>
                              </label>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      ) : report ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white rounded-lg shadow-md border border-slate-200"
        >
          <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            ✅ Parfaitement synchronisé!
          </h3>
          <p className="text-slate-600">
            Toutes les données du frontoffice et du backend sont cohérentes.
          </p>
        </motion.div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-600">Cliquez sur "Analyser" pour vérifier la synchronisation</p>
        </div>
      )}
    </div>
  );
}
