import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Users, Briefcase, Lightbulb, FileText, Settings, BarChart3, LogOut, MessageSquare, RefreshCw, ClipboardList, BookOpen, FolderOpen } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { path: '/equipe', label: 'Équipe', icon: Users },
  { path: '/services', label: 'Services', icon: Briefcase },
  { path: '/solutions', label: 'Solutions', icon: Lightbulb },
  { path: '/projects', label: 'Projets réalisés', icon: FolderOpen },
  { path: '/testimonials', label: 'Témoignages', icon: MessageSquare },
  { path: '/contacts', label: 'Contacts', icon: FileText },
  { path: '/news', label: 'Actualités', icon: FileText },
  { path: '/jobs', label: 'Offres d\'emploi', icon: Briefcase },
  { path: '/applications', label: 'Candidatures', icon: ClipboardList },
  { path: '/sync', label: 'Synchronisation', icon: RefreshCw },
  { path: '/logs', label: 'Journaux', icon: BookOpen },
  { path: '/settings', label: 'Paramètres', icon: Settings },
];

export default function AdminLayout({ children, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail') || 'Admin';

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b border-slate-200">
        <div className="flex items-center justify-between h-20 px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                T
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  TRU Admin
                </h1>
                <p className="text-xs text-slate-500">Management System</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-900">{userEmail.split('@')[0]}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-600 hover:text-red-600 group"
              title="Se déconnecter"
            >
              <LogOut className="w-5 h-5 transition-colors" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="fixed left-0 top-20 bottom-0 z-40 w-72 bg-white shadow-lg border-r border-slate-200 overflow-y-auto"
          >
            <nav className="p-6 space-y-2">
              <h3 className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-4">Menu Principal</h3>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      active
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-l-4 border-emerald-600'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {active && <div className="ml-auto w-2 h-2 rounded-full bg-emerald-600" />}
                  </Link>
                );
              })}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`pt-20 transition-all duration-300 ${sidebarOpen ? 'md:pl-72' : ''}`}>
        <div className="min-h-[calc(100vh-80px)]">
          {children}
        </div>
      </main>
    </div>
  );
}
