/**
 * Base44 API Client
 * Provides access to all entities and integrations via base44 API
 */

// Hardcode the backend URL for both dev and production
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://tru-backend-o1zc.onrender.com';
const API_BASE_URL = `${BACKEND_URL}/api`;

console.log('🔗 API_BASE_URL:', API_BASE_URL);
console.log('📝 VITE_BACKEND_URL env var:', import.meta.env.VITE_BACKEND_URL);

// Entity API endpoints
export const base44 = {
  entities: {
    TeamMember: {
      list: async (orderBy = 'display_order') => {
        const response = await fetch(`${API_BASE_URL}/team-members?orderBy=${orderBy}`);
        if (!response.ok) throw new Error('Failed to fetch team members');
        return response.json();
      },
      get: async (id) => {
        const response = await fetch(`${API_BASE_URL}/team-members/${id}`);
        if (!response.ok) throw new Error('Failed to fetch team member');
        return response.json();
      },
      create: async (data) => {
        const response = await fetch(`${API_BASE_URL}/team-members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create team member');
        return response.json();
      },
      update: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/team-members/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update team member');
        return response.json();
      },
      delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/team-members/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete team member');
        return response.json();
      },
    },

    Service: {
      list: async (orderBy = 'display_order') => {
        const response = await fetch(`${API_BASE_URL}/services?orderBy=${orderBy}`);
        if (!response.ok) throw new Error('Failed to fetch services');
        return response.json();
      },
      get: async (id) => {
        const response = await fetch(`${API_BASE_URL}/services/${id}`);
        if (!response.ok) throw new Error('Failed to fetch service');
        return response.json();
      },
      create: async (data) => {
        const response = await fetch(`${API_BASE_URL}/services`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create service');
        return response.json();
      },
      update: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/services/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update service');
        return response.json();
      },
      delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/services/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete service');
        return response.json();
      },
    },

    Solution: {
      list: async (orderBy = 'display_order') => {
        const response = await fetch(`${API_BASE_URL}/solutions?orderBy=${orderBy}`);
        if (!response.ok) throw new Error('Failed to fetch solutions');
        return response.json();
      },
      get: async (id) => {
        const response = await fetch(`${API_BASE_URL}/solutions/${id}`);
        if (!response.ok) throw new Error('Failed to fetch solution');
        return response.json();
      },
      create: async (data) => {
        const response = await fetch(`${API_BASE_URL}/solutions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create solution');
        return response.json();
      },
      update: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/solutions/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update solution');
        return response.json();
      },
      delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/solutions/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete solution');
        return response.json();
      },
    },

    PageContent: {
      list: async () => {
        const response = await fetch(`${API_BASE_URL}/page-contents`);
        if (!response.ok) throw new Error('Failed to fetch page contents');
        return response.json();
      },
      get: async (id) => {
        const response = await fetch(`${API_BASE_URL}/page-contents/${id}`);
        if (!response.ok) throw new Error('Failed to fetch page content');
        return response.json();
      },
      create: async (data) => {
        const response = await fetch(`${API_BASE_URL}/page-contents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create page content');
        return response.json();
      },
      update: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/page-contents/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update page content');
        return response.json();
      },
      delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/page-contents/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete page content');
        return response.json();
      },
    },

    Testimonial: {
      list: async (orderBy = 'display_order') => {
        const response = await fetch(`${API_BASE_URL}/testimonials?orderBy=${orderBy}`);
        if (!response.ok) throw new Error('Failed to fetch testimonials');
        return response.json();
      },
      get: async (id) => {
        const response = await fetch(`${API_BASE_URL}/testimonials/${id}`);
        if (!response.ok) throw new Error('Failed to fetch testimonial');
        return response.json();
      },
      create: async (data) => {
        const response = await fetch(`${API_BASE_URL}/testimonials`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create testimonial');
        return response.json();
      },
      update: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/testimonials/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update testimonial');
        return response.json();
      },
      delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/testimonials/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete testimonial');
        return response.json();
      },
    },

    SiteSettings: {
      list: async () => {
        const response = await fetch(`${API_BASE_URL}/settings`);
        if (!response.ok) throw new Error('Failed to fetch settings');
        return response.json();
      },
      get: async (id) => {
        const response = await fetch(`${API_BASE_URL}/settings/${id}`);
        if (!response.ok) throw new Error('Failed to fetch settings');
        return response.json();
      },
      create: async (data) => {
        const response = await fetch(`${API_BASE_URL}/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create settings');
        return response.json();
      },
      update: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/settings/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update settings');
        return response.json();
      },
      delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/settings/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete settings');
        return response.json();
      },
    },
  },

  integrations: {
    Core: {
      /**
       * Upload a file to the server
       * @param {Object} config - Upload configuration
       * @param {File} config.file - File to upload
       * @returns {Promise<{file_url: string}>} URL of uploaded file
       */
      UploadFile: async ({ file }) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) throw new Error('Failed to upload file');
        const data = await response.json();
        return { file_url: data.file_url || data.url };
      },
    },
  },
};
