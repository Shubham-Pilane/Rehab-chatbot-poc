const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Custom fetch client with interceptors
const request = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
};

export const api = {
  // Auth
  login: async (username, password) => {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },
  
  register: async (userData) => {
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  getProfile: async () => {
    return request('/api/auth/me');
  },

  // Sessions
  getSessions: async () => {
    return request('/api/chat/history');
  },
  
  getSession: async (id) => {
    return request(`/api/chat/session/${id}`);
  },
  
  createSession: async (title = 'New Chat') => {
    return request('/api/chat/session', {
      method: 'POST',
      body: JSON.stringify({ title })
    });
  },
  
  deleteSession: async (id) => {
    return request(`/api/chat/session/${id}`, {
      method: 'DELETE'
    });
  },

  // Messaging
  sendMessage: async (sessionId, content) => {
    return request('/api/chat/message', {
      method: 'POST',
      body: JSON.stringify({ sessionId, content })
    });
  },

  // Feedback
  submitFeedback: async (messageId, rating, comment = '') => {
    return request('/api/chat/feedback', {
      method: 'POST',
      body: JSON.stringify({ messageId, rating, comment })
    });
  },

  // RAG / Documents
  uploadDocument: async (file) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('document', file);

    const response = await fetch('/api/chat/document-upload', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }
    return data;
  },

  getDocuments: async () => {
    return request('/api/chat/documents');
  },

  deleteDocument: async (id) => {
    return request(`/api/chat/document/${id}`, {
      method: 'DELETE'
    });
  },

  searchDocument: async (query, limit = 5) => {
    return request('/api/chat/search-document', {
      method: 'POST',
      body: JSON.stringify({ query, limit })
    });
  },

  // Audit Logs
  getAuditLogs: async () => {
    return request('/api/chat/audit-logs');
  }
};
