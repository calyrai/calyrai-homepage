/**
 * KnowledgeGraph Component — Stage 5
 * 
 * Visualizes the ecosystem as an interactive knowledge graph
 * Consumes nexus.graph.json (ReactFlow format)
 * 
 * Features:
 * - Interactive node layout (force-directed positioning)
 * - Edges show relationships between nodes
 * - Zoom + pan navigation
 * - Click nodes to highlight and sync with tiles (Stage 6)
 * - Visual feedback on hover/selection
 * - Responsive sizing
 * 
 * Stage 6: Context-Driven Selection
 * - Integrated with SelectionContext for Tile ↔ Graph sync
 * - Click node → highlight tile, vice versa
 */

import React, { useCallback, useState, useEffect } from 'react'
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow'
import { useSelection } from '../context/SelectionContext'
import 'reactflow/dist/style.css'

export default function KnowledgeGraph({ graphData, theme, context = {} }) {
  const { nodes: initialNodes = [], edges: initialEdges = [] } = graphData || {}
  const positionedNodes = initialNodes.map((node, index) => ({
    ...node,
    position:
      node.position && typeof node.position.x === 'number' && typeof node.position.y === 'number'
        ? node.position
        : {
            x: (index % 4) * 240,
            y: Math.floor(index / 4) * 140,
          },
  }))
  const { selectedTile, setSelectedTile } = useSelection()
  const [nodes, setNodes, onNodesChange] = useNodesState(positionedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const colors = theme?.skin?.colors || {}

  // Update nodes with styling when theme or selection changes
  useEffect(() => {
    const styledNodes = positionedNodes.map((node) => {
      const isSelected = selectedTile === node.id
      const isHighlighted = selectedTile === node.id

      return {
        ...node,
        data: {
          ...node.data,
          label: node.data?.title || node.label || node.id,
          isSelected,
          isHighlighted,
        },
        style: {
          ...node.style,
          background: isSelected || isHighlighted
            ? colors.accent || '#FFFFFF'
            : colors.background || '#000000',
          color: colors.text_primary || '#FFFFFF',
          border: `2px solid ${isSelected ? (colors.accent || '#FFFFFF') : (colors.border || '#666666')}`,
          borderRadius: '8px',
          padding: '10px 12px',
          fontSize: '0.875rem',
          fontWeight: isSelected || isHighlighted ? 600 : 400,
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          boxShadow: isSelected || isHighlighted 
            ? `0 0 12px ${colors.accent || '#FFFFFF'}88`
            : '0 2px 4px rgba(0,0,0,0.25)',
        },
      }
    })

    setNodes(styledNodes)
  }, [positionedNodes, selectedTile, setNodes, colors.accent, colors.background, colors.border, colors.text_primary])

  // Style edges
  useEffect(() => {
    const styledEdges = initialEdges.map((edge) => ({
      ...edge,
      style: {
        stroke: colors.text_primary || '#FFFFFF',
        strokeWidth: 2,
        opacity: 0.85,
      },
      animated: true,
    }))

    setEdges(styledEdges)
  }, [initialEdges, colors.text_primary, setEdges])

  const handleNodeClick = useCallback(
    (event, node) => {
      // Update context with selected node ID (Stage 6)
      setSelectedTile(node.id)
    },
    [setSelectedTile]
  )

  if (!graphData || initialNodes.length === 0) {
    return (
      <div className="knowledge-graph-empty">
        <p>No graph data available</p>
      </div>
    )
  }

  return (
    <div className="knowledge-graph-container" style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
      >
        <Background color={colors.border_light || 'rgba(255,255,255,0.12)'} />
        <Controls />
      </ReactFlow>
    </div>
  )
}
