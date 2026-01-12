import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { jobService } from '../services/jobService'
import { authService } from '../services/authService'
import { applicationService } from '../services/applicationService'
import { cvService } from '../services/cvService'
import { showToast } from '../utils/toast'

const JobDetails = () => {
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [applied, setApplied] = useState(false)
  const [applying, setApplying] = useState(false)
  const [userCVs, setUserCVs] = useState([])
  const [selectedCV, setSelectedCV] = useState('')
  const [showCVModal, setShowCVModal] = useState(false)
  const [uploadingCV, setUploadingCV] = useState(false)
  const [cvFile, setCvFile] = useState(null)
  const { id } = useParams()
  const navigate = useNavigate()
  const isAuthenticated = authService.isAuthenticated()

  useEffect(() => {
    fetchJob()
    if (isAuthenticated) {
      fetchUserCVs()
      checkIfApplied()
    }
  }, [id, isAuthenticated])

  const fetchJob = async () => {
    try {
      const response = await jobService.getJobById(id)
      setJob(response.data)
    } catch (error) {
      setError('Job not found')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserCVs = async () => {
    try {
      const response = await cvService.getUserCVs()
      setUserCVs(response.data)
      if (response.data.length > 0) {
        setSelectedCV(response.data[0]._id)
      }
    } catch (error) {
      console.error('Error fetching CVs:', error)
    }
  }

  const checkIfApplied = async () => {
    try {
      const response = await applicationService.getUserApplications()
      const hasApplied = response.data.some(app => app.jobId._id === id)
      setApplied(hasApplied)
    } catch (error) {
      console.error('Error checking application status:', error)
    }
  }

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const user = authService.getCurrentUser()
    
    if (user.role === 'admin') {
      showToast.error('Admin cannot apply for jobs')
      return
    }

    setShowCVModal(true)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check if file is PDF or DOC
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        showToast.error('Please upload a PDF or Word document')
        return
      }
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showToast.error('File size must be less than 5MB')
        return
      }
      setCvFile(file)
    }
  }

  const handleUploadCV = async () => {
    if (!cvFile) {
      showToast.error('Please select a CV file to upload')
      return
    }

    setUploadingCV(true)
    try {
      const formData = new FormData()
      formData.append('cv', cvFile)
      
      const response = await cvService.uploadCV(formData)
      const newCV = response.data
      setUserCVs([...userCVs, newCV])
      setSelectedCV(newCV._id)
      setCvFile(null)
      showToast.success('CV uploaded successfully!')
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to upload CV')
    } finally {
      setUploadingCV(false)
    }
  }

  const confirmApplication = async () => {
    if (!selectedCV) {
      showToast.error('Please select a CV to apply')
      return
    }

    setApplying(true)
    try {
      await applicationService.applyJob(id, selectedCV)
      setApplied(true)
      setShowCVModal(false)
      showToast.success('Application submitted successfully!')
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to apply')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="job-detail-page">
        <div className="container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="job-detail-page">
        <div className="container">
          <div className="error-message">{error || 'Job not found'}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="job-detail-page">
      <div className="job-detail-container">
        <div className="job-detail-header">
          <div>
            <h1>{job.title}</h1>
            <p className="company-name">{job.companyName}</p>
            <div className="job-meta">
              <span>Location: {job.location}</span>
              <span>Type: {job.jobType}</span>
              {job.salary && <span>Salary: {job.salary}</span>}
            </div>
          </div>
          <button
            className="btn btn-primary apply-btn"
            onClick={handleApply}
            disabled={applied || applying || job.status !== 'active' || (job.vacancies <= 0)}
          >
            {applied ? 'Applied' : 
             job.vacancies <= 0 ? 'Position Filled' : 
             applying ? 'Applying...' : 'Apply Now'}
          </button>
        </div>

        <div className="job-detail-content">
          <div className="job-section">
            <h2>Job Description</h2>
            <p>{job.description}</p>
          </div>

          <div className="job-section">
            <h2>Job Details</h2>
            <div className="job-info-grid">
              <div className="info-item">
                <span className="label">Job Type:</span>
                <span className="value">{job.jobType}</span>
              </div>
              <div className="info-item">
                <span className="label">Location:</span>
                <span className="value">{job.location}</span>
              </div>
              {job.salary && (
                <div className="info-item">
                  <span className="label">Salary:</span>
                  <span className="value">{job.salary}</span>
                </div>
              )}
              <div className="info-item">
                <span className="label">Last Date:</span>
                <span className="value">
                  {new Date(job.lastDate).toLocaleDateString()}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Vacancies:</span>
                <span className="value">{job.vacancies || 1} positions available</span>
              </div>
              <div className="info-item">
                <span className="label">Status:</span>
                <span className={`status-badge ${job.status}`}>
                  {job.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CV Selection Modal */}
      {showCVModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Select CV for Application</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCVModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Choose which CV to use for your application to {job.title}</p>
              
              {/* Existing CVs */}
              {userCVs.length > 0 && (
                <div className="cv-section">
                  <h4>Your Existing CVs:</h4>
                  <div className="cv-selection">
                    {userCVs.map(cv => (
                      <label key={cv._id} className="cv-option">
                        <input
                          type="radio"
                          name="cv"
                          value={cv._id}
                          checked={selectedCV === cv._id}
                          onChange={(e) => setSelectedCV(e.target.value)}
                        />
                        <span>{cv.fileName}</span>
                        <small>Uploaded: {new Date(cv.uploadedAt).toLocaleDateString()}</small>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* CV Upload Section */}
              <div className="cv-section">
                <h4>Or Upload New CV:</h4>
                <div className="cv-upload-section">
                  <input
                    type="file"
                    id="cv-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="cv-upload" className="cv-upload-btn">
                    {cvFile ? cvFile.name : 'Choose CV File'}
                  </label>
                  {cvFile && (
                    <button 
                      className="btn btn-primary upload-btn"
                      onClick={handleUploadCV}
                      disabled={uploadingCV}
                    >
                      {uploadingCV ? 'Uploading...' : 'Upload CV'}
                    </button>
                  )}
                </div>
                <small className="upload-hint">
                  Accepted formats: PDF, DOC, DOCX (Max size: 5MB)
                </small>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowCVModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={confirmApplication}
                disabled={applying || !selectedCV}
              >
                {applying ? 'Applying...' : 'Apply Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobDetails
