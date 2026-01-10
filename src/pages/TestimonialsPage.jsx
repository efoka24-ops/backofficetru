import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/api/simpleClient';
import { uploadImage } from '@/api/uploadHelper';
import { backendClient } from '@/api/backendClient';

export default function TestimonialsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  // Fetch testimonials
  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      try {
        return await backendClient.getTestimonials();      } catch (error) {
        console.error('❌ Erreur:', error);
        return [];
      }
    },
    staleTime: 30000,
  });

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (data) => {
      if (editingTestimonial?.id) {
        return await backendClient.updateTestimonial(editingTestimonial.id, data);
      } else {
        return await backendClient.createTestimonial(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      apiClient.notifyFrontend('update', 'testimonials', null);
      setIsOpen(false);
      setEditingTestimonial(null);
    },
    onError: (error) => {
      console.error('❌ Erreur:', error);
      alert('Erreur: ' + (error.message || 'Erreur inconnue'));
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await backendClient.deleteTestimonial(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      apiClient.notifyFrontend('delete', 'testimonials', null);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editingTestimonial?.name || !editingTestimonial?.testimonial) {
      alert('Nom et Témoignage sont obligatoires');
      return;
    }
    mutation.mutate(editingTestimonial);
  };

  const openCreate = () => {
    setEditingTestimonial({
      name: '',
      title: '',
      company: '',
      testimonial: '',
      image: '',
      rating: 5,
    });
    setIsOpen(true);
  };

  const openEdit = (testimonial) => {
    setEditingTestimonial({ ...testimonial });
    setIsOpen(true);
  };

  const filtered = testimonials.filter(t =>
    (t.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (t.testimonial?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">⭐ Témoignages</h1>
            <p className="text-slate-600">Gérez les témoignages clients</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openCreate}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            ➕ Ajouter un témoignage
          </motion.button>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Rechercher un témoignage..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 bg-white"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-600"></div>
            <p className="mt-4 text-slate-600">Chargement...</p>
          </div>
        )}

        {/* Testimonials Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered.map((testimonial) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {/* Content */}
                  <div className="p-6">
                    {/* Rating */}
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < testimonial.rating ? 'text-amber-400' : 'text-slate-300'}>
                          ⭐
                        </span>
                      ))}
                    </div>

                    {/* Testimonial */}
                    <p className="text-slate-600 text-sm mb-4 italic line-clamp-3">
                      "{testimonial.testimonial}"
                    </p>

                    {/* Author */}
                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex items-center gap-3 mb-2">
                        {testimonial.image && (
                          <img
                            src={
                              testimonial.image.startsWith('http')
                                ? testimonial.image
                                : testimonial.image.startsWith('/uploads')
                                  ? `http://localhost:5000${testimonial.image}`
                                  : '/placeholder.svg'
                            }
                            alt={testimonial.name}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => e.target.src = '/placeholder.svg'}
                          />
                        )}
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{testimonial.name}</h4>
                          {testimonial.title && (
                            <p className="text-xs text-slate-500">{testimonial.title}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-slate-200 mt-4">
                      <button
                        onClick={() => openEdit(testimonial)}
                        className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded font-semibold transition-colors text-sm"
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Confirmer la suppression?')) {
                            deleteMutation.mutate(testimonial.id);
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
            <p className="text-slate-600 text-lg">Aucun témoignage trouvé</p>
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
                    {editingTestimonial?.id ? '✏️ Modifier' : '➕ Ajouter'} un témoignage
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
                    {editingTestimonial?.image ? (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="w-24 h-24 rounded-full overflow-hidden bg-amber-100 flex-shrink-0"
                      >
                        <img
                          src={
                            editingTestimonial.image.startsWith('http')
                              ? editingTestimonial.image
                              : `http://localhost:5000${editingTestimonial.image}`
                          }
                          alt="preview"
                          className="w-full h-full object-cover"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </motion.div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 text-3xl flex-shrink-0 font-bold">
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
                                setEditingTestimonial({
                                  ...editingTestimonial,
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
                        <div className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-colors font-semibold text-center cursor-pointer">
                          📁 Choisir une photo
                        </div>
                      </label>
                      <p className="text-xs text-slate-500 mt-2">
                        {editingTestimonial?.image ? '✅ Photo sélectionnée' : 'Clique pour uploader'}
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
                        value={editingTestimonial?.name || ''}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                        placeholder="Nom du client"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 bg-slate-50 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-900">Titre</label>
                      <input
                        type="text"
                        value={editingTestimonial?.title || ''}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, title: e.target.value })}
                        placeholder="Ex: PDG, Manager"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 bg-slate-50 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-900">Entreprise</label>
                    <input
                      type="text"
                      value={editingTestimonial?.company || ''}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, company: e.target.value })}
                      placeholder="Nom de l'entreprise"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 bg-slate-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-900">Témoignage *</label>
                    <textarea
                      value={editingTestimonial?.testimonial || ''}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, testimonial: e.target.value })}
                      placeholder="Écrivez le témoignage..."
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 bg-slate-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-900">Notation ⭐</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setEditingTestimonial({ ...editingTestimonial, rating: num })}
                          className={`text-3xl transition-transform hover:scale-110 ${
                            num <= (editingTestimonial?.rating || 0) ? 'text-amber-400' : 'text-slate-300'
                          }`}
                        >
                          ⭐
                        </button>
                      ))}
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
                      className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-400 text-white rounded font-semibold transition-colors"
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
