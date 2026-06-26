/**
 * Renderer — Main rendering engine for Nexus AST
 * 
 * Consumes nexus.ast.json (fully resolved AST)
 * Maps node types to React components
 * Data-driven: no hardcoding, all from YAML sources
 * 
 * Pattern:
 *   renderNode(node, theme) → switch(node.type) → component
 */

import React from 'react'
import Page from './Page'
import Section from './Section'
import Hero from './Hero'
import Tile from './Tile'
import Element from './Element'

const NODE_COMPONENTS = {
  page: Page,
  section: Section,
  hero: Hero,
  tile: Tile,
  element: Element,
}

/**
 * Main render dispatcher
 * 
 * @param {Object} node - AST node with {type, id, title, children, ...}
 * @param {Object} theme - Theme configuration from nexus.theme.json
 * @param {Object} context - Optional context (selection state, etc.)
 * @returns {React.ReactElement}
 */
export function renderNode(node, theme, context = {}) {
  if (!node || !node.type) {
    return null
  }

  const props = {
    node,
    theme,
    context,
    renderNode, // Pass renderer for recursive rendering
  }

  const Component = NODE_COMPONENTS[node.type]
  if (!Component) {
    console.warn(`Unknown node type: ${node.type}`)
    return <div className="node-unknown">Unknown: {node.type}</div>
  }

  return <Component {...props} />
}

/**
 * Render children nodes
 * Filters nulls and renders array of nodes
 * 
 * @param {Array} children - Array of child nodes
 * @param {Object} theme - Theme
 * @param {Object} context - Context
 * @returns {Array} Rendered children
 */
export function renderChildren(children, theme, context = {}) {
  if (!Array.isArray(children)) {
    return []
  }

  return children
    .map((child, idx) => (
      <React.Fragment key={child.id || idx}>
        {renderNode(child, theme, context)}
      </React.Fragment>
    ))
    .filter(Boolean)
}

export default renderNode
