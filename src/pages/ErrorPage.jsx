import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './ErrorPage.css'

// Ball component with 3D effect
const Ball = ({ 
  position, 
  targetPosition, 
  delay, 
  color, 
  size = 30,
  isAnimating,
  isComplete 
}) => {
  const ballRef = useRef(null)
  const [currentPos, setCurrentPos] = useState(position)
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(1)
  
  useEffect(() => {
    if (!isAnimating) return
    
    const ball = ballRef.current
    if (!ball) return
    
    // Physics simulation
    let startTime = null
    const duration = 1200 + Math.random() * 600 // Random duration between 1.2-1.8s
    const bounceCount = 3 + Math.floor(Math.random() * 2) // 3-4 bounces
    
    const startX = position.x
    const startY = position.y
    const deltaX = targetPosition.x - startX
    const deltaY = targetPosition.y - startY
    
    // Calculate intermediate bounce points
    const bouncePoints = []
    const progressStep = 1 / (bounceCount + 1)
    
    for (let i = 1; i <= bounceCount; i++) {
      const progress = i * progressStep
      bouncePoints.push({
        x: startX + deltaX * progress,
        y: startY + deltaY * progress - Math.sin(progress * Math.PI) * 150,
        t: progress
      })
    }
    
    // Add final point
    bouncePoints.push({ x: targetPosition.x, y: targetPosition.y, t: 1 })
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Find current segment
      let currentSegment = bouncePoints[0]
      let nextSegment = bouncePoints[1]
      
      for (let i = 0; i < bouncePoints.length - 1; i++) {
        if (progress >= bouncePoints[i].t && progress <= bouncePoints[i + 1].t) {
          currentSegment = bouncePoints[i]
          nextSegment = bouncePoints[i + 1]
          break
        }
      }
      
      // Interpolate between segments
      const segmentProgress = (progress - currentSegment.t) / (nextSegment.t - currentSegment.t)
      const eased = easeOutElastic(segmentProgress)
      
      const x = lerp(currentSegment.x, nextSegment.x, eased)
      const y = lerp(currentSegment.y, nextSegment.y, eased)
      
      setCurrentPos({ x, y })
      setRotation(rotation + 15 + Math.random() * 10)
      
      // Add slight squash and stretch
      const squashStretch = 1 + Math.sin(segmentProgress * Math.PI) * 0.1
      setScale({ x: 1 / squashStretch, y: squashStretch })
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // Settle animation - gentle pulse
        setScale({ x: 1.1, y: 0.9 })
        setTimeout(() => setScale({ x: 1, y: 1 }), 150)
      }
    }
    
    requestAnimationFrame(animate)
  }, [isAnimating, position, targetPosition])
  
  // Calculate light position for 3D effect
  const lightOffset = size * 0.3
  
  return (
    <div
      ref={ballRef}
      className={`error-ball ${isComplete ? 'settled' : ''}`}
      style={{
        '--current-x': `${currentPos.x}px`,
        '--current-y': `${currentPos.y}px`,
        '--target-x': `${targetPosition.x}px`,
        '--target-y': `${targetPosition.y}px`,
        '--ball-size': `${size}px`,
        '--ball-color': color,
        '--rotation': `${rotation}deg`,
        '--scale-x': scale.x,
        '--scale-y': scale.y,
        left: 0,
        top: 0,
        transform: `translate(${currentPos.x}px, ${currentPos.y}px) rotate(${rotation}deg) scale(${scale.x}, ${scale.y})`,
        width: size,
        height: size,
      }}
    >
      <div className="ball-shine" style={{
        background: `radial-gradient(circle at ${lightOffset}px ${-lightOffset}px, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.3) 20%, transparent 50%)`,
      }} />
      <div className="ball-body" style={{
        background: `radial-gradient(circle at 30% 30%, ${lightenColor(color, 40)} 0%, ${color} 50%, ${darkenColor(color, 30)} 100%)`,
      }} />
      <div className="ball-shadow" style={{
        background: `radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.4) 0%, transparent 70%)`,
      }} />
    </div>
  )
}

// Helper functions
const lerp = (a, b, t) => a + (b - a) * t

const easeOutElastic = (x) => {
  const c4 = (2 * Math.PI) / 3
  return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1
}

