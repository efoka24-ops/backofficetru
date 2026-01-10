import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Save, X, FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const pages = ['About', 'Contact', 'Home', 'Services', 'Solutions', 'Team'];

export default function PageContentManager() {
  const [isEditing, setIsEditing] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedPage, setSelectedPage] = useState('all');
  const queryClient = useQueryClient();

  const { data: contents = [], isLoading } = useQuery({
    queryKey: ['pageContents'],
    queryFn: () => base44.entities.PageContent.list(),
  });

  const filteredContents = selectedPage === 'all' ? contents : contents.filter(c => c.page_name === selectedPage);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PageContent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageContents'] });
      setIsEditing(false);
      setEditingContent(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PageContent.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageContents'] });
      setIsEditing(false);
      setEditingContent(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PageContent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageContents'] });
      setDeleteConfirm(null);
    },
  });

  const handleSave = () => {
    if (editingContent.id) {
      updateMutation.mutate({ id: editingContent.id, data: editingContent });
    } else {
      createMutation.mutate(editingContent);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setEditingContent({ ...editingContent, image_url: file_url });
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="admin-card">
        <div className="admin-card-header flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <FileText className="w-6 h-6 text-pink-600" />
                Contenus des pages
              </h2>
              <p className="text-sm text-slate-600 mt-1">Gérez le contenu de chaque page</p>
            </div>
            <Select value={selectedPage} onValueChange={setSelectedPage}>
              <SelectTrigger className="w-40 border-slate-300"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les pages</SelectItem>
                {pages.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={() => { 
              setEditingContent({ page_name: 'About', section_key: '', title: '', content: '', image_url: '', is_visible: true }); 
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
          ) : filteredContents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">Aucun contenu pour cette page</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredContents.map((content) => (
                <motion.div key={content.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-4 p-4 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200 hover:border-pink-300 hover:shadow-md transition-all group">
                  {content.image_url && <img src={content.image_url} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="admin-badge-purple text-xs">{content.page_name}</span>
                      <span className="admin-badge-blue text-xs">{content.section_key}</span>
                      {!content.is_visible && <span className="admin-badge-purple">Masqué</span>}
                    </div>
                    <h3 className="font-semibold text-slate-900 text-lg">{content.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2">{content.content}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-slate-100" onClick={() => { setEditingContent(content); setIsEditing(true); }}><Pencil className="w-5 h-5" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50" onClick={() => setDeleteConfirm(content)}><Trash2 className="w-5 h-5" /></Button>
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
            <DialogTitle className="text-2xl text-slate-900">{editingContent?.id ? 'Modifier' : 'Ajouter'} un contenu</DialogTitle>
          </DialogHeader>
          {editingContent && (
            <div className="space-y-6 pt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="form-group">
                  <Label className="form-label">Page *</Label>
                  <Select value={editingContent.page_name} onValueChange={(value) => setEditingContent({...editingContent, page_name: value})}>
                    <SelectTrigger className="border-slate-300"><SelectValue /></SelectTrigger>
                    <SelectContent>{pages.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="form-group">
                  <Label className="form-label">Clé de section *</Label>
                  <Input value={editingContent.section_key} onChange={(e) => setEditingContent({...editingContent, section_key: e.target.value})} placeholder="hero, mission, etc." className="admin-input" />
                </div>
              </div>
              <div className="form-group">
                <Label className="form-label">Titre</Label>
                <Input value={editingContent.title || ''} onChange={(e) => setEditingContent({...editingContent, title: e.target.value})} className="admin-input" />
              </div>
              <div className="form-group">
                <Label className="form-label">Contenu</Label>
                <Textarea value={editingContent.content || ''} onChange={(e) => setEditingContent({...editingContent, content: e.target.value})} rows={5} className="admin-input" />
              </div>
              <div className="form-group">
                <Label className="form-label">Image</Label>
                <div className="flex items-center gap-4">
                  {editingContent.image_url && <img src={editingContent.image_url} alt="" className="w-24 h-24 rounded-lg object-cover" />}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="content-image-upload" />
                  <label htmlFor="content-image-upload">
                    <Button variant="outline" asChild className="border-slate-300 cursor-pointer"><span><Upload className="w-4 h-4 mr-2" />Image</span></Button>
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <Switch checked={editingContent.is_visible !== false} onCheckedChange={(checked) => setEditingContent({...editingContent, is_visible: checked})} />
                <Label className="text-slate-900 font-medium">Visible sur le site</Label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button variant="outline" onClick={() => setIsEditing(false)}>Annuler</Button>
                <Button onClick={handleSave} disabled={!editingContent.page_name || !editingContent.section_key} className="admin-button-primary"><Save className="w-4 h-4" /> Enregistrer</Button>
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
