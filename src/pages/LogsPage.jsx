import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Trash2, RefreshCw, Filter, ChevronDown, Lightbulb, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { logger } from '@/services/logger';
import { analyzeBugAndSuggestSolution, formatSolution } from '@/services/bugSolver';
import { autoFixer } from '@/services/autoFixer';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLog, setExpandedLog] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [appliedFixes, setAppliedFixes] = useState({});
  const [fixLoading, setFixLoading] = useState(null);

  const LOG_LEVEL_COLORS = {
    DEBUG: 'bg-gray-100 text-gray-700 border-gray-300',
    INFO: 'bg-blue-100 text-blue-700 border-blue-300',
    WARN: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    ERROR: 'bg-red-100 text-red-700 border-red-300',
    SUCCESS: 'bg-green-100 text-green-700 border-green-300'
  };

  const LOG_LEVEL_BG = {
    DEBUG: 'bg-gray-50',
    INFO: 'bg-blue-50',
    WARN: 'bg-yellow-50',
    ERROR: 'bg-red-50',
    SUCCESS: 'bg-green-50'
  };

  // Charger les logs locaux au montage
  useEffect(() => {
    loadLogs();
  }, []);

  // Filtrer les logs quand le niveau ou la recherche change
  useEffect(() => {
    filterLogs();
  }, [logs, selectedLevel, searchTerm]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const localLogs = logger.getLocalLogs();
      setLogs(localLogs);

      // Essayer de charger aussi du backend
      try {
        const backendLogs = await logger.getBackendLogs({ limit: 50 });
        if (Array.isArray(backendLogs) && backendLogs.length > 0) {
          // Fusionner avec logs locaux (backend en priorité)
          const mergedLogs = [...backendLogs, ...localLogs];
          // Supprimer les doublons
          const uniqueLogs = Array.from(
            new Map(mergedLogs.map(log => [
              `${log.timestamp}-${log.message}`,
              log
            ])).values()
          ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setLogs(uniqueLogs);
        }
      } catch (err) {
        console.warn('Backend logs non disponibles');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    // Filtrer par niveau
    if (selectedLevel !== 'ALL') {
      filtered = filtered.filter(log => log.level === selectedLevel);
    }

    // Filtrer par recherche
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.data && JSON.stringify(log.data).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredLogs(filtered);
  };

  const clearLogs = () => {
    if (confirm('Êtes-vous sûr de vouloir effacer tous les logs locaux?')) {
      logger.clearLocalLogs();
      setLogs([]);
      setFilteredLogs([]);
    }
  };

  const exportLogs = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    logger.exportLogs(`logs-${timestamp}.json`);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getLevelIcon = (level) => {
    const icons = {
      DEBUG: '🔍',
      INFO: 'ℹ️',
      WARN: '⚠️',
      ERROR: '❌',
      SUCCESS: '✅'
    };
    return icons[level] || '•';
  };

  const applySolution = async (solution, logId) => {
    setFixLoading(logId);
    try {
      const result = await autoFixer.applySolution(solution);
      setAppliedFixes(prev => ({
        ...prev,
        [logId]: result
      }));
    } catch (error) {
      setAppliedFixes(prev => ({
        ...prev,
        [logId]: {
          success: false,
          message: `Erreur: ${error.message}`
        }
      }));
    } finally {
      setFixLoading(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Journaux d'activité</h1>
        <p className="text-slate-600">Suivi des opérations et débogage des erreurs</p>
      </div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md border border-slate-200 p-6 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Recherche */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Rechercher</label>
            <input
              type="text"
              placeholder="Message ou données..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Filtre par niveau */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Niveau</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Tous les niveaux</option>
              <option value="DEBUG">🔍 DEBUG</option>
              <option value="INFO">ℹ️ INFO</option>
              <option value="WARN">⚠️ AVERTISSEMENT</option>
              <option value="ERROR">❌ ERREUR</option>
              <option value="SUCCESS">✅ SUCCÈS</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={loadLogs}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            {isLoading ? 'Chargement...' : 'Actualiser'}
          </button>

          <button
            onClick={exportLogs}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>

          <button
            onClick={clearLogs}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Effacer
          </button>

          {/* Compteur */}
          <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-slate-700 font-medium">
            <span>{filteredLogs.length} log{filteredLogs.length !== 1 ? 's' : ''}</span>
            {selectedLevel !== 'ALL' && (
              <span className="text-sm opacity-75">({logs.length} total)</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Logs List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <AnimatePresence>
          {filteredLogs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md border border-slate-200 p-12 text-center">
              <p className="text-slate-600 text-lg">
                {logs.length === 0 ? 'Aucun log disponible' : 'Aucun log correspondant aux filtres'}
              </p>
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <motion.div
                key={`${log.timestamp}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.02 }}
                className={`border rounded-lg overflow-hidden transition-all ${LOG_LEVEL_COLORS[log.level]}`}
              >
                {/* Header du log */}
                <button
                  onClick={() =>
                    setExpandedLog(expandedLog === `${log.timestamp}-${index}` ? null : `${log.timestamp}-${index}`)
                  }
                  className={`w-full px-4 py-3 flex items-center justify-between hover:opacity-75 transition-opacity text-left ${LOG_LEVEL_BG[log.level]}`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xl">{getLevelIcon(log.level)}</span>
                    <div className="flex-1">
                      <div className="font-semibold">{log.message}</div>
                      <div className="text-xs opacity-75 mt-0.5">
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </div>
                  </div>
                  <motion.div
                    animate={{
                      rotate: expandedLog === `${log.timestamp}-${index}` ? 180 : 0
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>

                {/* Détails du log */}
                <AnimatePresence>
                  {expandedLog === `${log.timestamp}-${index}` && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t px-4 py-3 bg-white space-y-4"
                    >
                      {/* Données du log */}
                      {log.data && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2 text-slate-700">📋 Détails:</h4>
                          <pre className="bg-slate-50 p-3 rounded text-xs overflow-auto max-h-48 text-slate-700">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Informations techniques */}
                      <div className="space-y-1 text-xs text-slate-600">
                        {log.url && (
                          <div>
                            <span className="font-semibold">🌐 URL:</span> {log.url}
                          </div>
                        )}
                        {log.userAgent && (
                          <div>
                            <span className="font-semibold">💻 User-Agent:</span> {log.userAgent}
                          </div>
                        )}
                      </div>

                      {/* Suggestions de correction */}
                      {(() => {
                        const bugAnalysis = analyzeBugAndSuggestSolution(log);
                        if (!bugAnalysis) return null;

                        return (
                          <div className="border-t pt-4 mt-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Lightbulb className="w-5 h-5 text-amber-600" />
                              <h4 className="font-semibold text-slate-700">💡 Solutions suggérées</h4>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                              <p className="text-sm font-medium text-amber-900">
                                🔍 Bug détecté: <span className="font-bold">{bugAnalysis.bugType}</span>
                              </p>
                            </div>

                            <div className="space-y-3">
                              {bugAnalysis.solutions.map((solution, solIndex) => {
                                const fixKey = `${bugAnalysis.bugType}-${solIndex}`;
                                const fixResult = appliedFixes[fixKey];
                                const isApplying = fixLoading === fixKey;
                                const canAutomate = autoFixer.canAutomate(solution);

                                return (
                                  <motion.div
                                    key={solIndex}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: solIndex * 0.1 }}
                                    className={`border-l-4 ${
                                      fixResult?.success
                                        ? 'border-green-500 bg-green-50'
                                        : fixResult?.success === false
                                        ? 'border-orange-500 bg-orange-50'
                                        : solution.priority === 'HIGH'
                                        ? 'border-red-500 bg-red-50'
                                        : solution.priority === 'MEDIUM'
                                        ? 'border-yellow-500 bg-yellow-50'
                                        : 'border-blue-500 bg-blue-50'
                                    } p-3 rounded`}
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="font-semibold text-slate-900">
                                        {solution.title}
                                      </div>
                                      <span
                                        className={`text-xs font-bold px-2 py-1 rounded ${
                                          fixResult?.success
                                            ? 'bg-green-200 text-green-900'
                                            : fixResult?.success === false
                                            ? 'bg-orange-200 text-orange-900'
                                            : solution.priority === 'HIGH'
                                            ? 'bg-red-200 text-red-900'
                                            : solution.priority === 'MEDIUM'
                                            ? 'bg-yellow-200 text-yellow-900'
                                            : 'bg-blue-200 text-blue-900'
                                        }`}
                                      >
                                        {fixResult?.success ? '✅ APPLIQUÉE' : fixResult?.success === false ? '⚠️ ERREUR' : solution.priority}
                                      </span>
                                    </div>

                                    <p className="text-sm text-slate-700 mb-2">
                                      {solution.description}
                                    </p>

                                    <div className="bg-white rounded p-2 text-xs space-y-1 mb-3">
                                      <p className="font-semibold text-slate-600">📝 Étapes:</p>
                                      <ol className="list-decimal list-inside space-y-1">
                                        {solution.steps.map((step, stepIndex) => (
                                          <li key={stepIndex} className="text-slate-600">
                                            {step}
                                          </li>
                                        ))}
                                      </ol>
                                    </div>

                                    {/* Résultat de l'application */}
                                    {fixResult && (
                                      <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`rounded p-2 text-xs mb-3 ${
                                          fixResult.success
                                            ? 'bg-green-100 border border-green-300 text-green-800'
                                            : 'bg-orange-100 border border-orange-300 text-orange-800'
                                        }`}
                                      >
                                        <p className="font-semibold mb-1">
                                          {fixResult.success ? '✅ Succès!' : '⚠️ Erreur'}
                                        </p>
                                        <p className="whitespace-pre-wrap">{fixResult.message}</p>
                                        {fixResult.duration && (
                                          <p className="text-xs opacity-75 mt-1">Durée: {fixResult.duration}</p>
                                        )}
                                      </motion.div>
                                    )}

                                    {/* Bouton d'auto-correction */}
                                    {canAutomate && !fixResult && (
                                      <button
                                        onClick={() => applySolution(solution, fixKey)}
                                        disabled={isApplying}
                                        className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded font-semibold text-sm transition-all ${
                                          isApplying
                                            ? 'bg-slate-300 text-slate-600 cursor-wait'
                                            : 'bg-emerald-500 hover:bg-emerald-600 text-white hover:shadow-lg'
                                        }`}
                                      >
                                        {isApplying ? (
                                          <>
                                            <motion.div
                                              animate={{ rotate: 360 }}
                                              transition={{ duration: 1, repeat: Infinity }}
                                              className="w-4 h-4"
                                            >
                                              <Zap className="w-4 h-4" />
                                            </motion.div>
                                            Application en cours...
                                          </>
                                        ) : (
                                          <>
                                            <Zap className="w-4 h-4" />
                                            Appliquer automatiquement
                                          </>
                                        )}
                                      </button>
                                    )}
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
