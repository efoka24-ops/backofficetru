import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Save, X, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function SolutionManager() {
  const [isEditing, setIsEditing] = useState(false);
  const [editingSolution, setEditingSolution] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [newBenefit, setNewBenefit] = useState('');
  const queryClient = useQueryClient();

  const { data: solutions = [], isLoading } = useQuery({
    queryKey: ['solutions'],
    queryFn: () => base44.entities.Solution.list('display_order'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Solution.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solutions'] });
      setIsEditing(false);
      setEditingSolution(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Solution.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solutions'] });
      setIsEditing(false);
      setEditingSolution(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Solution.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solutions'] });
      setDeleteConfirm(null);
    },
  });

  const handleSave = () => {
    if (editingSolution.id) {
      updateMutation.mutate({ id: editingSolution.id, data: editingSolution });
    } else {
      createMutation.mutate({ ...editingSolution, display_order: solutions.length });
    }
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setEditingSolution({
        ...editingSolution,
        benefits: [...(editingSolution.benefits || []), newBenefit.trim()]
      });
      setNewBenefit('');
    }
  };

  const removeBenefit = (index) => {
    setEditingSolution({
      ...editingSolution,
      benefits: editingSolution.benefits.filter((_, i) => i !== index)
    });
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="admin-card">
        <div className="admin-card-header flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-amber-500" />
              Solutions
            </h2>
            <p className="text-sm text-slate-600 mt-1">Gérez vos solutions innovantes</p>
          </div>
          <Button 
            onClick={() => { 
              setEditingSolution({ name: '', tagline: '', emoji: '💡', description: '', benefits: [], highlight: '', is_visible: true }); 
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
          ) : solutions.length === 0 ? (
            <div className="text-center py-12">
              <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">Aucune solution ajoutée</p>
            </div>
          ) : (
            <div className="space-y-3">
              {solutions.map((solution) => (
                <motion.div key={solution.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl flex-shrink-0 group-hover:shadow-lg transition-shadow">{solution.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 text-lg">{solution.name}</h3>
                    <p className="text-sm text-slate-600 line-clamp-1">{solution.tagline}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {solution.benefits?.slice(0, 2).map((benefit, idx) => (
                        <span key={idx} className="admin-badge-blue text-xs">{benefit.slice(0, 12)}</span>
                      ))}
                      {solution.benefits?.length > 2 && <span className="text-xs text-slate-500">+{solution.benefits.length - 2}</span>}
                    </div>
                  </div>
                  {!solution.is_visible && <span className="admin-badge-purple">Masqué</span>}
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-slate-100" onClick={() => { setEditingSolution(solution); setIsEditing(true); }}><Pencil className="w-5 h-5" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50" onClick={() => setDeleteConfirm(solution)}><Trash2 className="w-5 h-5" /></Button>
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
            <DialogTitle className="text-2xl text-slate-900">{editingSolution?.id ? 'Modifier' : 'Ajouter'} une solution</DialogTitle>
          </DialogHeader>
          {editingSolution && (
            <div className="space-y-6 pt-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="form-group">
                  <Label className="form-label">Nom *</Label>
                  <Input value={editingSolution.name} onChange={(e) => setEditingSolution({...editingSolution, name: e.target.value})} className="admin-input" />
                </div>
                <div className="form-group">
                  <Label className="form-label">Tagline *</Label>
                  <Input value={editingSolution.tagline} onChange={(e) => setEditingSolution({...editingSolution, tagline: e.target.value})} className="admin-input" />
                </div>
                <div className="form-group">
                  <Label className="form-label">Emoji</Label>
                  <Input value={editingSolution.emoji || ''} onChange={(e) => setEditingSolution({...editingSolution, emoji: e.target.value})} placeholder="💡" className="admin-input" />
                </div>
              </div>
              <div className="form-group">
                <Label className="form-label">Description</Label>
                <Textarea value={editingSolution.description || ''} onChange={(e) => setEditingSolution({...editingSolution, description: e.target.value})} rows={3} className="admin-input" />
              </div>
              <div className="form-group">
                <Label className="form-label">Highlight</Label>
                <Input value={editingSolution.highlight || ''} onChange={(e) => setEditingSolution({...editingSolution, highlight: e.target.value})} className="admin-input" />
              </div>
              <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <Label className="form-label">Avantages</Label>
                <div className="flex gap-2">
                  <Input value={newBenefit} onChange={(e) => setNewBenefit(e.target.value)} placeholder="Ajouter" onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())} className="admin-input" />
                  <Button type="button" onClick={addBenefit} className="admin-button-primary"><Plus className="w-4 h-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(editingSolution.benefits || []).map((benefit, i) => (
                    <span key={i} className="admin-badge-blue"><button onClick={() => removeBenefit(i)} className="ml-1"><X className="w-3 h-3 inline" /></button> {benefit}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <Switch checked={editingSolution.is_visible !== false} onCheckedChange={(checked) => setEditingSolution({...editingSolution, is_visible: checked})} />
                <Label className="text-slate-900 font-medium">Visible sur le site</Label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button variant="outline" onClick={() => setIsEditing(false)}>Annuler</Button>
                <Button onClick={handleSave} disabled={!editingSolution.name} className="admin-button-primary"><Save className="w-4 h-4" /> Enregistrer</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-white rounded-xl border border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-slate-900">Supprimer ?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">{deleteConfirm?.name} sera supprimée définitivement.</AlertDialogDescription>
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
