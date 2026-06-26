import { useEffect, useState } from 'react'

const MOBILE_BREAKPOINT_PX = 768

function computeIsMobileViewport() {
  const isNarrowViewport = window.innerWidth <= MOBILE_BREAKPOINT_PX
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches
  return isNarrowViewport || isCoarsePointer
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(computeIsMobileViewport())

  useEffect(() => {
    const handleResize = () => setIsMobile(computeIsMobileViewport())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isMobile
}
