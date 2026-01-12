import React from 'react'
import { Link } from 'react-router-dom'
import './JobCard.css'

const JobCard = ({ job, isApplied }) => {
  return (
    <div className={`job-card ${isApplied ? 'job-card-applied' : ''}`}>
      <div className="job-header">
        <div className="company-logo">
          {job.companyName?.charAt(0).toUpperCase()}
        </div>
        <div className="job-type">{job.jobType}</div>
        {isApplied && (
          <div className="applied-badge">
            <span className="applied-icon">✓</span>
            Applied
          </div>
        )}
      </div>

      <div className="job-content">
        <h3 className="job-title">
          <Link to={`/jobs/${job._id}`}>{job.title}</Link>
        </h3>
        <p className="company-name">{job.companyName}</p>

        <div className="job-details">
          <div className="detail-item">
            <span className="icon">Location</span>
            {job.location}
          </div>
          <div className="detail-item">
            <span className="icon">Type</span>
            {job.jobType}
          </div>
          {job.salary && (
            <div className="detail-item">
              <span className="icon">Salary</span>
              {job.salary}
            </div>
          )}
          <div className="detail-item">
            <span className="icon">Positions</span>
            {job.vacancies || 1} available
          </div>
        </div>

        <p className="job-description">
          {job.description?.length > 150
            ? `${job.description.substring(0, 150)}...`
            : job.description
          }
        </p>
      </div>

      <div className="job-footer">
        <Link to={`/jobs/${job._id}`} className="view-details-btn">
          View Details
        </Link>
      </div>
    </div>
  )
}

export default JobCard
