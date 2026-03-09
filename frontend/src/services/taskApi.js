import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'An unexpected error occurred';
    return Promise.reject({ ...error, displayMessage: message });
  }
);

// ─── Task API ────────────────────────────────────────────────

export const taskApi = {
  /**
   * Get all tasks with optional filters and pagination
   */
  getTasks: (params = {}) => {
    const queryParams = {
      page: params.page || 0,
      size: params.size || 10,
      sortBy: params.sortBy || 'createdAt',
      sortDir: params.sortDir || 'desc',
      ...(params.title && { title: params.title }),
      ...(params.status && { status: params.status }),
      ...(params.priority && { priority: params.priority }),
    };
    return apiClient.get('/tasks', { params: queryParams });
  },

  /**
   * Get a single task by ID
   */
  getTaskById: (id) => apiClient.get(`/tasks/${id}`),

  /**
   * Create a new task
   */
  createTask: (taskData) => apiClient.post('/tasks', taskData),

  /**
   * Update a task
   */
  updateTask: (id, taskData) => apiClient.put(`/tasks/${id}`, taskData),

  /**
   * Update task status only
   */
  updateTaskStatus: (id, status) =>
    apiClient.patch(`/tasks/${id}/status`, null, { params: { status } }),

  /**
   * Delete a task
   */
  deleteTask: (id) => apiClient.delete(`/tasks/${id}`),
};

export default apiClient;