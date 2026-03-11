import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Save, X, Briefcase, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function ServiceManager() {
  const [isEditing, setIsEditing] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [newFeature, setNewFeature] = useState('');
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list('display_order'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Service.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setIsEditing(false);
      setEditingService(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Service.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setIsEditing(false);
      setEditingService(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Service.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setDeleteConfirm(null);
    },
  });

  const handleSave = () => {
    if (editingService.id) {
      updateMutation.mutate({ id: editingService.id, data: editingService });
    } else {
      createMutation.mutate({ ...editingService, display_order: services.length });
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setEditingService({
        ...editingService,
        features: [...(editingService.features || []), newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setEditingService({
      ...editingService,
      features: editingService.features.filter((_, i) => i !== index)
    });
  };

  const moveService = async (service, direction) => {
    const currentIndex = services.findIndex(s => s.id === service.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= services.length) return;
    const otherService = services[newIndex];
    await updateMutation.mutateAsync({ id: service.id, data: { display_order: newIndex } });
    await updateMutation.mutateAsync({ id: otherService.id, data: { display_order: currentIndex } });
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="admin-card">
        <div className="admin-card-header flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Briefcase className="w-6 h-6 text-emerald-600" />
              Services
            </h2>
            <p className="text-sm text-slate-600 mt-1">Gérez vos offres de services</p>
          </div>
          <Button 
            onClick={() => { 
              setEditingService({ title: '', description: '', icon: '🎯', features: [], objective: '', is_visible: true }); 
              setIsEditing(true); 
            }} 
            className="admin-button-primary"
          >
            <Plus className="w-5 h-5" /> Ajouter
          </Button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="admin-spinner mb-4" />
              <p className="text-slate-600 font-medium">Chargement...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">Aucun service ajouté</p>
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((service, index) => (
                <motion.div key={service.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group">
                  <div className="flex flex-col gap-1">
                    <button onClick={() => moveService(service, 'up')} disabled={index === 0} className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-20 transition-colors"><ArrowUp className="w-4 h-4 text-slate-600" /></button>
                    <button onClick={() => moveService(service, 'down')} disabled={index === services.length - 1} className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-20 transition-colors"><ArrowDown className="w-4 h-4 text-slate-600" /></button>
                  </div>
                  <div className="w-12 h-12 rounded-lg gradient-emerald flex items-center justify-center text-2xl flex-shrink-0 group-hover:shadow-lg transition-shadow">{service.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 text-lg">{service.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-1">{service.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {service.features?.slice(0, 2).map((feature, idx) => (
                        <span key={idx} className="admin-badge-blue text-xs">{feature.slice(0, 12)}</span>
                      ))}
                      {service.features?.length > 2 && <span className="text-xs text-slate-500">+{service.features.length - 2}</span>}
                    </div>
                  </div>
                  {!service.is_visible && <span className="admin-badge-purple">Masqué</span>}
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-slate-100" onClick={() => { setEditingService(service); setIsEditing(true); }}><Pencil className="w-5 h-5" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50" onClick={() => setDeleteConfirm(service)}><Trash2 className="w-5 h-5" /></Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl border border-slate-200">
          <DialogHeader className="border-b border-slate-200 pb-4">
            <DialogTitle className="text-2xl text-slate-900">{editingService?.id ? 'Modifier' : 'Ajouter'} un service</DialogTitle>
          </DialogHeader>
          {editingService && (
            <div className="space-y-6 pt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="form-group">
                  <Label className="form-label">Titre *</Label>
                  <Input value={editingService.title} onChange={(e) => setEditingService({...editingService, title: e.target.value})} className="admin-input" />
                </div>
                <div className="form-group">
                  <Label className="form-label">Icône</Label>
                  <Input value={editingService.icon || ''} onChange={(e) => setEditingService({...editingService, icon: e.target.value})} placeholder="🎯" className="admin-input" />
                </div>
              </div>
              <div className="form-group">
                <Label className="form-label">Description *</Label>
                <Textarea value={editingService.description} onChange={(e) => setEditingService({...editingService, description: e.target.value})} rows={3} className="admin-input" />
              </div>
              <div className="form-group">
                <Label className="form-label">Objectif</Label>
                <Input value={editingService.objective || ''} onChange={(e) => setEditingService({...editingService, objective: e.target.value})} className="admin-input" />
              </div>
              <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <Label className="form-label">Fonctionnalités</Label>
                <div className="flex gap-2">
                  <Input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} placeholder="Ajouter" onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} className="admin-input" />
                  <Button type="button" onClick={addFeature} className="admin-button-primary"><Plus className="w-4 h-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(editingService.features || []).map((feat, i) => (
                    <span key={i} className="admin-badge-blue"><button onClick={() => removeFeature(i)} className="ml-1"><X className="w-3 h-3 inline" /></button> {feat}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <Switch checked={editingService.is_visible !== false} onCheckedChange={(checked) => setEditingService({...editingService, is_visible: checked})} />
                <Label className="text-slate-900 font-medium">Visible sur le site</Label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button variant="outline" onClick={() => setIsEditing(false)}>Annuler</Button>
                <Button onClick={handleSave} disabled={!editingService.title} className="admin-button-primary"><Save className="w-4 h-4" /> Enregistrer</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-white rounded-xl border border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-slate-900">Supprimer ?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">{deleteConfirm?.title} sera supprimé définitivement.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(deleteConfirm.id)} className="admin-button-danger">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
