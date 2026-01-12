import api from './api.js'

export const applicationService = {
  // Apply for a job
  applyJob: async (jobId, cvId) => {
    const response = await api.post('/applications', { jobId, cvId })
    return response.data
  },

  // Get user's applications
  getUserApplications: async () => {
    const response = await api.get('/applications/my')
    return response.data
  },

  // Get application by ID
  getApplicationById: async (id) => {
    const response = await api.get(`/applications/${id}`)
    return response.data
  },

  // Delete application
  deleteApplication: async (id) => {
    const response = await api.delete(`/applications/${id}`)
    return response.data
  },

  // Get all applications for a job (employer only)
  getJobApplications: async (jobId) => {
    const response = await api.get(`/applications/job/${jobId}`)
    return response.data
  },

  // Update application status (employer only)
  updateApplicationStatus: async (id, status) => {
    const response = await api.put(`/applications/${id}/status`, { status })
    return response.data
  },

  // Admin functions
  // Get all applications (Admin only)
  getAllApplications: async () => {
    const response = await api.get('/applications/admin/all')
    return response.data
  },

  // Update application status (Admin only)
  updateStatus: async (id, status) => {
    const response = await api.put(`/applications/admin/${id}/status`, { status })
    return response.data
  },

  // Delete application (Admin only)
  deleteApplicationAdmin: async (id) => {
    const response = await api.delete(`/applications/admin/${id}`)
    return response.data
  }
}
