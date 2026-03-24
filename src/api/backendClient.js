/**
 * Backend API Client for Backoffice
 * Centralized API calls with environment-aware URLs
 */

const baseURL = import.meta.env.VITE_BACKEND_URL || 'https://back.trugroup.cm';
// Remove trailing slash if present
const BACKEND_URL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;

console.log('🔗 Backend Client URL:', BACKEND_URL);

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const backendClient = {
  // Testimonials
  async getTestimonials() {
    const response = await fetch(`${BACKEND_URL}/api/testimonials`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!response.ok) throw new Error('Failed to fetch testimonials');
    return response.json();
  },

  async updateTestimonial(id, data) {
    const response = await fetch(`${BACKEND_URL}/api/testimonials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update testimonial');
    return response.json();
  },

  async createTestimonial(data) {
    const response = await fetch(`${BACKEND_URL}/api/testimonials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create testimonial');
    return response.json();
  },

  async deleteTestimonial(id) {
    const response = await fetch(`${BACKEND_URL}/api/testimonials/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!response.ok) throw new Error('Failed to delete testimonial');
    return response.json();
  },

  // News
  async getNews() {
    const response = await fetch(`${BACKEND_URL}/api/news`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!response.ok) throw new Error('Failed to fetch news');
    return response.json();
  },

  async createNews(data) {
    const response = await fetch(`${BACKEND_URL}/api/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create news');
    return response.json();
  },

  async updateNews(id, data) {
    const response = await fetch(`${BACKEND_URL}/api/news/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update news');
    return response.json();
  },

  async deleteNews(id) {
    const response = await fetch(`${BACKEND_URL}/api/news/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!response.ok) throw new Error('Failed to delete news');
    return response.json();
  },

  // Jobs
  async getJobs() {
    const response = await fetch(`${BACKEND_URL}/api/jobs`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!response.ok) throw new Error('Failed to fetch jobs');
    return response.json();
  },

  async createJob(data) {
    const response = await fetch(`${BACKEND_URL}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create job');
    return response.json();
  },

  async updateJob(id, data) {
    const response = await fetch(`${BACKEND_URL}/api/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update job');
    return response.json();
  },

  async deleteJob(id) {
    const response = await fetch(`${BACKEND_URL}/api/jobs/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!response.ok) throw new Error('Failed to delete job');
    return response.json();
  },

  async getContacts() {
    const response = await fetch(`${BACKEND_URL}/api/contacts`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!response.ok) throw new Error('Failed to fetch contacts');
    const data = await response.json();
    const contacts = Array.isArray(data) ? data : [];
    return contacts.map((c) => ({
      ...c,
      fullName: c.fullName ?? c.name,
      createdAt: c.createdAt ?? c.created_at,
      updatedAt: c.updatedAt ?? c.updated_at,
      status: c.status ?? (c.read ? 'replied' : 'pending'),
    }));
  },

  async updateContact(id, data) {
    const response = await fetch(`${BACKEND_URL}/api/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update contact');
    return response.json();
  },

  async replyToContact(id, data) {
    const response = await fetch(`${BACKEND_URL}/api/contacts/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ id, ...data })
    });
    if (!response.ok) throw new Error('Failed to send reply');
    return response.json();
  },

  async deleteContact(id) {
    const response = await fetch(`${BACKEND_URL}/api/contacts/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!response.ok) throw new Error('Failed to delete contact');
    return response.json();
  },

  // Applications
  async getApplications() {
    const response = await fetch(`${BACKEND_URL}/api/applications`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!response.ok) throw new Error('Failed to fetch applications');
    return response.json();
  },

  // Settings
  async getSettings() {
    const response = await fetch(`${BACKEND_URL}/api/settings`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
  },

  async updateSettings(data) {
    const response = await fetch(`${BACKEND_URL}/api/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
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
    const response = await fetch(`${BACKEND_URL}/api/projects`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  },

  async createProject(data) {
    const response = await fetch(`${BACKEND_URL}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create project');
    return response.json();
  },

  async updateProject(id, data) {
    const response = await fetch(`${BACKEND_URL}/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update project');
    return response.json();
  },

  async deleteProject(id) {
    const response = await fetch(`${BACKEND_URL}/api/projects/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
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
