import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, CheckCircle, Clock, XCircle, Eye, Filter, Calendar } from 'lucide-react';
import { backendClient } from '@/api/backendClient';

export default function InscriptionsFormationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInscription, setSelectedInscription] = useState(null);
  const [notification, setNotification] = useState(null);
  const queryClient = useQueryClient();

  const { data: inscriptions = [], isLoading } = useQuery({
    queryKey: ['inscriptions-formations'],
    queryFn: async () => {
      const response = await backendClient.get('/inscriptions-formations');
      return response;
    },
    staleTime: 30000,
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const formatPrice = (prix) => {
    return new Intl.NumberFormat('fr-FR').format(prix);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (statut) => {
    const styles = {
      en_attente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmee: 'bg-green-100 text-green-800 border-green-200',
      annulee: 'bg-red-100 text-red-800 border-red-200'
    };
    
    const labels = {
      en_attente: '⏳ En attente',
      confirmee: '✅ Confirmée',
      annulee: '❌ Annulée'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[statut] || styles.en_attente}`}>
        {labels[statut] || statut}
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = ['Numéro', 'Formation', 'Nom', 'Prénom', 'Email', 'Téléphone', 'Entreprise', 'Statut', 'Date inscription', 'Montant'];
    const rows = filteredInscriptions.map(i => [
      i.numero_inscription,
      i.formations?.titre || '',
      i.nom,
      i.prenom,
      i.email,
      i.telephone,
      i.entreprise || '',
      i.statut,
      new Date(i.created_at).toLocaleDateString('fr-FR'),
      i.montant_paye || i.formations?.prix || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inscriptions-formations-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showNotification('✅ Export CSV réussi!');
  };

  const filteredInscriptions = inscriptions.filter(item => {
    const matchesSearch = 
      item.numero_inscription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.formations?.titre || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.statut === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: inscriptions.length,
    en_attente: inscriptions.filter(i => i.statut === 'en_attente').length,
    confirmee: inscriptions.filter(i => i.statut === 'confirmee').length,
    annulee: inscriptions.filter(i => i.statut === 'annulee').length,
    revenue: inscriptions
      .filter(i => i.statut === 'confirmee')
      .reduce((sum, i) => sum + (parseFloat(i.montant_paye) || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">📋 Inscriptions aux Formations</h1>
          <p className="text-slate-600 mt-2">Consultez et gérez les inscriptions</p>
        </motion.div>

        {/* Notifications */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-lg ${
                notification.type === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-green-50 text-green-800 border border-green-200'
              }`}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
          >
            <div className="text-center">
              <p className="text-slate-600 text-xs mb-1">TOTAL</p>
              <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500"
          >
            <div className="text-center">
              <p className="text-slate-600 text-xs mb-1">EN ATTENTE</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.en_attente}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
          >
            <div className="text-center">
              <p className="text-slate-600 text-xs mb-1">CONFIRMÉES</p>
              <p className="text-3xl font-bold text-green-600">{stats.confirmee}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500"
          >
            <div className="text-center">
              <p className="text-slate-600 text-xs mb-1">ANNULÉES</p>
              <p className="text-3xl font-bold text-red-600">{stats.annulee}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg p-6"
          >
            <div className="text-center text-white">
              <p className="text-xs mb-1 opacity-90">REVENUS</p>
              <p className="text-2xl font-bold">{formatPrice(stats.revenue)}</p>
              <p className="text-xs opacity-75">FCFA</p>
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par numéro, nom, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="en_attente">⏳ En attente</option>
                <option value="confirmee">✅ Confirmées</option>
                <option value="annulee">❌ Annulées</option>
              </select>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={exportToCSV}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </motion.button>
            </div>
          </div>
        </div>

        {/* Inscriptions Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Numéro
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Formation
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Participant
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredInscriptions.map((inscription, index) => (
                    <motion.tr
                      key={inscription.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-semibold text-emerald-600">
                          {inscription.numero_inscription}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="font-semibold text-slate-900 truncate">
                            {inscription.formations?.titre || 'N/A'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {inscription.formations?.prix ? `${formatPrice(inscription.formations.prix)} FCFA` : ''}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {inscription.prenom} {inscription.nom}
                          </p>
                          {inscription.entreprise && (
                            <p className="text-xs text-slate-500">{inscription.entreprise}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-slate-700">{inscription.email}</p>
                          <p className="text-slate-500">{inscription.telephone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">
                          <p>{new Date(inscription.created_at).toLocaleDateString('fr-FR')}</p>
                          <p className="text-xs text-slate-400">
                            {new Date(inscription.created_at).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(inscription.statut)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedInscription(inscription)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {filteredInscriptions.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <p className="text-lg font-semibold mb-2">Aucune inscription trouvée</p>
                  <p className="text-sm">Essayez de modifier vos critères de recherche</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedInscription && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedInscription(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Détails de l'inscription
                      </h2>
                      <p className="text-emerald-100 text-sm mt-1 font-mono">
                        {selectedInscription.numero_inscription}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedInscription(null)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  {/* Status */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <span className="text-slate-600 font-semibold">Statut</span>
                    {getStatusBadge(selectedInscription.statut)}
                  </div>

                  {/* Formation */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 mb-2">FORMATION</h3>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="font-bold text-lg text-slate-900 mb-2">
                        {selectedInscription.formations?.titre}
                      </p>
                      <p className="text-slate-600 text-sm mb-2">
                        {selectedInscription.formations?.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <div>
                          <span className="font-semibold">Prix: </span>
                          {formatPrice(selectedInscription.formations?.prix)} FCFA
                        </div>
                        <div>
                          <span className="font-semibold">Durée: </span>
                          {selectedInscription.formations?.duree}
                        </div>
                        <div>
                          <span className="font-semibold">Format: </span>
                          {selectedInscription.formations?.format}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Participant */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 mb-2">PARTICIPANT</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Nom complet</p>
                        <p className="font-semibold text-slate-900">
                          {selectedInscription.prenom} {selectedInscription.nom}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Email</p>
                        <p className="font-semibold text-slate-900">{selectedInscription.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Téléphone</p>
                        <p className="font-semibold text-slate-900">{selectedInscription.telephone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Profession</p>
                        <p className="font-semibold text-slate-900">{selectedInscription.profession || '-'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs text-slate-500 mb-1">Entreprise</p>
                        <p className="font-semibold text-slate-900">{selectedInscription.entreprise || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 mb-2">CHRONOLOGIE</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Inscription</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {formatDate(selectedInscription.created_at)}
                          </p>
                        </div>
                      </div>

                      {selectedInscription.fiche_telechargee_le && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Download className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Fiche téléchargée</p>
                            <p className="text-sm font-semibold text-slate-900">
                              {formatDate(selectedInscription.fiche_telechargee_le)}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedInscription.paiement_confirme_le && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Paiement confirmé</p>
                            <p className="text-sm font-semibold text-slate-900">
                              {formatDate(selectedInscription.paiement_confirme_le)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment */}
                  {selectedInscription.montant_paye && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 mb-2">PAIEMENT</h3>
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-2xl font-bold text-green-600">
                          {formatPrice(selectedInscription.montant_paye)} FCFA
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedInscription.notes && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 mb-2">NOTES</h3>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-slate-700">{selectedInscription.notes}</p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedInscription(null)}
                    className="w-full px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
