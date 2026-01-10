import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Save, 
  RotateCcw,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  Share2,
  Palette,
  FileText
} from 'lucide-react';
import { apiClient } from '@/api/simpleClient';
import { backendClient } from '@/api/backendClient';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteTitle: '',
    slogan: '',
    tagline: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    primary_color: '#22c55e',
    secondary_color: '#16a34a',
    logo_url: '',
    facebook_url: '',
    linkedin_url: '',
    twitter_url: '',
    maintenanceMode: false,
    businessHours: '',
    timezone: 'Africa/Douala',
  });
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const queryClient = useQueryClient();

  // Fetch settings
  const { data: fetchedSettings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      try {
        return await backendClient.getSettings();
      } catch (error) {
        console.error('Erreur chargement settings:', error);
        return null;
      }
    },
    staleTime: 60000,
  });

  useEffect(() => {
    if (fetchedSettings) {
      setSettings(prevSettings => ({
        ...prevSettings,
        ...fetchedSettings
      }));
    }
  }, [fetchedSettings]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      return await backendClient.updateSettings(data);
    },
    onSuccess: (data) => {
      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      
      // Notifier le frontend via événement broadcast
      window.dispatchEvent(new CustomEvent('settingsUpdated', {
        detail: { settings: data }
      }));
      
      // Notifier aussi via apiClient si disponible
      try {
        apiClient.notifyFrontend('update', 'settings', data);
      } catch (e) {
        console.warn('⚠️ Notification apiClient échouée:', e);
      }
      
      // Log
      console.log('✅ Paramètres synchronisés vers frontend:', data.siteTitle);
      showNotification('✅ Paramètres enregistrés avec succès!');
    },
    onError: (error) => {
      showNotification('❌ Erreur: ' + error.message, 'error');
    },
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!settings?.siteTitle || !settings?.email) {
      showNotification('Titre et Email sont obligatoires', 'error');
      return;
    }
    saveMutation.mutate(settings);
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: Globe },
    { id: 'contact', label: 'Coordonnées', icon: Mail },
    { id: 'social', label: 'Réseaux', icon: Share2 },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'hours', label: 'Horaires', icon: Clock },
    { id: 'maintenance', label: 'Maintenance', icon: Settings },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full"
        />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <p className="text-slate-600 text-lg">Erreur lors du chargement des paramètres</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-8 h-8 text-emerald-600" />
            <h1 className="text-4xl font-bold text-slate-900">Paramètres du site</h1>
          </div>
          <p className="text-slate-600 text-lg">Configurez tous les aspects de votre site TRU GROUP</p>
        </motion.div>

        {/* Notification */}
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-xl font-semibold text-lg ${
              notification.type === 'success'
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}
          >
            {notification.message}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tabs Navigation */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex flex-wrap border-b border-slate-200">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-4 py-4 font-semibold text-center transition-all border-b-2 flex items-center justify-center gap-2 ${
                      activeTab === tab.id
                        ? 'text-emerald-600 border-emerald-600 bg-emerald-50'
                        : 'text-slate-600 border-transparent hover:text-slate-900'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="hidden md:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="p-8 space-y-6">
              {/* GENERAL TAB */}
              {activeTab === 'general' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-900">
                        📱 Titre du site *
                      </label>
                      <input
                        type="text"
                        value={settings.siteTitle || ''}
                        onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                        placeholder="TRU GROUP"
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-900">
                        ✨ Slogan
                      </label>
                      <input
                        type="text"
                        value={settings.slogan || ''}
                        onChange={(e) => setSettings({ ...settings, slogan: e.target.value })}
                        placeholder="Transforming Reality Universally"
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-900">
                      📝 Tagline
                    </label>
                    <input
                      type="text"
                      value={settings.tagline || ''}
                      onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                      placeholder="Une brève description"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-900">
                      📖 Description générale
                    </label>
                    <textarea
                      value={settings.description || ''}
                      onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                      placeholder="Décrivez votre entreprise en quelques lignes..."
                      rows="4"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 transition-colors resize-none"
                    />
                  </div>
                </motion.div>
              )}

              {/* CONTACT TAB */}
              {activeTab === 'contact' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-900 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-emerald-600" />
                        Email *
                      </label>
                      <input
                        type="email"
                        value={settings.email || ''}
                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                        placeholder="contact@trugroup.cm"
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-900 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-emerald-600" />
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={settings.phone || ''}
                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                        placeholder="+237 6 XX XX XX XX"
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={settings.address || ''}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      placeholder="Douala, Cameroun"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 transition-colors"
                    />
                  </div>
                </motion.div>
              )}

              {/* SOCIAL TAB */}
              {activeTab === 'social' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-700">Entrez vos profils de réseaux sociaux (laisser vide pour désactiver)</p>
                  </div>
                  
                  {['facebook', 'twitter', 'linkedin', 'instagram', 'whatsapp'].map((social) => (
                    <div key={social}>
                      <label className="block text-sm font-semibold mb-2 text-slate-900 capitalize">
                        {social === 'whatsapp' ? '💬 WhatsApp' : 
                         social === 'facebook' ? '👍 Facebook' :
                         social === 'twitter' ? '𝕏 X (Twitter)' :
                         social === 'linkedin' ? '💼 LinkedIn' :
                         '📸 Instagram'}
                      </label>
                      <input
                        type="url"
                        value={settings.socialMedia?.[social] || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          socialMedia: {
                            ...settings.socialMedia,
                            [social]: e.target.value
                          }
                        })}
                        placeholder={`https://${social}.com/trugroup`}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 transition-colors"
                      />
                    </div>
                  ))}
                </motion.div>
              )}

              {/* DESIGN TAB */}
              {activeTab === 'design' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-900">
                      🎨 Couleur primaire
                    </label>
                    <div className="flex gap-4 items-center">
                      <div className="relative">
                        <input
                          type="color"
                          value={settings.primaryColor || '#10b981'}
                          onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                          className="w-20 h-20 rounded-xl cursor-pointer border-2 border-slate-200"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={settings.primaryColor || '#10b981'}
                          onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                          placeholder="#10b981"
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 font-mono text-sm transition-colors"
                        />
                        <p className="text-xs text-slate-500 mt-2">Couleur dominante du site</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-900">
                      🌊 Couleur secondaire
                    </label>
                    <div className="flex gap-4 items-center">
                      <div className="relative">
                        <input
                          type="color"
                          value={settings.secondaryColor || '#0d9488'}
                          onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                          className="w-20 h-20 rounded-xl cursor-pointer border-2 border-slate-200"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={settings.secondaryColor || '#0d9488'}
                          onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                          placeholder="#0d9488"
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 font-mono text-sm transition-colors"
                        />
                        <p className="text-xs text-slate-500 mt-2">Couleur accentuelle</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-900">
                      ⚫ Couleur d'accent
                    </label>
                    <div className="flex gap-4 items-center">
                      <div className="relative">
                        <input
                          type="color"
                          value={settings.accentColor || '#64748b'}
                          onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                          className="w-20 h-20 rounded-xl cursor-pointer border-2 border-slate-200"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={settings.accentColor || '#64748b'}
                          onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                          placeholder="#64748b"
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 font-mono text-sm transition-colors"
                        />
                        <p className="text-xs text-slate-500 mt-2">Couleur pour les détails</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* HOURS TAB */}
              {activeTab === 'hours' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-amber-700">Format: HH:MM - HH:MM ou "Fermé"</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <div key={day}>
                        <label className="block text-sm font-semibold mb-2 text-slate-900 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-emerald-600" />
                          {day === 'monday' ? 'Lundi' :
                           day === 'tuesday' ? 'Mardi' :
                           day === 'wednesday' ? 'Mercredi' :
                           day === 'thursday' ? 'Jeudi' :
                           day === 'friday' ? 'Vendredi' :
                           day === 'saturday' ? 'Samedi' : 'Dimanche'}
                        </label>
                        <input
                          type="text"
                          value={settings.businessHours?.[day] || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            businessHours: {
                              ...settings.businessHours,
                              [day]: e.target.value
                            }
                          })}
                          placeholder="09:00 - 18:00"
                          className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 text-sm transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* MAINTENANCE TAB */}
              {activeTab === 'maintenance' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={settings.maintenanceMode || false}
                        onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                        className="w-5 h-5 text-red-600 rounded mt-1 cursor-pointer"
                      />
                      <div className="flex-1">
                        <label className="font-semibold text-red-700">Mode maintenance</label>
                        <p className="text-sm text-red-600 mt-1">Activez cette option pour mettre le site en maintenance</p>
                      </div>
                    </div>
                  </div>

                  {settings.maintenanceMode && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <label className="block text-sm font-semibold mb-2 text-slate-900">
                        📢 Message de maintenance
                      </label>
                      <textarea
                        value={settings.maintenanceMessage || ''}
                        onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                        placeholder="Site en maintenance. Nous revenons bientôt!"
                        rows="3"
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 transition-colors resize-none"
                      />
                      <p className="text-xs text-slate-500 mt-2">Ce message s'affichera aux visiteurs</p>
                    </motion.div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700"><strong>Note:</strong> En mode maintenance, le site affichera un message aux visiteurs et les rediriront vers une page statique.</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex gap-4 sticky bottom-0 bg-white rounded-2xl shadow-lg p-6 border-t-4 border-emerald-500">
            <button
              type="reset"
              onClick={() => setSettings(fetchedSettings)}
              disabled={saveMutation.isPending}
              className="flex items-center justify-center gap-2 px-6 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg font-semibold transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Réinitialiser
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-all"
            >
              <Save className="w-5 h-5" />
              {saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
