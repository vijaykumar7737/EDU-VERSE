import axios from 'axios';

// Function to get the dynamic backend port
const getBackendPort = async () => {
  try {
    const response = await fetch('/port-config.json');
    const config = await response.json();
    return config.backendPort || 62000;
  } catch (error) {
    console.warn('Could not read port-config.json, using default port 62000');
    return 62000;
  }
};

// Dynamic API URL based on port configuration
let API_URL = process.env.REACT_APP_API_URL;

// If no environment variable is set, use dynamic port detection
if (!API_URL) {
  const backendPort = process.env.REACT_APP_BACKEND_PORT || 
                     process.env.BACKEND_PORT || 
                     62000;
  API_URL = `http://localhost:${backendPort}/api`;
}

// Create axios instance with dynamic base URL
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Update API base URL dynamically when port config is available
getBackendPort().then(port => {
  if (!process.env.REACT_APP_API_URL) {
    api.defaults.baseURL = `http://localhost:${port}/api`;
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/user'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

// User API calls
export const userAPI = {
  getUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Course API calls
export const courseAPI = {
  getCourses: () => api.get('/courses'),
  getCourse: (id) => api.get(`/courses/${id}`),
  getCoursesByInstructor: (instructorId) => api.get(`/courses/instructor/${instructorId}`),
  createCourse: (courseData) => api.post('/courses', courseData),
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  enrollInCourse: (id) => api.put(`/courses/${id}/enroll`),
  unenrollFromCourse: (id) => api.put(`/courses/${id}/unenroll`),
};

// Assignment API calls
export const assignmentAPI = {
  // Use 'course' query param and include only if provided
  getAssignments: (courseId) => courseId ? api.get(`/assignments?course=${courseId}`) : api.get('/assignments'),
  getAssignment: (id) => api.get(`/assignments/${id}`),
  createAssignment: (assignmentData) => api.post('/assignments', assignmentData),
  updateAssignment: (id, assignmentData) => api.put(`/assignments/${id}`, assignmentData),
  deleteAssignment: (id) => api.delete(`/assignments/${id}`),
  submitAssignment: (id, submissionData) => api.post(`/assignments/${id}/submit`, submissionData),
  // Add grading endpoint aligned with server
  gradeSubmission: (assignmentId, studentId, payload) => api.put(`/assignments/${assignmentId}/grade/${studentId}`, payload),
};

// Material API calls
export const materialAPI = {
  getMaterials: (courseId) => api.get(`/materials/course/${courseId}`),
  getMaterial: (id) => api.get(`/materials/${id}`),
  createMaterial: (materialData) => api.post('/materials', materialData),
  updateMaterial: (id, materialData) => api.put(`/materials/${id}`, materialData),
  deleteMaterial: (id) => api.delete(`/materials/${id}`),
};

// Discussion API calls
export const discussionAPI = {
  getDiscussions: (courseId) => api.get(`/discussions/course/${courseId}`),
  getDiscussion: (id) => api.get(`/discussions/${id}`),
  createDiscussion: (discussionData) => api.post('/discussions', discussionData),
  updateDiscussion: (id, discussionData) => api.put(`/discussions/${id}`, discussionData),
  deleteDiscussion: (id) => api.delete(`/discussions/${id}`),
  addReply: (id, replyData) => api.post(`/discussions/${id}/reply`, replyData),
};

export default api;