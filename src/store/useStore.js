import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Import initial data
import initialData from '../../../backend/data.example.json';

const useStore = create(
  persist(
    (set, get) => ({
      // Data state
      team: initialData.team || [],
      services: initialData.services || [],
      solutions: initialData.solutions || [],
      testimonials: initialData.testimonials || [],
      contacts: initialData.contacts || [],
      news: initialData.news || [],
      jobs: initialData.jobs || [],
      applications: initialData.applications || [],
      projects: initialData.projects || [],
      settings: initialData.settings || {},

      // Team CRUD
      addTeamMember: (member) => {
        set((state) => ({
          team: [...state.team, { ...member, id: member.id || Date.now() }]
        }));
      },
      updateTeamMember: (id, member) => {
        set((state) => ({
          team: state.team.map((m) => (m.id === id ? { ...m, ...member } : m))
        }));
      },
      deleteTeamMember: (id) => {
        set((state) => ({
          team: state.team.filter((m) => m.id !== id)
        }));
      },

      // Services CRUD
      addService: (service) => {
        set((state) => ({
          services: [...state.services, { ...service, id: service.id || Date.now() }]
        }));
      },
      updateService: (id, service) => {
        set((state) => ({
          services: state.services.map((s) => (s.id === id ? { ...s, ...service } : s))
        }));
      },
      deleteService: (id) => {
        set((state) => ({
          services: state.services.filter((s) => s.id !== id)
        }));
      },

      // Solutions CRUD
      addSolution: (solution) => {
        set((state) => ({
          solutions: [...state.solutions, { ...solution, id: solution.id || Date.now() }]
        }));
      },
      updateSolution: (id, solution) => {
        set((state) => ({
          solutions: state.solutions.map((s) => (s.id === id ? { ...s, ...solution } : s))
        }));
      },
      deleteSolution: (id) => {
        set((state) => ({
          solutions: state.solutions.filter((s) => s.id !== id)
        }));
      },

      // Testimonials CRUD
      addTestimonial: (testimonial) => {
        set((state) => ({
          testimonials: [...state.testimonials, { ...testimonial, id: testimonial.id || Date.now() }]
        }));
      },
      updateTestimonial: (id, testimonial) => {
        set((state) => ({
          testimonials: state.testimonials.map((t) => (t.id === id ? { ...t, ...testimonial } : t))
        }));
      },
      deleteTestimonial: (id) => {
        set((state) => ({
          testimonials: state.testimonials.filter((t) => t.id !== id)
        }));
      },

      // Contacts CRUD
      addContact: (contact) => {
        set((state) => ({
          contacts: [...state.contacts, { ...contact, id: contact.id || Date.now() }]
        }));
      },
      deleteContact: (id) => {
        set((state) => ({
          contacts: state.contacts.filter((c) => c.id !== id)
        }));
      },

      // News CRUD
      addNews: (newsItem) => {
        set((state) => ({
          news: [...state.news, { ...newsItem, id: newsItem.id || Date.now() }]
        }));
      },
      updateNews: (id, newsItem) => {
        set((state) => ({
          news: state.news.map((n) => (n.id === id ? { ...n, ...newsItem } : n))
        }));
      },
      deleteNews: (id) => {
        set((state) => ({
          news: state.news.filter((n) => n.id !== id)
        }));
      },

      // Jobs CRUD
      addJob: (job) => {
        set((state) => ({
          jobs: [...state.jobs, { ...job, id: job.id || Date.now() }]
        }));
      },
      updateJob: (id, job) => {
        set((state) => ({
          jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...job } : j))
        }));
      },
      deleteJob: (id) => {
        set((state) => ({
          jobs: state.jobs.filter((j) => j.id !== id)
        }));
      },

      // Applications CRUD
      addApplication: (application) => {
        set((state) => ({
          applications: [...state.applications, { ...application, id: application.id || Date.now() }]
        }));
      },
      deleteApplication: (id) => {
        set((state) => ({
          applications: state.applications.filter((a) => a.id !== id)
        }));
      },

      // Projects CRUD
      addProject: (project) => {
        set((state) => ({
          projects: [...state.projects, { ...project, id: project.id || Date.now() }]
        }));
      },
      updateProject: (id, project) => {
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...project } : p))
        }));
      },
      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id)
        }));
      },

      // Settings
      updateSettings: (settings) => {
        set(() => ({
          settings
        }));
      },

      // Utility functions
      resetToDefault: () => {
        set(() => ({
          team: initialData.team || [],
          services: initialData.services || [],
          solutions: initialData.solutions || [],
          testimonials: initialData.testimonials || [],
          contacts: initialData.contacts || [],
          news: initialData.news || [],
          jobs: initialData.jobs || [],
          applications: initialData.applications || [],
          projects: initialData.projects || [],
          settings: initialData.settings || {}
        }));
      },

      exportData: () => {
        const state = get();
        return {
          team: state.team,
          services: state.services,
          solutions: state.solutions,
          testimonials: state.testimonials,
          contacts: state.contacts,
          news: state.news,
          jobs: state.jobs,
          applications: state.applications,
          projects: state.projects,
          settings: state.settings
        };
      },

      importData: (data) => {
        set(() => ({
          team: data.team || [],
          services: data.services || [],
          solutions: data.solutions || [],
          testimonials: data.testimonials || [],
          contacts: data.contacts || [],
          news: data.news || [],
          jobs: data.jobs || [],
          applications: data.applications || [],
          projects: data.projects || [],
          settings: data.settings || {}
        }));
      }
    }),
    {
      name: 'tru-backoffice-store',
      version: 1
    }
  )
);

export default useStore;