const lightenColor = (color, percent) => {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, (num >> 16) + amt)
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt)
  const B = Math.min(255, (num & 0x0000ff) + amt)
  return `rgb(${R}, ${G}, ${B})`
}

const darkenColor = (color, percent) => {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max(0, (num >> 16) - amt)
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt)
  const B = Math.max(0, (num & 0x0000ff) - amt)
  return `rgb(${R}, ${G}, ${B})`
}

// Digit patterns for ball positioning
const getDigitBalls = (digit) => {
  const patterns = {
    '0': [
      [-1, -1], [0, -1], [1, -1],
      [-1, 0],           [1, 0],
      [-1, 1], [0, 1], [1, 1],
    ],
    '1': [
            [0, -1],
            [0, 0],
            [0, 1],
            [0, 2],
    ],
    '2': [
      [-1, -1], [0, -1], [1, -1],
            [1, 0],
      [-1, 1], [0, 1], [1, 1],
      [-1, 2],
    ],
    '3': [
      [-1, -1], [0, -1], [1, -1],
            [1, 0],           [1, 1],
      [-1, -1], [0, -1], [1, -1],
            [1, 0],           [1, 1],
      [-1, 1], [0, 1], [1, 1],
    ],
    '4': [
      [-1, -1],           [1, -1],
      [-1, 0],           [1, 0],
      [-1, 1], [0, 1], [1, 1],
            [0, 1],
            [0, 2],
    ],
    '5': [
      [-1, -1], [0, -1], [1, -1],
      [-1, 0],
      [-1, 1], [0, 1], [1, 1],
            [1, 0],
      [-1, 2], [0, 2], [1, 2],
    ],
    '6': [
      [-1, -1], [0, -1], [1, -1],
      [-1, 0],
      [-1, 1], [0, 1], [1, 1],
      [-1, 0],           [1, 0],
      [-1, 1], [0, 1], [1, 1],
    ],
    '7': [
      [-1, -1], [0, -1], [1, -1],
            [1, 0],
            [1, 1],
            [1, 2],
            [1, 3],
    ],
    '8': [
      [-1, -1], [0, -1], [1, -1],
      [-1, 0],           [1, 0],
      [-1, 1], [0, 1], [1, 1],
      [-1, 0],           [1, 0],
      [-1, 1], [0, 1], [1, 1],
    ],
    '9': [
      [-1, -1], [0, -1], [1, -1],
      [-1, 0],           [1, 0],
      [-1, 1], [0, 1], [1, 1],
            [1, 0],
      [-1, 1], [0, 1], [1, 1],
    ],
  }
  return patterns[digit] || []
}

// Get colors for error codes
const getErrorColors = (code) => {
  const colorSchemes = {
    '400': ['#ef4444', '#f87171', '#dc2626'],
    '401': ['#f59e0b', '#fbbf24', '#d97706'],
    '403': ['#8b5cf6', '#a78bfa', '#7c3aed'],
    '404': ['#3b82f6', '#60a5fa', '#2563eb'],
    '500': ['#ef4444', '#f87171', '#dc2626'],
    '503': ['#f59e0b', '#fbbf24', '#d97706'],
    default: ['#4f46e5', '#6366f1', '#4338ca'],
  }
  return colorSchemes[String(code)] || colorSchemes.default
}

