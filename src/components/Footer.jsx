import React from 'react'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>JobHub</h3>
            <p>Your trusted platform for finding the perfect job opportunity.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <a href="/">Home</a>
            <a href="/jobs">Browse Jobs</a>
            <a href="/register">Register</a>
          </div>
          <div className="footer-section">
            <h4>For Employers</h4>
            <a href="/register">Post a Job</a>
            <a href="#">Find Candidates</a>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Email: support@jobhub.com</p>
            <p>Phone: +1 234 567 8900</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 JobHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
