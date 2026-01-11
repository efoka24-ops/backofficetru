import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, Upload, ArrowUp, ArrowDown, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useData } from '@/hooks/useData';
import MemberAccountsPage from './MemberAccountsPage';

export default function EquipePage() {
  // Import from Zustand store via hook
  const { 
    team: teamMembers,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember
  } = useData();

  const [activeTab, setActiveTab] = useState('team');
  const [isEditingDialog, setIsEditingDialog] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [newExpertise, setNewExpertise] = useState('');
  const [newAchievement, setNewAchievement] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isLoading] = useState(false);

  const showNotification = (message, type = 'success', duration = 3000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), duration);
  };

  const handleSave = () => {
    if (!editingMember.name?.trim()) {
      showNotification('Le nom est obligatoire', 'error');
      return;
    }
    if (!editingMember.title?.trim()) {
      showNotification('La fonction est obligatoire', 'error');
      return;
    }

    if (editingMember.id) {
      updateTeamMember(editingMember.id, editingMember);
      showNotification(`✅ Les modifications de ${editingMember.name} ont été enregistrées!`);
    } else {
      addTeamMember(editingMember);
      showNotification(`✅ ${editingMember.name} a été ajouté avec succès!`);
    }
    
    setIsEditingDialog(false);
    setEditingMember(null);
  };
  const handleDelete = (memberId) => {
    deleteTeamMember(memberId);
    setDeleteConfirm(null);
    showNotification(`✅ Le membre a été supprimé avec succès!`);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille limite (250KB)
      const MAX_SIZE = 250 * 1024;
      if (file.size > MAX_SIZE) {
        const message = `Fichier trop volumineux (${(file.size / 1024).toFixed(2)}KB). Maximum: 250KB. Veuillez compresser l'image.`;
        showNotification(message, 'error', 5000);
        return;
      }

      // Convertir en base64 data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64DataUrl = event.target.result;
        setPhotoPreview(base64DataUrl);
        setEditingMember({ ...editingMember, image: base64DataUrl });
        showNotification(`✅ Photo chargée avec succès!`, 'success', 3000);
      };
      reader.onerror = () => {
        showNotification('❌ Erreur lors de la lecture du fichier', 'error', 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const addExpertise = () => {
    if (newExpertise.trim()) {
      setEditingMember({
        ...editingMember,
        specialties: [...(editingMember.specialties || []), newExpertise.trim()]
      });
      setNewExpertise('');
    }
  };

  const removeExpertise = (index) => {
    setEditingMember({
      ...editingMember,
      specialties: editingMember.specialties.filter((_, i) => i !== index)
    });
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setEditingMember({
        ...editingMember,
        certifications: [...(editingMember.certifications || []), newAchievement.trim()]
      });
      setNewAchievement('');
    }
  };

  const removeAchievement = (index) => {
    setEditingMember({
      ...editingMember,
      certifications: editingMember.certifications.filter((_, i) => i !== index)
    });
  };

  const moveMember = (member, direction) => {
    const currentIndex = teamMembers.findIndex(m => m.id === member.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= teamMembers.length) return;

    const otherMember = teamMembers[newIndex];
    
    updateTeamMember(member.id, { ...member, display_order: newIndex });
    updateTeamMember(otherMember.id, { ...otherMember, display_order: currentIndex });
  };

  const openEditDialog = (member) => {
    setEditingMember({ ...member });
    setPhotoPreview(member.image);
    setIsEditingDialog(true);
  };

  const openNewDialog = () => {
    setEditingMember({
      name: '',
      title: '',
      bio: '',
      image: '',
      email: '',
      phone: '',
      linked_in: '',
      specialties: [],
      certifications: [],
      is_founder: false,
      is_visible: true
    });
    setPhotoPreview(null);
    setIsEditingDialog(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 rounded-lg px-6 py-4 flex items-center gap-3 shadow-lg border ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Administration</h1>
        <p className="text-slate-600">Gérez le contenu de votre site TRU GROUP</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 mb-8 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('team')}
          className={`pb-4 border-b-2 font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'team'
              ? 'border-emerald-600 text-slate-900'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          👥 Équipe
        </button>
        <button
          onClick={() => setActiveTab('accounts')}
          className={`pb-4 border-b-2 font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'accounts'
              ? 'border-emerald-600 text-slate-900'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          👤 Accès Membres
        </button>
        <button
          onClick={() => setActiveTab('testimonials')}
          className={`pb-4 border-b-2 font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'testimonials'
              ? 'border-emerald-600 text-slate-900'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          💬 Témoignages
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-4 border-b-2 font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'settings'
              ? 'border-emerald-600 text-slate-900'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          ⚙️ Paramètres
        </button>
      </div>

      {/* Main Card */}
      {activeTab === 'team' && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Membres de l'équipe</h2>
            <p className="text-sm text-slate-600 mt-1">{teamMembers.length} membre{teamMembers.length !== 1 ? 's' : ''}</p>
          </div>
          <Button
            onClick={openNewDialog}
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 px-6 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Ajouter un membre
          </Button>
        </div>

        <div className="p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full mb-4"
              />
              <p className="text-slate-600 font-medium">Chargement des membres...</p>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 mb-6 font-medium">Aucun membre ajouté</p>
              <Button
                onClick={openNewDialog}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Ajouter le premier membre
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group"
                >
                  {/* Order Buttons */}
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => moveMember(member, 'up')}
                      disabled={index === 0}
                      className="p-1.5 hover:bg-emerald-100 rounded disabled:opacity-20 transition-colors"
                      title="Monter"
                    >
                      <ArrowUp className="w-4 h-4 text-emerald-600" />
                    </button>
                    <button
                      onClick={() => moveMember(member, 'down')}
                      disabled={index === teamMembers.length - 1}
                      className="p-1.5 hover:bg-emerald-100 rounded disabled:opacity-20 transition-colors"
                      title="Descendre"
                    >
                      <ArrowDown className="w-4 h-4 text-emerald-600" />
                    </button>
                  </div>

                  {/* Photo */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    {member.photo_url ? (
                      <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                    ) : member.image ? (
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                      <span className="text-white font-bold text-2xl">
                        {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 text-lg">{member.name}</h3>
                      {member.is_founder && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                          Fondateur
                        </span>
                      )}
                    </div>
                    <p className="text-emerald-600 font-semibold text-sm">{member.title}</p>
                    {member.bio && (
                      <p className="text-slate-600 text-sm mt-2 line-clamp-1">{member.bio}</p>
                    )}
                    {(member.specialties?.length > 0 || member.certifications?.length > 0) && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {member.specialties?.slice(0, 2).map((exp, i) => (
                          <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                            {exp}
                          </span>
                        ))}
                        {member.specialties?.length > 2 && (
                          <span className="px-2 py-0.5 text-slate-600 text-xs">+{member.specialties.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => openEditDialog(member)}
                      className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-emerald-600"
                      title="Modifier"
                    >
                      <Edit2 className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setDeleteConfirm(member)}
                      className="p-2.5 hover:bg-red-50 rounded-lg transition-colors text-red-600 hover:text-red-700"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={isEditingDialog} onOpenChange={setIsEditingDialog}>
        <DialogContent className="w-[600px] h-[792px] overflow-y-auto p-0 gap-0">
          <DialogHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 border-b border-emerald-200 sticky top-0 z-10">
            <DialogTitle className="text-2xl text-slate-900">
              {editingMember?.id ? '✏️ Modifier le membre' : '➕ Ajouter un nouveau membre'}
            </DialogTitle>
          </DialogHeader>

          {editingMember && (
            <div className="space-y-6 p-6">
              {/* Photo Upload Section */}
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <Label className="font-bold text-slate-900 mb-4 block text-lg">📸 Photo de profil</Label>
                <div className="flex gap-8 items-center">
                  {photoPreview && (
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="w-32 h-32 rounded-lg overflow-hidden shadow-md border-2 border-emerald-200 flex-shrink-0"
                    >
                      <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                    </motion.div>
                  )}
                  <label className="cursor-pointer flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <div className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2 font-semibold justify-center w-full">
                      <Upload className="w-5 h-5" />
                      {photoPreview ? 'Changer la photo' : 'Uploader une photo'}
                    </div>
                  </label>
                </div>
              </div>

              {/* Basic Info */}
              <div>
                <Label className="font-bold text-slate-900 mb-4 block text-lg">👤 Informations personnelles</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Nom complet *</label>
                    <Input
                      value={editingMember.name}
                      onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                      placeholder="Ex: Emmanuel Foka"
                      className="border-2 border-slate-200 focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Fonction *</label>
                    <Input
                      value={editingMember.title}
                      onChange={(e) => setEditingMember({...editingMember, title: e.target.value})}
                      placeholder="Ex: Fondateur & PDG"
                      className="border-2 border-slate-200 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 mb-1 block">📝 Description</label>
                <Textarea
                  value={editingMember.bio || ''}
                  onChange={(e) => setEditingMember({...editingMember, bio: e.target.value})}
                  placeholder="Courte biographie ou présentation..."
                  rows={4}
                  className="border-2 border-slate-200 focus:border-emerald-500"
                />
              </div>

              {/* Contact Info */}
              <div>
                <Label className="font-bold text-slate-900 mb-4 block text-lg">📞 Informations de contact</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Email</label>
                    <Input
                      type="email"
                      value={editingMember.email || ''}
                      onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}
                      placeholder="email@example.com"
                      className="border-2 border-slate-200 focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Téléphone</label>
                    <Input
                      value={editingMember.phone || ''}
                      onChange={(e) => setEditingMember({...editingMember, phone: e.target.value})}
                      placeholder="+237 6XX XXX XXX"
                      className="border-2 border-slate-200 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* LinkedIn */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">LinkedIn</label>
                <Input
                  value={editingMember.linked_in || ''}
                  onChange={(e) => setEditingMember({...editingMember, linked_in: e.target.value})}
                  placeholder="https://linkedin.com/in/..."
                  className="border-2 border-slate-200 focus:border-emerald-500"
                />
              </div>

              {/* Expertise */}
              <div>
                <Label className="font-bold text-slate-900 mb-4 block text-lg">🎯 Expertise & Compétences</Label>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newExpertise}
                    onChange={(e) => setNewExpertise(e.target.value)}
                    placeholder="Ex: React, Node.js, Leadership"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                    className="border-2 border-slate-200 focus:border-emerald-500"
                  />
                  <Button
                    onClick={addExpertise}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {(editingMember.specialties || []).map((exp, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.8 }}
                      className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm"
                    >
                      {exp}
                      <button onClick={() => removeExpertise(i)} className="hover:opacity-70">
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div>
                <Label className="font-bold text-slate-900 mb-4 block text-lg">🏆 Réalisations & Succès</Label>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    placeholder="Ex: 10 ans d'expérience, Prix innovation 2024"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                    className="border-2 border-slate-200 focus:border-emerald-500"
                  />
                  <Button
                    onClick={addAchievement}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {(editingMember.certifications || []).map((ach, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.8 }}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm"
                    >
                      {ach}
                      <button onClick={() => removeAchievement(i)} className="hover:opacity-70">
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Visibility Toggle */}
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 flex items-center gap-3">
                <Switch
                  checked={editingMember.is_visible !== false}
                  onCheckedChange={(checked) => setEditingMember({...editingMember, is_visible: checked})}
                />
                <div>
                  <Label className="font-semibold text-slate-900">Visible sur le site</Label>
                  <p className="text-xs text-slate-600">Activer pour afficher ce membre sur le site public</p>
                </div>
              </div>

              {/* Founder Toggle */}
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 flex items-center gap-3">
                <Switch
                  checked={editingMember.is_founder !== false}
                  onCheckedChange={(checked) => setEditingMember({...editingMember, is_founder: checked})}
                />
                <div>
                  <Label className="font-semibold text-slate-900">Fondateur</Label>
                  <p className="text-xs text-slate-600">Marquer comme fondateur de l'entreprise</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={() => setIsEditingDialog(false)}
                  className="px-6 border-2 border-slate-300 hover:border-slate-400"
                >
                  ❌ Annuler
                </Button>
                <Button
                  onClick={handleSave}
                disabled={!editingMember.name?.trim() || !editingMember.title?.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  Enregistrer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      )}

      {/* Accès Membres Tab */}
      {activeTab === 'accounts' && (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <MemberAccountsPage />
      </div>
      )}

      {/* Delete Confirmation - Outside tabs so it always works */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="border-2 border-red-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 text-xl">Supprimer ce membre ?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              <span className="font-semibold text-slate-900">{deleteConfirm?.name}</span> sera supprimé définitivement. Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2 border-slate-300">Non, garder</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteConfirm.id)}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
