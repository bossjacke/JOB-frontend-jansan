import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { cvService } from '../services/cvService'

const UploadCV = () => {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    validateAndSetFile(selectedFile)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    validateAndSetFile(droppedFile)
  }

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF or Word document')
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setFile(selectedFile)
    setError('')
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file to upload')
      return
    }

    setLoading(true)
    setMessage('')
    setError('')

    const formData = new FormData()
    formData.append('cv', file)

    try {
      await cvService.uploadCV(formData)
      setMessage('CV uploaded successfully!')
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      navigate('/profile')
    } catch (error) {
      setError(error.response?.data?.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  return (
    <div className="upload-cv-page">
      <div className="container">
        <div className="upload-container">
          <h1>Upload Your CV</h1>
          <p>Upload your resume in PDF or Word format (max 5MB)</p>

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <div
            className={`drop-zone ${file ? 'has-file' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx"
              hidden
            />

            {file ? (
              <div className="file-info">
                <span className="file-icon">📄</span>
                <span className="file-name">{file.name}</span>
                <span className="file-size">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            ) : (
              <div className="upload-prompt">
                <span className="upload-icon">📁</span>
                <p>Drag and drop your CV here</p>
                <p>or</p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse Files
                </button>
              </div>
            )}
          </div>

          {file && (
            <button
              className="btn btn-primary upload-btn"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Upload CV'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default UploadCV
