import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, Lightbulb, FileText, Settings, BarChart3, TrendingUp, AlertCircle, Lock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/api/simpleClient';
import { backendClient } from '@/api/backendClient';
import SyncStatus from '@/components/SyncStatus';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: stats = {}, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      try {
        const [team, services, solutions, contacts, settings] = await Promise.all([
          apiClient.getTeam(),
          apiClient.getServices(),
          apiClient.getSolutions(),
          apiClient.getContacts(),
          backendClient.getSettings().catch(() => ({}))
        ]);
        return {
          team: (team || []).length,
          services: (services || []).length,
          solutions: (solutions || []).length,
          contacts: (contacts || []).length,
          settings: settings || {}
        };
      } catch (error) {
        console.error('❌ Erreur chargement stats:', error);
        return { team: 0, services: 0, solutions: 0, contacts: 0 };
      }
    },
    staleTime: 30000,
  });

  const statCards = [
    { label: 'Équipe', value: stats.team || 0, icon: Users, color: 'emerald', trend: '+' },
    { label: 'Services', value: stats.services || 0, icon: Briefcase, color: 'blue', trend: '+' },
    { label: 'Solutions', value: stats.solutions || 0, icon: Lightbulb, color: 'amber', trend: '+' },
    { label: 'Contacts', value: stats.contacts || 0, icon: FileText, color: 'pink', trend: '+' },
  ];

  const colorClasses = {
    emerald: 'from-emerald-500 to-teal-600',
    blue: 'from-blue-500 to-cyan-600',
    amber: 'from-amber-500 to-orange-600',
    pink: 'from-pink-500 to-rose-600',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2"
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Tableau de Bord
            </h1>
          </motion.div>
          <p className="text-slate-600 text-lg">Bienvenue dans votre espace d'administration TRU GROUP</p>
        </div>

        {/* Alert */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <SyncStatus />
        </motion.div>

        {/* Info Alert */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">Information importante</h3>
            <p className="text-sm text-blue-800 mt-1">Tous les changements sont sauvegardés automatiquement et synchronisés avec le backend.</p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            const bgGradient = colorClasses[card.color];
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="group relative overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200"
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-0 group-hover:opacity-5 transition-opacity`} />

                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${bgGradient} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`text-sm font-semibold text-${card.color}-600 bg-${card.color}-50 px-2 py-1 rounded`}>
                      {card.trend}
                    </span>
                  </div>
                  <h3 className="text-slate-600 text-sm font-medium mb-1">{card.label}</h3>
                  <p className="text-3xl font-bold text-slate-900">{card.value}</p>
                </div>

                {/* Bottom accent */}
                <div className={`h-1 bg-gradient-to-r ${bgGradient}`} />
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-slate-200"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-emerald-600" />
              Vue d'ensemble
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div>
                  <p className="font-semibold text-slate-900">Équipe</p>
                  <p className="text-sm text-slate-600">Gérez vos membres</p>
                </div>
                <Users className="w-5 h-5 text-emerald-600" />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div>
                  <p className="font-semibold text-slate-900">Services</p>
                  <p className="text-sm text-slate-600">Mettez à jour vos offres</p>
                </div>
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div>
                  <p className="font-semibold text-slate-900">Solutions</p>
                  <p className="text-sm text-slate-600">Gérez vos solutions</p>
                </div>
                <Lightbulb className="w-5 h-5 text-amber-600" />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div>
                  <p className="font-semibold text-slate-900">Contenus</p>
                  <p className="text-sm text-slate-600">Éditez le contenu des pages</p>
                </div>
                <FileText className="w-5 h-5 text-pink-600" />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div>
                  <p className="font-semibold text-slate-900">Paramètres</p>
                  <p className="text-sm text-slate-600">Configuration du site</p>
                </div>
                <Settings className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Performance</h2>
              <p className="text-emerald-100">Vue globale de votre site</p>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Contenu complet</span>
                  <span className="text-sm font-bold">85%</span>
                </div>
                <div className="w-full bg-emerald-400/30 rounded-full h-2">
                  <div className="bg-emerald-200 h-2 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Visibilité</span>
                  <span className="text-sm font-bold">92%</span>
                </div>
                <div className="w-full bg-emerald-400/30 rounded-full h-2">
                  <div className="bg-emerald-200 h-2 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Optimisation</span>
                  <span className="text-sm font-bold">78%</span>
                </div>
                <div className="w-full bg-emerald-400/30 rounded-full h-2">
                  <div className="bg-emerald-200 h-2 rounded-full" style={{ width: '78%' }} />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-emerald-400/30">
              <p className="text-sm text-emerald-100">
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Tout fonctionne parfaitement
              </p>
            </div>
          </motion.div>
        </div>

        {/* Accès Membres Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12 p-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg cursor-pointer hover:shadow-xl hover:scale-105 transition-all"
          onClick={() => navigate('/member-access')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Gestion des Accès Membres</h3>
                <p className="text-purple-100 mt-1">Créer et gérer les comptes de connexion des membres</p>
              </div>
            </div>
            <div className="text-white text-4xl">👤</div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center text-slate-600 text-sm"
        >
          <p>TRU GROUP Admin Dashboard © 2025 - Tous droits réservés</p>
        </motion.div>
      </div>
    </div>
  );
}
