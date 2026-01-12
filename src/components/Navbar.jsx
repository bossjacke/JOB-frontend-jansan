import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import './Navbar.css'

const Navbar = () => {
  const navigate = useNavigate()
  const isAuthenticated = authService.isAuthenticated()
  const user = authService.getCurrentUser()

  const handleLogout = () => {
    authService.logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          JobHub
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/jobs" className="nav-link">
            Jobs
          </Link>

          {isAuthenticated ? (
            <div className="navbar-auth">
              {user?.role === 'admin' ? (
                <>
                  <Link to="/admin" className="nav-link">
                    👑 Admin Dashboard
                  </Link>
                </>
              ) : (
                <Link to="/profile" className="nav-link">
                  {user?.name ? `${user.name}` : 'Dashboard'} Profile
                </Link>
              )}
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
