import { showToast } from './toast'

class NotificationService {
  constructor() {
    this.lastCheckedStatuses = new Map() // Store last known status for each application
    this.checkInterval = null
  }

  // Start monitoring application status changes
  startMonitoring(userId, intervalMs = 30000) { // Check every 30 seconds
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }

    this.checkInterval = setInterval(async () => {
      await this.checkForStatusUpdates(userId)
    }, intervalMs)
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  // Check for status updates
  async checkForStatusUpdates(userId) {
    try {
      const response = await fetch(`${window.location.origin}/api/applications/my`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) return
      
      const data = await response.json()
      const applications = data.data || []

      applications.forEach(app => {
        const appId = app._id
        const currentStatus = app.status
        const lastStatus = this.lastCheckedStatuses.get(appId)
        
        // If status changed and we had a previous status
        if (lastStatus && lastStatus !== currentStatus) {
          this.showStatusChangeNotification(app, lastStatus, currentStatus)
        }
        
        // Update last known status
        this.lastCheckedStatuses.set(appId, currentStatus)
      })
    } catch (error) {
      console.error('Error checking application status:', error)
    }
  }

  // Show notification for status change
  showStatusChangeNotification(application, oldStatus, newStatus) {
    const jobTitle = application.jobId?.title || application.job?.title || 'Job'
    const companyName = application.jobId?.companyName || application.job?.companyName || 'Company'
    
    let message = ''
    let toastType = 'info'
    
    switch (newStatus) {
      case 'accepted':
        message = `🎉 வாழ்த்துக்கள்! Your application for "${jobTitle}" at ${companyName} has been **Approved (OK)**! உங்கள் விண்ணப்பம் ஏற்கப்பட்டது!`
        toastType = 'success'
        break
      case 'rejected':
        message = `😔 Your application for "${jobTitle}" at ${companyName} has been **Rejected (No)**. உங்கள் விண்ணப்பம் நிராகரிக்கப்பட்டது. Don't give up, keep applying!`
        toastType = 'error'
        break
      case 'reviewed':
        message = `📋 Your application for "${jobTitle}" at ${companyName} is now **Under Review**. உங்கள் விண்ணப்பம் மதிப்பாய்வில் உள்ளது.`
        toastType = 'info'
        break
      case 'pending':
        message = `⏳ Your application for "${jobTitle}" at ${companyName} is **Pending**. உங்கள் விண்ணப்பம் நிலுவையில் உள்ளது.`
        toastType = 'warning'
        break
      default:
        message = `📝 Status updated for your application to "${jobTitle}" at ${companyName}.`
    }
    
    // Show the toast notification
    showToast[toastType](message, {
      autoClose: newStatus === 'accepted' ? 8000 : 6000, // Longer for success
      position: 'top-right'
    })
  }

  // Initialize with current applications
  async initialize(userId) {
    try {
      const response = await fetch(`${window.location.origin}/api/applications/my`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) return
      
      const data = await response.json()
      const applications = data.data || []

      // Store current statuses
      applications.forEach(app => {
        this.lastCheckedStatuses.set(app._id, app.status)
      })

      // Start monitoring
      this.startMonitoring(userId)
    } catch (error) {
      console.error('Error initializing notifications:', error)
    }
  }

  // Show immediate notification for manual refresh
  showCurrentStatusNotifications(applications) {
    applications.forEach(app => {
      const jobTitle = app.jobId?.title || app.job?.title || 'Job'
      const companyName = app.jobId?.companyName || app.job?.companyName || 'Company'
      
      let message = ''
      let toastType = 'info'
      
      switch (app.status) {
        case 'accepted':
          message = `✅ Your application for "${jobTitle}" at ${companyName} is **Approved (OK)**`
          toastType = 'success'
          break
        case 'rejected':
          message = `❌ Your application for "${jobTitle}" at ${companyName} is **Rejected (No)**`
          toastType = 'error'
          break
        case 'pending':
          message = `⏳ Your application for "${jobTitle}" at ${companyName} is **Pending**`
          toastType = 'warning'
          break
        default:
          return // Don't show notification for other statuses on refresh
      }
      
      // Only show if not recently shown (avoid spam)
      const lastShown = localStorage.getItem(`notification_${app._id}`)
      const now = Date.now()
      if (!lastShown || (now - parseInt(lastShown)) > 300000) { // 5 minutes cooldown
        showToast[toastType](message)
        localStorage.setItem(`notification_${app._id}`, now.toString())
      }
    })
  }
}

// Create singleton instance
const notificationService = new NotificationService()

export default notificationService
