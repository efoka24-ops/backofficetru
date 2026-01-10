// backoffice/src/pages/MemberAccountsPage.jsx
import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Save, X, Copy, Check,
  AlertCircle, CheckCircle, User, Mail, Shield, Clock,
  Loader, LogIn, RotateCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://tru-backend-o1zc.onrender.com';

export default function MemberAccountsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [notification, setNotification] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  
  // Filtrage et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('email'); // 'email', 'createdAt', 'lastLogin'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    memberId: '',
    email: '',
    initialPassword: '',
    role: 'member'
  });

  const [editFormData, setEditFormData] = useState({
    email: '',
    status: 'active',
    role: 'member'
  });

  const queryClient = useQueryClient();
  const token = localStorage.getItem('adminToken');

  // Récupérer liste des membres de l'équipe
  const { data: members = [], isLoading, error: membersError, refetch } = useQuery({
    queryKey: ['members', token],
    queryFn: async () => {
      try {
        console.log('[FRONTEND] Token:', token ? 'Exists ✓' : 'Missing ✗');
        console.log('[FRONTEND] API_BASE_URL:', API_BASE_URL);
        console.log('[FRONTEND] Fetching members from /api/admin/members...');
        
        const response = await fetch(`${API_BASE_URL}/api/admin/members`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('[FRONTEND] Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[FRONTEND] API Error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          throw new Error(`API Error ${response.status}: ${errorData.error || response.statusText}`);
        }
        
        const data = await response.json();
        console.log('[FRONTEND] Members loaded successfully:', {
          total: data.total,
          count: data.members?.length || 0,
          debug: data.debug,
          members: data.members?.map(m => ({ id: m.id, name: m.name, email: m.email, hasAccount: m.account?.hasAccount }))
        });
        
        // Retourner le tableau même s'il est vide
        return Array.isArray(data.members) ? data.members : [];
      } catch (error) {
        console.error('[FRONTEND] Error fetching members:', error.message);
        throw error;
      }
    },
    enabled: !!token,
    retry: 3,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });

  // Créer un compte
  const createAccountMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`${API_BASE_URL}/api/admin/members/${data.memberId}/account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: data.email,
          initialPassword: data.initialPassword,
          role: data.role
        })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create account');
      }
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setNotification({
        type: 'success',
        message: `Account created! Login code: ${data.account.loginCode}`
      });
      setCreateDialogOpen(false);
      setFormData({ email: '', initialPassword: '', role: 'member' });
      setTimeout(() => setNotification(null), 5000);
    },
    onError: (error) => {
      setNotification({
        type: 'error',
        message: error.message
      });
      setTimeout(() => setNotification(null), 5000);
    }
  });

  // Modifier un compte
  const updateAccountMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`${API_BASE_URL}/api/admin/members/${data.memberId}/account`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: data.email,
          status: data.status,
          role: data.role
        })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update account');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setNotification({
        type: 'success',
        message: 'Account updated successfully'
      });
      setEditDialogOpen(false);
      setTimeout(() => setNotification(null), 5000);
    },
    onError: (error) => {
      setNotification({
        type: 'error',
        message: error.message
      });
      setTimeout(() => setNotification(null), 5000);
    }
  });

  // Supprimer un compte
  const deleteAccountMutation = useMutation({
    mutationFn: async (memberId) => {
      const response = await fetch(`${API_BASE_URL}/api/admin/members/${memberId}/account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete account');
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setNotification({
        type: 'success',
        message: 'Account deleted successfully'
      });
      setDeleteConfirm(null);
      setTimeout(() => setNotification(null), 5000);
    },
    onError: (error) => {
      setNotification({
        type: 'error',
        message: error.message
      });
      setTimeout(() => setNotification(null), 5000);
    }
  });

  // Générer nouveau code
  const generateCodeMutation = useMutation({
    mutationFn: async (memberId) => {
      const response = await fetch(`${API_BASE_URL}/api/admin/members/${memberId}/login-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to generate code');
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setNotification({
        type: 'success',
        message: `New code generated: ${data.loginCode}`
      });
      setCopiedCode(null);
      setTimeout(() => setNotification(null), 5000);
    },
    onError: (error) => {
      setNotification({
        type: 'error',
        message: error.message
      });
      setTimeout(() => setNotification(null), 5000);
    }
  });

  const handleCreateAccount = (member) => {
    setSelectedMember(member);
    setFormData({
      memberId: member.id,
      email: member.email || '',
      initialPassword: '',
      role: 'member'
    });
    setCreateDialogOpen(true);
  };

  const handleEditAccount = (member) => {
    setSelectedMember(member);
    setEditFormData({
      email: member.account?.email || '',
      status: member.account?.status || 'active',
      role: member.account?.role || 'member'
    });
    setEditDialogOpen(true);
  };

  const handleSubmitCreate = () => {
    if (!formData.memberId || !formData.email) {
      setNotification({
        type: 'error',
        message: 'Member and Email are required'
      });
      return;
    }

    createAccountMutation.mutate({
      memberId: formData.memberId,
      email: formData.email,
      initialPassword: formData.initialPassword,
      role: formData.role
    });
  };

  const handleSubmitEdit = () => {
    if (!selectedMember) return;

    updateAccountMutation.mutate({
      memberId: selectedMember.id,
      ...editFormData
    });
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Fonction de filtrage et tri
  const filteredMembers = members
    .filter(member => {
      const hasAccount = !!member.account;
      const email = member.account?.email || member.email || '';
      const name = member.name || '';
      
      // Recherche
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = email.toLowerCase().includes(searchLower) || 
                           name.toLowerCase().includes(searchLower);
      
      // Filtre rôle
      const matchesRole = filterRole === 'all' || member.account?.role === filterRole;
      
      // Filtre statut
      const matchesStatus = filterStatus === 'all' || member.account?.status === filterStatus;
      
      return hasAccount && matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      let aVal, bVal;
      
      switch(sortBy) {
        case 'email':
          aVal = (a.account?.email || '').toLowerCase();
          bVal = (b.account?.email || '').toLowerCase();
          break;
        case 'createdAt':
          aVal = new Date(a.account?.createdAt || 0).getTime();
          bVal = new Date(b.account?.createdAt || 0).getTime();
          break;
        case 'lastLogin':
          aVal = new Date(a.account?.lastLogin || 0).getTime();
          bVal = new Date(b.account?.lastLogin || 0).getTime();
          break;
        default:
          return 0;
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <User className="w-6 h-6" />
            Member Accounts Management
          </h2>
          <p className="text-slate-600 mt-1">Create and manage member access accounts</p>
        </div>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg border flex items-start gap-3 ${
              notification.type === 'success'
                ? 'bg-green-500/20 border-green-500/50 text-green-400'
                : 'bg-red-500/20 border-red-500/50 text-red-400'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <p>{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Gestion des Accès
          </h3>
          <Button
            onClick={() => {
              setFormData({ memberId: '', email: '', initialPassword: '', role: 'member' });
              setCreateDialogOpen(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 font-semibold"
          >
            <Plus className="w-4 h-4" />
            Créer un Accès
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Search</label>
            <Input
              placeholder="Email or name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="border-slate-300"
            />
          </div>

          {/* Filter by Role */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Role</label>
            <select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Filter by Status */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Sort by */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="email">Email</option>
              <option value="createdAt">Created Date</option>
              <option value="lastLogin">Last Login</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-slate-600">
          Showing <span className="font-semibold">{paginatedMembers.length}</span> of <span className="font-semibold">{filteredMembers.length}</span> member(s)
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Account Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Last Login</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedMembers.map((member) => (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 text-slate-900 font-medium">{member.name}</td>
                  <td className="px-6 py-4">
                    {member.account?.hasAccount ? (
                      <div className="flex items-center gap-2 text-slate-700">
                        <Mail className="w-4 h-4" />
                        {member.account.email}
                      </div>
                    ) : (
                      <span className="text-slate-400">No account</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {member.account?.hasAccount ? (
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                        member.account.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                        {member.account.status}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {member.account?.hasAccount ? (
                      <span className="inline-flex items-center gap-2 text-slate-700">
                        <Shield className="w-4 h-4" />
                        {member.account.role}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    {member.account?.lastLogin ? (
                      new Date(member.account.lastLogin).toLocaleDateString('fr-FR')
                    ) : (
                      'Never'
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {!member.account?.hasAccount ? (
                      <Button
                        size="sm"
                        onClick={() => handleCreateAccount(member)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="w-4 h-4" />
                        Create
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditAccount(member)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateCodeMutation.mutate(member.id)}
                          disabled={generateCodeMutation.isPending}
                        >
                          <RotateCw className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteConfirm(member)}
                          className="text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
            <div className="text-sm text-slate-600">
              Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-300 text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Account Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-white border-slate-200 w-[750px] max-h-[750px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Créer un Accès Membre</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Status information */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">État du chargement:</p>
                  <div className="mt-1 space-y-1 text-slate-700">
                    <p>• Token: {token ? '✓ Présent' : '✗ Manquant'}</p>
                    <p>• Membres chargés: {isLoading ? '⏳ Chargement...' : members.length > 0 ? `✓ ${members.length} trouvé(s)` : '✗ Aucun'}</p>
                    {membersError && <p className="text-red-600">• Erreur: {membersError.message}</p>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    console.log('[DIAGNOSTIC] Manual refetch triggered');
                    refetch();
                  }}
                  disabled={isLoading}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-400 text-white rounded text-xs font-semibold transition-colors"
                >
                  {isLoading ? '🔄' : '🔍'} Tester
                </button>
              </div>
            </div>

            {/* Sélectionner le Membre de l'Équipe */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Sélectionner Équipe/Membre
              </label>
              <select
                value={formData.memberId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  if (selectedId && members && members.length > 0) {
                    const selectedMemberObj = members.find(m => String(m.id) === String(selectedId));
                    if (selectedMemberObj) {
                      console.log('[FORM] Selected member:', { id: selectedMemberObj.id, name: selectedMemberObj.name, email: selectedMemberObj.email });
                      setFormData(prev => ({
                        ...prev,
                        memberId: selectedId,
                        email: selectedMemberObj.email || ''
                      }));
                    }
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      memberId: selectedId,
                      email: ''
                    }));
                  }
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="">-- Choisir un membre de l'équipe --</option>
                
                {isLoading && (
                  <>
                    <option disabled>⏳ Chargement de l'équipe...</option>
                  </>
                )}
                
                {membersError && !isLoading && (
                  <>
                    <option disabled>❌ Erreur: {membersError.message}</option>
                  </>
                )}
                
                {!isLoading && !membersError && members && members.length > 0 && (
                  members
                    .filter(m => !m.account?.hasAccount)
                    .map(member => (
                      <option key={`member-${member.id}`} value={String(member.id)}>
                        👤 {member.name} {member.title ? `(${member.title})` : ''} - {member.email}
                      </option>
                    ))
                )}
                
                {!isLoading && !membersError && (!members || members.length === 0) && (
                  <option disabled>ℹ️ Aucun membre chargé</option>
                )}
                
                {!isLoading && !membersError && members && members.filter(m => !m.account?.hasAccount).length === 0 && members.length > 0 && (
                  <option disabled>✓ Tous les membres ont un accès</option>
                )}
              </select>
              
              {!isLoading && membersError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-300 rounded text-xs text-red-700">
                  ❌ Erreur de chargement: {membersError.message}
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="ml-2 underline font-semibold hover:no-underline"
                  >
                    Réessayer
                  </button>
                </div>
              )}
              
              {!isLoading && !membersError && members && members.length > 0 && (
                <p className="text-xs text-green-600 mt-1">✓ {members.length} membre(s) chargé(s)</p>
              )}
            </div>

            {/* Grille 2 colonnes pour les champs */}
            <div className="grid grid-cols-2 gap-3">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  <Mail className="w-3 h-3 inline mr-1" />
                  Email
                </label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@company.com"
                  className="bg-white border-slate-300 text-slate-900 font-medium text-sm"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  <Shield className="w-3 h-3 inline mr-1" />
                  Rôle
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="member">Membre</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                <Shield className="w-3 h-3 inline mr-1" />
                Mot de Passe (Optionnel)
              </label>
              <Input
                type="password"
                value={formData.initialPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, initialPassword: e.target.value }))}
                placeholder="Code utilisé sinon"
                className="bg-white border-slate-300 text-slate-900 font-medium text-sm"
              />
            </div>

            {/* Membre Sélectionné */}
            {formData.memberId && members && (
              <div className="bg-green-50 border border-green-300 rounded-lg p-3">
                <h4 className="font-semibold text-green-900 text-sm mb-2">✓ Sélectionné</h4>
                {members.find(m => String(m.id) === String(formData.memberId)) && (
                  <div className="text-sm text-green-800 space-y-1">
                    {(() => {
                      const selectedMember = members.find(m => String(m.id) === String(formData.memberId));
                      return (
                        <>
                          <p><strong>👤 {selectedMember?.name}</strong></p>
                          {selectedMember?.title && <p className="text-xs">📍 {selectedMember.title}</p>}
                          <p className="text-xs">📧 {formData.email}</p>
                          <p className="text-xs">🆔 ID: {formData.memberId}</p>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                setFormData({ memberId: '', email: '', initialPassword: '', role: 'member' });
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmitCreate}
              disabled={createAccountMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {createAccountMutation.isPending ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Créer Accès
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-white border-slate-200 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <Edit2 className="w-5 h-5" />
              Modifier Accès - {selectedMember?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6">
            {/* Colonne Gauche */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <Input
                  value={editFormData.email}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-white border-slate-300 text-slate-900 font-medium"
                  placeholder="email@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Rôle
                </label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="member">Membre Standard</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
            </div>

            {/* Colonne Droite */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  Statut
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="active">Actif</option>
                  <option value="pending">En Attente</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-900 text-sm">État Actuel</h4>
                <div className="text-xs text-amber-800 space-y-1 mt-2">
                  <p><strong>Email:</strong> {editFormData.email}</p>
                  <p><strong>Rôle:</strong> {editFormData.role === 'admin' ? 'Administrateur' : 'Membre'}</p>
                  <p><strong>Statut:</strong> {editFormData.status === 'active' ? '✓ Actif' : editFormData.status === 'pending' ? '⏳ En attente' : '✗ Inactif'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmitEdit}
              disabled={updateAccountMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updateAccountMutation.isPending ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Account?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete the account for {deleteConfirm?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 hover:bg-slate-600">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAccountMutation.mutate(deleteConfirm.id)}
              disabled={deleteAccountMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
