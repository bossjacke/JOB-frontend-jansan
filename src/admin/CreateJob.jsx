import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobService } from '../services/jobService'
import './AdminDashboard.css'

const CreateJob = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    jobType: 'full-time',
    location: '',
    salary: '',
    description: '',
    lastDate: '',
    vacancies: 1
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await jobService.createJob(formData)
      navigate('/admin/analytics')
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Create New Job</h1>
          <p>Post a new job vacancy</p>
        </div>

        <div className="job-form-container">
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="job-form">
            <div className="form-group">
              <label htmlFor="title">Job Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter job title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="companyName">Company Name *</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                placeholder="Enter company name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="jobType">Job Type *</label>
              <select
                id="jobType"
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                required
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="Enter job location"
              />
            </div>

            <div className="form-group">
              <label htmlFor="salary">Salary</label>
              <input
                type="text"
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="Enter salary range (e.g., $50k-80k)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Job Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="6"
                placeholder="Enter job description"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastDate">Application Deadline *</label>
              <input
                type="datetime-local"
                id="lastDate"
                name="lastDate"
                value={formData.lastDate}
                onChange={handleChange}
                required
              />
              <small className="form-hint">Set the exact date and time when applications will close</small>
            </div>

            <div className="form-group">
              <label htmlFor="vacancies">Number of Vacancies *</label>
              <input
                type="number"
                id="vacancies"
                name="vacancies"
                value={formData.vacancies}
                onChange={handleChange}
                required
                min="1"
                max="100"
              />
              <small className="form-hint">How many positions are available for this job</small>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Job'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateJob
