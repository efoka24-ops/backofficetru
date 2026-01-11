import useStore from '../store/useStore';

/**
 * Hook for accessing Zustand store data in components
 * Provides simplified access to all CRUD operations and state
 */
export const useData = () => {
  return {
    // Team state & actions
    team: useStore((state) => state.team),
    addTeamMember: useStore((state) => state.addTeamMember),
    updateTeamMember: useStore((state) => state.updateTeamMember),
    deleteTeamMember: useStore((state) => state.deleteTeamMember),

    // Services state & actions
    services: useStore((state) => state.services),
    addService: useStore((state) => state.addService),
    updateService: useStore((state) => state.updateService),
    deleteService: useStore((state) => state.deleteService),

    // Solutions state & actions
    solutions: useStore((state) => state.solutions),
    addSolution: useStore((state) => state.addSolution),
    updateSolution: useStore((state) => state.updateSolution),
    deleteSolution: useStore((state) => state.deleteSolution),

    // Testimonials state & actions
    testimonials: useStore((state) => state.testimonials),
    addTestimonial: useStore((state) => state.addTestimonial),
    updateTestimonial: useStore((state) => state.updateTestimonial),
    deleteTestimonial: useStore((state) => state.deleteTestimonial),

    // Contacts state & actions
    contacts: useStore((state) => state.contacts),
    addContact: useStore((state) => state.addContact),
    deleteContact: useStore((state) => state.deleteContact),

    // News state & actions
    news: useStore((state) => state.news),
    addNews: useStore((state) => state.addNews),
    updateNews: useStore((state) => state.updateNews),
    deleteNews: useStore((state) => state.deleteNews),

    // Jobs state & actions
    jobs: useStore((state) => state.jobs),
    addJob: useStore((state) => state.addJob),
    updateJob: useStore((state) => state.updateJob),
    deleteJob: useStore((state) => state.deleteJob),

    // Applications state & actions
    applications: useStore((state) => state.applications),
    addApplication: useStore((state) => state.addApplication),
    deleteApplication: useStore((state) => state.deleteApplication),

    // Projects state & actions
    projects: useStore((state) => state.projects),
    addProject: useStore((state) => state.addProject),
    updateProject: useStore((state) => state.updateProject),
    deleteProject: useStore((state) => state.deleteProject),

    // Settings state & actions
    settings: useStore((state) => state.settings),
    updateSettings: useStore((state) => state.updateSettings),

    // Utility functions
    resetToDefault: useStore((state) => state.resetToDefault),
    exportData: useStore((state) => state.exportData),
    importData: useStore((state) => state.importData)
  };
};
