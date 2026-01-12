import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { applicationService } from '../services/applicationService'
import { cvService } from '../services/cvService'
import { showToast } from '../utils/toast'
import notificationService from '../utils/notificationService'
import { authService } from '../services/authService'

const Applications = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchApplications()
    
    // Cleanup function to stop notifications when component unmounts
    return () => {
      notificationService.stopMonitoring()
    }
  }, [])

  useEffect(() => {
    // Initialize notification service when applications are loaded
    if (applications.length > 0) {
      const user = authService.getCurrentUser()
      if (user) {
        notificationService.initialize(user._id || user.id)
        
        // Show current status notifications (with cooldown to avoid spam)
        notificationService.showCurrentStatusNotifications(applications)
      }
    }
  }, [applications])

  const fetchApplications = async () => {
    try {
      const response = await applicationService.getUserApplications()
      setApplications(response.data)
    } catch (error) {
      setError('Failed to fetch applications')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'accepted':
        return 'success'
      case 'rejected':
        return 'danger'
      case 'reviewing':
        return 'info'
      default:
        return ''
    }
  }

  const handleViewCV = async (cvId) => {
    try {
      const blob = await cvService.viewCV(cvId)
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error viewing CV:', error)
      // Fallback to download if view fails
      try {
        const blob = await cvService.downloadCV(cvId)
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'cv.pdf'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } catch (downloadError) {
        console.error('Error downloading CV:', downloadError)
        showToast.error('Failed to view CV')
      }
    }
  }

  if (loading) {
    return (
      <div className="applications-page">
        <div className="container">
          <div className="loading">Loading applications...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="applications-page">
        <div className="container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="applications-page">
      <div className="container">
        <div className="applications-header">
          <h1>My Applications</h1>
          <p>Track the status of your job applications</p>
        </div>

        {applications.length === 0 ? (
          <div className="no-applications">
            <h3>No applications yet</h3>
            <p>Start applying for jobs to see them here</p>
            <Link to="/jobs" className="btn btn-primary">
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="applications-list">
            {applications.map((application) => (
              <div key={application._id} className="application-card">
                <div className="application-info">
                  <h3>{application.jobId?.title}</h3>
                  <p className="company-name">{application.jobId?.companyName}</p>
                  <div className="application-meta">
                    <span>
                      Applied on:{' '}
                      {new Date(application.appliedAt).toLocaleDateString()}
                    </span>
                    <span>Location: {application.jobId?.location}</span>
                    <span>Type: {application.jobId?.jobType}</span>
                  </div>
                </div>
                <div className="application-actions">
                  <span className={`status-badge ${getStatusColor(application.status)}`}>
                    {application.status}
                  </span>
                  {application.cvId && (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        const cvId = typeof application.cvId === 'string' ? application.cvId : application.cvId._id
                        handleViewCV(cvId)
                      }}
                    >
                      View CV
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Applications
