import axios from 'axios'

// Use environment variable for backend URL, fallback to Render URL for production
const API_URL = `${import.meta.env.VITE_BACKEND_URL || 'https://tru-backend-o1zc.onrender.com'}/api`

console.log('🔗 Backoffice API_URL:', API_URL)

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Services API
export const servicesAPI = {
  getAll: () => api.get('/services'),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`)
}

// Content API
export const contentAPI = {
  getAll: () => api.get('/content'),
  create: (data) => api.post('/content', data),
  update: (id, data) => api.put(`/content/${id}`, data),
  delete: (id) => api.delete(`/content/${id}`)
}

// Team API
export const teamAPI = {
  getAll: () => api.get('/team'),
  create: (data) => api.post('/team', data),
  update: (id, data) => api.put(`/team/${id}`, data),
  delete: (id) => api.delete(`/team/${id}`)
}

// Health Check
export const healthCheck = () => api.get('/health')
