import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobService } from '../services/jobService'
import JobCard from '../components/JobCard'
import './Home.css'

const Home = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchData, setSearchData] = useState({
    keyword: '',
    location: ''
  })
  const navigate = useNavigate()

  useEffect(() => {
    fetchFeaturedJobs()
  }, [])

  const fetchFeaturedJobs = async () => {
    try {
      const response = await jobService.getJobs()
      setJobs(response.data.slice(0, 6)) // Show only first 6 jobs
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchData.keyword) params.append('keyword', searchData.keyword)
    if (searchData.location) params.append('location', searchData.location)
    navigate(`/jobs?${params.toString()}`)
  }

  const handleInputChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Find Your Dream Job Easily</h1>
          <p>Discover thousands of job opportunities from top companies around the world</p>

          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-inputs">
              <input
                type="text"
                name="keyword"
                placeholder="Job title, keywords, or company"
                value={searchData.keyword}
                onChange={handleInputChange}
                className="search-input"
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={searchData.location}
                onChange={handleInputChange}
                className="search-input"
              />
            </div>
            <button type="submit" className="search-btn">
              Search Jobs
            </button>
          </form>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="featured-jobs">
        <div className="container">
          <h2>Featured Jobs</h2>
          <p>Explore the latest job opportunities</p>

          {loading ? (
            <div className="loading">Loading jobs...</div>
          ) : (
            <div className="jobs-grid">
              {jobs.map(job => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}

          <div className="view-all">
            <a href="/jobs" className="btn btn-primary">View All Jobs</a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
