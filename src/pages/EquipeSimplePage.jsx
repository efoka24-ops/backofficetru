import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/simpleClient';
import { uploadImage } from '@/api/uploadHelper';
import { motion, AnimatePresence } from 'framer-motion';

export default function EquipeSimplePage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  // Fetch team members
  const { data: members = [], isLoading } = useQuery({
    queryKey: ['team'],
    queryFn: () => apiClient.getTeam(),
    staleTime: 30000,
  });

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (data) => {
      if (editingMember?.id) {
        console.log('📝 Modification membre ID:', editingMember.id, 'Data:', data);
        return apiClient.updateTeamMember(editingMember.id, data);
      } else {
        console.log('➕ Création nouveau membre. Data:', data);
        return apiClient.createTeamMember(data);
      }
    },
    onSuccess: (response) => {
      console.log('✅ Succès:', response);
      queryClient.invalidateQueries({ queryKey: ['team'] });
      apiClient.notifyFrontend('update', 'team', null);
      setIsOpen(false);
      setEditingMember(null);
    },
    onError: (error) => {
      console.error('❌ Erreur complète:', error);
      console.error('Message:', error.message);
      alert('Erreur: ' + (error.message || 'Erreur inconnue'));
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return apiClient.deleteTeamMember(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      apiClient.notifyFrontend('delete', 'team', null);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editingMember?.name || !editingMember?.title) {
      alert('Nom et Titre sont obligatoires');
      return;
    }
    
    // Envoyer les données telles quelles (pas de base64)
    const dataToSend = { ...editingMember };
    delete dataToSend.imageFile; // Supprimer les références de fichier temporaires
    
    console.log('📤 Envoi données:', dataToSend);
    mutation.mutate(dataToSend);
  };

  const openCreate = () => {
    setEditingMember({
      name: '',
      title: '',
      bio: '',
      email: '',
      phone: '',
      image: '',
      specialties: [],
      certifications: [],
      is_founder: false,
      linked_in: '',
    });
    setIsOpen(true);
  };

  const openEdit = (member) => {
    setEditingMember({ ...member });
    setIsOpen(true);
  };

  const filtered = members.filter(m =>
    (m.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (m.title?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">👥 Équipe</h1>
            <p className="text-slate-600">Gérez les membres de votre équipe</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openCreate}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            ➕ Ajouter un membre
          </motion.button>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Rechercher un membre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
            <p className="mt-4 text-slate-600">Chargement...</p>
          </div>
        )}

        {/* Members Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered.map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {/* Image */}
                  {member.image && (
                    <div className="h-48 bg-slate-200 overflow-hidden">
                      <img 
                        src={
                          member.image.startsWith('http') 
                            ? member.image 
                            : member.image.startsWith('/uploads')
                              ? `http://localhost:5000${member.image}`
                              : member.image
                        }
                        alt={member.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Image non trouvée:', member.image);
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                    <p className="text-emerald-600 font-semibold mb-3">{member.title}</p>

                    {member.bio && (
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">{member.bio}</p>
                    )}

                    {member.email && (
                      <p className="text-xs text-slate-500 mb-1">📧 {member.email}</p>
                    )}
                    {member.phone && (
                      <p className="text-xs text-slate-500 mb-3">📱 {member.phone}</p>
                    )}

                    {Array.isArray(member.specialties) && member.specialties.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {member.specialties.map((spec, i) => (
                          <span key={i} className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded">
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}

                    {member.is_founder && (
                      <div className="mb-3 text-sm font-semibold text-amber-600">⭐ Fondateur</div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => openEdit(member)}
                        className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded font-semibold transition-colors text-sm"
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Confirmer la suppression?')) {
                            deleteMutation.mutate(member.id);
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
            <p className="text-slate-600 text-lg">Aucun membre trouvé</p>
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
                {/* Header avec Photo */}
                <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {editingMember?.id ? '✏️ Modifier' : '➕ Ajouter'} un membre
                    </h2>
                  </div>
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
                    {editingMember?.image && !editingMember.image.startsWith('data:') ? (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="w-24 h-24 rounded-lg overflow-hidden bg-emerald-100 flex-shrink-0"
                      >
                        <img 
                          src={
                            editingMember.image.startsWith('http')
                              ? editingMember.image
                              : `http://localhost:5000${editingMember.image}`
                          }
                          alt="preview" 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            console.error('Erreur chargement image:', editingMember.image);
                            e.target.style.display = 'none';
                          }}
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
                                setEditingMember({
                                  ...editingMember,
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
                        <div className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors font-semibold text-center cursor-pointer">
                          📁 Choisir une photo
                        </div>
                      </label>
                      <p className="text-xs text-slate-500 mt-2">
                        {editingMember?.image ? '✅ Photo sélectionnée' : 'Clique pour uploader'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {/* Nom et Poste */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-900">Nom complet *</label>
                      <input
                        type="text"
                        value={editingMember?.name || ''}
                        onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                        placeholder="Nom et prénom"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-900">Poste *</label>
                      <input
                        type="text"
                        value={editingMember?.title || ''}
                        onChange={(e) => setEditingMember({ ...editingMember, title: e.target.value })}
                        placeholder="Ex: Directeur Technique"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 text-sm"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-900">Description</label>
                    <textarea
                      value={editingMember?.bio || ''}
                      onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                      placeholder="Bio ou description..."
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 text-sm"
                    />
                  </div>

                  {/* Email, Téléphone, LinkedIn */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-900">Email</label>
                      <input
                        type="email"
                        value={editingMember?.email || ''}
                        onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                        placeholder="email@..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-900">Téléphone</label>
                      <input
                        type="tel"
                        value={editingMember?.phone || ''}
                        onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                        placeholder="+237..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-900">LinkedIn</label>
                      <input
                        type="url"
                        value={editingMember?.linked_in || ''}
                        onChange={(e) => setEditingMember({ ...editingMember, linked_in: e.target.value })}
                        placeholder="linkedin.com/in/..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 text-sm"
                      />
                    </div>
                  </div>

                  {/* Expertises */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-slate-900">Expertises</label>
                      <button
                        type="button"
                        onClick={() => {
                          const current = Array.isArray(editingMember?.specialties) ? editingMember.specialties : [];
                          setEditingMember({
                            ...editingMember,
                            specialties: [...current, '']
                          });
                        }}
                        className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded text-sm font-semibold"
                      >
                        ➕ Ajouter
                      </button>
                    </div>
                    <div className="space-y-2">
                      {Array.isArray(editingMember?.specialties) && editingMember.specialties.length > 0 ? (
                        editingMember.specialties.map((specialty, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={specialty || ''}
                              onChange={(e) => {
                                const updated = [...editingMember.specialties];
                                updated[index] = e.target.value;
                                setEditingMember({
                                  ...editingMember,
                                  specialties: updated
                                });
                              }}
                              placeholder="Expertise..."
                              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = editingMember.specialties.filter((_, i) => i !== index);
                                setEditingMember({
                                  ...editingMember,
                                  specialties: updated
                                });
                              }}
                              className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded font-semibold text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 italic">Aucune expertise ajoutée</p>
                      )}
                    </div>
                  </div>

                  {/* Prix & Certifications */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-slate-900">Prix & Certifications</label>
                      <button
                        type="button"
                        onClick={() => {
                          const current = Array.isArray(editingMember?.certifications) ? editingMember.certifications : [];
                          setEditingMember({
                            ...editingMember,
                            certifications: [...current, '']
                          });
                        }}
                        className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded text-sm font-semibold"
                      >
                        ➕ Ajouter
                      </button>
                    </div>
                    <div className="space-y-2">
                      {Array.isArray(editingMember?.certifications) && editingMember.certifications.length > 0 ? (
                        editingMember.certifications.map((cert, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={cert || ''}
                              onChange={(e) => {
                                const updated = [...editingMember.certifications];
                                updated[index] = e.target.value;
                                setEditingMember({
                                  ...editingMember,
                                  certifications: updated
                                });
                              }}
                              placeholder="Prix ou certification..."
                              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = editingMember.certifications.filter((_, i) => i !== index);
                                setEditingMember({
                                  ...editingMember,
                                  certifications: updated
                                });
                              }}
                              className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded font-semibold text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 italic">Aucune certification ajoutée</p>
                      )}
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingMember?.is_founder || false}
                        onChange={(e) => setEditingMember({ ...editingMember, is_founder: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 accent-emerald-600"
                      />
                      <span className="text-sm font-semibold">Fondateur</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        className="w-4 h-4 rounded border-slate-300"
                      />
                      <span className="text-sm font-semibold">Visible sur le site</span>
                    </label>
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
                      className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded font-semibold transition-colors"
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
