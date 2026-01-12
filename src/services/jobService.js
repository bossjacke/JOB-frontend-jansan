import api from './api.js'

export const jobService = {
  // Get all jobs
  getJobs: async () => {
    const response = await api.get('/jobs')
    return response.data
  },

  // Get job by ID
  getJobById: async (id) => {
    const response = await api.get(`/jobs/${id}`)
    return response.data
  },

  // Search jobs with filters
  searchJobs: async (params) => {
    const queryString = new URLSearchParams(params).toString()
    const response = await api.get(`/jobs/search?${queryString}`)
    return response.data
  },

  // Create new job (admin)
  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData)
    return response.data
  },

  // Update job (admin)
  updateJob: async (id, jobData) => {
    const response = await api.put(`/jobs/${id}`, jobData)
    return response.data
  },

  // Delete job (admin)
  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`)
    return response.data
  },

  // Admin functions
  // Get all jobs including inactive (Admin only)
  getAllJobsAdmin: async () => {
    const response = await api.get('/jobs/admin/all')
    return response.data
  }
}
