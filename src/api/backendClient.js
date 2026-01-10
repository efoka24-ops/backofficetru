/**
 * Backend API Client for Backoffice
 * Centralized API calls with environment-aware URLs
 */

// Hardcode the backend URL for both dev and production
const baseURL = import.meta.env.VITE_BACKEND_URL || 'https://tru-backend-o1zc.onrender.com';
// Remove trailing slash if present
const BACKEND_URL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;

console.log('🔗 Backend Client URL:', BACKEND_URL);

export const backendClient = {
  // Testimonials
  async getTestimonials() {
    const response = await fetch(`${BACKEND_URL}/api/testimonials`);
    if (!response.ok) throw new Error('Failed to fetch testimonials');
    return response.json();
  },

  async updateTestimonial(id, data) {
    const response = await fetch(`${BACKEND_URL}/api/testimonials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update testimonial');
    return response.json();
  },

  async createTestimonial(data) {
    const response = await fetch(`${BACKEND_URL}/api/testimonials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create testimonial');
    return response.json();
  },

  async deleteTestimonial(id) {
    const response = await fetch(`${BACKEND_URL}/api/testimonials/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete testimonial');
    return response.json();
  },

  // News
  async getNews() {
    const response = await fetch(`${BACKEND_URL}/api/news`);
    if (!response.ok) throw new Error('Failed to fetch news');
    return response.json();
  },

  async createNews(data) {
    const response = await fetch(`${BACKEND_URL}/api/news`, {
      method: 'POST',
      body: data
    });
    if (!response.ok) throw new Error('Failed to create news');
    return response.json();
  },

  async updateNews(id, data) {
    const response = await fetch(`${BACKEND_URL}/api/news/${id}`, {
      method: 'PUT',
      body: data
    });
    if (!response.ok) throw new Error('Failed to update news');
    return response.json();
  },

  async deleteNews(id) {
    const response = await fetch(`${BACKEND_URL}/api/news/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete news');
    return response.json();
  },

  // Jobs
  async getJobs() {
    const response = await fetch(`${BACKEND_URL}/api/jobs`);
    if (!response.ok) throw new Error('Failed to fetch jobs');
    return response.json();
  },

  async createJob(data) {
    const response = await fetch(`${BACKEND_URL}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create job');
    return response.json();
  },

  async updateJob(id, data) {
    const response = await fetch(`${BACKEND_URL}/api/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update job');
    return response.json();
  },

  async deleteJob(id) {
    const response = await fetch(`${BACKEND_URL}/api/jobs/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete job');
    return response.json();
  },

  async getContacts() {
    const response = await fetch(`${BACKEND_URL}/api/contacts`);
    if (!response.ok) throw new Error('Failed to fetch contacts');
    return response.json();
  },

  async updateContact(id, data) {
    const response = await fetch(`${BACKEND_URL}/api/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update contact');
    return response.json();
  },

  async replyToContact(id, data) {
    const response = await fetch(`${BACKEND_URL}/api/contacts/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data })
    });
    if (!response.ok) throw new Error('Failed to send reply');
    return response.json();
  },

  async deleteContact(id) {
    const response = await fetch(`${BACKEND_URL}/api/contacts/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete contact');
    return response.json();
  },

  // Applications
  async getApplications() {
    const response = await fetch(`${BACKEND_URL}/api/applications`);
    if (!response.ok) throw new Error('Failed to fetch applications');
    return response.json();
  },

  // Settings
  async getSettings() {
    const response = await fetch(`${BACKEND_URL}/api/settings`);
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
  },

  async updateSettings(data) {
    const response = await fetch(`${BACKEND_URL}/api/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update settings');
    return response.json();
  },

  // Team (for sync view)
  async getTeam() {
    const response = await fetch(`${BACKEND_URL}/api/team`);
    if (!response.ok) throw new Error('Failed to fetch team');
    return response.json();
  },

  // Projects CRUD
  async getProjects() {
    const response = await fetch(`${BACKEND_URL}/api/projects`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  },

  async createProject(data) {
    const response = await fetch(`${BACKEND_URL}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create project');
    return response.json();
  },

  async updateProject(id, data) {
    const response = await fetch(`${BACKEND_URL}/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update project');
    return response.json();
  },

  async deleteProject(id) {
    const response = await fetch(`${BACKEND_URL}/api/projects/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to delete project');
    return response.json();
  },

  // Health check
  async checkHealth() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
};
