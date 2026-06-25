/**
 * useScrollCenter Hook
 * 
 * Detects which tile is in the center of the viewport
 * Useful for scroll-based interactions on mobile
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export function useScrollCenter() {
  const tileRefs = useRef(new Map())
  const [centerTileId, setCenterTileId] = useState(null)
  const [registryVersion, setRegistryVersion] = useState(0)

  const registerTile = useCallback((id, ref) => {
    if (ref) {
      tileRefs.current.set(id, ref)
    } else {
      tileRefs.current.delete(id)
    }
    setRegistryVersion((prev) => prev + 1)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (tileRefs.current.size === 0) return

      const viewportCenter = window.innerHeight / 2
      let closestTile = null
      let closestDistance = Infinity

      for (const [id, ref] of tileRefs.current.entries()) {
        if (!ref || !ref.getBoundingClientRect) continue

        const rect = ref.getBoundingClientRect()
        const tileCenterY = rect.top + rect.height / 2
        const distance = Math.abs(tileCenterY - viewportCenter)

        if (distance < closestDistance) {
          closestDistance = distance
          closestTile = id
        }
      }

      if (closestTile !== centerTileId) {
        setCenterTileId(closestTile)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [centerTileId, registryVersion])

  return { centerTileId, registerTile }
}

/**
 * ScrollCenterContext
 * Provides scroll center detection to all tiles in a section
 */
import React, { createContext, useContext } from 'react'

const ScrollCenterContext = createContext(null)

export function ScrollCenterProvider({ children }) {
  const { centerTileId, registerTile } = useScrollCenter()
  const value = useMemo(() => ({ centerTileId, registerTile }), [centerTileId, registerTile])

  return (
    <ScrollCenterContext.Provider value={value}>
      {children}
    </ScrollCenterContext.Provider>
  )
}

export function useScrollCenterContext() {
  return useContext(ScrollCenterContext)
}