// Main ErrorPage component
const ErrorPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const containerRef = useRef(null)
  
  const [balls, setBalls] = useState([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)
  
  // Get error data from location state or use defaults
  const errorData = location.state || {
    code: 404,
    title: 'Page Not Found',
    message: 'The page you\'re looking for doesn\'t exist.',
  }
  
  const { code, title, message } = errorData
  
  // Calculate ball positions
  const calculateBallPositions = useCallback(() => {
    if (!containerRef.current) return []
    
    const codeStr = String(code)
    const colors = getErrorColors(code)
    const ballSize = 35
    const digitSpacing = ballSize * 1.8
    const ballSpacing = ballSize * 0.8
    
    // Get container dimensions
    const container = containerRef.current
    const centerX = container.offsetWidth / 2
    const centerY = container.offsetHeight / 2 - 50
    
    // Calculate total width of error code
    let totalWidth = 0
    const digitInfo = codeStr.split('').map((digit, digitIndex) => {
      const pattern = getDigitBalls(digit)
      const digitWidth = Math.max(...pattern.map(([x]) => x)) - Math.min(...pattern.map(([x]) => x)) + 1
      const width = digitWidth * ballSpacing
      totalWidth += width + digitSpacing
      return { digit, pattern, width, index: digitIndex }
    })
    
    // Starting X position to center the number
    let currentX = centerX - totalWidth / 2 + ballSize / 2
    
    const allBalls = []
    
    digitInfo.forEach(({ digit, pattern, width, index }) => {
      // Center this digit horizontally
      const digitCenterX = currentX + width / 2
      
      pattern.forEach(([dx, dy], ballIndex) => {
        const targetX = digitCenterX + dx * ballSpacing - ballSize / 2
        const targetY = centerY + dy * ballSpacing - ballSize / 2
        
        // Random starting position at bottom
        const startX = Math.random() * container.offsetWidth
        const startY = container.offsetHeight + 50 + Math.random() * 100
        
        allBalls.push({
          id: `${index}-${ballIndex}`,
          digit,
          position: { x: startX, y: startY },
          targetPosition: { x: targetX, y: targetY },
          delay: index * 100 + ballIndex * 30,
          color: colors[index % colors.length],
          size: ballSize,
        })
      })
      
      currentX += width + digitSpacing
    })
    
    return allBalls
  }, [code])
  
  // Initialize and start animation
  useEffect(() => {
    const calculatedBalls = calculateBallPositions()
    setBalls(calculatedBalls)
    
    // Start animation after a short delay
    const timer = setTimeout(() => {
      setIsAnimating(true)
      
      // Mark animation complete after balls have time to arrive
      setTimeout(() => {
        setAnimationComplete(true)
      }, 2500)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [calculateBallPositions])
  
  // Handle go back
  const handleGoBack = () => {
    navigate(-1)
  }
  
  // Handle go home
  const handleGoHome = () => {
    navigate('/', { replace: true })
  }
  
  // Check if user has seen error (prevent replay on refresh)
  useEffect(() => {
    const hasSeenError = sessionStorage.getItem(`error-${code}-seen`)
    if (hasSeenError) {
      setAnimationComplete(true)
      // Animate balls to final positions immediately
      const finalBalls = balls.map(ball => ({
        ...ball,
        position: ball.targetPosition,
      }))
      setBalls(finalBalls)
    } else {
      sessionStorage.setItem(`error-${code}-seen`, 'true')
    }
    
    return () => {
      sessionStorage.removeItem(`error-${code}-seen`)
    }
  }, [code, balls])
  
  return (
    <div className="error-page" ref={containerRef}>
      <div className="error-background">
        {/* Animated background particles */}
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                '--delay': `${Math.random() * 5}s`,
                '--duration': `${3 + Math.random() * 4}s`,
                '--size': `${3 + Math.random() * 6}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
        
        {/* Gradient orbs for depth */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      
      <div className="error-content">
        {/* Animated error code balls */}
        <div className={`error-balls-container ${animationComplete ? 'complete' : ''}`}>
          {balls.map((ball) => (
            <Ball
              key={ball.id}
              position={ball.position}
              targetPosition={ball.targetPosition}
              delay={ball.delay}
              color={ball.color}
              size={ball.size}
              isAnimating={isAnimating}
              isComplete={animationComplete}
            />
          ))}
        </div>
        
        {/* Error title and message */}
        <div className={`error-text ${animationComplete ? 'visible' : ''}`}>
          <h1 className="error-title">{title}</h1>
          <p className="error-message">{message}</p>
        </div>
        
        {/* Action buttons */}
        <div className={`error-buttons ${animationComplete ? 'visible' : ''}`}>
          <button
            className="error-btn error-btn-secondary"
            onClick={handleGoBack}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Go Back
          </button>
          <button
            className="error-btn error-btn-primary"
            onClick={handleGoHome}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Home
          </button>
        </div>
      </div>
      
      {/* Error code watermark */}
      <div className="error-watermark">
        {String(code).split('').map((digit, i) => (
          <span key={i}>{digit}</span>
        ))}
      </div>
    </div>
  )
}

export default ErrorPage

