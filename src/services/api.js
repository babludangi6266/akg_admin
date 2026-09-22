import axios from 'axios';

const api = axios.create({
  baseURL: 'https://zaminjunction.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('akg_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const requestUrl = error.config?.url || '';
    if (error.response && error.response.status === 401 && requestUrl.includes('/auth/me')) {
      localStorage.removeItem('akg_admin_token');
      localStorage.removeItem('akg_admin_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || { message: error.message || 'Server error' });
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const leadAPI = {
  getLeads: (params) => api.get('/leads', { params }),
  getLeadById: (id) => api.get(`/leads/${id}`),
  updateLeadStatus: (id, statusData) => api.put(`/leads/${id}/status`, statusData),
  deleteLead: (id) => api.delete(`/leads/${id}`),
};

export const propertyAPI = {
  getProperties: (params) => api.get('/properties', { params }),
  createProperty: (data) => api.post('/properties', data),
  updateProperty: (id, data) => api.put(`/properties/${id}`, data),
  deleteProperty: (id) => api.delete(`/properties/${id}`),
};

export default api;
