import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, AlertCircle, Mail, MessageSquare, Eye, Send, X, Phone, MapPin } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { backendClient } from '@/api/backendClient';

// Initialiser EmailJS avec ta clé publique
emailjs.init('qkNcx5-8mPFa4DtMh');

export default function ContactsPage() {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [notification, setNotification] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewingContact, setViewingContact] = useState(null);
  const [replyMethod, setReplyMethod] = useState(null); // 'email' ou 'sms'
  const [replyText, setReplyText] = useState('');
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      try {
        const data = await backendClient.getContacts();
        return data || [];
      } catch (error) {
        console.error('❌ Erreur:', error);
        return [];
      }
    },
    staleTime: 30000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => backendClient.updateContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      showNotification('✅ Contact mis à jour!');
    },
    onError: (error) => {
      showNotification('❌ Erreur: ' + error.message, 'error');
    }
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, method, message }) => backendClient.replyToContact(id, { method, message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      showNotification('✅ Réponse envoyée avec succès!');
    },
    onError: (error) => {
      showNotification('❌ Erreur: ' + error.message, 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => backendClient.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setDeleteConfirm(null);
      showNotification('✅ Contact supprimé!');
    },
    onError: (error) => {
      showNotification('❌ Erreur: ' + error.message, 'error');
    }
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      showNotification('❌ Veuillez écrire une réponse', 'error');
      return;
    }

    try {
      // Envoyer l'email au client via EmailJS
      if (replyMethod === 'email') {
        await emailjs.send('service_a59rkt1', 'template_contact_reply', {
          to_email: viewingContact.email,
          to_name: viewingContact.fullName,
          subject: `Réponse à votre demande: ${viewingContact.subject}`,
          message: replyText,
          from_name: 'TRU GROUP'
        });

        // Envoyer une copie à l'admin
        await emailjs.send('service_a59rkt1', 'template_contact_reply', {
          to_email: 'efoka24@gmail.com',
          to_name: 'Admin TRU GROUP',
          subject: `Réponse envoyée à ${viewingContact.fullName}`,
          message: `Vous avez envoyé une réponse à ${viewingContact.fullName} (${viewingContact.email})\n\nRéponse:\n${replyText}`,
          from_name: 'TRU GROUP Notification'
        });

        console.log('✅ Email envoyé avec succès via EmailJS');
      }

      // Sauvegarder la réponse dans la base de données
      await replyMutation.mutateAsync({
        id: viewingContact.id,
        method: replyMethod,
        message: replyText
      });

      // Réinitialiser les données
      setViewingContact(null);
      setReplyMethod(null);
      setReplyText('');
    } catch (error) {
      console.error('❌ Erreur:', error);
      showNotification('❌ Erreur: ' + error.message, 'error');
    }
  };

  const filteredContacts = filterStatus === 'all'
    ? contacts
    : contacts.filter(c => c.status === filterStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">📧 Gestion des Contacts</h1>
          <p className="text-slate-600 mt-2">Gérez les messages et répondez par email ou SMS</p>
        </motion.div>

        {/* Notifications */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                notification.type === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-green-50 text-green-800 border border-green-200'
              }`}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {['all', 'pending', 'replied', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === status
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-orange-400'
              }`}
            >
              {status === 'all' ? '📋 Tous' : status === 'pending' ? '⏳ En attente' : status === 'replied' ? '✅ Répondus' : '🔒 Fermés'}
            </button>
          ))}
        </div>

        {/* Contacts List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600"></div>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <p className="text-slate-600 text-lg">Aucun contact trouvé</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContacts.map((contact) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow hover:shadow-lg transition-all border-l-4 border-orange-500 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-900">{contact.fullName || contact.name}</h3>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          contact.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          contact.status === 'replied' ? 'bg-green-100 text-green-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {contact.status === 'pending' ? '⏳ En attente' : contact.status === 'replied' ? '✅ Répondu' : '🔒 Fermé'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
                        <Mail className="w-4 h-4" />
                        {contact.email}
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                          <Phone className="w-4 h-4" />
                          {contact.phone}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      {new Date(contact.createdAt || contact.submittedAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>

                  {contact.subject && (
                    <div className="mb-3 text-sm">
                      <strong className="text-slate-700">Sujet:</strong> <span className="text-orange-600 font-semibold">{contact.subject}</span>
                    </div>
                  )}

                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <p className="text-slate-700">{contact.message}</p>
                  </div>

                  {contact.replyMessage && (
                    <div className="bg-green-50 rounded-lg p-4 mb-4 border-l-2 border-green-500">
                      <p className="text-xs text-green-700 mb-1"><strong>Réponse ({contact.replyMethod === 'email' ? '📧 Email' : '💬 SMS'}):</strong></p>
                      <p className="text-green-900">{contact.replyMessage}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => setViewingContact(contact)}
                      className="flex-1 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Voir + Répondre
                    </button>
                    {contact.status === 'pending' && (
                      <button
                        onClick={() => updateMutation.mutate({ id: contact.id, data: { status: 'replied' } })}
                        disabled={updateMutation.isPending}
                        className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-semibold disabled:opacity-50 transition-colors"
                      >
                        ✅ Répondu
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteConfirm(contact.id)}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-semibold transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-white rounded-2xl p-6 max-w-sm"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-4">Supprimer ce message?</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(deleteConfirm)}
                    disabled={deleteMutation.isPending}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold disabled:opacity-50"
                  >
                    Supprimer
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reply Modal */}
        <AnimatePresence>
          {viewingContact && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">📬 Répondre</h2>
                  <button
                    onClick={() => {
                      setViewingContact(null);
                      setReplyMethod(null);
                      setReplyText('');
                    }}
                    className="text-slate-400 hover:text-slate-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Contact Details */}
                <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1"><strong>De:</strong> {viewingContact.fullName || viewingContact.name}</p>
                  <p className="text-sm text-slate-600 mb-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {viewingContact.email}
                  </p>
                  {viewingContact.phone && (
                    <p className="text-sm text-slate-600 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {viewingContact.phone}
                    </p>
                  )}
                  {viewingContact.subject && (
                    <p className="text-sm text-slate-600"><strong>Sujet:</strong> {viewingContact.subject}</p>
                  )}
                  <p className="text-sm text-slate-600 mt-2"><strong>Message:</strong></p>
                  <p className="text-slate-700 mt-1">{viewingContact.message}</p>
                </div>

                {/* Reply Method Selection */}
                {!replyMethod ? (
                  <div className="space-y-3">
                    <p className="font-semibold text-slate-900 mb-4">Choisissez la méthode de réponse:</p>
                    <button
                      onClick={() => setReplyMethod('email')}
                      className="w-full p-4 border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-3"
                    >
                      <Mail className="w-6 h-6 text-blue-600" />
                      <div className="text-left">
                        <p className="font-semibold text-slate-900">Répondre par Email</p>
                        <p className="text-sm text-slate-600">À {viewingContact.email}</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setReplyMethod('sms')}
                      className="w-full p-4 border-2 border-slate-200 hover:border-green-500 hover:bg-green-50 rounded-lg transition-all flex items-center gap-3"
                    >
                      <MessageSquare className="w-6 h-6 text-green-600" />
                      <div className="text-left">
                        <p className="font-semibold text-slate-900">Répondre par SMS</p>
                        <p className="text-sm text-slate-600">{viewingContact.phone || 'Pas de numéro'}</p>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Votre réponse:
                      </label>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Écrivez votre message de réponse..."
                        rows="4"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-50"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setReplyMethod(null);
                          setReplyText('');
                        }}
                        className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                      >
                        Retour
                      </button>
                      <button
                        onClick={handleReply}
                        disabled={replyMutation.isPending}
                        className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-400 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Envoyer
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
