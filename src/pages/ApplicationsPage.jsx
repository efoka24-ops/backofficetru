import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Eye, Download, CheckCircle2, Clock, X, Search } from 'lucide-react';
import { backendClient } from '@/api/backendClient';

export default function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingApp, setViewingApp] = useState(null);
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [notification, setNotification] = useState(null);
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => backendClient.getApplications(),
    staleTime: 30000,
  });

  const updateMutation = useMutation({
    mutationFn: (data) =>
      fetch(`http://localhost:5000/api/applications/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      showNotification('✅ Candidature mise à jour!');
    },
    onError: (error) => {
      showNotification('❌ Erreur: ' + error.message, 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      fetch(`http://localhost:5000/api/applications/${id}`, { method: 'DELETE' })
        .then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setDeleteConfirm(null);
      showNotification('✅ Candidature supprimée!');
    },
    onError: (error) => {
      showNotification('❌ Erreur: ' + error.message, 'error');
    }
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleStatusChange = (appId, newStatus) => {
    const app = applications.find(a => a.id === appId);
    if (app) {
      updateMutation.mutate({ ...app, status: newStatus });
      setViewingApp({ ...app, status: newStatus });
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = statusFilter === 'Tous' || app.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  const statuses = ['Nouveau', 'En cours', 'Accepté', 'Rejeté'];

  const getStatusColor = (status) => {
    const colors = {
      'Nouveau': 'bg-blue-50 text-blue-800 border-blue-200',
      'En cours': 'bg-yellow-50 text-yellow-800 border-yellow-200',
      'Accepté': 'bg-green-50 text-green-800 border-green-200',
      'Rejeté': 'bg-red-50 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-slate-50 text-slate-800 border-slate-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">📋 Candidatures</h1>
          <p className="text-slate-600 mt-2">Gérez les candidatures des visiteurs</p>
        </motion.div>

        {/* Notifications */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-lg ${
                notification.type === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-green-50 text-green-800 border border-green-200'
              }`}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: applications.length, icon: '📊', color: 'blue' },
            { label: 'Nouveau', value: applications.filter(a => a.status === 'Nouveau').length, icon: '⭕', color: 'blue' },
            { label: 'En cours', value: applications.filter(a => a.status === 'En cours').length, icon: '⏳', color: 'yellow' },
            { label: 'Accepté', value: applications.filter(a => a.status === 'Accepté').length, icon: '✅', color: 'green' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className="text-slate-600 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou poste..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option>Tous</option>
            {statuses.map(status => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Applications Table */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">Aucune candidature</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApps.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">{app.fullName}</h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-emerald-600 font-semibold mb-2">{app.jobTitle}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <span>📧 {app.email}</span>
                      <span>📱 {app.phone}</span>
                      <span className="text-slate-400">
                        📅 {new Date(app.appliedAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setViewingApp(app)}
                      className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition"
                      title="Voir détails"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(app.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Details Modal */}
        <AnimatePresence>
          {viewingApp && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl max-w-2xl w-full p-8 max-h-96 overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{viewingApp.fullName}</h2>
                    <p className="text-emerald-600 font-semibold">{viewingApp.jobTitle}</p>
                  </div>
                  <button
                    onClick={() => setViewingApp(null)}
                    className="p-1 hover:bg-slate-100 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Contact Info */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-bold text-slate-900 mb-3">Informations de contact</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Email:</span> <a href={`mailto:${viewingApp.email}`} className="text-emerald-600 hover:underline">{viewingApp.email}</a></p>
                      <p><span className="font-semibold">Téléphone:</span> <a href={`tel:${viewingApp.phone}`} className="text-emerald-600 hover:underline">{viewingApp.phone}</a></p>
                      {viewingApp.linkedin && (
                        <p><span className="font-semibold">LinkedIn:</span> <a href={viewingApp.linkedin} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Voir profil</a></p>
                      )}
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-bold text-slate-900 mb-3">Lettre de motivation</h3>
                    <p className="text-slate-700 whitespace-pre-wrap text-sm">{viewingApp.coverLetter}</p>
                  </div>

                  {/* Resume */}
                  {viewingApp.resume && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h3 className="font-bold text-slate-900 mb-3">CV</h3>
                      <a
                        href={`http://localhost:5000${viewingApp.resume}`}
                        download
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm"
                      >
                        <Download className="w-4 h-4" /> Télécharger CV
                      </a>
                    </div>
                  )}

                  {/* Status Management */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-bold text-slate-900 mb-3">Statut</h3>
                    <div className="flex flex-wrap gap-2">
                      {statuses.map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(viewingApp.id, status)}
                          className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                            viewingApp.status === status
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-slate-300 text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>ID: {viewingApp.id}</p>
                    <p>Candidature: {new Date(viewingApp.appliedAt).toLocaleString('fr-FR')}</p>
                  </div>

                  <button
                    onClick={() => setViewingApp(null)}
                    className="w-full mt-4 px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition font-semibold"
                  >
                    Fermer
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation */}
        <AnimatePresence>
          {deleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-white rounded-xl p-6 max-w-sm"
              >
                <h3 className="text-xl font-bold mb-4">Confirmer la suppression?</h3>
                <p className="text-slate-600 mb-6">Cette candidature sera définitivement supprimée.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(deleteConfirm)}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Supprimer
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
