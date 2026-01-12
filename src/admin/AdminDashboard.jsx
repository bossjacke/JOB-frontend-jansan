
import React, { useState, useEffect } from 'react'
import { authService } from '../services/authService'
import api from '../services/api'
import { applicationService } from '../services/applicationService'
import { cvService } from '../services/cvService'
import { jobService } from '../services/jobService'
import { useNavigate } from 'react-router-dom'
import { showToast } from '../utils/toast'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const admin = authService.getCurrentUser()
  const [activeSection, setActiveSection] = useState('overview')

  // Users state
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [userSort, setUserSort] = useState('name')

  // Jobs state
  const [jobs, setJobs] = useState([])
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [jobSearch, setJobSearch] = useState('')
  const [jobSort, setJobSort] = useState('title')

  // Applications state
  const [applications, setApplications] = useState([])
  const [loadingApps, setLoadingApps] = useState(false)
  const [appFilter, setAppFilter] = useState('all')
  const [appSearch, setAppSearch] = useState('')
  const [editingApp, setEditingApp] = useState(null)
  const [editForm, setEditForm] = useState({})

  // CVs state
  const [cvs, setCvs] = useState([])
  const [loadingCVs, setLoadingCVs] = useState(false)
  const [cvSearch, setCvSearch] = useState('')

  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await api.get('/users')
      setUsers(response.data.data || [])
    } catch (err) {
      console.error('Failed to fetch users')
      setUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  const loadJobs = async () => {
    setLoadingJobs(true)
    try {
      const response = await jobService.getAllJobsAdmin()
      console.log('Jobs API response:', response.data)
      const jobsData = response.data?.data || response.data || []
      setJobs(jobsData)
    } catch (err) {
      console.error('Failed to fetch jobs:', err.response?.data || err.message)
      setJobs([])
    } finally {
      setLoadingJobs(false)
    }
  }

  const loadApplications = async () => {
    setLoadingApps(true)
    try {
      console.log('Loading applications...')
      const response = await applicationService.getAllApplications()
      console.log('Applications API raw response:', response)
      console.log('Applications API response.data:', response.data)
      console.log('Applications API response.data.data:', response.data?.data)

      const apps = response.data?.data || response.data || []
      console.log('Final applications array:', apps)
      console.log('Applications count:', apps.length)

      if (apps.length > 0) {
        console.log('Sample application:', apps[0])
        console.log('Sample application status:', apps[0]?.status)
        console.log('Sample application job:', apps[0]?.job)
        console.log('Sample application user:', apps[0]?.user)
      }

      setApplications(apps)
    } catch (err) {
      console.error('Failed to fetch applications:', err)
      console.error('Error response:', err.response?.data)
      setApplications([])
    } finally {
      setLoadingApps(false)
    }
  }


  const loadCVs = async () => {
    setLoadingCVs(true)
    try {
      console.log('Loading CVs...')
      const response = await cvService.getAllCVs()
      console.log('CVs API raw response:', response)
      console.log('CVs API response.data:', response.data)
      console.log('CVs API response.data.data:', response.data?.data)

      const cvsData = response.data?.data || response.data || []
      console.log('Final CVs array:', cvsData)
      console.log('CVs count:', cvsData.length)

      if (cvsData.length > 0) {
        console.log('Sample CV:', cvsData[0])
        console.log('Sample CV user:', cvsData[0]?.user)
      }

      setCvs(cvsData)
    } catch (err) {
      console.error('Failed to fetch CVs:', err)
      console.error('Error response:', err.response?.data)
      setCvs([])
    } finally {
      setLoadingCVs(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${userId}`)
        setUsers(users.filter(user => user._id !== userId))
        showToast.success('User deleted successfully')
      } catch (err) {
        showToast.error('Failed to delete user')
      }
    }
  }

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await jobService.deleteJob(jobId)
        setJobs(jobs.filter(job => job._id !== jobId))
        showToast.success('Job deleted successfully')
      } catch (err) {
        showToast.error('Failed to delete job')
      }
    }
  }

  // Helper function to format expiry date
  const formatExpiryDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Helper function to get countdown message
  const getCountdown = (lastDate) => {
    const now = new Date()
    const expiry = new Date(lastDate)
    const diff = expiry - now

    if (diff <= 0) {
      return { text: 'Expired', class: 'expired', diff: 0 }
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) {
      return { text: `${days}d ${hours}h left`, class: days <= 1 ? 'urgent' : 'normal', diff }
    } else if (hours > 0) {
      return { text: `${hours}h ${minutes}m left`, class: 'urgent', diff }
    } else {
      return { text: `${minutes}m left`, class: 'critical', diff }
    }
  }

  const handleToggleJobActive = async (job) => {
    try {
      const newStatus = job.status === 'active' ? 'closed' : 'active'
      const updatedJob = { ...job, status: newStatus }
      await jobService.updateJob(job._id, updatedJob)
      setJobs(jobs.map(j => j._id === job._id ? updatedJob : j))
      showToast.success(`Job ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`)
    } catch (err) {
      showToast.error('Failed to update job')
    }
  }

  const handleUpdateAppStatus = async (appId, newStatus) => {
    try {
      const app = applications.find(a => a._id === appId)
      const jobTitle = app?.job?.title || 'Job'
      const userName = app?.user?.name || 'Applicant'
      
      await applicationService.updateStatus(appId, newStatus)
      setApplications(applications.map(app =>
        app._id === appId ? { ...app, status: newStatus } : app
      ))
      
      // Show specific toast to admin
      if (newStatus === 'approved') {
        showToast.success(`✅ Application approved! ${userName}'s application for "${jobTitle}" has been marked as Approved (OK)`)
      } else if (newStatus === 'rejected') {
        showToast.warning(`❌ Application rejected! ${userName}'s application for "${jobTitle}" has been marked as Rejected (No)`)
      } else {
        showToast.success('Application status updated successfully')
      }
    } catch (err) {
      showToast.error('Failed to update status')
    }
  }

  const handleDeleteApplication = async (appId) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await applicationService.deleteApplication(appId)
        setApplications(applications.filter(app => app._id !== appId))
        showToast.success('Application deleted successfully')
      } catch (err) {
        showToast.error('Failed to delete application')
      }
    }
  }

  // Inline editing functions
  const startEditingApp = (app) => {
    setEditingApp(app._id)
    setEditForm({
      name: app.user?.name || '',
      email: app.user?.email || '',
      phone: app.user?.phone || '',
      location: app.user?.location || '',
      notes: app.notes || '',
      status: app.status
    })
  }

  const cancelEditingApp = () => {
    setEditingApp(null)
    setEditForm({})
  }

  const saveEditingApp = async (appId) => {
    try {
      // Update application status and notes
      await applicationService.updateStatus(appId, editForm.status)
      setApplications(applications.map(app =>
        app._id === appId ? {
          ...app,
          status: editForm.status,
          notes: editForm.notes,
          user: {
            ...app.user,
            name: editForm.name,
            email: editForm.email,
            phone: editForm.phone,
            location: editForm.location
          }
        } : app
      ))
      
      const jobTitle = applications.find(a => a._id === appId)?.job?.title || 'Job'
      const userName = editForm.name || 'Applicant'
      
      setEditingApp(null)
      setEditForm({})
      
      // Show specific toast to admin
      if (editForm.status === 'approved') {
        showToast.success(`✅ Application approved! ${userName}'s application for "${jobTitle}" has been marked as Approved (OK)`)
      } else if (editForm.status === 'rejected') {
        showToast.warning(`❌ Application rejected! ${userName}'s application for "${jobTitle}" has been marked as Rejected (No)`)
      } else {
        showToast.success('Application updated successfully!')
      }
    } catch (err) {
      showToast.error('Failed to update application')
    }
  }

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  const handleDeleteCV = async (cvId) => {
    if (window.confirm('Are you sure you want to delete this CV?')) {
      try {
        await cvService.deleteCV(cvId)
        setCvs(cvs.filter(cv => cv._id !== cvId))
        showToast.success('CV deleted successfully')
      } catch (err) {
        showToast.error('Failed to delete CV')
      }
    }
  }

  const handleDownloadCV = async (cv) => {
    try {
      const response = await cvService.downloadCV(cv._id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', cv.fileName || 'cv.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      showToast.error('Failed to download CV')
    }
  }

  const handleDownloadCVFromApp = async (cvId) => {
    try {
      if (!cvId) {
        showToast.error('CV data not available')
        return
      }
      const response = await cvService.downloadCV(cvId)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'cv.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error('Failed to download CV:', err)
      showToast.error('Failed to download CV')
    }
  }

  const handleViewCVFromApp = async (cvId) => {
    try {
      if (!cvId) {
        showToast.error('CV data not available')
        return
      }
      const blob = await cvService.viewCV(cvId)
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error viewing CV:', error)
      // Fallback to download if view fails
      try {
        await handleDownloadCVFromApp(cvId)
      } catch (downloadError) {
        console.error('Error downloading CV:', downloadError)
        showToast.error('Failed to view CV')
      }
    }
  }

  const handleViewCV = async (cv) => {
    try {
      const blob = await cvService.viewCV(cv._id)
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error viewing CV:', error)
      // Fallback to download if view fails
      try {
        await handleDownloadCV(cv)
      } catch (downloadError) {
        console.error('Error downloading CV:', downloadError)
        showToast.error('Failed to view CV')
      }
    }
  }

  // Filtered and sorted data
  const filteredUsers = (users || []).filter(user =>
    user && user.name && user.email && (
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase())
    )
  ).sort((a, b) => {
    if (userSort === 'name') return a.name.localeCompare(b.name)
    if (userSort === 'email') return a.email.localeCompare(b.email)
    if (userSort === 'role') return a.role.localeCompare(b.role)
    return 0
  })

  const filteredJobs = (jobs || []).filter(job =>
    job && job.title && job.companyName && (
      job.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
      job.companyName.toLowerCase().includes(jobSearch.toLowerCase())
    )
  ).sort((a, b) => {
    if (jobSort === 'title') return a.title.localeCompare(b.title)
    if (jobSort === 'company') return a.companyName.localeCompare(b.companyName)
    if (jobSort === 'status') return a.status.localeCompare(b.status)
    return 0
  })

  const filteredApps = (applications || []).filter(app => {
    if (!app) return false
    const matchesFilter = appFilter === 'all' || app.status === appFilter
    const matchesSearch = (app.job?.title || '').toLowerCase().includes(appSearch.toLowerCase()) ||
      (app.user?.name || '').toLowerCase().includes(appSearch.toLowerCase())
    return matchesFilter && matchesSearch
  })


  const filteredCVs = (cvs || []).filter(cv => {
    if (!cv) return false
    const matchesSearch = cvSearch === '' ||
      (cv.userId?.name || '').toLowerCase().includes(cvSearch.toLowerCase()) ||
      (cv.userId?.email || '').toLowerCase().includes(cvSearch.toLowerCase()) ||
      (cv.fileName || '').toLowerCase().includes(cvSearch.toLowerCase())
    return matchesSearch
  })

  const menuItems = [
    { id: 'overview', title: 'Overview', icon: '📊' },
    { id: 'users', title: 'Manage Users', icon: '👥' },
    { id: 'jobs', title: 'Manage Jobs', icon: '💼' },
    { id: 'applications', title: 'View Applications', icon: '📋' },
    { id: 'cvs', title: 'Manage CVs', icon: '📄' }
  ]

  const renderOverview = () => (
    <div className="overview-section">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <h3>Users</h3>
          <p className="stat-number">{users.length}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <h3>Jobs</h3>
          <p className="stat-number">{jobs.length}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <h3>Applications</h3>
          <p className="stat-number">{applications.length}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <h3>CVs</h3>
          <p className="stat-number">{cvs.length}</p>
        </div>
      </div>
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          <button className="btn btn-primary" onClick={() => navigate('/jobs/create')}>
            <span>➕</span>
            Create New Job
          </button>
          <button className="btn btn-outline" onClick={() => setActiveSection('users')}>
            <span>👥</span>
            Manage Users
          </button>
          <button className="btn btn-outline" onClick={() => setActiveSection('applications')}>
            <span>📋</span>
            View Applications
          </button>
        </div>
      </div>
    </div>
  )

  const renderUsers = () => (
    <div className="users-section">
      <div className="section-header">
        <h2>User Management</h2>
        <div className="section-actions">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>
          <select
            value={userSort}
            onChange={(e) => setUserSort(e.target.value)}
            className="filter-select"
          >
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="role">Sort by Role</option>
          </select>
        </div>
      </div>
      {loadingUsers ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => setUserSort(userSort === 'name' ? 'name-desc' : 'name')}>
                  Name <span className="sort-icon">↕️</span>
                </th>
                <th className="sortable" onClick={() => setUserSort(userSort === 'email' ? 'email-desc' : 'email')}>
                  Email <span className="sort-icon">↕️</span>
                </th>
                <th>Phone</th>
                <th className="sortable" onClick={() => setUserSort(userSort === 'role' ? 'role-desc' : 'role')}>
                  Role <span className="sort-icon">↕️</span>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>{user.role}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        <span>🗑️</span>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  const renderJobs = () => (
    <div className="jobs-section">
      <div className="section-header">
        <h2>Job Management</h2>
        <div className="section-actions">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search jobs..."
              value={jobSearch}
              onChange={(e) => setJobSearch(e.target.value)}
            />
          </div>
          <select
            value={jobSort}
            onChange={(e) => setJobSort(e.target.value)}
            className="filter-select"
          >
            <option value="title">Sort by Title</option>
            <option value="company">Sort by Company</option>
            <option value="status">Sort by Status</option>
          </select>
          <button className="btn btn-primary" onClick={() => navigate('/jobs/create')}>
            <span>➕</span>
            Create New Job
          </button>
        </div>
      </div>
      {loadingJobs ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading jobs...</p>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => setJobSort(jobSort === 'title' ? 'title-desc' : 'title')}>
                  Title <span className="sort-icon">↕️</span>
                </th>
                <th className="sortable" onClick={() => setJobSort(jobSort === 'company' ? 'company-desc' : 'company')}>
                  Company <span className="sort-icon">↕️</span>
                </th>
                <th>Location</th>
                <th>Type</th>
                <th>Expiry Date</th>
                <th>Time Left</th>
                <th className="sortable" onClick={() => setJobSort(jobSort === 'status' ? 'status-desc' : 'status')}>
                  Status <span className="sort-icon">↕️</span>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map(job => {
                const countdown = getCountdown(job.lastDate)
                return (
                  <tr key={job._id}>
                    <td>{job.title}</td>
                    <td>{job.companyName}</td>
                    <td>{job.location}</td>
                    <td>{job.jobType}</td>
                    <td>
                      <span className="expiry-date" title={formatExpiryDate(job.lastDate)}>
                        {new Date(job.lastDate).toLocaleDateString()}
                      </span>
                      <span className="expiry-time">
                        {new Date(job.lastDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td>
                      <span className={`countdown-badge ${countdown.class}`}>
                        {countdown.text}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${job.status === 'active' ? 'active' : 'inactive'}`}>
                        {job.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleToggleJobActive(job)}
                        >
                          {job.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteJob(job._id)}
                        >
                          <span>🗑️</span>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  const renderApplications = () => (
    <div className="applications-section">
      <div className="section-header">
        <h2>Application Management</h2>
        <div className="section-actions">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search applications..."
              value={appSearch}
              onChange={(e) => setAppSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="filter-bar">
        <div className="filter-group">
          <span className="filter-label">Filter by status:</span>
          <select value={appFilter} onChange={(e) => setAppFilter(e.target.value)} className="filter-select">
            <option value="all">All Applications</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      {loadingApps ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading applications...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="no-data">
          <div className="no-data-icon">📋</div>
          <h3>No applications found</h3>
          <p>No applications match your current filters.</p>
        </div>
      ) : (
        <div className="applications-list">
          {filteredApps.map(app => (
            <div key={app._id} className={`application-card ${editingApp === app._id ? 'editing' : ''}`}>
              <div className="app-header">
                <h4>{app.job?.title || 'Job Title'}</h4>
                <div className="app-header-actions">
                  {editingApp === app._id ? (
                    <>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => saveEditingApp(app._id)}
                      >
                        <span>💾</span> Save
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={cancelEditingApp}
                      >
                        <span>❌</span> Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span className={`status-badge ${app.status}`}>{app.status}</span>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => startEditingApp(app)}
                      >
                        <span>✏️</span> Edit
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="app-details">
                <div className="detail-row">
                  <span className="detail-label">Applicant:</span>
                  {editingApp === app._id ? (
                    <input
                      type="text"
                      className="edit-input"
                      value={editForm.name}
                      onChange={(e) => handleEditFormChange('name', e.target.value)}
                    />
                  ) : (
                    <span className="detail-value">{app.user?.name || 'Unknown'}</span>
                  )}
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  {editingApp === app._id ? (
                    <input
                      type="email"
                      className="edit-input"
                      value={editForm.email}
                      onChange={(e) => handleEditFormChange('email', e.target.value)}
                    />
                  ) : (
                    <span className="detail-value">{app.user?.email || 'N/A'}</span>
                  )}
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone:</span>
                  {editingApp === app._id ? (
                    <input
                      type="text"
                      className="edit-input"
                      value={editForm.phone}
                      onChange={(e) => handleEditFormChange('phone', e.target.value)}
                    />
                  ) : (
                    <span className="detail-value">{app.user?.phone || 'N/A'}</span>
                  )}
                </div>
                <div className="detail-row">
                  <span className="detail-label">Location:</span>
                  {editingApp === app._id ? (
                    <input
                      type="text"
                      className="edit-input"
                      value={editForm.location}
                      onChange={(e) => handleEditFormChange('location', e.target.value)}
                    />
                  ) : (
                    <span className="detail-value">{app.user?.location || 'N/A'}</span>
                  )}
                </div>
                <div className="detail-row">
                  <span className="detail-label">Applied Date:</span>
                  <span className="detail-value">{new Date(app.appliedAt).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Company:</span>
                  <span className="detail-value">{app.job?.companyName || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Job Location:</span>
                  <span className="detail-value">{app.job?.location || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Job Type:</span>
                  <span className="detail-value">{app.job?.jobType || 'N/A'}</span>
                </div>
                {app.job?.salary && (
                  <div className="detail-row">
                    <span className="detail-label">Salary:</span>
                    <span className="detail-value">{app.job?.salary || 'N/A'}</span>
                  </div>
                )}
                {editingApp === app._id && (
                  <div className="detail-row full-width">
                    <span className="detail-label">Notes:</span>
                    <textarea
                      className="edit-textarea"
                      value={editForm.notes}
                      onChange={(e) => handleEditFormChange('notes', e.target.value)}
                      placeholder="Add notes about this application..."
                      rows="3"
                    />
                  </div>
                )}
                {app.cvId && (
                  <div className="detail-row">
                    <span className="detail-label">CV:</span>
                    <span className="detail-value cv-actions">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          const cvId = typeof app.cvId === 'string' ? app.cvId : app.cvId._id
                          handleViewCVFromApp(cvId)
                        }}
                      >
                        <span>👁️</span>
                        View
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          const cvId = typeof app.cvId === 'string' ? app.cvId : app.cvId._id
                          handleDownloadCVFromApp(cvId)
                        }}
                      >
                        <span> CV ⬇️</span>
                        {typeof app.cvId === 'object'}
                      </button>
                    </span>
                  </div>
                )}
                <dev>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteApplication(app._id)}
                  >
                    <span>🗑️</span> Delete
                  </button>
                </dev>
              </div>
              <div className="app-actions">
                {editingApp === app._id ? (
                  <>
                    <label>Status:</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => handleEditFormChange('status', e.target.value)}
                      className="filter-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </>
                ) : (
                  <>
                    <select
                      value={app.status}
                      onChange={(e) => handleUpdateAppStatus(app._id, e.target.value)}
                      className="filter-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderCVs = () => (
    <div className="cvs-section">
      <div className="section-header">
        <h2>CV Management</h2>
        <div className="section-actions">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search CVs..."
              value={cvSearch}
              onChange={(e) => setCvSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
      {loadingCVs ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading CVs...</p>
        </div>
      ) : filteredCVs.length === 0 ? (
        <div className="no-data">
          <div className="no-data-icon">📄</div>
          <h3>No CVs found</h3>
          <p>No CVs match your search criteria.</p>
        </div>
      ) : (
        <div className="cvs-list">
          {filteredCVs.map(cv => (
            <div key={cv._id} className="cv-card">
              <div className="cv-info">
                <h4>{cv.userId?.name || cv.user?.name || 'Unknown User'}</h4>
                <p>{cv.userId?.email || cv.user?.email || 'N/A'}</p>
                <p className="cv-file">{cv.fileName || 'cv.pdf'}</p>
              </div>
              <div className="cv-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleViewCV(cv)}
                >
                  <span>👁️</span>
                  View
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleDownloadCV(cv)}
                >
                  <span>⬇️</span>
                  Download
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteCV(cv._id)}
                >
                  <span>🗑️</span>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  useEffect(() => {
    loadUsers()
    loadJobs()
    loadApplications()
    loadCVs()
  }, [])

  return (
    <div className="admin-dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome 👑 {admin?.name}</h1>
          <p>Manage your platform from the admin dashboard</p>
        </div>

        <div className="admin-layout">
          <div className="admin-sidebar">
            <div className="admin-nav-header">
              <div className="admin-avatar">
                {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="admin-info">
                <h4>{admin?.name}</h4>
                <p>Administrator</p>
              </div>
            </div>
            <nav className="admin-nav">
              <p className="nav-section-title">Dashboard</p>
              {menuItems.map(item => (
                <button
                  key={item.id}
                  className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-title">{item.title}</span>
                  {item.id === 'applications' && applications.filter(app => app.status === 'pending').length > 0 && (
                    <span className="nav-badge">
                      {applications.filter(app => app.status === 'pending').length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="admin-content">
            {activeSection === 'overview' && renderOverview()}
            {activeSection === 'users' && renderUsers()}
            {activeSection === 'jobs' && renderJobs()}
            {activeSection === 'applications' && renderApplications()}
            {activeSection === 'cvs' && renderCVs()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
