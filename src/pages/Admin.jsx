import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Debug: Log that base44 imported successfully
console.log('✅ Admin.jsx: base44 imported successfully:', base44);
import { motion } from 'framer-motion';
import { 
  Users, Settings, Plus, Pencil, Trash2, Save, X, Upload, Eye, EyeOff, 
  ArrowUp, ArrowDown, MessageSquare, Star, Briefcase, Lightbulb, FileText 
} from 'lucide-react';
import ServiceManager from '../components/admin/ServiceManager';
import SolutionManager from '../components/admin/SolutionManager';
import PageContentManager from '../components/admin/PageContentManager';
import MemberAccountsPage from './MemberAccountsPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Admin() {
  const [activeTab, setActiveTab] = useState('team');
  const [isEditing, setIsEditing] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [isEditingTestimonial, setIsEditingTestimonial] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [newExpertise, setNewExpertise] = useState('');
  const [newAchievement, setNewAchievement] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const queryClient = useQueryClient();
  
  // Use constants for query keys to prevent minification issues
  const QUERY_KEYS = {
    TEAM: 'team_members_key_v1',
    TESTIMONIALS: 'testimonials_key_v1',
    SETTINGS: 'site_settings_key_v1',
  };

  const { data: teamMembers = [], isLoading: loadingMembers } = useQuery({
    queryKey: [QUERY_KEYS.TEAM],
    queryFn: () => base44.entities.TeamMember.list('display_order'),
  });

  const { data: testimonials = [], isLoading: loadingTestimonials } = useQuery({
    queryKey: [QUERY_KEYS.TESTIMONIALS],
    queryFn: () => base44.entities.Testimonial.list('display_order'),
  });

  const { data: settingsArray = [], isLoading: loadingSettings, error: settingsError } = useQuery({
    queryKey: [QUERY_KEYS.SETTINGS],
    queryFn: async () => {
      try {
        console.log('🔧 Fetching settings from:', `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/settings`);
        const result = await base44.entities.SiteSettings.list();
        console.log('✅ Settings fetched successfully:', result);
        return result;
      } catch (err) {
        console.error('❌ Error fetching settings:', err);
        throw err;
      }
    },
  });

  const settings = settingsArray[0] || {
    company_name: 'TRU GROUP',
    slogan: 'Au cœur de l\'innovation',
    phone: '+237 691 22 71 49',
    email: 'info@trugroup.cm',
    address: 'Maroua, Cameroun',
    primary_color: '#22c55e',
    secondary_color: '#16a34a'
  };

  const [editedSettings, setEditedSettings] = useState(settings);

  React.useEffect(() => {
    if (settingsArray[0]) {
      setEditedSettings(settingsArray[0]);
    }
  }, [settingsArray]);

  const createMemberMutation = useMutation({
    mutationFn: (data) => base44.entities.TeamMember.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAM] });
      setIsEditing(false);
      setEditingMember(null);
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TeamMember.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAM] });
      setIsEditing(false);
      setEditingMember(null);
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id) => base44.entities.TeamMember.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEAM] });
      setDeleteConfirm(null);
    },
  });

  const createTestimonialMutation = useMutation({
    mutationFn: (data) => base44.entities.Testimonial.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TESTIMONIALS] });
      setIsEditingTestimonial(false);
      setEditingTestimonial(null);
    },
  });

  const updateTestimonialMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Testimonial.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TESTIMONIALS] });
      setIsEditingTestimonial(false);
      setEditingTestimonial(null);
    },
  });

  const deleteTestimonialMutation = useMutation({
    mutationFn: (id) => base44.entities.Testimonial.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TESTIMONIALS] });
      setDeleteConfirm(null);
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (data) => {
      try {
        // Get the latest settings from the query
        const currentSettings = queryClient.getQueryData([QUERY_KEYS.SETTINGS]);
        if (currentSettings && currentSettings[0]) {
          return base44.entities.SiteSettings.update(currentSettings[0].id, data);
        } else {
          return base44.entities.SiteSettings.create(data);
        }
      } catch (err) {
        console.error('❌ Error saving settings:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SETTINGS] });
    },
  });

  const handleSaveMember = () => {
    if (editingMember.id) {
      updateMemberMutation.mutate({ id: editingMember.id, data: editingMember });
    } else {
      createMemberMutation.mutate({
        ...editingMember,
        display_order: teamMembers.length
      });
    }
  };

  const handleSaveTestimonial = () => {
    if (editingTestimonial.id) {
      updateTestimonialMutation.mutate({ id: editingTestimonial.id, data: editingTestimonial });
    } else {
      createTestimonialMutation.mutate({
        ...editingTestimonial,
        display_order: testimonials.length
      });
    }
  };

  const handlePhotoUpload = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (type === 'member') {
        setEditingMember({ ...editingMember, photo_url: file_url });
      } else if (type === 'testimonial') {
        setEditingTestimonial({ ...editingTestimonial, photo_url: file_url });
      }
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setEditedSettings({ ...editedSettings, logo_url: file_url });
    }
  };

  const addExpertise = () => {
    if (newExpertise.trim()) {
      setEditingMember({
        ...editingMember,
        expertise: [...(editingMember.expertise || []), newExpertise.trim()]
      });
      setNewExpertise('');
    }
  };

  const removeExpertise = (index) => {
    setEditingMember({
      ...editingMember,
      expertise: editingMember.expertise.filter((_, i) => i !== index)
    });
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setEditingMember({
        ...editingMember,
        achievements: [...(editingMember.achievements || []), newAchievement.trim()]
      });
      setNewAchievement('');
    }
  };

  const removeAchievement = (index) => {
    setEditingMember({
      ...editingMember,
      achievements: editingMember.achievements.filter((_, i) => i !== index)
    });
  };

  const moveMember = async (member, direction) => {
    const currentIndex = teamMembers.findIndex(m => m.id === member.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= teamMembers.length) return;

    const otherMember = teamMembers[newIndex];
    
    await updateMemberMutation.mutateAsync({ 
      id: member.id, 
      data: { display_order: newIndex } 
    });
    await updateMemberMutation.mutateAsync({ 
      id: otherMember.id, 
      data: { display_order: currentIndex } 
    });
  };

  const handleDelete = () => {
    if (deleteType === 'member') {
      deleteMemberMutation.mutate(deleteConfirm.id);
    } else if (deleteType === 'testimonial') {
      deleteTestimonialMutation.mutate(deleteConfirm.id);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-black mb-2">
            Administration
          </h1>
          <p className="text-lg text-gray-600 font-medium">Gérez le contenu de votre site TRU GROUP</p>
        </div>

        {/* Error Messages */}
        {settingsError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-semibold mb-2">⚠️ Erreur de chargement</h3>
            <p className="text-red-700 text-sm">{settingsError?.message || 'Une erreur est survenue lors du chargement des paramètres'}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-4 gap-0 p-0 bg-white border-b border-gray-300 rounded-none">
            <TabsTrigger value="team" className="flex items-center justify-center gap-2 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:text-gray-600 hover:text-black pb-3">
              <Users className="w-5 h-5" />
              <span>Équipe</span>
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center justify-center gap-2 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:text-gray-600 hover:text-black pb-3">
              <Users className="w-5 h-5" />
              <span>Accès Membres</span>
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="flex items-center justify-center gap-2 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:text-gray-600 hover:text-black pb-3">
              <MessageSquare className="w-5 h-5" />
              <span>Témoignages</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center justify-center gap-2 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:text-gray-600 hover:text-black pb-3">
              <Settings className="w-5 h-5" />
              <span>Paramètres</span>
            </TabsTrigger>
          </TabsList>

          {/* Team Tab */}
          <TabsContent value="team">
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-gray-200">
                <div>
                  <CardTitle className="text-2xl text-black">Membres de l'équipe</CardTitle>
                </div>
                <Button 
                  onClick={() => {
                    setEditingMember({
                      name: '',
                      role: '',
                      description: '',
                      photo_url: '',
                      email: '',
                      phone: '',
                      linkedin: '',
                      expertise: [],
                      achievements: [],
                      is_founder: false,
                      is_visible: true
                    });
                    setIsEditing(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Ajouter un membre
                </Button>
              </CardHeader>
              <CardContent className="pt-8">
                {loadingMembers ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-12 h-12 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">Chargement des membres...</p>
                  </div>
                ) : teamMembers.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-gray-600">Aucun membre ajouté. Cliquez sur "Ajouter" pour commencer.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teamMembers.map((member, index) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all"
                      >
                        <div className="flex flex-col gap-1">
                          <button 
                            onClick={() => moveMember(member, 'up')}
                            disabled={index === 0}
                            className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                            title="Monter"
                          >
                            <ArrowUp className="w-4 h-4 text-gray-600" />
                          </button>
                          <button 
                            onClick={() => moveMember(member, 'down')}
                            disabled={index === teamMembers.length - 1}
                            className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                            title="Descendre"
                          >
                            <ArrowDown className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>

                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                          {member.photo_url ? (
                            <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-bold text-lg">
                              {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-black text-lg">{member.name}</h3>
                          <p className="text-emerald-600 font-medium text-sm">{member.role}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingMember(member);
                              setIsEditing(true);
                            }}
                            className="hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-red-50 text-red-600 hover:text-red-700"
                            onClick={() => {
                              setDeleteConfirm(member);
                              setDeleteType('member');
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Member Accounts Tab */}
          <TabsContent value="accounts">
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <CardContent className="pt-8">
                <MemberAccountsPage />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testimonials Tab */}
          <TabsContent value="testimonials">
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-gray-200">
                <div>
                  <CardTitle className="text-2xl text-black">Témoignages clients</CardTitle>
                </div>
                <Button 
                  onClick={() => {
                    setEditingTestimonial({
                      client_name: '',
                      client_role: '',
                      company: '',
                      photo_url: '',
                      testimonial: '',
                      rating: 5,
                      is_visible: true
                    });
                    setIsEditingTestimonial(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Ajouter un témoignage
                </Button>
              </CardHeader>
              <CardContent className="pt-8">
                {loadingTestimonials ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-12 h-12 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">Chargement des témoignages...</p>
                  </div>
                ) : testimonials.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-gray-600">Aucun témoignage ajouté. Cliquez sur "Ajouter" pour commencer.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {testimonials.map((testimonial) => (
                      <motion.div
                        key={testimonial.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                            {testimonial.photo_url ? (
                              <img src={testimonial.photo_url} alt={testimonial.client_name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-white font-bold text-sm">
                                {testimonial.client_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-black">{testimonial.client_name}</h3>
                            </div>
                            <p className="text-emerald-600 font-medium text-sm mb-2">
                              {testimonial.client_role}{testimonial.company && `, ${testimonial.company}`}
                            </p>
                            <p className="text-gray-700 text-sm mb-2">"{testimonial.testimonial}"</p>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingTestimonial(testimonial);
                                setIsEditingTestimonial(true);
                              }}
                              className="hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-red-50 text-red-600 hover:text-red-700"
                              onClick={() => {
                                setDeleteConfirm(testimonial);
                                setDeleteType('testimonial');
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <CardHeader className="pb-6 border-b border-gray-200">
                <CardTitle className="text-2xl text-black">Paramètres du site</CardTitle>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Logo Section */}
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-black mb-4">Logo</h3>
                    <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-20 h-20 rounded-lg bg-black flex items-center justify-center overflow-hidden">
                        {editedSettings.logo_url ? (
                          <img src={editedSettings.logo_url} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-emerald-500 font-bold text-2xl">TG</span>
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label htmlFor="logo-upload">
                          <Button variant="outline" asChild className="border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-700">
                            <span className="cursor-pointer">
                              <Upload className="w-4 h-4 mr-2" />
                              Changer le logo
                            </span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="space-y-2">
                    <Label className="text-black font-semibold">Nom de l'entreprise</Label>
                    <Input
                      value={editedSettings.company_name || ''}
                      onChange={(e) => setEditedSettings({...editedSettings, company_name: e.target.value})}
                      className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-black font-semibold">Slogan</Label>
                    <Input
                      value={editedSettings.slogan || ''}
                      onChange={(e) => setEditedSettings({...editedSettings, slogan: e.target.value})}
                      className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                    />
                  </div>

                  {/* Colors */}
                  <div className="space-y-3">
                    <Label className="text-black font-semibold">Couleur principale</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={editedSettings.primary_color || '#22c55e'}
                        onChange={(e) => setEditedSettings({...editedSettings, primary_color: e.target.value})}
                        className="w-14 h-14 rounded-lg cursor-pointer border-2 border-gray-300"
                      />
                      <Input
                        value={editedSettings.primary_color || '#22c55e'}
                        onChange={(e) => setEditedSettings({...editedSettings, primary_color: e.target.value})}
                        className="flex-1 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-black font-semibold">Couleur secondaire</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={editedSettings.secondary_color || '#16a34a'}
                        onChange={(e) => setEditedSettings({...editedSettings, secondary_color: e.target.value})}
                        className="w-14 h-14 rounded-lg cursor-pointer border-2 border-gray-300"
                      />
                      <Input
                        value={editedSettings.secondary_color || '#16a34a'}
                        onChange={(e) => setEditedSettings({...editedSettings, secondary_color: e.target.value})}
                        className="flex-1 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg font-mono text-sm"
                      />
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2">
                    <Label className="text-black font-semibold">Téléphone</Label>
                    <Input
                      value={editedSettings.phone || ''}
                      onChange={(e) => setEditedSettings({...editedSettings, phone: e.target.value})}
                      className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-black font-semibold">Email</Label>
                    <Input
                      value={editedSettings.email || ''}
                      onChange={(e) => setEditedSettings({...editedSettings, email: e.target.value})}
                      className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-black font-semibold">Adresse</Label>
                    <Input
                      value={editedSettings.address || ''}
                      onChange={(e) => setEditedSettings({...editedSettings, address: e.target.value})}
                      className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                    />
                  </div>

                  {/* Social Links */}
                  <div className="lg:col-span-2 pt-4">
                    <h3 className="text-lg font-semibold text-black mb-4">Réseaux sociaux</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-black font-semibold">Facebook</Label>
                        <Input
                          value={editedSettings.facebook_url || ''}
                          onChange={(e) => setEditedSettings({...editedSettings, facebook_url: e.target.value})}
                          placeholder="https://facebook.com/..."
                          className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-black font-semibold">LinkedIn</Label>
                        <Input
                          value={editedSettings.linkedin_url || ''}
                          onChange={(e) => setEditedSettings({...editedSettings, linkedin_url: e.target.value})}
                          placeholder="https://linkedin.com/..."
                          className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-black font-semibold">Twitter</Label>
                        <Input
                          value={editedSettings.twitter_url || ''}
                          onChange={(e) => setEditedSettings({...editedSettings, twitter_url: e.target.value})}
                          placeholder="https://twitter.com/..."
                          className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="lg:col-span-2 flex justify-end pt-6 border-t border-gray-200">
                    <Button 
                      onClick={() => saveSettingsMutation.mutate(editedSettings)}
                      disabled={saveSettingsMutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {saveSettingsMutation.isPending ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Enregistrement...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Save className="w-4 h-4" />
                          Enregistrer
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Member Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader className="border-b border-slate-200 pb-4">
            <DialogTitle className="text-2xl text-slate-900">
              {editingMember?.id ? 'Modifier le membre' : 'Ajouter un membre'}
            </DialogTitle>
          </DialogHeader>
          
          {editingMember && (
            <div className="space-y-6 pt-4">
              {/* Photo Section */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center overflow-hidden shadow-md flex-shrink-0">
                  {editingMember.photo_url ? (
                    <img src={editingMember.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-2xl">
                      {editingMember.name ? editingMember.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-2">Photo de profil</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'member')}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload">
                    <Button variant="outline" asChild className="border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-700">
                      <span className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Changer la photo
                      </span>
                    </Button>
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-slate-900">Nom complet *</Label>
                  <Input
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                    placeholder="Nom et prénom"
                    className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-slate-900">Poste *</Label>
                  <Input
                    value={editingMember.role}
                    onChange={(e) => setEditingMember({...editingMember, role: e.target.value})}
                    placeholder="Ex: Directeur Technique"
                    className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-slate-900">Description</Label>
                <Textarea
                  value={editingMember.description || ''}
                  onChange={(e) => setEditingMember({...editingMember, description: e.target.value})}
                  placeholder="Bio ou description..."
                  rows={3}
                  className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-slate-900">Email</Label>
                  <Input
                    type="email"
                    value={editingMember.email || ''}
                    onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}
                    className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-slate-900">Téléphone</Label>
                  <Input
                    value={editingMember.phone || ''}
                    onChange={(e) => setEditingMember({...editingMember, phone: e.target.value})}
                    className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-slate-900">LinkedIn</Label>
                  <Input
                    value={editingMember.linkedin || ''}
                    onChange={(e) => setEditingMember({...editingMember, linkedin: e.target.value})}
                    className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Expertise */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <Label className="font-semibold text-slate-900">Expertises</Label>
                <div className="flex gap-2">
                  <Input
                    value={newExpertise}
                    onChange={(e) => setNewExpertise(e.target.value)}
                    placeholder="Ajouter une expertise"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                    className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <Button type="button" onClick={addExpertise} variant="outline" className="border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-700">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(editingMember.expertise || []).map((exp, index) => (
                    <span key={index} className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                      {exp}
                      <button onClick={() => removeExpertise(index)} className="hover:text-emerald-900">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <Label className="font-semibold text-slate-900">Prix & Certifications</Label>
                <div className="flex gap-2">
                  <Input
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    placeholder="Ajouter un prix ou certification"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                    className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <Button type="button" onClick={addAchievement} variant="outline" className="border-amber-300 hover:border-amber-500 hover:bg-amber-50 text-amber-700">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(editingMember.achievements || []).map((ach, index) => (
                    <span key={index} className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                      🏆 {ach}
                      <button onClick={() => removeAchievement(index)} className="hover:text-amber-900">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={editingMember.is_founder || false}
                    onCheckedChange={(checked) => setEditingMember({...editingMember, is_founder: checked})}
                  />
                  <Label className="text-slate-900 font-medium cursor-pointer">Fondateur</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={editingMember.is_visible !== false}
                    onCheckedChange={(checked) => setEditingMember({...editingMember, is_visible: checked})}
                  />
                  <Label className="text-slate-900 font-medium cursor-pointer">Visible sur le site</Label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button variant="outline" onClick={() => setIsEditing(false)} className="border-slate-300 hover:border-slate-400">
                  Annuler
                </Button>
                <Button 
                  onClick={handleSaveMember}
                  disabled={!editingMember.name || !editingMember.role}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Testimonial Dialog */}
      <Dialog open={isEditingTestimonial} onOpenChange={setIsEditingTestimonial}>
        <DialogContent className="max-w-xl bg-white">
          <DialogHeader className="border-b border-slate-200 pb-4">
            <DialogTitle className="text-2xl text-slate-900">
              {editingTestimonial?.id ? 'Modifier le témoignage' : 'Ajouter un témoignage'}
            </DialogTitle>
          </DialogHeader>
          
          {editingTestimonial && (
            <div className="space-y-6 pt-4">
              {/* Photo */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-md">
                  {editingTestimonial.photo_url ? (
                    <img src={editingTestimonial.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold">
                      {editingTestimonial.client_name ? editingTestimonial.client_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-2">Photo du client</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'testimonial')}
                    className="hidden"
                    id="testimonial-photo-upload"
                  />
                  <label htmlFor="testimonial-photo-upload">
                    <Button variant="outline" asChild className="border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-700">
                      <span className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Changer la photo
                      </span>
                    </Button>
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-slate-900">Nom du client *</Label>
                  <Input
                    value={editingTestimonial.client_name}
                    onChange={(e) => setEditingTestimonial({...editingTestimonial, client_name: e.target.value})}
                    placeholder="Nom complet"
                    className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-slate-900">Poste</Label>
                  <Input
                    value={editingTestimonial.client_role || ''}
                    onChange={(e) => setEditingTestimonial({...editingTestimonial, client_role: e.target.value})}
                    placeholder="Ex: Directeur Général"
                    className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-slate-900">Entreprise</Label>
                  <Input
                    value={editingTestimonial.company || ''}
                    onChange={(e) => setEditingTestimonial({...editingTestimonial, company: e.target.value})}
                    placeholder="Nom de l'entreprise"
                    className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-slate-900">Note</Label>
                  <Select
                    value={String(editingTestimonial.rating || 5)}
                    onValueChange={(value) => setEditingTestimonial({...editingTestimonial, rating: parseInt(value)})}
                  >
                    <SelectTrigger className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 4, 3, 2, 1].map((num) => (
                        <SelectItem key={num} value={String(num)}>
                          <div className="flex items-center gap-1">
                            {[...Array(num)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                            ))}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-slate-900">Témoignage *</Label>
                <Textarea
                  value={editingTestimonial.testimonial}
                  onChange={(e) => setEditingTestimonial({...editingTestimonial, testimonial: e.target.value})}
                  placeholder="Le témoignage du client..."
                  rows={4}
                  className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              {/* Options */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <Switch
                  checked={editingTestimonial.is_visible !== false}
                  onCheckedChange={(checked) => setEditingTestimonial({...editingTestimonial, is_visible: checked})}
                />
                <Label className="text-slate-900 font-medium cursor-pointer">Visible sur le site</Label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <Button variant="outline" onClick={() => setIsEditingTestimonial(false)} className="border-slate-300 hover:border-slate-400">
                  Annuler
                </Button>
                <Button 
                  onClick={handleSaveTestimonial}
                  disabled={!editingTestimonial.client_name || !editingTestimonial.testimonial}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-slate-900">
              {deleteType === 'member' ? 'Supprimer ce membre ?' : 'Supprimer ce témoignage ?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Cette action est irréversible. <span className="font-semibold text-slate-900">{deleteConfirm?.name || deleteConfirm?.client_name}</span> sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-300">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
