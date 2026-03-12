/**
 * Page Projects Manager - Gestion CRUD des projets réalisés
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, Search } from 'lucide-react';
import { backendClient } from '../api/backendClient';
import { logger } from '../services/logger';

export default function ProjectsManager() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    description: '',
    category: 'Développement d\'apps',
    status: 'Produit',
    technologies: [],
    details: ''
  });

  // Charger les projets
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await backendClient.getProjects();
      setProjects(data || []);
      logger.log('Projets chargés:', data);
    } catch (error) {
      logger.error('Erreur lors du chargement des projets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      client: '',
      description: '',
      category: 'Développement d\'apps',
      status: 'Produit',
      technologies: [],
      details: ''
    });
    setIsFormOpen(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setFormData(project);
    setIsFormOpen(true);
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet?')) {
      try {
        await backendClient.deleteProject(id);
        setProjects(projects.filter(p => p.id !== id));
        logger.log('Projet supprimé:', id);
      } catch (error) {
        logger.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleSaveProject = async () => {
    try {
      if (!formData.name || !formData.client) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }

      let saved;
      if (editingProject) {
        saved = await backendClient.updateProject(editingProject.id, formData);
        setProjects(projects.map(p => p.id === editingProject.id ? saved : p));
        logger.log('Projet modifié:', saved);
      } else {
        saved = await backendClient.createProject(formData);
        setProjects([...projects, saved]);
        logger.log('Projet créé:', saved);
      }

      setIsFormOpen(false);
      alert('Projet sauvegardé avec succès!');
    } catch (error) {
      logger.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du projet');
    }
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Projets Réalisés</h1>
        <p className="text-slate-600">Gérez vos projets clients et solutions réalisées</p>
      </div>

      {/* Toolbar */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un projet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <button
          onClick={handleAddProject}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Ajouter un projet
        </button>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-600">Chargement...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{project.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      project.status === 'Produit' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">
                    <strong>Client:</strong> {project.client}
                  </p>
                  <p className="text-sm text-slate-600 mb-2">
                    {project.description}
                  </p>
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded">
                      {project.category}
                    </span>
                    {project.technologies?.map((tech, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEditProject(project)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto p-6"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              {editingProject ? 'Modifier le projet' : 'Ajouter un projet'}
            </h2>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nom du projet *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  placeholder="Client *"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-20"
              />

              <div className="grid md:grid-cols-2 gap-4">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option>Développement d'apps</option>
                  <option>Transformation digitale</option>
                  <option>Conseil & Organisation</option>
                  <option>Formation</option>
                </select>

                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option>Produit</option>
                  <option>Réalisé</option>
                  <option>En cours</option>
                </select>
              </div>

              <textarea
                placeholder="Détails supplémentaires"
                value={formData.details || ''}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-20"
              />

              <input
                type="text"
                placeholder="Technologies (séparées par des virgules)"
                value={formData.technologies?.join(', ') || ''}
                onChange={(e) => setFormData({ ...formData, technologies: e.target.value.split(',').map(t => t.trim()) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsFormOpen(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveProject}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Sauvegarder
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
