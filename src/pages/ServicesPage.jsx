import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Check, AlertCircle } from 'lucide-react';
import { useData } from '@/hooks/useData';

export default function ServicesPage() {
  const {
    services,
    addService,
    updateService,
    deleteService
  } = useData();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSave = () => {
    if (!editingService.title?.trim()) {
      showNotification('Le nom est obligatoire', 'error');
      return;
    }

    if (editingService.id) {
      updateService(editingService.id, editingService);
      showNotification('✅ Service modifié avec succès!');
    } else {
      addService(editingService);
      showNotification('✅ Service créé avec succès!');
    }
    
    setIsDialogOpen(false);
    setEditingService(null);
  };

  const handleDelete = (serviceId) => {
    deleteService(serviceId);
    setDeleteConfirm(null);
    showNotification('✅ Service supprimé avec succès!');
  };

  const openDialog = (service = null) => {
    setEditingService(service || {
      icon: 'Building2',
      title: '',
      description: '',
      features: [],
      objective: '',
      color: 'from-blue-500 to-indigo-600'
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              🛠️ Gestion des Services
            </h1>
            <p className="text-slate-600 mt-2">Gérer vos services et offres</p>
          </div>
          <motion.button
            onClick={() => openDialog()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Ajouter un service
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                notification.type === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-green-50 text-green-800 border border-green-200'
              }`}
            >
              {notification.type === 'error' ? (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <Check className="w-5 h-5 flex-shrink-0" />
              )}
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        {services.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <p className="text-slate-600 text-lg">Aucun service pour le moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all border-l-4 border-blue-500"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-900">{service.title}</h3>
                  </div>

                  {service.description && (
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">{service.description}</p>
                  )}

                  {service.features && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-slate-700 mb-2">Caractéristiques:</p>
                      <div className="flex flex-wrap gap-1">
                        {service.features.slice(0, 3).map((feature, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => openDialog(service)}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded font-semibold hover:bg-blue-100 flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(service.id)}
                      className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded font-semibold hover:bg-red-100 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Dialog */}
        <AnimatePresence>
          {isDialogOpen && editingService && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              onClick={() => setIsDialogOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    {editingService.id ? '✏️ Modifier le service' : '➕ Ajouter un service'}
                  </h2>
                  <button
                    onClick={() => setIsDialogOpen(false)}
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Nom *</label>
                    <input
                      type="text"
                      value={editingService.title || ''}
                      onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="Nom du service"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Description</label>
                    <textarea
                      value={editingService.description || ''}
                      onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="Description du service"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Objectif</label>
                      <input
                        type="text"
                        value={editingService.objective || ''}
                        onChange={(e) => setEditingService({ ...editingService, objective: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                        placeholder="Objectif du service"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
                  <button
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!editingService.title?.trim()}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-semibold disabled:opacity-50"
                  >
                    Sauvegarder
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
              onClick={() => setDeleteConfirm(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl shadow-2xl p-6 max-w-sm mx-4"
              >
                <h3 className="text-xl font-bold mb-4">Confirmer la suppression?</h3>
                <p className="text-slate-600 mb-6">Cette action est irréversible.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold disabled:opacity-50"
                  >
                    Supprimer
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
