import api from './api.js'

export const cvService = {
  // Upload CV
  uploadCV: async (formData) => {
    const response = await api.post('/cv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Get user's CVs
  getUserCVs: async () => {
    const response = await api.get('/cv/my')
    return response.data
  },

  // Delete CV
  deleteCV: async (id) => {
    const response = await api.delete(`/cv/${id}`)
    return response.data
  },

  // Download CV
  downloadCV: async (id) => {
    const response = await api.get(`/cv/${id}/download`, {
      responseType: 'blob'
    })
    return response.data
  },

  // View CV inline
  viewCV: async (id) => {
    console.log('viewCV called with id:', id)
    const response = await api.get(`/cv/${id}/view`, {
      responseType: 'blob'
    })
    return response.data
  },

  // Get all CVs (admin)
  getAllCVs: async () => {
    const response = await api.get('/cv')
    return response.data
  },

  // Admin functions
  // Delete CV (Admin only)
  deleteCVAdmin: async (id) => {
    const response = await api.delete(`/cv/admin/${id}`)
    return response.data
  }
}
