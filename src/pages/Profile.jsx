import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../services/authService'
import { applicationService } from '../services/applicationService'
import { cvService } from '../services/cvService'
import api from '../services/api'
import { showToast } from '../utils/toast'
import notificationService from '../utils/notificationService'
import './Profile.css'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
    
    // Cleanup function to stop notifications when component unmounts
    return () => {
      notificationService.stopMonitoring()
    }
  }, [])

  useEffect(() => {
    // Initialize notification service when user and applications are loaded
    if (user && applications.length > 0) {
      notificationService.initialize(user._id || user.id)
      
      // Show current status notifications (with cooldown to avoid spam)
      notificationService.showCurrentStatusNotifications(applications)
    }
  }, [user, applications])

  const fetchUserData = async () => {
    try {
      // Fetch full user profile from API
      const userResponse = await api.get('/users/profile')
      setUser(userResponse.data.data)
      
      // Fetch applications
      const appResponse = await applicationService.getUserApplications()
      console.log('Applications data:', appResponse.data)
      console.log('Sample application:', appResponse.data[0])
      setApplications(appResponse.data)
    } catch (error) {
      console.error('Error fetching user data:', error)
      // Fallback to localStorage user data
      setUser(authService.getCurrentUser())
      try {
        const appResponse = await applicationService.getUserApplications()
        setApplications(appResponse.data)
      } catch (appError) {
        console.error('Error fetching applications:', appError)
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return '✅'
      case 'rejected':
        return '❌'
      case 'reviewing':
        return '🔄'
      default:
        return '⏳'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'accepted':
        return 'Approved'
      case 'rejected':
        return 'Rejected'
      case 'reviewing':
        return 'Reviewing'
      default:
        return 'Pending'
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'accepted':
        return 'status-accepted'
      case 'rejected':
        return 'status-rejected'
      case 'reviewing':
        return 'status-reviewing'
      default:
        return 'status-pending'
    }
  }

  // Count by status
  const approvedCount = applications.filter(a => a.status === 'accepted').length
  const rejectedCount = applications.filter(a => a.status === 'rejected').length
  const pendingCount = applications.filter(a => a.status === 'pending').length
  const reviewingCount = applications.filter(a => a.status === 'reviewing').length

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
      <div className="profile-page">
        <div className="container">
          <div className="loading">Loading profile...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="container">
        {/* Header Section */}
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1>{user?.name}</h1>
            <p>{user?.email}</p>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="profile-stats">
          <div className="stat-card total">
            <span className="stat-icon">📋</span>
            <div className="stat-content">
              <span className="stat-number">{applications.length}</span>
              <span className="stat-label">Total Applications</span>
            </div>
          </div>
          <div className="stat-card approved">
            <span className="stat-icon">✅</span>
            <div className="stat-content">
              <span className="stat-number">{approvedCount}</span>
              <span className="stat-label">Approved (OK)</span>
            </div>
          </div>
          <div className="stat-card rejected">
            <span className="stat-icon">❌</span>
            <div className="stat-content">
              <span className="stat-number">{rejectedCount}</span>
              <span className="stat-label">Rejected (No)</span>
            </div>
          </div>
          <div className="stat-card pending">
            <span className="stat-icon">⏳</span>
            <div className="stat-content">
              <span className="stat-number">{pendingCount + reviewingCount}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
        </div>

        {/* Main Content - All in One UI */}
        <div className="profile-main">
          {/* Left Column - User Info */}
          <div className="profile-section user-info-section">
            <div className="section-card">
              <h2>👤 Personal Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">{user?.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email Address</span>
                  <span className="info-value">{user?.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone Number</span>
                  <span className="info-value">{user?.phone || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Location</span>
                  <span className="info-value">{user?.location || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Account Type</span>
                  <span className="info-value role-badge">{user?.role}</span>
                </div>
              </div>
            </div>

            <div className="section-card">
              <h2>⚡ Quick Actions</h2>
              <div className="actions-grid">
                <Link to="/upload-cv" className="action-card">
                  <span className="action-icon">📄</span>
                  <span className="action-text">Upload New CV</span>
                </Link>
                <Link to="/applications" className="action-card">
                  <span className="action-icon">📋</span>
                  <span className="action-text">View All Applications</span>
                </Link>
                <Link to="/jobs" className="action-card">
                  <span className="action-icon">🔍</span>
                  <span className="action-text">Browse Jobs</span>
                </Link>
                <button 
                  className="action-card"
                  onClick={() => {
                    fetchUserData()
                    showToast.info('🔄 Checking for application updates...')
                  }}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    textAlign: 'left',
                    width: '100%',
                    padding: '0',
                    fontSize: 'inherit'
                  }}
                >
                  <span className="action-icon">🔄</span>
                  <span className="action-text">Check Updates</span>
                </button>
                <Link to="/dashboard" className="action-card">
                  <span className="action-icon">🏠</span>
                  <span className="action-text">Go to Dashboard</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Applied Jobs */}
          <div className="profile-section applications-section">
            <div className="section-card">
              <h2>📋 My Applied Jobs ({applications.length})</h2>
              
              {applications.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📭</span>
                  <h3>No applications yet</h3>
                  <p>Start applying for jobs to see them here!</p>
                  <Link to="/jobs" className="btn btn-primary">
                    Browse Jobs
                  </Link>
                </div>
              ) : (
                <div className="applications-list">
                  {applications.map((application) => (
                    <div key={application._id} className="applied-job-card">
                      <div className="job-main-info">
                        <div className="job-header">
                          <h3>{application.jobId?.title}</h3>
                          <span className={`status-badge ${getStatusClass(application.status)}`}>
                            {getStatusIcon(application.status)} {getStatusText(application.status)}
                          </span>
                        </div>
                        <p className="company-name">{application.jobId?.companyName}</p>
                      </div>
                      
                      <div className="job-details">
                        <div className="detail">
                          <span className="detail-icon">📍</span>
                          <span>{application.jobId?.location}</span>
                        </div>
                        <div className="detail">
                          <span className="detail-icon">💼</span>
                          <span>{application.jobId?.jobType}</span>
                        </div>
                        <div className="detail">
                          <span className="detail-icon">📅</span>
                          <span>Applied: {new Date(application.appliedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="job-actions">
                        <Link to={`/jobs/${application.jobId?._id}`} className="btn btn-secondary btn-sm">
                          View Job
                        </Link>
                        {application.cvId && (
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              console.log('CV button clicked, cvId:', application.cvId)
                              console.log('CV ID type:', typeof application.cvId)
                              const cvId = typeof application.cvId === 'string' ? application.cvId : application.cvId._id
                              console.log('Final CV ID:', cvId)
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
        </div>
      </div>
    </div>
  )
}

export default Profile
