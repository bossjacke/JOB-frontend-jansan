import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { jobService } from '../services/jobService'
import { applicationService } from '../services/applicationService'
import { authService } from '../services/authService'
import JobCard from '../components/JobCard'

const Jobs = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [appliedJobIds, setAppliedJobIds] = useState([])
  const [filters, setFilters] = useState({
    keyword: '',
    jobType: '',
    location: ''
  })
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const keyword = searchParams.get('keyword') || ''
    const location = searchParams.get('location') || ''
    setFilters({ ...filters, keyword, location })
    fetchJobs({ keyword, location })
  }, [searchParams])

  const fetchJobs = async (params = {}) => {
    try {
      const response = await jobService.searchJobs(params)
      setJobs(response.data)
      
      // Fetch user's applied jobs if authenticated
      if (authService.isAuthenticated()) {
        try {
          const appResponse = await applicationService.getUserApplications()
          const appliedIds = appResponse.data.map(app => app.jobId?._id || app.jobId)
          setAppliedJobIds(appliedIds)
        } catch (error) {
          console.error('Error fetching applications:', error)
        }
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchJobs(filters)
  }

  const jobTypes = ['full-time', 'part-time', 'contract', 'internship', 'remote']

  return (
    <div className="jobs-page">
      <div className="container">
        <div className="jobs-header">
          <h1>Find Your Dream Job</h1>
          <p>Browse through {jobs.length} job opportunities</p>
        </div>
        <div className="jobs-layout">
          <aside className="filters-sidebar">
            <div className="filter-card">
              <h3>Search Jobs</h3>
              <form onSubmit={handleSearch}>
                <div className="filter-group">
                  <label>Keywords</label>
                  <input
                    type="text"
                    name="keyword"
                    placeholder="Job title or company"
                    value={filters.keyword}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="filter-group">
                  <label>Job Type</label>
                  <select
                    name="jobType"
                    value={filters.jobType}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Types</option>
                    {jobTypes.map(type => (
                      <option key={type} value={type}>
                        {type.replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="City or region"
                    value={filters.location}
                    onChange={handleFilterChange}
                  />
                </div>
                <button type="submit" className="btn btn-primary filter-btn">
                  Search
                </button>
              </form>
            </div>
          </aside>
          <div className="jobs-results">
            {loading ? (
              <div className="loading">Loading jobs...</div>
            ) : jobs.length === 0 ? (
              <div className="no-jobs">
                <h3>No jobs found</h3>
                <p>Try adjusting your search filters</p>
              </div>
            ) : (
              <div className="jobs-list">
                {jobs.map(job => (
                  <JobCard 
                    key={job._id} 
                    job={job} 
                    isApplied={appliedJobIds.includes(job._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Jobs

