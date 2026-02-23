import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, X, Search, Calendar, MapPin, Users, DollarSign, Award } from 'lucide-react';
import { backendClient } from '@/api/backendClient';

export default function FormationsPage() {
  const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [notification, setNotification] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [modules, setModules] = useState(['']);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    prix: '',
    duree: '',
    format: 'presentiel',
    lieu: '',
    places_disponibles: 20,
    statut: 'active',
    date_debut: '',
    date_fin: '',
    image_url: ''
  });
  const queryClient = useQueryClient();

  const { data: formations = [], isLoading } = useQuery({
    queryKey: ['formations'],
    queryFn: async () => {
      const response = await backendClient.get('/formations');
      return response;
    },
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await backendClient.post('/formations', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formations'] });
      setShowModal(false);
      resetForm();
      showNotification('✅ Formation créée!');
    },
    onError: (error) => {
      showNotification('❌ Erreur: ' + error.message, 'error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      return await backendClient.put(`/formations/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formations'] });
      setShowModal(false);
      setEditingId(null);
      resetForm();
      showNotification('✅ Formation mise à jour!');
    },
    onError: (error) => {
      showNotification('❌ Erreur: ' + error.message, 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await backendClient.delete(`/formations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formations'] });
      setDeleteConfirm(null);
      showNotification('✅ Formation supprimée!');
    },
    onError: (error) => {
      showNotification('❌ Erreur: ' + error.message, 'error');
    }
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const resetForm = () => {
    setFormData({
      titre: '',
      description: '',
      prix: '',
      duree: '',
      format: 'presentiel',
      lieu: '',
      places_disponibles: 20,
      statut: 'active',
      date_debut: '',
      date_fin: '',
      image_url: ''
    });
    setModules(['']);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.titre || !formData.description || !formData.prix || !formData.duree) {
      showNotification('❌ Veuillez remplir les champs obligatoires', 'error');
      return;
    }

    const submitData = {
      ...formData,
      prix: parseFloat(formData.prix),
      places_disponibles: parseInt(formData.places_disponibles),
      modules: modules.filter(m => m.trim() !== '')
    };

    if (editingId) {
      updateMutation.mutate({ ...submitData, id: editingId });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      titre: item.titre,
      description: item.description,
      prix: item.prix.toString(),
      duree: item.duree,
      format: item.format || 'presentiel',
      lieu: item.lieu || '',
      places_disponibles: item.places_disponibles || 20,
      statut: item.statut || 'active',
      date_debut: item.date_debut ? item.date_debut.split('T')[0] : '',
      date_fin: item.date_fin ? item.date_fin.split('T')[0] : '',
      image_url: item.image_url || ''
    });
    setModules(Array.isArray(item.modules) && item.modules.length > 0 ? item.modules : ['']);
    setShowModal(true);
  };

  const addModule = () => {
    setModules([...modules, '']);
  };

  const removeModule = (index) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const updateModule = (index, value) => {
    const newModules = [...modules];
    newModules[index] = value;
    setModules(newModules);
  };

  const formatPrice = (prix) => {
    return new Intl.NumberFormat('fr-FR').format(prix);
  };

  const filteredFormations = formations.filter(item =>
    item.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const resolveImageSrc = (imagePath) => {
    if (!imagePath) return '';
    if (/^https?:\/\//i.test(imagePath) || imagePath.startsWith('data:')) {
      return imagePath;
    }
    const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${backendBaseUrl}${normalizedPath}`;
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setImageUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('image', file);

      const response = await fetch(`${backendBaseUrl}/api/upload`, {
        method: 'POST',
        body: uploadData
      });
      const result = await response.json();
      if (!response.ok || !result?.url) {
        throw new Error(result?.error || 'Upload impossible');
      }

      setFormData({ ...formData, image_url: result.url });
      showNotification('✅ Image téléversée');
    } catch (error) {
      showNotification(`❌ ${error.message}`, 'error');
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">🎓 Gestion des Formations</h1>
          <p className="text-slate-600 mt-2">Créez et gérez vos formations professionnelles</p>
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

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une formation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                resetForm();
                setEditingId(null);
                setShowModal(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <Plus className="w-5 h-5" />
              Nouvelle Formation
            </motion.button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-emerald-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1">Formations actives</p>
                <p className="text-3xl font-bold text-slate-900">
                  {formations.filter(f => f.statut === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1">Total formations</p>
                <p className="text-3xl font-bold text-slate-900">{formations.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1">Places disponibles</p>
                <p className="text-3xl font-bold text-slate-900">
                  {formations.reduce((sum, f) => sum + (f.places_disponibles || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Formations List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredFormations.map((formation, index) => (
              <motion.div
                key={formation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image */}
                  {formation.image_url && (
                    <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                      <img
                        src={resolveImageSrc(formation.image_url)}
                        alt={formation.titre}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">{formation.titre}</h3>
                        <p className="text-slate-600 text-sm line-clamp-2">{formation.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        formation.statut === 'active' 
                          ? 'bg-green-100 text-green-700'
                          : formation.statut === 'terminee'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {formation.statut}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        <span className="font-semibold">{formatPrice(formation.prix)} FCFA</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>{formation.duree}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-purple-500" />
                        <span>{formation.format}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="w-4 h-4 text-orange-500" />
                        <span>{formation.places_disponibles} places</span>
                      </div>
                    </div>

                    {formation.modules && formation.modules.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-slate-500 mb-2">MODULES:</p>
                        <div className="flex flex-wrap gap-2">
                          {formation.modules.slice(0, 4).map((module, idx) => (
                            <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                              {module}
                            </span>
                          ))}
                          {formation.modules.length > 4 && (
                            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                              +{formation.modules.length - 4} autres
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {(formation.date_debut || formation.date_fin) && (
                      <div className="text-sm text-slate-500 mb-4">
                        📅 {formation.date_debut && new Date(formation.date_debut).toLocaleDateString('fr-FR')}
                        {formation.date_fin && ` - ${new Date(formation.date_fin).toLocaleDateString('fr-FR')}`}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(formation)}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 font-medium"
                      >
                        <Edit2 className="w-4 h-4" />
                        Modifier
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(formation.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal Create/Edit */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {editingId ? '✏️ Modifier la formation' : '➕ Nouvelle formation'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  {/* Titre */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Titre de la formation *
                    </label>
                    <input
                      type="text"
                      value={formData.titre}
                      onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                      required
                    />
                  </div>

                  {/* Prix et Durée */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Prix (FCFA) *
                      </label>
                      <input
                        type="number"
                        value={formData.prix}
                        onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Durée *
                      </label>
                      <input
                        type="text"
                        value={formData.duree}
                        onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
                        placeholder="Ex: 2 semaines, 1 mois"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Format et Lieu */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Format *
                      </label>
                      <select
                        value={formData.format}
                        onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                      >
                        <option value="presentiel">Présentiel</option>
                        <option value="en_ligne">En ligne</option>
                        <option value="hybride">Hybride</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Lieu
                      </label>
                      <input
                        type="text"
                        value={formData.lieu}
                        onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                        placeholder="Ex: Yaoundé, Cameroun"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                      />
                    </div>
                  </div>

                  {/* Places et Statut */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Places disponibles
                      </label>
                      <input
                        type="number"
                        value={formData.places_disponibles}
                        onChange={(e) => setFormData({ ...formData, places_disponibles: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Statut
                      </label>
                      <select
                        value={formData.statut}
                        onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="terminee">Terminée</option>
                        <option value="annulee">Annulée</option>
                      </select>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Date de début
                      </label>
                      <input
                        type="date"
                        value={formData.date_debut}
                        onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Date de fin
                      </label>
                      <input
                        type="date"
                        value={formData.date_fin}
                        onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                      />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Image de la formation
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files?.[0])}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                    />
                    <div className="mt-2 text-xs text-slate-500">
                      {imageUploading ? 'Téléversement en cours...' : (formData.image_url ? 'Image prête' : 'Aucune image sélectionnée')}
                    </div>
                    {formData.image_url && (
                      <div className="mt-3 flex items-center gap-3">
                        <img
                          src={resolveImageSrc(formData.image_url)}
                          alt="Aperçu"
                          className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image_url: '' })}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Supprimer l'image
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Modules */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Modules de formation
                    </label>
                    <div className="space-y-2">
                      {modules.map((module, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={module}
                            onChange={(e) => updateModule(index, e.target.value)}
                            placeholder={`Module ${index + 1}`}
                            className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                          />
                          {modules.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeModule(index)}
                              className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addModule}
                        className="w-full px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                      >
                        + Ajouter un module
                      </button>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-50"
                    >
                      {editingId ? 'Mettre à jour' : 'Créer la formation'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setDeleteConfirm(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Confirmer la suppression</h3>
                  <p className="text-slate-600 mb-6">
                    Êtes-vous sûr de vouloir supprimer cette formation ? Cette action est irréversible.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => deleteMutation.mutate(deleteConfirm)}
                      disabled={deleteMutation.isPending}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Supprimer
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
