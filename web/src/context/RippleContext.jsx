import React, { createContext, useContext, useState, useCallback, useRef } from 'react'

const RippleContext = createContext()

export function RippleProvider({ children }) {
  const [ripples, setRipples] = useState([])
  const rippleIdRef = useRef(0)

  const createRipple = useCallback((x, y) => {
    const id = rippleIdRef.current++
    const ripple = {
      id,
      x,
      y,
      startTime: performance.now(),
      duration: 2400,
    }
    setRipples((prev) => [...prev, ripple])

    // Auto-cleanup after duration
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
    }, ripple.duration)
  }, [])

  return (
    <RippleContext.Provider value={{ ripples, createRipple }}>
      {children}
    </RippleContext.Provider>
  )
}

export function useRipple() {
  const context = useContext(RippleContext)
  if (!context) {
    throw new Error('useRipple must be used within RippleProvider')
  }
  return context
}
