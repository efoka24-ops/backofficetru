import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/api/simpleClient';
import { uploadImage } from '@/api/uploadHelper';

export default function SolutionsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingSolution, setEditingSolution] = useState(null);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  // Fetch solutions
  const { data: solutions = [], isLoading } = useQuery({
    queryKey: ['solutions'],
    queryFn: () => apiClient.getSolutions(),
    staleTime: 30000,
  });

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (data) => {
      if (editingSolution?.id) {
        return apiClient.updateSolution(editingSolution.id, data);
      } else {
        return apiClient.createSolution(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solutions'] });
      apiClient.notifyFrontend('update', 'solutions', null);
      setIsOpen(false);
      setEditingSolution(null);
    },
    onError: (error) => {
      console.error('❌ Erreur:', error);
      alert('Erreur: ' + (error.message || 'Erreur inconnue'));
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return apiClient.deleteSolution(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solutions'] });
      apiClient.notifyFrontend('delete', 'solutions', null);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editingSolution?.name || !editingSolution?.description) {
      alert('Nom et Description sont obligatoires');
      return;
    }

    const dataToSend = { ...editingSolution };
    delete dataToSend.imageFile;

    console.log('📤 Envoi données:', dataToSend);
    mutation.mutate(dataToSend);
  };

  const openCreate = () => {
    setEditingSolution({
      name: '',
      description: '',
      category: '',
      image: '',
      benefits: [],
      features: [],
    });
    setIsOpen(true);
  };

  const openEdit = (solution) => {
    setEditingSolution({ ...solution });
    setIsOpen(true);
  };

  const filtered = solutions.filter(s =>
    (s.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (s.description?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">💡 Solutions</h1>
            <p className="text-slate-600">Gérez vos solutions et offres complètes</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openCreate}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            ➕ Ajouter une solution
          </motion.button>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Rechercher une solution..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="mt-4 text-slate-600">Chargement...</p>
          </div>
        )}

        {/* Solutions Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered.map((solution) => (
                <motion.div
                  key={solution.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {/* Image */}
                  {solution.image && (
                    <div className="h-48 bg-slate-200 overflow-hidden">
                      <img 
                        src={
                          solution.image.startsWith('http') 
                            ? solution.image 
                            : solution.image.startsWith('/uploads')
                              ? `http://localhost:5000${solution.image}`
                              : solution.image
                        }
                        alt={solution.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{solution.name}</h3>
                    {solution.category && (
                      <p className="text-blue-600 font-semibold text-sm mb-2">{solution.category}</p>
                    )}
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">{solution.description}</p>

                    {/* Benefits */}
                    {Array.isArray(solution.benefits) && solution.benefits.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-slate-700 mb-1">Avantages:</p>
                        <div className="flex flex-wrap gap-1">
                          {solution.benefits.slice(0, 2).map((benefit, i) => (
                            <span key={i} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                              ✓ {benefit}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Features */}
                    {Array.isArray(solution.features) && solution.features.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {solution.features.slice(0, 2).map((feature, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => openEdit(solution)}
                        className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded font-semibold transition-colors text-sm"
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Confirmer la suppression?')) {
                            deleteMutation.mutate(solution.id);
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded font-semibold transition-colors text-sm"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-slate-600 text-lg">Aucune solution trouvée</p>
          </div>
        )}

        {/* Dialog */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setIsOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-start">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {editingSolution?.id ? '✏️ Modifier' : '➕ Ajouter'} une solution
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-slate-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Photo Section */}
                <div className="p-6 border-b border-slate-200">
                  <label className="block text-sm font-semibold mb-3">📸 Photo</label>
                  <div className="flex gap-4">
                    {editingSolution?.image && !editingSolution.image.startsWith('data:') ? (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="w-24 h-24 rounded-lg overflow-hidden bg-blue-100 flex-shrink-0"
                      >
                        <img 
                          src={
                            editingSolution.image.startsWith('http')
                              ? editingSolution.image
                              : `http://localhost:5000${editingSolution.image}`
                          }
                          alt="preview" 
                          className="w-full h-full object-cover" 
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </motion.div>
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 text-3xl flex-shrink-0 font-bold">
                        ?
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const imageUrl = await uploadImage(file);
                                setEditingSolution({
                                  ...editingSolution,
                                  image: imageUrl
                                });
                              } catch (error) {
                                console.error('Erreur upload:', error.message);
                                alert('Erreur lors de l\'upload: ' + error.message);
                              }
                            }
                          }}
                          className="hidden"
                        />
                        <div className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors font-semibold text-center cursor-pointer">
                          📁 Choisir une photo
                        </div>
                      </label>
                      <p className="text-xs text-slate-500 mt-2">
                        {editingSolution?.image ? '✅ Photo sélectionnée' : 'Clique pour uploader'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-900">Nom *</label>
                      <input
                        type="text"
                        value={editingSolution?.name || ''}
                        onChange={(e) => setEditingSolution({ ...editingSolution, name: e.target.value })}
                        placeholder="Nom de la solution"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-900">Catégorie</label>
                      <input
                        type="text"
                        value={editingSolution?.category || ''}
                        onChange={(e) => setEditingSolution({ ...editingSolution, category: e.target.value })}
                        placeholder="Ex: Enterprise, Startup"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-900">Description *</label>
                    <textarea
                      value={editingSolution?.description || ''}
                      onChange={(e) => setEditingSolution({ ...editingSolution, description: e.target.value })}
                      placeholder="Description détaillée..."
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50 text-sm"
                    />
                  </div>

                  {/* Features */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-slate-900">Caractéristiques</label>
                      <button
                        type="button"
                        onClick={() => {
                          const current = Array.isArray(editingSolution?.features) ? editingSolution.features : [];
                          setEditingSolution({
                            ...editingSolution,
                            features: [...current, '']
                          });
                        }}
                        className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm font-semibold"
                      >
                        ➕ Ajouter
                      </button>
                    </div>
                    <div className="space-y-2">
                      {Array.isArray(editingSolution?.features) && editingSolution.features.length > 0 ? (
                        editingSolution.features.map((feature, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={feature || ''}
                              onChange={(e) => {
                                const updated = [...editingSolution.features];
                                updated[index] = e.target.value;
                                setEditingSolution({
                                  ...editingSolution,
                                  features: updated
                                });
                              }}
                              placeholder="Caractéristique..."
                              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = editingSolution.features.filter((_, i) => i !== index);
                                setEditingSolution({
                                  ...editingSolution,
                                  features: updated
                                });
                              }}
                              className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded font-semibold text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 italic">Aucune caractéristique</p>
                      )}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-slate-900">Avantages</label>
                      <button
                        type="button"
                        onClick={() => {
                          const current = Array.isArray(editingSolution?.benefits) ? editingSolution.benefits : [];
                          setEditingSolution({
                            ...editingSolution,
                            benefits: [...current, '']
                          });
                        }}
                        className="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm font-semibold"
                      >
                        ➕ Ajouter
                      </button>
                    </div>
                    <div className="space-y-2">
                      {Array.isArray(editingSolution?.benefits) && editingSolution.benefits.length > 0 ? (
                        editingSolution.benefits.map((benefit, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={benefit || ''}
                              onChange={(e) => {
                                const updated = [...editingSolution.benefits];
                                updated[index] = e.target.value;
                                setEditingSolution({
                                  ...editingSolution,
                                  benefits: updated
                                });
                              }}
                              placeholder="Avantage..."
                              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = editingSolution.benefits.filter((_, i) => i !== index);
                                setEditingSolution({
                                  ...editingSolution,
                                  benefits: updated
                                });
                              }}
                              className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded font-semibold text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 italic">Aucun avantage</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-6 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-semibold transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={mutation.isPending}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded font-semibold transition-colors"
                    >
                      {mutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
