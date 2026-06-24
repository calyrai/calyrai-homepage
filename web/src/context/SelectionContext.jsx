/**
 * SelectionContext — Shared State for Tile ↔ Graph Sync
 * 
 * Provides global selectedTile state that both views subscribe to
 * Allows clicking a tile to highlight nodes, and vice versa
 */

import React, { createContext, useState, useCallback } from 'react'

export const SelectionContext = createContext({
  selectedTile: null,
  setSelectedTile: () => {},
})

export function SelectionProvider({ children }) {
  const [selectedTile, setSelectedTile] = useState(null)

  const handleSelectTile = useCallback((tileId) => {
    setSelectedTile(tileId === selectedTile ? null : tileId)
  }, [selectedTile])

  const value = {
    selectedTile,
    setSelectedTile: handleSelectTile,
  }

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  )
}

// Hook for consuming the context
export function useSelection() {
  const context = React.useContext(SelectionContext)
  if (!context) {
    throw new Error('useSelection must be used within SelectionProvider')
  }
  return context
}
