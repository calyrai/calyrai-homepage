import React, { useEffect, useMemo, useRef, useState } from 'https://esm.sh/react@18.3.1';
import { createRoot } from 'https://esm.sh/react-dom@18.3.1/client';
import { createPortal } from 'https://esm.sh/react-dom@18.3.1';
import htm from 'https://esm.sh/htm@3.1.1';
import { marked } from 'https://esm.sh/marked@13.0.3';
import ReactFlow, {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlowProvider,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
} from 'https://esm.sh/reactflow@11.11.4?deps=react@18.3.1,react-dom@18.3.1';

const html = htm.bind(React.createElement);

(function () {
  'use strict';

  const flowRoot = document.getElementById('nexus-flow-root');
  const backpackPanelRoot = document.getElementById('backpack-panel-root');
  const brailleInputRoot = document.getElementById('braille-input-root');
  const activeNodePanelRoot = document.getElementById('active-node-panel-root');
  const connectedListRoot = document.getElementById('connected-list-root');
  const contentOutlineRoot = document.getElementById('content-outline-root');
  const terminalPanelRoot = document.getElementById('terminal-panel-root');
  const commentPanelRoot = document.getElementById('comment-panel-root');

  if (!flowRoot || !backpackPanelRoot || !brailleInputRoot || !activeNodePanelRoot || !connectedListRoot || !contentOutlineRoot || !terminalPanelRoot || !commentPanelRoot) {
    return;
  }

  const tileRootMap = {
    'nexus-flow-root': flowRoot,
    'backpack-panel-root': backpackPanelRoot,
    'braille-input-root': brailleInputRoot,
    'active-node-panel-root': activeNodePanelRoot,
    'connected-list-root': connectedListRoot,
    'content-outline-root': contentOutlineRoot,
    'terminal-panel-root': terminalPanelRoot,
    'comment-panel-root': commentPanelRoot,
  };

  const terminalSessionId = getTerminalSessionId();
  const terminalApiBase = window.location.protocol + '//' + window.location.hostname + ':8000';
  const GLABS_SECTION_EVENT = 'nexus:section-change';
  const initialTerminalLines = [
    'zsh shell ready.',
    'This terminal executes real commands through the local Calyr backend.',
    'Examples: pwd, ls, cd src, git status, python --version',
    'If the backend is not running on port 8000, command execution will fail.',
    ''
  ];
  const initialStatusLines = [
    '[ui] react flow sandbox ready',
    '[ui] terminal tabs available: terminal, logs, graph, code, output',
    '[ui] drag cards, connect from handles, overlap to auto-link, delete selected edges with d/backspace'
  ];
  const defaultCommentNote = [
    '# Workspace Notes',
    '',
    '- Graph: focus on the active relation cluster.',
    '- Terminal: use for real shell commands and quick inspection.',
    '- Comments: capture decisions, TODOs, and markdown snippets here.',
  ].join('\n');

  const defaultNodeSpecs = [
    {
      id: 'nexus-core',
      name: 'Nexus Core',
      shortLabel: 'Nexus',
      bits: '101111',
      accent: 'cyan',
      description: 'Shared semantic frame, registry context, and composition rules for the current workspace.',
      links: ['Theory', 'Access', 'Engine', 'Sandbox', 'Gallery'],
      manual: false,
      hub: true,
      kind: 'Core',
    },
    {
      id: 'theory',
      name: 'Theory',
      shortLabel: 'Theory',
      bits: '110010',
      accent: 'white',
      manual: false,
      kind: 'Module',
      description: 'Maps the semantic topology and keeps region logic coherent across the workspace.',
      links: ['Semantic Cartography', 'Boundary Logic'],
    },
    {
      id: 'access',
      name: 'Access',
      shortLabel: 'Access',
      bits: '100110',
      accent: 'cyan',
      manual: false,
      kind: 'Surface',
      description: 'Publishes stable projections of the workspace into readable public or collaborative surfaces.',
      links: ['Projection Layer', 'Public Relay'],
    },
    {
      id: 'engine',
      name: 'Engine',
      shortLabel: 'Engine',
      bits: '110101',
      accent: 'white',
      manual: false,
      kind: 'Runtime',
      description: 'Executes orchestration, graph evaluation, and constrained runtime behavior.',
      links: ['Execution', 'Scheduling'],
    },
    {
      id: 'sandbox',
      name: "G'labs Sandbox",
      shortLabel: 'Sandbox',
      bits: '110110',
      accent: 'magenta',
      manual: false,
      kind: 'Lab',
      description: 'Experimental track for testing new semantics before they enter the coordinated stack.',
      links: ['Experiments', 'Prototypes'],
    },
    {
      id: 'gallery',
      name: 'Gallery',
      shortLabel: 'Gallery',
      bits: '101100',
      accent: 'white',
      manual: false,
      kind: 'Output',
      description: 'Application-facing views that turn semantic capability into concrete outcomes and deliverables.',
      links: ['Applications', 'Delivery'],
    },
  ];

  const defaultTileDefinitions = [
    { id: 'graph', panelId: 'panel-graph', renderer: 'graph', rootId: 'nexus-flow-root', title: 'Graph', description: 'Semantic workspace graph projection', summaryMode: 'graph' },
    { id: 'registry', panelId: 'panel-registry', renderer: 'registry', rootId: 'backpack-panel-root', title: 'Registry', description: 'Saved semantic patterns', summaryMode: 'registry' },
    { id: 'compose', panelId: 'panel-compose', renderer: 'compose', rootId: 'braille-input-root', title: 'Compose', description: 'Pattern composition controls', summaryMode: 'compose' },
    { id: 'selection', panelId: 'panel-selection', renderer: 'selection', rootId: 'active-node-panel-root', title: 'Selection', description: 'Active semantic object', summaryMode: 'selection' },
    { id: 'linked', panelId: 'panel-linked', renderer: 'linked', rootId: 'connected-list-root', title: 'Linked Modules', description: 'Semantic adjacencies', summaryMode: 'linked' },
    { id: 'contents', panelId: 'panel-contents', renderer: 'contents', rootId: 'content-outline-root', title: 'Contents', description: 'Outline projection', summaryMode: 'contents' },
    { id: 'terminal', panelId: 'panel-terminal', renderer: 'terminal', rootId: 'terminal-panel-root', title: 'Terminal', description: 'Runtime monitor and command stream', summaryMode: 'terminal' },
    { id: 'comment', panelId: 'panel-comment', renderer: 'comment', rootId: 'comment-panel-root', title: 'Notes', description: 'Semantic notes and markdown', summaryMode: 'comment' },
  ];

  let semanticWorkspace = {
    tiles: defaultTileDefinitions.slice(),
    nodeSpecs: defaultNodeSpecs.slice(),
    edges: buildEdgesFromSpecs(defaultNodeSpecs, []),
    registry: {
      backpackItems: ['101111', '110010', '100110', '110101', '110110', '101100'],
      makerBits: '000000',
    },
    evaluation: {
      primary_route: ['nexus-core', 'theory', 'access', 'engine', 'gallery'],
      secondary_routes: [{ name: 'access_to_sandbox', path: ['access', 'sandbox'] }],
      payload: { dataset: 'nexus.semantic.transfer', mode: 'deterministic' },
    },
  };

  const alphaFoldComponentWorkspace = {
    tiles: [
      { id: 'graph', panelId: 'panel-graph', renderer: 'graph', rootId: 'nexus-flow-root', title: 'glabs.nexus.engines.alphafold', description: 'Developed code-to-plot execution order', summaryMode: 'graph', order: 1 },
      { id: 'registry', panelId: 'panel-registry', renderer: 'registry', rootId: 'backpack-panel-root', title: 'Registry', description: 'JSON settings and braille for each step', summaryMode: 'registry', order: 2 },
      { id: 'selection', panelId: 'panel-selection', renderer: 'selection', rootId: 'active-node-panel-root', title: 'Selection', description: 'Active AlphaFold step', summaryMode: 'selection', order: 3 },
      { id: 'linked', panelId: 'panel-linked', renderer: 'linked', rootId: 'connected-list-root', title: 'Plots', description: 'Attached plot outputs and adjacencies', summaryMode: 'linked', order: 4 },
      { id: 'contents', panelId: 'panel-contents', renderer: 'contents', rootId: 'content-outline-root', title: 'Developed Order', description: 'Pipeline order and execution trace', summaryMode: 'contents', order: 5 },
      { id: 'terminal', panelId: 'panel-terminal', renderer: 'terminal', rootId: 'terminal-panel-root', title: 'Terminal', description: 'AlphaFold runtime monitor', summaryMode: 'terminal', order: 6 },
      { id: 'comment', panelId: 'panel-comment', renderer: 'comment', rootId: 'comment-panel-root', title: 'Notes', description: 'Execution notes and payload remarks', summaryMode: 'comment', order: 7 },
    ],
    nodeSpecs: [
      { id: 'af-input', name: 'Input Sequence', shortLabel: 'Input', bits: '100000', accent: 'cyan', description: 'Primary sequence entry and job identity seed for the AlphaFold run.', links: ['Sequence View'], kind: 'Code', position: { x: 140, y: 150 }, pearlSize: 'large' },
      { id: 'af-parse', name: 'Parse Split JSON', shortLabel: 'Parse', bits: '110000', accent: 'cyan', description: 'Read split-definition JSON and lift segment policies into runtime structure.', links: ['Segment Map'], kind: 'Code', position: { x: 380, y: 150 }, pearlSize: 'large' },
      { id: 'af-mask', name: 'Apply Mask Policy', shortLabel: 'Mask', bits: '111000', accent: 'cyan', description: 'Apply masking and transformation rules to build the protected working sequence.', links: ['Mask View'], kind: 'Code', position: { x: 620, y: 150 }, pearlSize: 'large' },
      { id: 'af-build', name: 'Build AF3 Payload', shortLabel: 'Build', bits: '111100', accent: 'cyan', description: 'Assemble the final AlphaFold 3 payload with sequence, seeds, and metadata.', links: ['Score Plot'], kind: 'Code', position: { x: 860, y: 150 }, pearlSize: 'large' },
      { id: 'af-submit', name: 'Submit Job', shortLabel: 'Submit', bits: '111110', accent: 'cyan', description: 'Deliver the composed payload into the AlphaFold execution surface.', links: ['Server'], kind: 'Code', position: { x: 1100, y: 150 }, pearlSize: 'large' },
      { id: 'af-seq-view', name: 'Sequence View', shortLabel: 'Seq View', bits: '100001', accent: 'white', description: 'Small plot pearl for the raw sequence projection.', links: ['Input Sequence'], kind: 'Plot', position: { x: 140, y: 350 }, pearlSize: 'small' },
      { id: 'af-seg-map', name: 'Segment Map', shortLabel: 'Seg Map', bits: '110001', accent: 'white', description: 'Segment boundaries and policy map extracted from the JSON definition.', links: ['Parse Split JSON'], kind: 'Plot', position: { x: 380, y: 350 }, pearlSize: 'small' },
      { id: 'af-mask-view', name: 'Mask View', shortLabel: 'Mask View', bits: '111001', accent: 'white', description: 'Transformed sequence preview after policy application.', links: ['Apply Mask Policy'], kind: 'Plot', position: { x: 620, y: 350 }, pearlSize: 'small' },
      { id: 'af-score', name: 'Score Plot', shortLabel: 'Score', bits: '111101', accent: 'white', description: 'Confidence and output metrics attached to the build stage.', links: ['Build AF3 Payload'], kind: 'Plot', position: { x: 860, y: 350 }, pearlSize: 'small' },
    ],
    edges: [
      { source: 'af-input', target: 'af-parse' },
      { source: 'af-parse', target: 'af-mask' },
      { source: 'af-mask', target: 'af-build' },
      { source: 'af-build', target: 'af-submit' },
      { source: 'af-input', target: 'af-seq-view' },
      { source: 'af-parse', target: 'af-seg-map' },
      { source: 'af-mask', target: 'af-mask-view' },
      { source: 'af-build', target: 'af-score' },
    ],
    registry: {
      backpackItems: ['100000', '110000', '111000', '111100', '111110', '100001', '110001', '111001', '111101'],
      makerBits: '111100',
      stepConfigs: [
        { id: 'af-input', label: 'Input Sequence', bits: '100000', role: 'code', settings: { step: 'input_sequence', accepts: 'amino_acid_string', chain: 'A', seeds: [1] } },
        { id: 'af-parse', label: 'Parse Split JSON', bits: '110000', role: 'code', settings: { step: 'parse_split_json', format: 'nexus.split_definition', fields: ['object_id', 'segments'] } },
        { id: 'af-mask', label: 'Apply Mask Policy', bits: '111000', role: 'code', settings: { step: 'apply_mask_policy', policies: ['withheld', 'transformed'], replacement: 'X' } },
        { id: 'af-build', label: 'Build AF3 Payload', bits: '111100', role: 'code', settings: { step: 'build_af3_payload', dialect: 'alphafold3', version: 1, output_fields: ['name', 'modelSeeds', 'sequences'] } },
        { id: 'af-submit', label: 'Submit Job', bits: '111110', role: 'code', settings: { step: 'submit_job', target: 'alphafoldserver.com', method: 'paste_json' } },
        { id: 'af-seq-view', label: 'Sequence View', bits: '100001', role: 'plot', settings: { output: 'sequence_display', format: 'linear_aa_view' } },
        { id: 'af-seg-map', label: 'Segment Map', bits: '110001', role: 'plot', settings: { output: 'segment_map', format: 'range_chart' } },
        { id: 'af-mask-view', label: 'Mask View', bits: '111001', role: 'plot', settings: { output: 'mask_preview', format: 'sequence_diff_view' } },
        { id: 'af-score', label: 'Score Plot', bits: '111101', role: 'plot', settings: { output: 'confidence_plot', format: 'per_residue_score' } },
      ],
    },
    evaluation: {
      primary_route: ['af-input', 'af-parse', 'af-mask', 'af-build', 'af-submit'],
      secondary_routes: [
        { name: 'input_plot', path: ['af-input', 'af-seq-view'] },
        { name: 'parse_plot', path: ['af-parse', 'af-seg-map'] },
        { name: 'mask_plot', path: ['af-mask', 'af-mask-view'] },
        { name: 'build_plot', path: ['af-build', 'af-score'] },
      ],
      payload: { engine: 'glabs.nexus.engines.alphafold', engine_alias: 'nexus.engines.alphafold', engine_id: 'glabs_nexus_engines_alphafold', mode: 'developed-order' },
    },
  };

  initWorkspace();

  function BrailleNode(props) {
    const data = props.data;
    const className = [
      'rf-braille-node',
      'is-' + data.accent,
      data.progressState ? 'is-progress-' + data.progressState : '',
      data.isActive ? 'is-focused' : '',
      data.isConnected ? 'is-connected-node' : '',
      data.isDropTarget ? 'is-drop-target' : '',
    ].filter(Boolean).join(' ');

    return html`
      <div className=${className} onClick=${function () { data.onSelect(props.id); }}>
        <${Handle} className="node-handle node-handle-target" type="target" position=${Position.Left} isConnectable=${true} />
        <${Handle} className="node-handle node-handle-source" type="source" position=${Position.Right} isConnectable=${true} />
        ${data.manual ? html`<button className="graph-node-delete" type="button" onClick=${function (event) {
          event.preventDefault();
          event.stopPropagation();
          data.onDelete(props.id);
        }}>x</button>` : null}
        <div className="graph-node-drag-handle"></div>
        <div className="rf-node-wrap">
          <${BraillePearl}
            label=${data.shortLabel || data.name}
            kind=${data.kind || 'Module'}
            description=${data.description}
            bits=${data.bits}
            accent=${data.accent}
            active=${data.isActive}
            motion=${data.motion}
            connectionCount=${Array.isArray(data.links) ? data.links.length : 0}
            codePreview=${buildHoverCodePreview(data)}
            showInfo=${true}
            mini=${data.pearlSize === 'small'}
          />
        </div>
      </div>
    `;
  }

  const nodeTypes = { braille: BrailleNode };

  function BraillePearl(props) {
    const className = [
      'braille-pearl',
      props.panel ? 'is-panel' : '',
      props.mini ? 'is-mini' : '',
      'is-' + (props.accent || 'white'),
      props.active ? 'is-active' : '',
    ].filter(Boolean).join(' ');
    const labelLine = String(props.label || 'Node');

    const motionStyle = {
      '--pearl-rgb': accentRgb(props.accent),
      '--ring-a-duration': ((props.motion && props.motion.ringA) || 18) + 's',
      '--ring-b-duration': ((props.motion && props.motion.ringB) || 27) + 's',
      '--ring-c-duration': ((props.motion && props.motion.ringC) || 36) + 's',
      '--ring-a-delay': ((props.motion && props.motion.delayA) || 0) + 's',
      '--ring-b-delay': ((props.motion && props.motion.delayB) || 0) + 's',
      '--ring-c-delay': ((props.motion && props.motion.delayC) || 0) + 's',
    };

    return html`
      <div className=${className} style=${motionStyle}>
        <div className="braille-pearl-halo"></div>
        <div className="braille-ring braille-ring-a"></div>
        <div className="braille-ring braille-ring-b"></div>
        <div className="braille-ring braille-ring-c"></div>
        <div className="braille-pearl-core"></div>
        <div className="braille-pearl-label">
          <span className="braille-pearl-label-line">${labelLine}</span>
        </div>
        <div className="braille-pearl-braille">
          <span className="braille-row">${brailleMarkup(props.bits || '000000', props.accent || 'white')}</span>
        </div>
        ${props.showInfo ? html`
          <div className="braille-pearl-hover-card">
            <div className="braille-pearl-info-top">
              <span className="braille-pearl-info-kind">${props.kind}</span>
              <span className="braille-pearl-info-bits">${props.bits}</span>
            </div>
            <div className="braille-pearl-info-title">${props.label}</div>
            <div className="braille-pearl-info-description">${props.description}</div>
            <div className="braille-pearl-structure">
              ${props.codePreview.map(function (item, index) {
                return html`
                  <div key=${'code-preview-' + index + '-' + item.label} className="braille-pearl-structure-row">
                    <span className="braille-pearl-structure-label">${item.label}</span>
                    <span className="braille-pearl-structure-value">${item.value}</span>
                  </div>
                `;
              })}
            </div>
            <div className="braille-pearl-meta-bar">${props.connectionCount} links</div>
          </div>
        ` : null}
      </div>
    `;
  }

  function BackpackPanel(props) {
    return html`
      <div className="backpack-grid">
        ${props.items.map(function (bits, index) {
          return html`
            <button
              key=${'backpack-' + index + '-' + bits}
              className="backpack-brick"
              type="button"
              title=${'Load braille pattern ' + bits}
              onClick=${function () { props.onLoadBits(bits); }}
            >
              <div className="registry-token">
                <span className="braille-row">${brailleMarkup(bits, 'white')}</span>
              </div>
              <div className="backpack-bits">${bits}</div>
            </button>
          `;
        })}
      </div>
      <button className="mini-add" type="button" onClick=${props.onAdd}>+</button>
    `;
  }

  function AlphaFoldRegistryPanel(props) {
    const steps = Array.isArray(props.stepConfigs) ? props.stepConfigs.slice() : [];
    const nodeSpecs = Array.isArray(props.nodeSpecs) ? props.nodeSpecs : [];
    const [stepJsonDrafts, setStepJsonDrafts] = useState({});
    const [docDrafts, setDocDrafts] = useState({});

    useEffect(function () {
      setStepJsonDrafts(function (current) {
        const next = Object.assign({}, current);
        steps.forEach(function (step) {
          if (!next[step.id]) {
            next[step.id] = JSON.stringify(step.settings || {}, null, 2);
          }
        });
        return next;
      });
    }, [steps.map(function (step) { return step.id + ':' + JSON.stringify(step.settings || {}); }).join('|')]);

    const nodeSpecById = new Map(nodeSpecs.map(function (spec) {
      return [String(spec.id || ''), spec];
    }));
    const sortedRegister = steps.sort(function (a, b) {
      var roleA = a && a.role === 'plot' ? 1 : 0;
      var roleB = b && b.role === 'plot' ? 1 : 0;
      if (roleA !== roleB) return roleA - roleB;
      var labelA = String((a && a.label) || '');
      var labelB = String((b && b.label) || '');
      return labelA.localeCompare(labelB);
    });

    const documentationRows = sortedRegister.map(function (step) {
      const spec = nodeSpecById.get(String(step.id || '')) || null;
      return {
        id: String(step.id || ''),
        label: String(step.label || step.id || 'Step'),
        role: String(step.role || 'code'),
        bits: String(step.bits || '000000'),
        description: (docDrafts[String(step.id || '')] !== undefined)
          ? String(docDrafts[String(step.id || '')])
          : (spec && spec.description
            ? String(spec.description)
            : 'No step documentation available yet.'),
        settingsKeys: Object.keys((step && step.settings) || {})
      };
    });

    return html`
        <div className="registry-section">
          <h4 className="registry-section-title">Register</h4>
          <div className="registry-step-list">
            ${sortedRegister.map(function (step) {
              return html`
                <div key=${'registry-step-' + step.id} className=${['registry-step-card', step.role === 'plot' ? 'is-plot' : 'is-code'].join(' ')}>
                  <div className="registry-step-head">
                    <div className="registry-step-braille"><span className="braille-row">${brailleMarkup(step.bits || '000000', step.role === 'plot' ? 'white' : 'cyan')}</span></div>
                    <div className="registry-step-copy">
                      <div className="registry-step-label">${step.label}</div>
                      <div className="registry-step-bits">${step.bits}</div>
                    </div>
                  </div>
                  <textarea
                    className="registry-step-editor"
                    value=${stepJsonDrafts[step.id] || JSON.stringify(step.settings || {}, null, 2)}
                    onChange=${function (event) {
                      const value = String(event.target.value || '');
                      setStepJsonDrafts(function (current) {
                        const next = Object.assign({}, current);
                        next[step.id] = value;
                        return next;
                      });
                    }}
                    onBlur=${function (event) {
                      if (typeof props.onUpdateStepSettings !== 'function') return;
                      const nextText = String(event.currentTarget.value || '');
                      try {
                        const parsed = JSON.parse(nextText);
                        props.onUpdateStepSettings(step.id, parsed);
                      } catch (_error) {
                        // Keep editing text; invalid JSON is not committed.
                      }
                    }}
                  ></textarea>
                </div>
              `;
            })}
          </div>
        </div>

        <div className="registry-section registry-section-docs">
          <h4 className="registry-section-title">Documentation</h4>
          <div className="registry-doc-list">
            ${documentationRows.map(function (row) {
              const docMeta = row.settingsKeys.length ? row.settingsKeys.join(', ') : 'none';
              return html`
                <article key=${'registry-doc-' + row.id} className="registry-doc-card ${row.role === 'plot' ? 'is-plot' : 'is-code'}">
                  <header className="registry-doc-head">
                    <strong className="registry-doc-title">${row.label}</strong>
                    <span className="registry-doc-bits">${row.bits}</span>
                  </header>
                  <textarea
                    className="registry-doc-editor"
                    value=${row.description}
                    onChange=${function (event) {
                      const value = String(event.target.value || '');
                      setDocDrafts(function (current) {
                        const next = Object.assign({}, current);
                        next[row.id] = value;
                        return next;
                      });
                    }}
                    onBlur=${function (event) {
                      if (typeof props.onUpdateStepDescription === 'function') {
                        props.onUpdateStepDescription(row.id, String(event.currentTarget.value || ''));
                      }
                    }}
                  ></textarea>
                  <p className="registry-doc-meta">Settings: ${docMeta}</p>
                </article>
              `;
            })}
          </div>
        </div>
      `;
  }

  function RegistryPanel(props) {
    if (props.mode === 'alphafold') {
      return html`<${AlphaFoldRegistryPanel}
        stepConfigs=${props.stepConfigs}
        nodeSpecs=${props.nodeSpecs}
        onUpdateStepSettings=${props.onUpdateStepSettings}
        onUpdateStepDescription=${props.onUpdateStepDescription}
      />`;
    }

    return html`
      <${BackpackPanel}
        items=${props.items}
        onAdd=${props.onAdd}
        onLoadBits=${props.onLoadBits}
      />
    `;
  }

  function BrailleInputPanel(props) {
    return html`
      <div className="braille-maker">
        ${Array.from({ length: 6 }, function (_value, index) {
          const isActive = props.bits.charAt(index) === '1';
          return html`
            <button
              key=${'maker-' + index}
              className=${['braille-maker-dot', isActive ? 'is-active' : ''].filter(Boolean).join(' ')}
              type="button"
              aria-label=${'Toggle braille dot ' + (index + 1)}
              onClick=${function () { props.onToggle(index); }}
            ></button>
          `;
        })}
      </div>
      <div className="tool-actions">
        <button className="panel-button" type="button" onClick=${props.onClear}>Clear</button>
        <button className="panel-button" type="button" onClick=${props.onRandom}>Random</button>
      </div>
      <div className="braille-maker-meta">Pattern ${props.bits}</div>
      <button className="panel-button panel-button-primary" type="button" onClick=${props.onActivate}>Activate</button>
    `;
  }

  function ActiveNodePanel(props) {
    if (!props.node) return null;
    return html`
      <div className="active-node-head">
        <div className="active-node-pearl"><${BraillePearl} label=${props.node.data.shortLabel || props.node.data.name} kind=${props.node.data.kind || 'Module'} description=${props.node.data.description} bits=${props.node.data.bits} accent=${props.node.data.accent} active=${true} connectionCount=${props.node.data.links ? props.node.data.links.length : 0} panel=${true} /></div>
        <div className="active-node-copy">
          <h3>${props.node.data.name}</h3>
          <p className="status-inline">Status: <span>Active</span></p>
        </div>
      </div>
      <p>${props.node.data.description || 'Braille graph node.'}</p>
      <p className="braille-maker-meta">Braille pattern ${props.node.data.bits}</p>
    `;
  }

  function getActiveSectionName() {
    const activeTab = document.querySelector('.sandbox-tab.is-active');
    return activeTab ? String(activeTab.dataset.section || 'workspace') : 'workspace';
  }

  function ConnectedListPanel(props) {
    if (!props.connections.length) {
      return html`<div className="connected-item is-empty">No active connections.</div>`;
    }

    return props.connections.map(function (item, index) {
      if (item.id) {
        return html`
          <button
            key=${'connection-' + index + '-' + item.label}
            className="connected-item"
            data-node-id=${item.id}
            type="button"
            onClick=${function () { props.onSelect(item.id); }}
          >
            ${item.label}
          </button>
        `;
      }
      return html`<div key=${'connection-' + index + '-' + item.label} className="connected-item">${item.label}</div>`;
    });
  }

  function ContentOutlinePanel(props) {
    if (props.mode === 'alphafold') {
      const orderedSteps = props.primaryRoute || [];
      const branchSteps = Array.isArray(props.secondaryRoutes) ? props.secondaryRoutes : [];
      return html`
        <div className="content-outline-group">
          <div className="content-outline-title">Primary Order</div>
          <div className="content-outline-list">
            ${orderedSteps.map(function (item, index) {
              const label = index + 1 + '. ' + item.label;
              if (item.id) {
                return html`
                  <button
                    key=${'af-order-' + item.id}
                    className="content-outline-item is-button"
                    type="button"
                    onClick=${function () { props.onSelect(item.id); }}
                  >
                    ${label}
                  </button>
                `;
              }
              return html`<div key=${'af-order-' + index} className="content-outline-item">${label}</div>`;
            })}
          </div>
        </div>

        <div className="content-outline-group">
          <div className="content-outline-title">Plot Branches</div>
          <div className="content-outline-list">
            ${branchSteps.map(function (route, index) {
              const pathLabel = Array.isArray(route.labels) ? route.labels.join(' -> ') : String(route.name || 'branch');
              return html`<div key=${'af-branch-' + index} className="content-outline-item">${pathLabel}</div>`;
            })}
          </div>
        </div>

        <div className="content-outline-group">
          <div className="content-outline-title">Active Step</div>
          <div className="content-outline-list">
            <div className="content-outline-item is-active">${props.activeNode ? props.activeNode.data.name : 'No active step'}</div>
            <div className="content-outline-item">Kind: ${props.activeNode ? props.activeNode.data.kind : 'Code'}</div>
            <div className="content-outline-item">Braille: ${props.activeNode ? props.activeNode.data.bits : '000000'}</div>
          </div>
        </div>
      `;
    }

    const [query, setQuery] = useState('');
    const suggestionChips = useMemo(function () {
      const chips = ['Overview', 'Structure', 'Runtime'];
      if (props.activeNode) chips.unshift(props.activeNode.data.shortLabel || props.activeNode.data.name);
      return chips;
    }, [props.activeNode ? props.activeNode.id : null]);

    const searchableItems = useMemo(function () {
      const items = [
        { label: 'Overview', meta: 'Section' },
        { label: 'Structure', meta: 'Section' },
        { label: 'Connections', meta: 'Section' },
        { label: 'Runtime', meta: 'Section' },
      ];

      if (props.activeNode) {
        items.push({ label: props.activeNode.data.name, meta: props.activeNode.data.kind || 'Module' });
        items.push({ label: props.activeNode.data.bits, meta: 'Braille' });
      }

      props.connections.forEach(function (item) {
        items.push({ label: item.label, meta: item.id ? 'Linked module' : 'Linked content', id: item.id || null });
      });

      return items;
    }, [props.activeNode ? props.activeNode.id : null, props.connections]);

    const filteredItems = useMemo(function () {
      const normalizedQuery = query.trim().toLowerCase();
      if (!normalizedQuery) return searchableItems;
      return searchableItems.filter(function (item) {
        return item.label.toLowerCase().includes(normalizedQuery) || item.meta.toLowerCase().includes(normalizedQuery);
      });
    }, [query, searchableItems]);

    return html`
      <div className="content-search-shell">
        <label className="content-search-bar" aria-label="Search contents">
          <span className="content-search-icon">Search</span>
          <input
            className="content-search-input"
            type="search"
            placeholder="Search modules, structure, runtime"
            value=${query}
            onInput=${function (event) { setQuery(event.currentTarget.value); }}
          />
        </label>
        <div className="content-search-chips">
          ${suggestionChips.map(function (chip) {
            return html`
              <button
                key=${'search-chip-' + chip}
                className="content-search-chip"
                type="button"
                onClick=${function () { setQuery(chip); }}
              >
                ${chip}
              </button>
            `;
          })}
        </div>
      </div>

      <div className="content-outline-group">
        <div className="content-outline-title">Search Results</div>
        <div className="content-outline-list">
          ${(filteredItems.length ? filteredItems : [{ label: 'No matching content', meta: 'Search' }]).map(function (item, index) {
            if (item.id) {
              return html`
                <button
                  key=${'search-result-' + index + '-' + item.label}
                  className="content-outline-item is-button"
                  type="button"
                  onClick=${function () { props.onSelect(item.id); }}
                >
                  <span className="content-outline-item-label">${item.label}</span>
                  <span className="content-outline-item-meta">${item.meta}</span>
                </button>
              `;
            }
            return html`
              <div key=${'search-result-' + index + '-' + item.label} className="content-outline-item">
                <span className="content-outline-item-label">${item.label}</span>
                <span className="content-outline-item-meta">${item.meta}</span>
              </div>
            `;
          })}
        </div>
      </div>

      <div className="content-outline-group">
        <div className="content-outline-title">Sections</div>
        <div className="content-outline-list">
          ${['Overview', 'Structure', 'Connections', 'Runtime'].map(function (item) {
            return html`<div key=${'outline-section-' + item} className="content-outline-item is-static">${item}</div>`;
          })}
        </div>
      </div>

      <div className="content-outline-group">
        <div className="content-outline-title">Active Module</div>
        <div className="content-outline-list">
          <div className="content-outline-item is-active">${props.activeNode ? props.activeNode.data.name : 'No active node'}</div>
          <div className="content-outline-item">Kind: ${props.activeNode ? props.activeNode.data.kind : 'Module'}</div>
          <div className="content-outline-item">Braille: ${props.activeNode ? props.activeNode.data.bits : '000000'}</div>
        </div>
      </div>

      <div className="content-outline-group">
        <div className="content-outline-title">Linked Content</div>
        <div className="content-outline-list">
          ${(props.connections.length ? props.connections : [{ label: 'No linked content', id: null }]).map(function (item, index) {
            if (item.id) {
              return html`
                <button
                  key=${'outline-link-' + index + '-' + item.label}
                  className="content-outline-item is-button"
                  type="button"
                  onClick=${function () { props.onSelect(item.id); }}
                >
                  ${item.label}
                </button>
              `;
            }
            return html`<div key=${'outline-link-' + index + '-' + item.label} className="content-outline-item">${item.label}</div>`;
          })}
        </div>
      </div>
    `;
  }

  function TerminalPanel(props) {
    const promptLabel = formatTerminalPrompt(props.cwd, props.shellName);

    return html`
      <div className="terminal-tabs">
        ${['terminal', 'logs', 'graph', 'code', 'output'].map(function (viewName) {
          const label = terminalTabLabel(viewName);
          const className = ['terminal-tab', props.activeView === viewName ? 'is-active' : ''].filter(Boolean).join(' ');
          return html`
            <button key=${viewName} className=${className} type="button" onClick=${function () { props.onViewChange(viewName); }}>
              ${label}
            </button>
          `;
        })}
      </div>

      <pre className=${['terminal-log', 'terminal-view', props.activeView === 'terminal' ? 'is-active' : ''].filter(Boolean).join(' ')}>${props.terminalLines.join('\n')}</pre>
      <pre className=${['terminal-log', 'terminal-view', props.activeView === 'logs' ? 'is-active' : ''].filter(Boolean).join(' ')}>${props.statusLines.join('\n')}</pre>

      <div className=${['terminal-view', 'terminal-view-copy', props.activeView === 'graph' ? 'is-active' : ''].filter(Boolean).join(' ')}>
        <div className="terminal-copy-title">Graph Node</div>
        <div>${props.activeNode ? props.activeNode.data.name : 'No active node'}</div>
        <div className="terminal-copy-title">Connections</div>
        <div>${props.connections.map(function (item) { return item.label; }).join(' | ') || 'none'}</div>
        <div className="terminal-copy-title">Evaluation Progress</div>
        <div>${props.evaluationProgressLabel}</div>
        <div className="terminal-copy-title">Current Transfer</div>
        <div>${props.evaluationActiveTransferLabel}</div>
      </div>

      <pre className=${['terminal-log', 'terminal-view', 'terminal-view-code', props.activeView === 'code' ? 'is-active' : ''].filter(Boolean).join(' ')}>${props.codeView}</pre>

      <div className=${['terminal-view', 'terminal-view-copy', props.activeView === 'output' ? 'is-active' : ''].filter(Boolean).join(' ')}>
        <div className="terminal-copy-title">Evaluation ID</div>
        <div>${props.evaluationId || 'not-started'}</div>
        <div className="terminal-copy-title">Results JSON</div>
        <pre className="terminal-output-json">${props.evaluationOutputJson}</pre>
        <div className="terminal-output-actions">
          <button className="panel-button" type="button" onClick=${props.onAdvanceEvaluation}>Advance Step</button>
          <button className="panel-button" type="button" onClick=${props.onResetEvaluation}>Reset Run</button>
          <button className="panel-button" type="button" onClick=${props.onDownloadEvaluation}>Download JSON</button>
          <button className="panel-button" type="button" onClick=${props.onLoadLastEvaluation}>Load Last Result</button>
        </div>
      </div>

      <div className="terminal-entry-row" hidden=${props.activeView !== 'terminal'}>
        <span className="terminal-prompt">${promptLabel}</span>
        <input
          ref=${props.inputRef}
          className="terminal-entry"
          type="text"
          placeholder="ls"
          value=${props.commandValue}
          disabled=${props.isBusy}
          onInput=${function (event) { props.onCommandChange(event.currentTarget.value); }}
          onKeyDown=${function (event) {
            if (event.key !== 'Enter') return;
            const command = props.commandValue.trim();
            if (!command) return;
            event.preventDefault();
            props.onSubmit(command);
          }}
        />
      </div>
    `;
  }

  function MarkdownPanel(props) {
    const previewHtml = useMemo(function () {
      return marked.parse(props.value || '', {
        breaks: true,
        gfm: true,
      });
    }, [props.value]);

    return html`
      <div className="markdown-panel">
        <div className="markdown-column markdown-column-editor">
          <div className="markdown-panel-label">Markdown</div>
          <div className="markdown-panel-hint">Write notes in Markdown. The tile preview stays compact, the open window is your editing surface.</div>
          <textarea
            className="markdown-editor-input"
            value=${props.value}
            placeholder="Write notes in Markdown"
            onInput=${function (event) { props.onChange(event.currentTarget.value); }}
          ></textarea>
        </div>
        <div className="markdown-column markdown-column-preview">
          <div className="markdown-panel-label">Preview</div>
          <div className="markdown-preview" dangerouslySetInnerHTML=${{ __html: previewHtml }}></div>
        </div>
      </div>
    `;
  }

  function setPanelTileSummary(panelId, summary) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    const summaryRoot = panel.querySelector('.panel-tile-summary');
    if (!summaryRoot) return;

    let info = summaryRoot.querySelector('.panel-tile-info');
    if (!info) {
      info = document.createElement('div');
      info.className = 'panel-tile-info';
      summaryRoot.insertBefore(info, summaryRoot.firstChild || null);
    }

    let title = info.querySelector('h2');
    if (!title) {
      title = document.createElement('h2');
      info.appendChild(title);
    }
    title.textContent = summary.title || 'Panel';

    let description = info.querySelector('p');
    if (!description) {
      description = document.createElement('p');
      info.appendChild(description);
    }
    description.textContent = summary.description || summary.meta || '';
  }

  function FlowApp() {
    const [currentSection, setCurrentSection] = useState(function () {
      return getActiveSectionName();
    });
    const isAlphaFoldMode = currentSection === 'components' || currentSection === 'registry';
    const workspaceModel = isAlphaFoldMode ? alphaFoldComponentWorkspace : semanticWorkspace;
    const workspaceTiles = Array.isArray(workspaceModel.tiles) ? workspaceModel.tiles : defaultTileDefinitions;
    const workspaceNodes = Array.isArray(workspaceModel.nodeSpecs) && workspaceModel.nodeSpecs.length
      ? workspaceModel.nodeSpecs
      : defaultNodeSpecs;
    const workspaceEdges = Array.isArray(workspaceModel.edges) && workspaceModel.edges.length
      ? workspaceModel.edges
      : buildEdgesFromSpecs(workspaceNodes, []);
    const workspaceEvaluation = workspaceModel.evaluation || {
      primary_route: ['nexus-core', 'theory', 'access', 'engine', 'gallery'],
      secondary_routes: [{ name: 'access_to_sandbox', path: ['access', 'sandbox'] }],
      payload: { dataset: 'nexus.semantic.transfer', mode: 'deterministic' },
    };

    const reactFlow = useReactFlow();
    const terminalInputRef = useRef(null);
    const [nodes, setNodes] = useState(function () {
      return workspaceNodes.map(toReactFlowNode);
    });
    const [edges, setEdges] = useState(workspaceEdges);
    const [selectedNodeId, setSelectedNodeId] = useState(workspaceNodes[0] ? workspaceNodes[0].id : null);
    const [selectedEdgeId, setSelectedEdgeId] = useState(null);
    const [dropTargetId, setDropTargetId] = useState(null);
    const [backpackItems, setBackpackItems] = useState(function () {
      return (workspaceModel.registry && Array.isArray(workspaceModel.registry.backpackItems) && workspaceModel.registry.backpackItems.length)
        ? workspaceModel.registry.backpackItems.slice()
        : ['101111', '110010', '100110', '110101', '110110', '101100'];
    });
    const [makerBits, setMakerBits] = useState(function () {
      return (workspaceModel.registry && workspaceModel.registry.makerBits) ? String(workspaceModel.registry.makerBits) : '000000';
    });
    const [alphaFoldStepConfigs, setAlphaFoldStepConfigs] = useState(function () {
      return (alphaFoldComponentWorkspace.registry && Array.isArray(alphaFoldComponentWorkspace.registry.stepConfigs))
        ? alphaFoldComponentWorkspace.registry.stepConfigs.map(function (step) {
            return {
              id: String((step && step.id) || ''),
              label: String((step && step.label) || 'Step'),
              bits: String((step && step.bits) || '000000'),
              role: String((step && step.role) || 'code'),
              settings: step && step.settings && typeof step.settings === 'object' ? step.settings : {},
            };
          })
        : [];
    });
    const [terminalLines, setTerminalLines] = useState(initialTerminalLines);
    const [statusLines, setStatusLines] = useState(initialStatusLines);
    const [activeTerminalView, setActiveTerminalView] = useState('terminal');
    const [terminalCommand, setTerminalCommand] = useState('');
    const [terminalBusy, setTerminalBusy] = useState(false);
    const [terminalCwd, setTerminalCwd] = useState('~');
    const [terminalShell, setTerminalShell] = useState('zsh');
    const [commentDraft, setCommentDraft] = useState(function () {
      return window.localStorage.getItem('nexus-comment-note') || defaultCommentNote;
    });
    const [evaluationRun, setEvaluationRun] = useState(function () {
      return buildEvaluationRun(workspaceEvaluation, workspaceNodes);
    });
    const [evaluationResults, setEvaluationResults] = useState(function () {
      try {
        const raw = window.localStorage.getItem('nexus-evaluation-results');
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch (_error) {
        return [];
      }
    });

    useEffect(function () {
      function handleSectionChange(event) {
        const nextSection = event && event.detail && event.detail.section
          ? String(event.detail.section)
          : getActiveSectionName();
        setCurrentSection(nextSection || 'workspace');
      }

      window.addEventListener(GLABS_SECTION_EVENT, handleSectionChange);
      return function () {
        window.removeEventListener(GLABS_SECTION_EVENT, handleSectionChange);
      };
    }, []);

    useEffect(function () {
      setNodes(workspaceNodes.map(toReactFlowNode));
      setEdges(workspaceEdges);
      setSelectedNodeId(workspaceNodes[0] ? workspaceNodes[0].id : null);
      setSelectedEdgeId(null);
      setDropTargetId(null);
      setBackpackItems((workspaceModel.registry && Array.isArray(workspaceModel.registry.backpackItems) && workspaceModel.registry.backpackItems.length)
        ? workspaceModel.registry.backpackItems.slice()
        : ['101111', '110010', '100110', '110101', '110110', '101100']);
      setMakerBits((workspaceModel.registry && workspaceModel.registry.makerBits) ? String(workspaceModel.registry.makerBits) : '000000');
      if (isAlphaFoldMode) {
        setAlphaFoldStepConfigs((workspaceModel.registry && Array.isArray(workspaceModel.registry.stepConfigs))
          ? workspaceModel.registry.stepConfigs.map(function (step) {
              return {
                id: String((step && step.id) || ''),
                label: String((step && step.label) || 'Step'),
                bits: String((step && step.bits) || '000000'),
                role: String((step && step.role) || 'code'),
                settings: step && step.settings && typeof step.settings === 'object' ? step.settings : {},
              };
            })
          : []);
      }
      setEvaluationRun(buildEvaluationRun(workspaceEvaluation, workspaceNodes));
    }, [currentSection]);

    const connectedNodeIds = useMemo(function () {
      const ids = new Set();
      edges.forEach(function (edge) {
        if (edge.source === selectedNodeId) ids.add(edge.target);
        if (edge.target === selectedNodeId) ids.add(edge.source);
      });
      return ids;
    }, [edges, selectedNodeId]);

    const activeNode = useMemo(function () {
      return nodes.find(function (node) {
        return node.id === selectedNodeId;
      }) || nodes[0] || null;
    }, [nodes, selectedNodeId]);

    const connections = useMemo(function () {
      return activeNode ? getNodeConnections(activeNode, nodes, edges) : [];
    }, [activeNode, edges, nodes]);

    const codeView = useMemo(function () {
      return activeNode ? renderCodeView(activeNode) : '# No active node';
    }, [activeNode]);

    function appendTerminalLine(line) {
      setTerminalLines(function (currentLines) {
        return currentLines.concat(String(line));
      });
    }

    function appendTerminalBlock(block) {
      const lines = trimTrailingNewline(block).split('\n').filter(Boolean);
      if (!lines.length) return;
      setTerminalLines(function (currentLines) {
        return currentLines.concat(lines);
      });
    }

    function appendStatusLine(line) {
      setStatusLines(function (currentLines) {
        return currentLines.concat(String(line));
      });
    }

    function nodeNameById(nodeId) {
      const match = nodes.find(function (node) { return node.id === nodeId; });
      return match ? match.data.name : nodeId;
    }

    function persistEvaluationResult(record) {
      setEvaluationResults(function (current) {
        const next = [record].concat(current).slice(0, 24);
        window.localStorage.setItem('nexus-evaluation-results', JSON.stringify(next));
        return next;
      });
    }

    function finishEvaluationRun(nextRun) {
      if (!nextRun) return;
      const doneRun = {
        ...nextRun,
        completed_at: nextRun.completed_at || new Date().toISOString(),
      };
      persistEvaluationResult(doneRun);
      appendStatusLine('[evaluation] complete: ' + doneRun.evaluation_id);
      appendTerminalLine('> Evaluation trace stored: ' + doneRun.evaluation_id);
    }

    function advanceEvaluationStep() {
      setEvaluationRun(function (current) {
        if (!current || !Array.isArray(current.steps) || current.step_index >= current.steps.length) {
          return current;
        }

        const now = new Date().toISOString();
        const nextIndex = current.step_index;
        const steps = current.steps.map(function (step, idx) {
          if (idx < nextIndex) {
            return { ...step, status: 'done', timestamp: step.timestamp || now };
          }
          if (idx === nextIndex) {
            return { ...step, status: 'active', timestamp: now };
          }
          return { ...step, status: 'pending' };
        });

        const activeStep = steps[nextIndex];
        appendStatusLine('[evaluation] ' + nodeNameById(activeStep.from) + ' -> ' + nodeNameById(activeStep.to));

        const updated = {
          ...current,
          steps: steps,
          step_index: nextIndex + 1,
        };

        if (updated.step_index >= updated.steps.length) {
          const completedSteps = updated.steps.map(function (step) {
            return step.status === 'active' ? { ...step, status: 'done' } : step;
          });
          const doneRun = {
            ...updated,
            steps: completedSteps,
            completed_at: now,
          };
          finishEvaluationRun(doneRun);
          return doneRun;
        }

        return updated;
      });
    }

    function resetEvaluationRun() {
      const fresh = buildEvaluationRun(workspaceEvaluation, workspaceNodes);
      setEvaluationRun(fresh);
      appendStatusLine('[evaluation] reset: ' + fresh.evaluation_id);
    }

    function loadLastEvaluationResult() {
      if (!evaluationResults.length) return;
      const last = evaluationResults[0];
      setEvaluationRun(last);
      appendStatusLine('[evaluation] loaded stored trace: ' + last.evaluation_id);
    }

    function downloadEvaluationRun() {
      const payload = JSON.stringify(evaluationRun, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = (evaluationRun && evaluationRun.evaluation_id ? evaluationRun.evaluation_id : 'evaluation-run') + '.json';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      appendStatusLine('[evaluation] downloaded: ' + anchor.download);
    }

    const evaluationOutputJson = useMemo(function () {
      return JSON.stringify(evaluationRun, null, 2);
    }, [evaluationRun]);

    function connectNodes(sourceId, targetId, origin) {
      if (!sourceId || !targetId || sourceId === targetId) return;
      const nextId = edgeId(sourceId, targetId);
      let added = false;

      setEdges(function (currentEdges) {
        if (currentEdges.some(function (edge) { return edge.id === nextId; })) {
          return currentEdges;
        }
        added = true;
        return addEdge({
          id: nextId,
          source: sourceId,
          target: targetId,
          type: 'smoothstep',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 18,
            height: 18,
            color: 'rgba(93, 200, 255, 0.32)',
          },
        }, currentEdges);
      });

      if (!added) return;
      const sourceNode = nodes.find(function (node) { return node.id === sourceId; });
      const targetNode = nodes.find(function (node) { return node.id === targetId; });
      appendTerminalLine('> Connected ' + (sourceNode ? sourceNode.data.name : sourceId) + ' to ' + (targetNode ? targetNode.data.name : targetId) + '.');
      appendStatusLine('connection ' + origin + ': ' + (sourceNode ? sourceNode.data.name : sourceId) + ' -> ' + (targetNode ? targetNode.data.name : targetId));
      setSelectedEdgeId(nextId);
    }

    function handleDeleteNode(id) {
      const removedNode = nodes.find(function (node) { return node.id === id; });
      setNodes(function (currentNodes) {
        const remaining = currentNodes.filter(function (node) { return node.id !== id; });
        setSelectedNodeId(function (currentSelectedId) {
          if (currentSelectedId !== id) return currentSelectedId;
          return remaining[0] ? remaining[0].id : (workspaceNodes[0] ? workspaceNodes[0].id : null);
        });
        return remaining;
      });
      setEdges(function (currentEdges) {
        return currentEdges.filter(function (edge) {
          return edge.source !== id && edge.target !== id;
        });
      });
      setSelectedEdgeId(null);
      if (removedNode) {
        appendTerminalLine('> Removed ' + removedNode.data.name + '.');
        appendStatusLine('manual node removed: ' + removedNode.data.name);
      }
    }

    function addManualNode(bits) {
      const manualIndex = nodes.filter(function (node) {
        return node.data.manual;
      }).length + 1;
      const id = 'manual-' + manualIndex + '-' + Date.now();
      const anchorNode = activeNode;
      const position = anchorNode
        ? { x: anchorNode.position.x + 128, y: anchorNode.position.y + 42 }
        : { x: 420, y: 320 };
      const nextNode = {
        id: id,
        type: 'braille',
        position: position,
        data: {
          id: id,
          name: 'Manual Node ' + manualIndex,
          shortLabel: 'Manual',
          bits: bits,
          accent: 'white',
          manual: true,
          kind: 'Draft',
          description: 'Manually drawn braille brick placed into the React Flow sandbox.',
          links: ['Manual sandbox brick'],
        },
      };
      setNodes(function (currentNodes) {
        return currentNodes.concat(nextNode);
      });
      setSelectedNodeId(id);
      appendTerminalLine('> Manual braille node drawn: ' + nextNode.data.name + ' [' + bits + ']');
      appendStatusLine('manual node created: ' + nextNode.data.name);
    }

    const evaluationNodeStateMap = useMemo(function () {
      const stateMap = {};
      if (!evaluationRun || !Array.isArray(evaluationRun.steps)) return stateMap;

      evaluationRun.steps.forEach(function (step) {
        if (step.status === 'done') {
          stateMap[step.from] = 'done';
          stateMap[step.to] = 'done';
        } else if (step.status === 'active') {
          if (!stateMap[step.from]) stateMap[step.from] = 'done';
          stateMap[step.to] = 'active';
        }
      });
      return stateMap;
    }, [evaluationRun]);

    const evaluationEdgeStateMap = useMemo(function () {
      const stateMap = {};
      if (!evaluationRun || !Array.isArray(evaluationRun.steps)) return stateMap;
      evaluationRun.steps.forEach(function (step) {
        const id = edgeId(step.from, step.to);
        if (!id) return;
        stateMap[id] = step.status;
      });
      return stateMap;
    }, [evaluationRun]);

    const displayNodes = useMemo(function () {
      return nodes.map(function (node) {
        const progressState = evaluationNodeStateMap[node.id] || 'pending';
        return {
          ...node,
          dragHandle: '.graph-node-drag-handle',
          data: {
            ...node.data,
            isActive: node.id === selectedNodeId,
            isConnected: node.id !== selectedNodeId && connectedNodeIds.has(node.id),
            isDropTarget: node.id === dropTargetId,
            progressState: progressState,
            onSelect: function (id) {
              setSelectedNodeId(id);
              setSelectedEdgeId(null);
            },
            onDelete: handleDeleteNode,
          },
        };
      });
    }, [connectedNodeIds, dropTargetId, evaluationNodeStateMap, nodes, selectedNodeId]);

    const displayEdges = useMemo(function () {
      return edges.map(function (edge) {
        const traceState = evaluationEdgeStateMap[edge.id] || 'pending';
        const isTraceActive = traceState === 'active';
        const isTraceDone = traceState === 'done';
        return {
          ...edge,
          className: [edge.id === selectedEdgeId ? 'is-active-edge' : '', isTraceActive ? 'is-eval-active-edge' : '', isTraceDone ? 'is-eval-done-edge' : ''].filter(Boolean).join(' '),
          animated: isTraceActive,
          selectable: true,
          type: 'smoothstep',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 18,
            height: 18,
            color: isTraceActive ? 'rgba(255, 200, 72, 0.95)' : (isTraceDone ? 'rgba(115, 255, 170, 0.9)' : (edge.id === selectedEdgeId ? 'rgba(93, 200, 255, 0.76)' : 'rgba(93, 200, 255, 0.32)')),
          },
          style: {
            stroke: isTraceActive ? 'rgba(255, 200, 72, 0.88)' : (isTraceDone ? 'rgba(115, 255, 170, 0.8)' : (edge.id === selectedEdgeId ? 'rgba(93, 200, 255, 0.76)' : 'rgba(93, 200, 255, 0.24)')),
            strokeWidth: isTraceActive ? 2.7 : (edge.id === selectedEdgeId ? 2.2 : 1.55),
          },
        };
      });
    }, [edges, evaluationEdgeStateMap, selectedEdgeId]);

    useEffect(function () {
      if (!activeNode) return;
      appendStatusLine('active node: ' + activeNode.data.name);
    }, [activeNode ? activeNode.id : null]);

    useEffect(function () {
      if (activeTerminalView === 'terminal' && !terminalBusy && terminalInputRef.current) {
        terminalInputRef.current.focus();
      }
    }, [activeTerminalView, terminalBusy]);

    useEffect(function () {
      window.localStorage.setItem('nexus-comment-note', commentDraft);
    }, [commentDraft]);

    useEffect(function () {
      if (!evaluationRun || !Array.isArray(evaluationRun.steps)) return;
      if (evaluationRun.step_index >= evaluationRun.steps.length) return;
      const timer = window.setTimeout(function () {
        advanceEvaluationStep();
      }, 1800);
      return function () {
        window.clearTimeout(timer);
      };
    }, [evaluationRun ? evaluationRun.step_index : 0, evaluationRun ? evaluationRun.evaluation_id : '']);

    useEffect(function () {
      const tileByPanelId = {};
      workspaceTiles.forEach(function (tile) {
        if (tile.panelId) tileByPanelId[tile.panelId] = tile;
      });

      const graphTile = tileByPanelId['panel-graph'] || {};
      const totalSteps = evaluationRun && Array.isArray(evaluationRun.steps) ? evaluationRun.steps.length : 0;
      const doneSteps = evaluationRun && Array.isArray(evaluationRun.steps)
        ? evaluationRun.steps.filter(function (step) { return step.status === 'done'; }).length
        : 0;
      setPanelTileSummary('panel-graph', {
        title: graphTile.title || 'Graph',
        description: doneSteps + '/' + totalSteps + ' steps · ' + nodes.length + ' modules, ' + edges.length + ' active links',
      });

      const registryTile = tileByPanelId['panel-registry'] || {};
      setPanelTileSummary('panel-registry', {
        title: registryTile.title || 'Registry',
        description: backpackItems.length + ' saved patterns',
      });

      const composeTile = tileByPanelId['panel-compose'] || {};
      setPanelTileSummary('panel-compose', {
        title: composeTile.title || 'Compose',
        description: makerBits.split('').filter(function (bit) { return bit === '1'; }).length + ' active dots',
      });

      const selectionTile = tileByPanelId['panel-selection'] || {};
      setPanelTileSummary('panel-selection', {
        title: selectionTile.title || 'Selection',
        description: activeNode ? activeNode.data.name : 'No active module selected',
      });

      const linkedTile = tileByPanelId['panel-linked'] || {};
      setPanelTileSummary('panel-linked', {
        title: linkedTile.title || 'Linked Modules',
        description: connections.length ? (connections.length + ' linked items') : 'No active links',
      });

      const contentsTile = tileByPanelId['panel-contents'] || {};
      setPanelTileSummary('panel-contents', {
        title: contentsTile.title || 'Contents',
        description: activeNode ? ('Outline for ' + activeNode.data.name) : 'Module outline',
      });

      const terminalTile = tileByPanelId['panel-terminal'] || {};
      setPanelTileSummary('panel-terminal', {
        title: terminalTile.title || 'Terminal',
        description: terminalBusy ? 'Running command' : 'Shell ready',
      });

      const commentTile = tileByPanelId['panel-comment'] || {};
      setPanelTileSummary('panel-comment', {
        title: commentTile.title || 'Notes',
        description: extractCommentTitle(commentDraft),
      });
    }, [activeNode ? activeNode.id : null, activeTerminalView, backpackItems, codeView, commentDraft, connections, edges.length, evaluationRun, makerBits, nodes.length, terminalBusy]);

    useEffect(function () {
      function handleKeydown(event) {
        const target = event.target;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
          return;
        }
        if (!selectedEdgeId) return;
        if (event.key !== 'd' && event.key !== 'D' && event.key !== 'Backspace') return;
        event.preventDefault();
        setEdges(function (currentEdges) {
          return currentEdges.filter(function (edge) { return edge.id !== selectedEdgeId; });
        });
        appendTerminalLine('> Deleted edge ' + selectedEdgeId + '.');
        appendStatusLine('edge deleted: ' + selectedEdgeId);
        setSelectedEdgeId(null);
      }

      document.addEventListener('keydown', handleKeydown);
      return function () {
        document.removeEventListener('keydown', handleKeydown);
      };
    }, [selectedEdgeId]);

    useEffect(function () {
      const terminalPanels = document.querySelectorAll('.terminal-log, .terminal-view-copy, .terminal-view-code');
      terminalPanels.forEach(function (panel) {
        if (panel.classList.contains('is-active')) {
          panel.scrollTop = panel.scrollHeight;
        }
      });
    }, [activeTerminalView, statusLines, terminalLines]);

    async function handleTerminal(command) {
      appendTerminalLine(formatTerminalPrompt(terminalCwd, terminalShell) + ' ' + command);
      setTerminalCommand('');

      if (command === 'clear') {
        setTerminalLines([]);
        return;
      }

      setTerminalBusy(true);
      try {
        const response = await fetch(terminalApiBase + '/shell', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            session_id: terminalSessionId,
            command: command,
            shell: 'zsh'
          })
        });

        const payload = await response.json();
        if (!response.ok) {
          appendTerminalLine('[error] ' + (payload.detail || 'Command failed.'));
          appendStatusLine('shell error: ' + (payload.detail || 'command failed'));
          return;
        }

        if (payload.stdout) appendTerminalBlock(payload.stdout);
        if (payload.stderr) appendTerminalBlock(payload.stderr);
        if (!payload.stdout && !payload.stderr && payload.exit_code !== 0) {
          appendTerminalLine('[exit ' + payload.exit_code + ']');
        }
        setTerminalCwd(payload.cwd || terminalCwd);
        setTerminalShell(payload.shell || terminalShell);
        appendStatusLine('shell [' + (payload.shell || terminalShell) + '] exit ' + payload.exit_code + ': ' + command);
      } catch (_error) {
        appendTerminalLine('[error] Terminal backend unavailable on ' + terminalApiBase + '.');
        appendStatusLine('shell backend unavailable: ' + terminalApiBase);
      } finally {
        setTerminalBusy(false);
      }
    }

    const onNodesChange = function (changes) {
      setNodes(function (currentNodes) {
        return applyNodeChanges(changes, currentNodes);
      });
    };

    const onEdgesChange = function (changes) {
      setEdges(function (currentEdges) {
        return applyEdgeChanges(changes, currentEdges);
      });
    };

    const onNodeDrag = function (_event, node) {
      const intersections = reactFlow.getIntersectingNodes(node).filter(function (item) {
        return item.id !== node.id;
      });
      setDropTargetId(intersections[0] ? intersections[0].id : null);
    };

    const onNodeDragStop = function (_event, node) {
      const intersections = reactFlow.getIntersectingNodes(node).filter(function (item) {
        return item.id !== node.id;
      });
      const target = intersections[0];
      setDropTargetId(null);
      if (!target) return;
      connectNodes(node.id, target.id, 'overlap');
    };

    function resolveTileRoot(rootId) {
      if (!rootId) return null;
      return tileRootMap[rootId] || document.getElementById(rootId);
    }

    function renderProjectedTile(tile) {
      const root = resolveTileRoot(tile.rootId);
      if (!root) return null;

      if (tile.renderer === 'registry') {
        return createPortal(html`
          <${RegistryPanel}
            mode=${isAlphaFoldMode ? 'alphafold' : 'default'}
            items=${backpackItems}
            stepConfigs=${isAlphaFoldMode
              ? alphaFoldStepConfigs
              : (workspaceModel.registry && workspaceModel.registry.stepConfigs ? workspaceModel.registry.stepConfigs : [])}
            nodeSpecs=${workspaceNodes}
            onUpdateStepSettings=${function (stepId, nextSettings) {
              setAlphaFoldStepConfigs(function (current) {
                return current.map(function (step) {
                  if (step.id !== stepId) return step;
                  return Object.assign({}, step, { settings: nextSettings });
                });
              });
              appendStatusLine('registry updated: ' + stepId);
            }}
            onUpdateStepDescription=${function (stepId, description) {
              setNodes(function (current) {
                return current.map(function (node) {
                  if (node.id !== stepId) return node;
                  return Object.assign({}, node, {
                    data: Object.assign({}, node.data, { description: String(description || '') })
                  });
                });
              });
              appendStatusLine('documentation updated: ' + stepId);
            }}
            onAdd=${function () {
              setBackpackItems(function (currentItems) {
                return currentItems.concat(randomBits());
              });
              appendTerminalLine('> Backpack extended with a new braille brick.');
            }}
            onLoadBits=${function (bits) {
              setMakerBits(bits);
              appendStatusLine('braille input loaded from backpack: ' + bits);
            }}
          />
        `, root, tile.id);
      }

      if (tile.renderer === 'compose') {
        return createPortal(html`
          <${BrailleInputPanel}
            bits=${makerBits}
            onToggle=${function (index) {
              setMakerBits(function (currentBits) {
                return currentBits.split('').map(function (bit, bitIndex) {
                  if (bitIndex !== index) return bit;
                  return bit === '1' ? '0' : '1';
                }).join('');
              });
            }}
            onClear=${function () { setMakerBits('000000'); }}
            onRandom=${function () { setMakerBits(randomBits()); }}
            onActivate=${function () { addManualNode(makerBits); }}
          />
        `, root, tile.id);
      }

      if (tile.renderer === 'selection') {
        return createPortal(html`<${ActiveNodePanel} node=${activeNode} />`, root, tile.id);
      }

      if (tile.renderer === 'linked') {
        return createPortal(html`<${ConnectedListPanel} connections=${connections} onSelect=${setSelectedNodeId} />`, root, tile.id);
      }

      if (tile.renderer === 'contents') {
        return createPortal(html`<${ContentOutlinePanel}
          mode=${isAlphaFoldMode ? 'alphafold' : 'default'}
          activeNode=${activeNode}
          connections=${connections}
          onSelect=${setSelectedNodeId}
          primaryRoute=${isAlphaFoldMode
            ? workspaceEvaluation.primary_route.map(function (nodeId) {
                const match = workspaceNodes.find(function (node) { return node.id === nodeId; });
                return { id: nodeId, label: match ? match.name : nodeId };
              })
            : []}
          secondaryRoutes=${isAlphaFoldMode
            ? workspaceEvaluation.secondary_routes.map(function (route) {
                return {
                  name: route.name,
                  labels: (route.path || []).map(function (nodeId) {
                    const match = workspaceNodes.find(function (node) { return node.id === nodeId; });
                    return match ? match.name : nodeId;
                  }),
                };
              })
            : []}
        />`, root, tile.id);
      }

      if (tile.renderer === 'terminal') {
        const totalSteps = evaluationRun && Array.isArray(evaluationRun.steps) ? evaluationRun.steps.length : 0;
        const doneSteps = evaluationRun && Array.isArray(evaluationRun.steps)
          ? evaluationRun.steps.filter(function (step) { return step.status === 'done'; }).length
          : 0;
        const activeStep = evaluationRun && Array.isArray(evaluationRun.steps)
          ? evaluationRun.steps.find(function (step) { return step.status === 'active'; })
          : null;
        const activeTransferLabel = activeStep
          ? (nodeNameById(activeStep.from) + ' -> ' + nodeNameById(activeStep.to) + ' [' + activeStep.routeName + ']')
          : (doneSteps >= totalSteps && totalSteps > 0 ? 'completed' : 'waiting');
        return createPortal(html`
          <${TerminalPanel}
            activeView=${activeTerminalView}
            onViewChange=${setActiveTerminalView}
            activeNode=${activeNode}
            connections=${connections}
            codeView=${codeView}
            commandValue=${terminalCommand}
            cwd=${terminalCwd}
            shellName=${terminalShell}
            inputRef=${terminalInputRef}
            isBusy=${terminalBusy}
            onCommandChange=${setTerminalCommand}
            onSubmit=${handleTerminal}
            statusLines=${statusLines}
            terminalLines=${terminalLines}
            evaluationProgressLabel=${doneSteps + '/' + totalSteps + ' completed'}
            evaluationActiveTransferLabel=${activeTransferLabel}
            evaluationId=${evaluationRun ? evaluationRun.evaluation_id : ''}
            evaluationOutputJson=${evaluationOutputJson}
            onAdvanceEvaluation=${advanceEvaluationStep}
            onResetEvaluation=${resetEvaluationRun}
            onDownloadEvaluation=${downloadEvaluationRun}
            onLoadLastEvaluation=${loadLastEvaluationResult}
          />
        `, root, tile.id);
      }

      if (tile.renderer === 'comment') {
        return createPortal(html`
          <${MarkdownPanel}
            value=${commentDraft}
            onChange=${setCommentDraft}
          />
        `, root, tile.id);
      }

      return null;
    }

    const projectedTiles = workspaceTiles
      .slice()
      .sort(function (a, b) { return Number(a.order || 0) - Number(b.order || 0); })
      .map(function (tile) { return renderProjectedTile(tile); })
      .filter(Boolean);

    return html`
      ${projectedTiles}

      <${ReactFlow}
        nodes=${displayNodes}
        edges=${displayEdges}
        nodeTypes=${nodeTypes}
        defaultEdgeOptions=${{ type: 'smoothstep', selectable: true, focusable: true, markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: 'rgba(93, 200, 255, 0.32)' } }}
        fitView=${true}
        fitViewOptions=${{ padding: 0.22 }}
        minZoom=${0.45}
        maxZoom=${1.8}
        deleteKeyCode=${null}
        nodesDraggable=${true}
        nodesConnectable=${true}
        elementsSelectable=${true}
        snapToGrid=${true}
        snapGrid=${[20, 20]}
        panOnScroll=${true}
        panOnDrag=${true}
        elevateEdgesOnSelect=${true}
        selectNodesOnDrag=${false}
        onNodesChange=${onNodesChange}
        onEdgesChange=${onEdgesChange}
        onConnect=${function (connection) {
          connectNodes(connection.source, connection.target, 'handle');
        }}
        onNodeClick=${function (_event, node) {
          setSelectedNodeId(node.id);
          setSelectedEdgeId(null);
        }}
        onEdgeClick=${function (event, edge) {
          event.preventDefault();
          event.stopPropagation();
          setSelectedEdgeId(edge.id);
        }}
        onPaneClick=${function () {
          setSelectedEdgeId(null);
          setDropTargetId(null);
        }}
        onNodeDrag=${onNodeDrag}
        onNodeDragStop=${onNodeDragStop}
      >
        <${Background} color="rgba(93, 200, 255, 0.06)" gap=${32} size=${1} />
        <${MiniMap}
          pannable=${true}
          zoomable=${true}
          maskColor="rgba(4, 10, 18, 0.68)"
          nodeStrokeColor=${function (node) {
            return 'rgba(' + accentRgb(node.data.accent) + ', 0.9)';
          }}
          nodeColor=${function (node) {
            return 'rgba(' + accentRgb(node.data.accent) + ', 0.22)';
          }}
        />
        <${Controls} showInteractive=${false} />
      </${ReactFlow}>
    `;
  }

  async function initWorkspace() {
    const semanticConfig = await loadSemanticWorkspaceConfig();
    semanticWorkspace = normalizeSemanticWorkspaceConfig(semanticConfig);
    const statusCount = document.querySelector('.sandbox-status strong');
    if (statusCount) {
      const count = Array.isArray(semanticWorkspace.nodeSpecs) ? semanticWorkspace.nodeSpecs.length : 0;
      statusCount.textContent = String(count) + ' / 24';
    }
    const panelLayout = await loadPanelLayoutConfig();
    applyPanelLayoutConfig(panelLayout);
    applySemanticPanelTitles(semanticWorkspace);
    bindPanelWindows();
    createRoot(flowRoot).render(html`<${ReactFlowProvider}><${FlowApp} /></${ReactFlowProvider}>`);
  }

  async function loadSemanticWorkspaceConfig() {
    const configUrl = new URL('../data/glabs_semantic_workspace.json?v=20260515-semantic-r2', import.meta.url);
    try {
      const response = await fetch(configUrl);
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (_error) {
      return null;
    }
  }

  async function loadPanelLayoutConfig() {
    const configUrl = new URL('../data/glabs_panels.json?v=20260515-layout-r3', import.meta.url);
    try {
      const response = await fetch(configUrl);
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (_error) {
      return null;
    }
  }

  function normalizeSemanticWorkspaceConfig(config) {
    const safeConfig = config || {};
    const tiles = normalizeTiles(safeConfig.tiles);
    const nodeSpecs = normalizeNodeSpecs(safeConfig.nodes);
    const edges = normalizeEdges(safeConfig.edges, nodeSpecs);
    const registry = normalizeRegistry(safeConfig.registry);
    const evaluation = normalizeEvaluation(safeConfig.evaluation, nodeSpecs);
    return {
      tiles: tiles,
      nodeSpecs: nodeSpecs,
      edges: edges,
      registry: registry,
      evaluation: evaluation,
    };
  }

  function normalizeTiles(rawTiles) {
    const source = Array.isArray(rawTiles) && rawTiles.length ? rawTiles : defaultTileDefinitions;
    const fallbackByRenderer = {};
    defaultTileDefinitions.forEach(function (tile) {
      fallbackByRenderer[tile.renderer] = tile;
    });

    return source.map(function (tile, index) {
      const renderer = String(tile.renderer || tile.type || 'graph');
      const fallback = fallbackByRenderer[renderer] || {};
      return {
        id: String(tile.id || ('tile_' + index)),
        panelId: String(tile.panelId || fallback.panelId || ''),
        rootId: String(tile.rootId || fallback.rootId || ''),
        renderer: renderer,
        title: String(tile.title || fallback.title || renderer),
        description: String(tile.description || fallback.description || ''),
        summaryMode: String(tile.summaryMode || fallback.summaryMode || renderer),
        order: Number.isFinite(Number(tile.order)) ? Number(tile.order) : (index + 1),
      };
    });
  }

  function normalizeNodeSpecs(rawNodes) {
    const source = Array.isArray(rawNodes) && rawNodes.length ? rawNodes : defaultNodeSpecs;
    return source.map(function (node, index) {
      return {
        id: String(node.id || ('node_' + index)),
        name: String(node.name || ('Node ' + (index + 1))),
        shortLabel: String(node.shortLabel || node.name || ('Node ' + (index + 1))),
        bits: String(node.bits || randomBits()),
        accent: String(node.accent || 'white'),
        description: String(node.description || 'Braille graph node.'),
        links: Array.isArray(node.links) ? node.links.slice() : [],
        manual: Boolean(node.manual),
        hub: Boolean(node.hub),
        kind: String(node.kind || 'Module'),
        pearlSize: String(node.pearlSize || 'large'),
        position: node.position && typeof node.position === 'object'
          ? { x: Number(node.position.x || 0), y: Number(node.position.y || 0) }
          : null,
      };
    });
  }

  function normalizeEdges(rawEdges, nodes) {
    const nodeIds = new Set(nodes.map(function (node) { return node.id; }));
    const source = Array.isArray(rawEdges) && rawEdges.length ? rawEdges : buildEdgesFromSpecs(nodes, []);

    return source
      .map(function (edge, index) {
        const sourceId = String(edge.source || '');
        const targetId = String(edge.target || '');
        if (!sourceId || !targetId) return null;
        if (!nodeIds.has(sourceId) || !nodeIds.has(targetId)) return null;
        return {
          id: String(edge.id || edgeId(sourceId, targetId) || ('edge_' + index)),
          source: sourceId,
          target: targetId,
          type: 'smoothstep',
        };
      })
      .filter(Boolean);
  }

  function normalizeRegistry(rawRegistry) {
    const source = rawRegistry || {};
    return {
      backpackItems: Array.isArray(source.backpackItems) && source.backpackItems.length
        ? source.backpackItems.map(String)
        : ['101111', '110010', '100110', '110101', '110110', '101100'],
      makerBits: String(source.makerBits || '000000'),
      stepConfigs: Array.isArray(source.stepConfigs)
        ? source.stepConfigs.map(function (step) {
            return {
              id: String((step && step.id) || ''),
              label: String((step && step.label) || 'Step'),
              bits: String((step && step.bits) || '000000'),
              role: String((step && step.role) || 'code'),
              settings: step && step.settings && typeof step.settings === 'object' ? step.settings : {},
            };
          })
        : [],
    };
  }

  function normalizeEvaluation(rawEvaluation, nodes) {
    const nodeIds = new Set((nodes || []).map(function (node) { return node.id; }));
    const source = rawEvaluation || {};
    const defaultPrimary = ['nexus-core', 'theory', 'access', 'engine', 'gallery'];
    const primaryRoute = Array.isArray(source.primary_route) && source.primary_route.length
      ? source.primary_route.map(String).filter(function (id) { return nodeIds.has(id); })
      : defaultPrimary.filter(function (id) { return nodeIds.has(id); });

    const secondaryRoutes = Array.isArray(source.secondary_routes)
      ? source.secondary_routes
          .map(function (route, index) {
            const name = String((route && route.name) || ('secondary_' + (index + 1)));
            const path = Array.isArray(route && route.path)
              ? route.path.map(String).filter(function (id) { return nodeIds.has(id); })
              : [];
            if (path.length < 2) return null;
            return { name: name, path: path };
          })
          .filter(Boolean)
      : [];

    const payload = source.payload && typeof source.payload === 'object'
      ? source.payload
      : { dataset: 'nexus.semantic.transfer', mode: 'deterministic' };

    return {
      primary_route: primaryRoute.length > 1 ? primaryRoute : defaultPrimary,
      secondary_routes: secondaryRoutes,
      payload: payload,
    };
  }

  function buildEvaluationSteps(evaluation) {
    const steps = [];
    const primary = (evaluation && Array.isArray(evaluation.primary_route)) ? evaluation.primary_route : [];
    for (let i = 0; i < primary.length - 1; i += 1) {
      steps.push({
        route: 'primary',
        routeName: 'primary_route',
        from: primary[i],
        to: primary[i + 1],
      });
    }

    const secondary = (evaluation && Array.isArray(evaluation.secondary_routes)) ? evaluation.secondary_routes : [];
    secondary.forEach(function (route) {
      const path = Array.isArray(route.path) ? route.path : [];
      for (let i = 0; i < path.length - 1; i += 1) {
        steps.push({
          route: 'secondary',
          routeName: route.name || 'secondary_route',
          from: path[i],
          to: path[i + 1],
        });
      }
    });
    return steps;
  }

  function createEvaluationRunId() {
    return 'eval-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
  }

  function buildEvaluationRun(evaluation, nodeSpecs) {
    const bitsByNodeId = {};
    (Array.isArray(nodeSpecs) ? nodeSpecs : []).forEach(function (spec) {
      if (!spec || !spec.id) return;
      bitsByNodeId[spec.id] = spec.bits || '000000';
    });

    return {
      evaluation_id: createEvaluationRunId(),
      started_at: new Date().toISOString(),
      completed_at: null,
      step_index: 0,
      steps: buildEvaluationSteps(evaluation).map(function (step) {
        const fromBits = bitsByNodeId[step.from] || '000000';
        const toBits = bitsByNodeId[step.to] || '000000';
        return {
          route: step.route,
          routeName: step.routeName,
          from: step.from,
          to: step.to,
          from_bits: fromBits,
          to_bits: toBits,
          operation_braille: fromBits + '->' + toBits,
          status: 'pending',
          timestamp: null,
        };
      }),
      payload: (evaluation && evaluation.payload) ? evaluation.payload : {},
    };
  }

  function applySemanticPanelTitles(workspaceModel) {
    if (!workspaceModel || !Array.isArray(workspaceModel.tiles)) return;
    workspaceModel.tiles.forEach(function (tile) {
      if (!tile.panelId) return;
      const panel = document.getElementById(tile.panelId);
      if (!panel) return;
      const info = panel.querySelector('.panel-tile-info');
      if (!info) return;
      const titleNode = info.querySelector('h2');
      const descNode = info.querySelector('p');
      if (titleNode && tile.title) titleNode.textContent = tile.title;
      if (descNode && tile.description) descNode.textContent = tile.description;
    });
  }

  function buildEdgesFromSpecs(nodes, rawEdges) {
    if (Array.isArray(rawEdges) && rawEdges.length) {
      return rawEdges.map(function (edge, index) {
        const source = String(edge.source || '');
        const target = String(edge.target || '');
        return {
          id: String(edge.id || edgeId(source, target) || ('edge_' + index)),
          source: source,
          target: target,
          type: 'smoothstep',
        };
      }).filter(function (edge) {
        return edge.source && edge.target;
      });
    }

    const hub = (nodes || []).find(function (node) { return node.hub; }) || (nodes || [])[0];
    if (!hub) return [];

    return (nodes || [])
      .filter(function (node) { return node.id !== hub.id; })
      .map(function (node) {
        return {
          id: edgeId(hub.id, node.id),
          source: hub.id,
          target: node.id,
          type: 'smoothstep',
        };
      });
  }

  function applyPanelLayoutConfig(config) {
    if (!config || !Array.isArray(config.panels)) return;

    config.panels.forEach(function (panelConfig) {
      const panel = document.getElementById(panelConfig.id);
      if (!panel) return;

      if (panelConfig.size) panel.dataset.panelSize = panelConfig.size;
      if (panelConfig.group) panel.dataset.panelGroup = panelConfig.group;
      if (panelConfig.dockSpan) panel.dataset.dockSpan = panelConfig.dockSpan;
      if (panelConfig.expandMode) panel.dataset.expandMode = panelConfig.expandMode;

      panel.dataset.markHint = panelConfig.markHint || config.markHint || '';

      if (typeof panelConfig.initialCollapsed === 'boolean') {
        panel.classList.toggle('is-collapsed', panelConfig.initialCollapsed);
      }

      panel.style.setProperty('--dock-shift-x', panelConfig.dockShiftX || '0px');
      panel.style.setProperty('--dock-shift-y', panelConfig.dockShiftY || '0px');
      panel.style.setProperty('--dock-tilt', panelConfig.dockTilt || '0deg');

      if (panelConfig.overlay) {
        if (typeof panelConfig.overlay.x === 'number') panel.dataset.overlayX = String(panelConfig.overlay.x);
        if (typeof panelConfig.overlay.y === 'number') panel.dataset.overlayY = String(panelConfig.overlay.y);
        if (typeof panelConfig.overlay.w === 'number') panel.dataset.overlayW = String(panelConfig.overlay.w);
        if (typeof panelConfig.overlay.h === 'number') panel.dataset.overlayH = String(panelConfig.overlay.h);
      }

      const heading = panel.querySelector('.panel-heading h2');
      if (heading && panelConfig.title) {
        heading.textContent = panelConfig.title;
      }

      const kicker = panel.querySelector('.canvas-kicker');
      if (kicker && panelConfig.kicker) {
        kicker.textContent = panelConfig.kicker;
      }

      const copy = panel.querySelector('.panel-copy');
      if (copy && panelConfig.copy) {
        copy.textContent = panelConfig.copy;
      }
    });
  }

  function toReactFlowNode(spec) {
    const motion = buildNodeMotionProfile(spec.id);
    return {
      id: spec.id,
      type: 'braille',
      position: positionForSpec(spec),
      data: {
        id: spec.id,
        name: spec.name,
        shortLabel: spec.shortLabel || spec.name,
        bits: spec.bits,
        accent: spec.accent,
        kind: spec.kind || 'Module',
        manual: Boolean(spec.manual),
        description: spec.description || 'Braille graph node.',
        links: Array.isArray(spec.links) ? spec.links.slice() : [],
        motion: motion,
        pearlSize: spec.pearlSize || 'large',
      },
    };
  }

  function buildNodeMotionProfile(seedText) {
    const seed = hashString(seedText || 'node');
    const ringA = 14 + (seed % 11);
    const ringB = 22 + (seed % 17);
    const ringC = 30 + (seed % 19);
    const delayA = -1 * ((seed % 8) / 3);
    const delayB = -1 * (((seed >> 2) % 11) / 4);
    const delayC = -1 * (((seed >> 3) % 13) / 5);
    return {
      ringA: ringA,
      ringB: ringB,
      ringC: ringC,
      delayA: delayA,
      delayB: delayB,
      delayC: delayC,
    };
  }

  function hashString(value) {
    const text = String(value || '');
    let h = 0;
    for (let i = 0; i < text.length; i += 1) {
      h = (h << 5) - h + text.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  function edgeId(a, b) {
    return [a, b].sort().join('::');
  }

  function brailleMarkup(bits, accent) {
    return bits.split('').map(function (bit, index) {
      const className = bit === '1' ? 'braille-dot is-on ' + accent : 'braille-dot';
      return html`<span key=${accent + '-dot-' + index + '-' + bit} className=${className}></span>`;
    });
  }

  function positionForSpec(spec) {
    if (spec && spec.position && Number.isFinite(Number(spec.position.x)) && Number.isFinite(Number(spec.position.y))) {
      return {
        x: Number(spec.position.x),
        y: Number(spec.position.y),
      };
    }

    const hubPosition = { x: 140, y: 210 };
    const orderedIds = [
      'theory',
      'access',
      'engine',
      'sandbox',
      'gallery',
    ];

    if (spec.hub) return hubPosition;

    const index = orderedIds.indexOf(spec.id);
    if (index === -1) return { x: 460, y: 240 };

    const column = Math.floor(index / 2);
    const row = index % 2;
    return {
      x: 460 + column * 240,
      y: 120 + row * 200,
    };
  }

  function accentRgb(accent) {
    if (accent === 'cyan') return '54, 222, 255';
    if (accent === 'magenta') return '246, 84, 223';
    return '226, 233, 244';
  }

  function nodeLabelLines(label) {
    const words = String(label || '').trim().split(/\s+/).filter(Boolean);
    if (words.length <= 1) return [label];
    if (words.length === 2) return words;

    const midpoint = Math.ceil(words.length / 2);
    return [words.slice(0, midpoint).join(' '), words.slice(midpoint).join(' ')];
  }

  function bindPanelWindows() {

    function getActiveSectionName() {
      const activeTab = document.querySelector('.sandbox-tab.is-active');
      return activeTab ? String(activeTab.dataset.section || 'workspace') : 'workspace';
    }
    const sandboxShell = document.querySelector('.sandbox-shell');
    const panelDock = document.getElementById('panel-dock');
    const panelMenu = document.getElementById('panel-menu');
    const panelOverlay = document.getElementById('panel-overlay');
    const panelWindows = Array.from(document.querySelectorAll('[data-panel-window]'));
    const pushToWorkspaceButton = document.getElementById('components-push-workspace');
    const structureHint = document.getElementById('sandbox-structure-hint');
    const panelHomes = new Map();
    const panelSyncFns = new Map();
    let draggedPanel = null;
    let draggedPanels = [];
    let pendingDockTarget = null;
    let dockReorderFrame = null;
    let lastDockReorderKey = '';
    let lastSnapTile = null;

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    function syncOverlayVisibility() {
      if (!panelOverlay) return;
      const hasOverlayPanels = panelOverlay.children.length > 0;
      const hasMenuTiles = panelMenu && panelMenu.children.length > 0;
      const showOverlay = hasOverlayPanels || hasMenuTiles;
      panelOverlay.classList.toggle('is-active', showOverlay);
      panelOverlay.setAttribute('aria-hidden', String(!showOverlay));
      if (showOverlay) {
        ensureOverlayScrollSpace();
      }
    }

    function syncMenuShellState() {
      if (!sandboxShell || !panelMenu) return;
      const isOverlayActive = panelOverlay && panelOverlay.classList.contains('is-active');
      sandboxShell.classList.toggle('has-panel-menu', panelMenu.children.length > 0 && isOverlayActive);
    }

    function applyStoredTransform(panel) {
      const offsetX = Number(panel.dataset.translateX || '0');
      const offsetY = Number(panel.dataset.translateY || '0');
      if (!offsetX && !offsetY) {
        panel.style.transform = '';
        return;
      }
      panel.style.transform = 'translate(' + offsetX + 'px, ' + offsetY + 'px)';
    }

    function applyOverlayGeometry(panel) {
      if (!panelOverlay) return;
      const x = Number(panel.dataset.overlayX || '24');
      const y = Number(panel.dataset.overlayY || '24');
      const width = Number(panel.dataset.overlayW || '520');
      const height = Number(panel.dataset.overlayH || '420');
      const maxW = Math.max(220, panelOverlay.clientWidth - 24);
      const maxH = Math.max(160, panelOverlay.clientHeight - 24);
      const safeW = clamp(width, 220, maxW);
      const safeH = clamp(height, 160, maxH);
      const maxX = Math.max(8, panelOverlay.clientWidth - safeW - 8);
      const safeX = clamp(x, 8, maxX);
      const safeY = Math.max(8, y);
      panel.dataset.overlayX = String(Math.round(safeX));
      panel.dataset.overlayY = String(Math.round(safeY));
      panel.dataset.overlayW = String(Math.round(safeW));
      panel.dataset.overlayH = String(Math.round(safeH));
      panel.style.left = safeX + 'px';
      panel.style.top = safeY + 'px';
      panel.style.width = safeW + 'px';
      panel.style.height = safeH + 'px';
    }

    function ensureOverlayGeometry(panel) {
      if (!panelOverlay) return;
      const overlayWidth = Math.max(panelOverlay.clientWidth, 960);
      const overlayHeight = Math.max(panelOverlay.clientHeight, 720);
      const stackIndex = panelOverlay.querySelectorAll('[data-panel-window].is-overlay-panel').length;
      const preset = panel.dataset.panelSize || 'medium';
      const presets = {
        compact: {
          width: clamp(overlayWidth * 0.28, 320, 440),
          height: clamp(overlayHeight * 0.34, 240, 360),
        },
        medium: {
          width: clamp(overlayWidth * 0.4, 420, 620),
          height: clamp(overlayHeight * 0.46, 320, 560),
        },
        wide: {
          width: clamp(overlayWidth * 0.64, 640, 980),
          height: clamp(overlayHeight * 0.62, 420, 760),
        },
      };
      const nextPreset = presets[preset] || presets.medium;
      if (!panel.dataset.overlayW) panel.dataset.overlayW = String(Math.round(nextPreset.width));
      if (!panel.dataset.overlayH) panel.dataset.overlayH = String(Math.round(nextPreset.height));
      if (!panel.dataset.overlayX) panel.dataset.overlayX = String(32 + (stackIndex % 4) * 38);
      if (!panel.dataset.overlayY) panel.dataset.overlayY = String(32 + (stackIndex % 5) * 34);
    }

    function stackPanelInLowerOverlay(panel) {
      if (!panelOverlay) return;

      const openPanels = Array.from(panelOverlay.querySelectorAll('[data-panel-window].is-overlay-panel')).filter(function (item) {
        return item !== panel;
      });

      const overlayW = Math.max(panelOverlay.clientWidth, 900);
      const overlayH = Math.max(panelOverlay.clientHeight, 680);
      const defaultW = clamp(overlayW * 0.62, 520, overlayW - 64);
      const defaultH = clamp(overlayH * 0.46, 320, 520);
      const itemW = Number(panel.dataset.overlayW || Math.round(defaultW));
      const itemH = Number(panel.dataset.overlayH || Math.round(defaultH));
      const laneX = 20;
      const startY = Math.round(overlayH * 0.55);
      const gapY = 26;
      const nextY = startY + openPanels.length * (itemH + gapY);

      panel.dataset.overlayW = String(Math.round(itemW));
      panel.dataset.overlayH = String(Math.round(itemH));
      panel.dataset.overlayX = String(laneX);
      panel.dataset.overlayY = String(nextY);
      panel.style.zIndex = String(40 + openPanels.length);
    }

    function placeInDock(panel) {
      if (!panelDock) return;
      panel.style.transform = '';
      panel.classList.remove('is-overlay-panel');
      panel.style.left = '';
      panel.style.top = '';
      panel.style.width = '';
      panel.style.height = '';
      panelDock.appendChild(panel);
      panel.setAttribute('draggable', 'true');
      syncOverlayVisibility();
    }

    function placeInMenu(panel) {
      if (!panelMenu) {
        placeInDock(panel);
        return;
      }
      panel.style.transform = '';
      panel.classList.remove('is-overlay-panel');
      panel.style.left = '';
      panel.style.top = '';
      panel.style.width = '';
      panel.style.height = '';
      panelMenu.appendChild(panel);
      panel.setAttribute('draggable', 'false');
      syncOverlayVisibility();
    }

    function placeInOverlay(panel) {
      if (!panelOverlay) {
        placeAtHome(panel);
        return;
      }
      panel.style.transform = '';
      panel.classList.add('is-overlay-panel');
      panelOverlay.appendChild(panel);
      panel.setAttribute('draggable', 'false');
      ensureOverlayGeometry(panel);
      applyOverlayGeometry(panel);
      syncOverlayVisibility();
    }

    function placeAtHome(panel) {
      const home = panelHomes.get(panel);
      if (!home || !home.placeholder.parentNode) return;
      home.placeholder.parentNode.insertBefore(panel, home.placeholder.nextSibling);
      panel.classList.remove('is-overlay-panel');
      panel.setAttribute('draggable', 'false');
      panel.style.left = '';
      panel.style.top = '';
      panel.style.width = '';
      panel.style.height = '';
      applyStoredTransform(panel);
    }

    function markedPanels() {
      return panelWindows.filter(function (panel) {
        return panel.classList.contains('is-collapsed')
          && !panel.classList.contains('is-minimized')
          && panel.classList.contains('is-marked');
      });
    }

    function dockOrderedPanels() {
      if (!panelDock) return [];
      return Array.from(panelDock.querySelectorAll('[data-panel-window].is-collapsed'));
    }

    function captureDockRects() {
      const rects = new Map();
      dockOrderedPanels().forEach(function (panel) {
        rects.set(panel, panel.getBoundingClientRect());
      });
      return rects;
    }

    function animateDockReflow(previousRects) {
      if (!panelDock || !previousRects || !previousRects.size) return;

      const activeDraggedSet = new Set(draggedPanels);
      dockOrderedPanels().forEach(function (panel) {
        if (activeDraggedSet.has(panel)) return;
        const previousRect = previousRects.get(panel);
        if (!previousRect) return;
        const nextRect = panel.getBoundingClientRect();
        const deltaX = previousRect.left - nextRect.left;
        const deltaY = previousRect.top - nextRect.top;
        if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) return;

        panel.style.setProperty('--dock-reflow-x', deltaX + 'px');
        panel.style.setProperty('--dock-reflow-y', deltaY + 'px');
        panel.classList.add('is-reflowing');

        requestAnimationFrame(function () {
          panel.style.setProperty('--dock-reflow-x', '0px');
          panel.style.setProperty('--dock-reflow-y', '0px');
        });

        window.setTimeout(function () {
          panel.classList.remove('is-reflowing');
          panel.style.removeProperty('--dock-reflow-x');
          panel.style.removeProperty('--dock-reflow-y');
        }, 240);
      });
    }

    function withDockReflow(mutator) {
      const previousRects = captureDockRects();
      mutator();
      requestAnimationFrame(function () {
        animateDockReflow(previousRects);
      });
    }

    function activeDraggedPanels(sourcePanel) {
      const orderedPanels = dockOrderedPanels();
      const marked = markedPanels();
      if (sourcePanel.classList.contains('is-marked') && marked.length > 1) {
        return orderedPanels.filter(function (panel) {
          return marked.indexOf(panel) !== -1;
        });
      }
      return [sourcePanel];
    }

    function insertDraggedPanels(beforeNode) {
      if (!panelDock || !draggedPanels.length) return;
      const fragment = document.createDocumentFragment();
      draggedPanels.forEach(function (panel) {
        fragment.appendChild(panel);
      });
      panelDock.insertBefore(fragment, beforeNode || null);
    }

    function draggedGroupKey() {
      return draggedPanels.map(function (panel) { return panel.id || 'panel'; }).join('|');
    }

    function dockReorderKey(targetTile, insertBefore) {
      const anchor = targetTile ? (targetTile.id || targetTile.querySelector('h2')?.textContent || 'tile') : 'end';
      return draggedGroupKey() + '::' + anchor + '::' + (insertBefore ? 'before' : 'after');
    }

    function setSnapTile(tile) {
      if (lastSnapTile && lastSnapTile !== tile) {
        lastSnapTile.classList.remove('is-snap-target');
      }
      if (tile) {
        tile.classList.add('is-snap-target');
      }
      lastSnapTile = tile || null;
    }

    function resolveDockSnapTarget(clientX, clientY) {
      if (!panelDock || !draggedPanels.length) return null;
      const draggedSet = new Set(draggedPanels);
      const candidates = dockOrderedPanels().filter(function (panel) {
        return !draggedSet.has(panel);
      });
      if (!candidates.length) return null;

      let nearest = null;
      let nearestScore = Number.POSITIVE_INFINITY;

      candidates.forEach(function (panel) {
        const rect = panel.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = Math.abs(clientX - centerX);
        const dy = Math.abs(clientY - centerY);
        const score = dy * 1.9 + dx * 0.65;
        if (score < nearestScore) {
          nearestScore = score;
          nearest = { panel: panel, rect: rect, centerX: centerX, centerY: centerY };
        }
      });

      if (!nearest) return null;

      const verticallyClose = Math.abs(clientY - nearest.centerY) <= nearest.rect.height * 0.55;
      const insertBefore = verticallyClose
        ? clientX < nearest.centerX
        : clientY < nearest.centerY;

      return {
        targetTile: nearest.panel,
        insertBefore: insertBefore,
      };
    }

    function applyDockReorder(targetTile, insertBefore) {
      if (!panelDock || !draggedPanel) return;
      const nextKey = dockReorderKey(targetTile, insertBefore);
      if (nextKey === lastDockReorderKey) return;

      const previousRects = captureDockRects();
      if (!targetTile || draggedPanels.indexOf(targetTile) !== -1) {
        insertDraggedPanels(null);
      } else {
        insertDraggedPanels(insertBefore ? targetTile : targetTile.nextSibling);
      }
      animateDockReflow(previousRects);
      lastDockReorderKey = nextKey;
    }

    function scheduleDockReorderFromPointer(clientX, clientY) {
      pendingDockTarget = { clientX: clientX, clientY: clientY };
      if (dockReorderFrame !== null) return;

      dockReorderFrame = requestAnimationFrame(function () {
        dockReorderFrame = null;
        if (!pendingDockTarget) return;
        const nextTarget = pendingDockTarget;
        pendingDockTarget = null;

        const snapTarget = resolveDockSnapTarget(nextTarget.clientX, nextTarget.clientY);
        if (!snapTarget) {
          setSnapTile(null);
          applyDockReorder(null, false);
          return;
        }

        setSnapTile(snapTarget.targetTile);
        applyDockReorder(snapTarget.targetTile, snapTarget.insertBefore);
      });
    }

    function refreshCollapsedButtons() {
      const markedCount = markedPanels().length;
      panelWindows.forEach(function (panel) {
        const toggleButtons = Array.from(panel.querySelectorAll('[data-panel-toggle]'));
        const isExpanded = !panel.classList.contains('is-collapsed');
        toggleButtons.forEach(function (button) {
          if (isExpanded) {
            button.textContent = 'Close';
          } else {
            button.textContent = markedCount > 0 ? 'Open marked' : 'Open';
          }
          button.setAttribute('aria-expanded', String(isExpanded));
        });
      });

      if (pushToWorkspaceButton && sandboxShell) {
        const inComponentsMode = sandboxShell.classList.contains('is-components-mode');
        pushToWorkspaceButton.disabled = !inComponentsMode || markedCount === 0;
        pushToWorkspaceButton.textContent = inComponentsMode && markedCount > 0
          ? ('Push Selected To Workspace (' + markedCount + ')')
          : 'Push Selected To Workspace';
      }
    }

    function clearMarkedPanels() {
      panelWindows.forEach(function (panel) {
        panel.classList.remove('is-marked');
        panel.setAttribute('aria-selected', 'false');
      });
      refreshCollapsedButtons();
    }

    function openMarkedPanels(fallbackPanel) {
      const targets = markedPanels();
      const panelsToOpen = targets.length ? targets : (fallbackPanel ? [fallbackPanel] : []);
      panelsToOpen.forEach(function (panel) {
        panel.dataset.expandMode = 'overlay';
        panel.classList.remove('is-collapsed');
        panel.classList.remove('is-minimized');
        panel.classList.remove('is-marked');
        panel.setAttribute('aria-selected', 'false');
        const syncPanelState = panelSyncFns.get(panel);
        if (typeof syncPanelState === 'function') syncPanelState();
      });
      refreshCollapsedButtons();
    }

    function closePanelsToDock(panels) {
      panels.forEach(function (panel) {
        panel.classList.add('is-collapsed');
        panel.classList.remove('is-minimized');
        const syncFn = panelSyncFns.get(panel);
        if (typeof syncFn === 'function') syncFn();
      });
      refreshCollapsedButtons();
    }

    function closeAllOverlayPanelsToDock() {
      const overlaySidePanels = panelWindows.filter(function (panel) {
        return panel.classList.contains('is-overlay-panel') || panel.classList.contains('is-minimized');
      });
      if (!overlaySidePanels.length) return;
      closePanelsToDock(overlaySidePanels);
    }

    function openDockSelectionForWorkspace() {
      const selected = markedPanels();
      if (selected.length) {
        openMarkedPanels();
        return;
      }
      const firstCollapsed = panelWindows.find(function (panel) {
        return panel.classList.contains('is-collapsed') && !panel.classList.contains('is-minimized');
      });
      if (firstCollapsed) {
        openMarkedPanels(firstCollapsed);
      }
    }

    function overlayTargets() {
      const overlays = panelWindows.filter(function (panel) {
        return panel.classList.contains('is-overlay-panel');
      });
      const markedOverlays = overlays.filter(function (panel) {
        return panel.classList.contains('is-marked');
      });
      return markedOverlays.length ? markedOverlays : overlays;
    }

    function setOverlayRect(panel, x, y, w, h) {
      if (!panelOverlay) return;
      const maxW = Math.max(220, panelOverlay.clientWidth - 24);
      const maxH = Math.max(160, panelOverlay.clientHeight - 24);
      const nextW = clamp(w, 220, maxW);
      const nextH = clamp(h, 160, maxH);
      const maxX = Math.max(8, panelOverlay.clientWidth - nextW - 8);
      panel.dataset.expandMode = 'overlay';
      panel.classList.remove('is-collapsed');
      panel.classList.remove('is-minimized');
      panel.dataset.overlayX = String(Math.round(clamp(x, 8, maxX)));
      panel.dataset.overlayY = String(Math.round(Math.max(8, y)));
      panel.dataset.overlayW = String(Math.round(nextW));
      panel.dataset.overlayH = String(Math.round(nextH));
      const syncFn = panelSyncFns.get(panel);
      if (typeof syncFn === 'function') syncFn();
      ensureOverlayScrollSpace();
    }

    function ensureOverlayScrollSpace() {
      if (!panelOverlay) return;
      let spacer = panelOverlay.querySelector('.panel-overlay-spacer');
      if (!spacer) {
        spacer = document.createElement('div');
        spacer.className = 'panel-overlay-spacer';
        panelOverlay.appendChild(spacer);
      }

      const overlays = Array.from(panelOverlay.querySelectorAll('[data-panel-window].is-overlay-panel')).filter(function (panel) {
        return !panel.classList.contains('is-minimized');
      });

      let maxBottom = panelOverlay.clientHeight;
      overlays.forEach(function (panel) {
        const y = Number(panel.dataset.overlayY || '0');
        const h = Number(panel.dataset.overlayH || String(panel.offsetHeight || 0));
        maxBottom = Math.max(maxBottom, y + h + 32);
      });
      spacer.style.height = String(Math.round(maxBottom)) + 'px';
    }

    function overlayBandForPanel(panel) {
      const group = String(panel && panel.dataset && panel.dataset.panelGroup || '').toLowerCase();
      if (group === 'content') return 'lower';
      return 'upper';
    }

    function maximizePinToBand(panel) {
      if (!panelOverlay) return;
      const margin = 12;
      const gap = 12;
      const workW = Math.max(320, panelOverlay.clientWidth - margin * 2);
      const workH = Math.max(240, panelOverlay.clientHeight - margin * 2);
      const stackedH = Math.max(220, Math.round((workH - gap) / 2));
      const band = overlayBandForPanel(panel);
      const bandTop = band === 'lower'
        ? (margin + stackedH + gap)
        : margin;

      const overlays = panelWindows.filter(function (item) {
        return item !== panel
          && item.classList.contains('is-overlay-panel')
          && !item.classList.contains('is-minimized')
          && item.dataset.overlayStack === ('band-' + band);
      });

      let nextY = bandTop;
      if (overlays.length) {
        let maxBottom = 0;
        overlays.forEach(function (item) {
          const y = Number(item.dataset.overlayY || '0');
          const h = Number(item.dataset.overlayH || String(item.offsetHeight || stackedH));
          maxBottom = Math.max(maxBottom, y + h);
        });
        nextY = maxBottom + gap;
      }

      panel.dataset.overlayStack = 'band-' + band;
      setOverlayRect(panel, margin, nextY, workW, stackedH);
      requestAnimationFrame(function () {
        if (band === 'lower') {
          panelOverlay.scrollTop = panelOverlay.scrollHeight;
        } else {
          panelOverlay.scrollTop = 0;
        }
      });
    }

    function applyOverlayLayout(action) {
      if (!panelOverlay) return;
      let targets = overlayTargets();
      if (!targets.length) {
        openDockSelectionForWorkspace();
        targets = overlayTargets();
      }
      if (!targets.length) return;

      const gap = 12;
      const margin = 12;
      const workW = Math.max(320, panelOverlay.clientWidth - margin * 2);
      const workH = Math.max(240, panelOverlay.clientHeight - margin * 2);

      if (action === 'maximize') {
        const halfH = (workH - gap) / 2;
        const upperTargets = [];
        const lowerTargets = [];

        targets.forEach(function (panel) {
          if (overlayBandForPanel(panel) === 'lower') lowerTargets.push(panel);
          else upperTargets.push(panel);
        });

        if (!upperTargets.length && lowerTargets.length > 1) {
          upperTargets.push(lowerTargets.shift());
        }
        if (!lowerTargets.length && upperTargets.length > 1) {
          lowerTargets.push(upperTargets.pop());
        }

        function placeBand(bandTargets, bandTop) {
          if (!bandTargets.length) return;
          const rows = bandTargets.length;
          const rowGap = 10;
          const cellH = (halfH - Math.max(0, rows - 1) * rowGap) / rows;
          bandTargets.forEach(function (panel, index) {
            panel.dataset.overlayStack = 'band-' + (bandTop > margin ? 'lower' : 'upper');
            setOverlayRect(panel, margin, bandTop + index * (cellH + rowGap), workW, cellH);
          });
        }

        placeBand(upperTargets, margin);
        placeBand(lowerTargets, margin + halfH + gap);
        return;
      }

      if (action === 'left' || action === 'right' || action === 'top' || action === 'bottom' || action === 'center') {
        const halfW = (workW - gap) / 2;
        const halfH = (workH - gap) / 2;
        targets.forEach(function (panel) {
          if (action === 'left') setOverlayRect(panel, margin, margin, halfW, workH);
          else if (action === 'right') setOverlayRect(panel, margin + halfW + gap, margin, halfW, workH);
          else if (action === 'top') setOverlayRect(panel, margin, margin, workW, halfH);
          else if (action === 'bottom') setOverlayRect(panel, margin, margin + halfH + gap, workW, halfH);
          else if (action === 'center') {
            const w = Math.max(420, workW * 0.58);
            const h = Math.max(300, workH * 0.62);
            setOverlayRect(panel, margin + (workW - w) / 2, margin + (workH - h) / 2, w, h);
          }
        });
        return;
      }

      if (action === 'columns') {
        const cols = 2;
        const rows = Math.ceil(targets.length / cols);
        const colW = (workW - gap) / cols;
        const cellH = (workH - Math.max(0, rows - 1) * gap) / rows;
        targets.forEach(function (panel, index) {
          const col = index % cols;
          const row = Math.floor(index / cols);
          setOverlayRect(panel, margin + col * (colW + gap), margin + row * (cellH + gap), colW, cellH);
        });
        return;
      }

      if (action === 'grid') {
        const cols = 2;
        const rows = Math.max(2, Math.ceil(targets.length / cols));
        const colW = (workW - gap) / cols;
        const cellH = (workH - Math.max(0, rows - 1) * gap) / rows;
        targets.forEach(function (panel, index) {
          const col = index % cols;
          const row = Math.floor(index / cols);
          setOverlayRect(panel, margin + col * (colW + gap), margin + row * (cellH + gap), colW, cellH);
        });
      }
    }

    const workspaceWindowTools = document.getElementById('workspace-window-tools');
    if (workspaceWindowTools) {
      workspaceWindowTools.addEventListener('click', function (event) {
        const button = event.target && event.target.closest('[data-layout-action]');
        if (!button) return;
        const action = button.getAttribute('data-layout-action');
        if (!action) return;
        event.preventDefault();
        event.stopPropagation();
        applyOverlayLayout(action);
      });
    }

    let wheelAccumX = 0;
    let wheelResetTimer = null;
    let lastWheelNavAt = 0;

    function resetWheelAccumulatorSoon() {
      if (wheelResetTimer !== null) {
        clearTimeout(wheelResetTimer);
      }
      wheelResetTimer = window.setTimeout(function () {
        wheelAccumX = 0;
        wheelResetTimer = null;
      }, 120);
    }

    function handleWheelPaneGesture(event, direction) {
      if (event.ctrlKey) return; // Ignore pinch-zoom gestures.
      if (Math.abs(event.deltaX) < Math.abs(event.deltaY) * 1.2) return;

      const now = Date.now();
      if (now - lastWheelNavAt < 320) return;

      wheelAccumX += event.deltaX;
      resetWheelAccumulatorSoon();

      if (direction === 'dock-to-overlay' && wheelAccumX <= -90) {
        event.preventDefault();
        openDockSelectionForWorkspace();
        wheelAccumX = 0;
        lastWheelNavAt = now;
        return;
      }

      if (direction === 'overlay-to-dock' && wheelAccumX >= 90) {
        event.preventDefault();
        closeAllOverlayPanelsToDock();
        wheelAccumX = 0;
        lastWheelNavAt = now;
      }
    }

    if (panelDock) {
      panelDock.addEventListener('dragover', function (event) {
        if (!draggedPanel) return;
        event.preventDefault();
        scheduleDockReorderFromPointer(event.clientX, event.clientY);
      });

      panelDock.addEventListener('drop', function (event) {
        if (!draggedPanel) return;
        event.preventDefault();
        setSnapTile(null);
        pendingDockTarget = null;
        if (dockReorderFrame !== null) {
          cancelAnimationFrame(dockReorderFrame);
          dockReorderFrame = null;
        }
      });

      let dockTouchStartX = 0;
      let dockTouchStartY = 0;
      panelDock.addEventListener('touchstart', function (event) {
        if (!event.touches || !event.touches[0]) return;
        dockTouchStartX = event.touches[0].clientX;
        dockTouchStartY = event.touches[0].clientY;
      }, { passive: true });

      panelDock.addEventListener('touchend', function (event) {
        if (!event.changedTouches || !event.changedTouches[0]) return;
        const dx = event.changedTouches[0].clientX - dockTouchStartX;
        const dy = event.changedTouches[0].clientY - dockTouchStartY;
        if (Math.abs(dx) > 72 && Math.abs(dy) < 56 && dx < 0) {
          openDockSelectionForWorkspace();
        }
      }, { passive: true });

      panelDock.addEventListener('wheel', function (event) {
        handleWheelPaneGesture(event, 'dock-to-overlay');
      }, { passive: false });
    }

    if (panelOverlay) {
      let overlayTouchStartX = 0;
      let overlayTouchStartY = 0;
      panelOverlay.addEventListener('touchstart', function (event) {
        if (!event.touches || !event.touches[0]) return;
        overlayTouchStartX = event.touches[0].clientX;
        overlayTouchStartY = event.touches[0].clientY;
      }, { passive: true });

      panelOverlay.addEventListener('touchend', function (event) {
        if (!event.changedTouches || !event.changedTouches[0]) return;
        const dx = event.changedTouches[0].clientX - overlayTouchStartX;
        const dy = event.changedTouches[0].clientY - overlayTouchStartY;
        if (Math.abs(dx) > 72 && Math.abs(dy) < 56 && dx > 0) {
          closeAllOverlayPanelsToDock();
        }
      }, { passive: true });

      panelOverlay.addEventListener('wheel', function (event) {
        // Keep two-finger pane switching for the workspace background only.
        if (event.target && event.target.closest('[data-panel-window].is-overlay-panel')) return;
        handleWheelPaneGesture(event, 'overlay-to-dock');
      }, { passive: false });
    }

    if (panelMenu) {
      let menuTouchStartX = 0;
      let menuTouchStartY = 0;

      panelMenu.addEventListener('touchstart', function (event) {
        if (!event.touches || !event.touches[0]) return;
        menuTouchStartX = event.touches[0].clientX;
        menuTouchStartY = event.touches[0].clientY;
      }, { passive: true });

      panelMenu.addEventListener('touchend', function (event) {
        if (!event.changedTouches || !event.changedTouches[0]) return;
        const dx = event.changedTouches[0].clientX - menuTouchStartX;
        const dy = event.changedTouches[0].clientY - menuTouchStartY;
        if (Math.abs(dx) > 72 && Math.abs(dy) < 56 && dx > 0) {
          closeAllOverlayPanelsToDock();
        }
      }, { passive: true });

      panelMenu.addEventListener('wheel', function (event) {
        handleWheelPaneGesture(event, 'overlay-to-dock');
      }, { passive: false });
    }

    panelWindows.forEach(function (panel) {
      const handle = panel.querySelector('.panel-heading') || panel.querySelector('h2');
      const toggleButtons = Array.from(panel.querySelectorAll('[data-panel-toggle]'));
      let clickToggleTimer = null;
      if (!handle) return;

      if (!panel.classList.contains('is-collapsed') && !panel.dataset.expandMode) {
        panel.dataset.expandMode = 'overlay';
      }

      const placeholder = document.createComment('panel-home');
      panel.parentNode.insertBefore(placeholder, panel);
      panelHomes.set(panel, { placeholder: placeholder });

      function syncPanelState() {
        const previousRects = captureDockRects();
        const isMinimized = panel.classList.contains('is-minimized');
        const isExpanded = !panel.classList.contains('is-collapsed');
        if (isMinimized) {
          placeInMenu(panel);
        } else if (isExpanded) {
          panel.classList.remove('is-marked');
          panel.setAttribute('aria-selected', 'false');
          if (panel.dataset.expandMode === 'overlay') {
            placeInOverlay(panel);
          } else {
            placeAtHome(panel);
          }
        } else {
          placeInDock(panel);
        }
        refreshCollapsedButtons();
        syncMenuShellState();
        requestAnimationFrame(function () {
          animateDockReflow(previousRects);
        });
      }

      function setPanelMinimized(nextState) {
        if (nextState) {
          panel.dataset.expandMode = 'overlay';
          panel.classList.add('is-minimized');
          panel.classList.add('is-collapsed');
        } else {
          panel.classList.remove('is-minimized');
          panel.classList.remove('is-collapsed');
        }
      }

      function shouldIgnorePanelDoubleClick(event) {
        const target = event.target;
        if (!target || !(target instanceof Element)) return false;
        return Boolean(target.closest(
          '[data-panel-toggle], button, a, input, textarea, select, option, label, [contenteditable="true"], .react-flow, .react-flow__pane, .react-flow__node, .react-flow__edge, .terminal-entry, .content-search-input, .markdown-editor-input, .content-outline-item.is-button, .connected-item[data-node-id]'
        ));
      }

      panelSyncFns.set(panel, syncPanelState);

      let startX = 0;
      let startY = 0;
      let offsetX = 0;
      let offsetY = 0;
      let activePointerId = null;
      let movedDuringDrag = false;
      let lastDragEndedAt = 0;
      let dockTouchPointerId = null;
      let dockTouchDragStarted = false;
      let dockTouchStartX = 0;
      let dockTouchStartY = 0;

      function stopDragging(event) {
        if (activePointerId === null || (event && event.pointerId !== activePointerId)) return;
        panel.classList.remove('is-dragging');
        activePointerId = null;
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', stopDragging);
        window.removeEventListener('pointercancel', stopDragging);
      }

      function onPointerMove(event) {
        if (event.pointerId !== activePointerId) return;
        if (!movedDuringDrag) {
          const movedX = Math.abs(event.clientX - startX);
          const movedY = Math.abs(event.clientY - startY);
          if (movedX > 4 || movedY > 4) movedDuringDrag = true;
        }
        const nextX = offsetX + (event.clientX - startX);
        const nextY = offsetY + (event.clientY - startY);
        if (panel.classList.contains('is-overlay-panel') && panelOverlay) {
          const maxX = Math.max(0, panelOverlay.clientWidth - panel.offsetWidth - 16);
          const maxY = Math.max(0, panelOverlay.clientHeight - panel.offsetHeight - 16);
          panel.dataset.overlayX = String(clamp(nextX, 0, maxX));
          panel.dataset.overlayY = String(clamp(nextY, 0, maxY));
          applyOverlayGeometry(panel);
          return;
        }
        panel.style.transform = 'translate(' + nextX + 'px, ' + nextY + 'px)';
      }

      handle.addEventListener('pointerdown', function (event) {
        if (event.target && event.target.closest('[data-panel-toggle]')) return;
        // Allow dragging overlay panels (even minimized), but not collapsed dock tiles
        if (panel.classList.contains('is-collapsed') && !panel.classList.contains('is-overlay-panel')) return;
        if (event.button !== 0) return;
        event.preventDefault();
        startX = event.clientX;
        startY = event.clientY;
        movedDuringDrag = false;
        if (panel.classList.contains('is-overlay-panel')) {
          offsetX = Number(panel.dataset.overlayX || '0');
          offsetY = Number(panel.dataset.overlayY || '0');
        } else {
          offsetX = Number(panel.dataset.translateX || '0');
          offsetY = Number(panel.dataset.translateY || '0');
        }
        activePointerId = event.pointerId;
        panel.classList.add('is-dragging');
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', function onPointerUp(pointerEvent) {
          if (pointerEvent.pointerId !== activePointerId) return;
          const finalX = offsetX + (pointerEvent.clientX - startX);
          const finalY = offsetY + (pointerEvent.clientY - startY);
          if (panel.classList.contains('is-overlay-panel') && panelOverlay) {
            const maxX = Math.max(0, panelOverlay.clientWidth - panel.offsetWidth - 16);
            const maxY = Math.max(0, panelOverlay.clientHeight - panel.offsetHeight - 16);
            panel.dataset.overlayX = String(clamp(finalX, 0, maxX));
            panel.dataset.overlayY = String(clamp(finalY, 0, maxY));
            applyOverlayGeometry(panel);
          } else {
            panel.dataset.translateX = String(finalX);
            panel.dataset.translateY = String(finalY);
          }
          if (movedDuringDrag) {
            lastDragEndedAt = Date.now();
          }
          stopDragging(pointerEvent);
          window.removeEventListener('pointerup', onPointerUp);
        });
        window.addEventListener('pointercancel', stopDragging);
      });

      handle.addEventListener('dblclick', function (event) {
        event.stopPropagation();
        if (panel.classList.contains('is-overlay-panel')) {
          setPanelMinimized(!panel.classList.contains('is-minimized'));
        } else {
          panel.classList.toggle('is-collapsed');
        }
        syncPanelState();
      });

      panel.addEventListener('dblclick', function (event) {
        if (event.target && event.target.closest('.panel-heading')) return;
        if (shouldIgnorePanelDoubleClick(event)) return;
        if (clickToggleTimer !== null) {
          clearTimeout(clickToggleTimer);
          clickToggleTimer = null;
        }
        event.preventDefault();
        event.stopPropagation();

        if (panel.classList.contains('is-collapsed') && sandboxShell && sandboxShell.classList.contains('is-components-mode')) {
          if (!panel.classList.contains('is-marked')) {
            panel.classList.add('is-marked');
            panel.setAttribute('aria-selected', 'true');
          }
          const selectedIds = markedPanels().map(function (item) { return item.id; });
          if (selectedIds.length) {
            applySectionPreset('workspace', { openIds: selectedIds });
          }
          return;
        }

        if (panel.classList.contains('is-collapsed')) {
          openMarkedPanels(panel);
          return;
        }
        // For overlay panels, minimize instead of collapse
        if (panel.classList.contains('is-overlay-panel')) {
          setPanelMinimized(true);
        } else {
          panel.classList.add('is-collapsed');
        }
        syncPanelState();
      });

      panel.addEventListener('click', function (event) {
        if (event.target && event.target.closest('[data-panel-toggle]')) return;
        if (event.target && event.target.closest('button, a, input, textarea, select, option, label, [contenteditable="true"]')) return;
        if (Date.now() - lastDragEndedAt < 220) return;
        
        // Title click → toggle minimize (hide/show content, keep panel in overlay)
        if (event.target && event.target.closest('.panel-heading')) {
          if (panel.classList.contains('is-overlay-panel')) {
            // For overlay panels, toggle minimized state into left-side menu.
            setPanelMinimized(!panel.classList.contains('is-minimized'));
            syncPanelState();
          }
          return;
        }
        
        // Skip marking if click is on React root content (graph, terminal, comments, etc.)
        var reactRoots = ['nexus-flow-root', 'terminal-panel-root', 'comment-panel-root', 
                         'active-node-panel-root', 'connected-list-root', 'content-outline-root', 
                         'braille-input-root', 'backpack-panel-root'];
        for (var i = 0; i < reactRoots.length; i++) {
          if (event.target.closest('#' + reactRoots[i])) {
            return; // Don't mark if clicking inside React content
          }
        }
        
        // Body click → toggle mark (select/deselect)
        if (!panel.classList.contains('is-collapsed') && !panel.classList.contains('is-minimized')) {
          return; // Skip marking on fully expanded panels
        }

        if (panel.classList.contains('is-collapsed') && sandboxShell && sandboxShell.classList.contains('is-components-mode')) {
          panel.classList.toggle('is-marked');
          panel.setAttribute('aria-selected', String(panel.classList.contains('is-marked')));
          refreshCollapsedButtons();
          return;
        }
        
        if (clickToggleTimer !== null) {
          clearTimeout(clickToggleTimer);
          clickToggleTimer = null;
        }
        clickToggleTimer = window.setTimeout(function () {
          clickToggleTimer = null;
          panel.classList.toggle('is-marked');
          panel.setAttribute('aria-selected', String(panel.classList.contains('is-marked')));
          refreshCollapsedButtons();
        }, 180);
      });

      toggleButtons.forEach(function (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          if (panel.classList.contains('is-collapsed')) {
            openMarkedPanels(panel);
            return;
          }

          panel.classList.toggle('is-collapsed');
          syncPanelState();
        });
      });

      // Wire up header pin buttons (close, maximize, minimize)
      var pinButtons = Array.from(panel.querySelectorAll('.panel-pin'));
      pinButtons.forEach(function (pinButton) {
        var pinActionName = pinButton.dataset.pin;
        if (pinActionName === 'close') {
          pinButton.title = 'Close: send panel to dock tiles';
        } else if (pinActionName === 'maximize') {
          pinButton.title = 'Maximize: open page-wide at workspace bottom';
        } else if (pinActionName === 'minimize') {
          pinButton.title = 'Minimize: move to left rail tile';
        }

        function handlePinClick(event) {
          event.preventDefault();
          event.stopPropagation();
          var pinAction = pinButton.dataset.pin;
          
          if (pinAction === 'close') {
            // Close: collapse panel and move to dock
            panel.classList.add('is-collapsed');
            panel.classList.remove('is-minimized');
            syncPanelState();
          } else if (pinAction === 'minimize') {
            // Minimize: move panel to left title-only menu.
            setPanelMinimized(true);
            syncPanelState();
          } else if (pinAction === 'maximize') {
            // Maximize: open in overlay as bottom, page-wide panel.
            if (panel.classList.contains('is-collapsed') || panel.classList.contains('is-minimized')) {
              panel.classList.remove('is-collapsed');
              panel.classList.remove('is-minimized');
              panel.dataset.expandMode = 'overlay';
              syncPanelState();
              maximizePinToBand(panel);
            } else if (panel.classList.contains('is-overlay-panel')) {
              if (panel.classList.contains('is-minimized')) {
                setPanelMinimized(false);
                syncPanelState();
              }
              maximizePinToBand(panel);
            }
          }
        }
        
        pinButton.addEventListener('click', handlePinClick);
        pinButton.addEventListener('mousedown', handlePinClick);
        pinButton.addEventListener('touchstart', handlePinClick);
      });

      panel.addEventListener('dragstart', function (event) {
        if (!panel.classList.contains('is-collapsed')) {
          event.preventDefault();
          return;
        }
        draggedPanel = panel;
        draggedPanels = activeDraggedPanels(panel);
        lastDockReorderKey = '';
        draggedPanels.forEach(function (draggedItem) {
          draggedItem.classList.add('is-sort-dragging');
        });
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('text/plain', panel.querySelector('h2') ? panel.querySelector('h2').textContent || 'panel' : 'panel');
        }
      });

      panel.addEventListener('dragend', function () {
        draggedPanels.forEach(function (draggedItem) {
          draggedItem.classList.remove('is-sort-dragging');
        });
        if (clickToggleTimer !== null) {
          clearTimeout(clickToggleTimer);
          clickToggleTimer = null;
        }
        setSnapTile(null);
        pendingDockTarget = null;
        if (dockReorderFrame !== null) {
          cancelAnimationFrame(dockReorderFrame);
          dockReorderFrame = null;
        }
        lastDockReorderKey = '';
        draggedPanel = null;
        draggedPanels = [];
      });

      function clearDockTouchReorder() {
        draggedPanels.forEach(function (draggedItem) {
          draggedItem.classList.remove('is-sort-dragging');
        });
        setSnapTile(null);
        pendingDockTarget = null;
        if (dockReorderFrame !== null) {
          cancelAnimationFrame(dockReorderFrame);
          dockReorderFrame = null;
        }
        lastDockReorderKey = '';
        draggedPanel = null;
        draggedPanels = [];
        dockTouchPointerId = null;
        dockTouchDragStarted = false;
      }

      panel.addEventListener('pointerdown', function (event) {
        if (event.pointerType !== 'touch') return;
        if (!panel.classList.contains('is-collapsed') || panel.classList.contains('is-minimized')) return;
        if (!panelDock || panel.parentElement !== panelDock) return;
        if (event.target && event.target.closest('button, a, input, textarea, select, option, label, [contenteditable="true"]')) return;

        dockTouchPointerId = event.pointerId;
        dockTouchDragStarted = false;
        dockTouchStartX = event.clientX;
        dockTouchStartY = event.clientY;
        draggedPanel = panel;
        draggedPanels = activeDraggedPanels(panel);
        lastDockReorderKey = '';
        draggedPanels.forEach(function (draggedItem) {
          draggedItem.classList.add('is-sort-dragging');
        });
      });

      panel.addEventListener('pointermove', function (event) {
        if (dockTouchPointerId === null || event.pointerId !== dockTouchPointerId) return;
        const dx = Math.abs(event.clientX - dockTouchStartX);
        const dy = Math.abs(event.clientY - dockTouchStartY);
        if (!dockTouchDragStarted && (dx > 8 || dy > 8)) {
          dockTouchDragStarted = true;
        }
        if (!dockTouchDragStarted) return;
        event.preventDefault();
        scheduleDockReorderFromPointer(event.clientX, event.clientY);
      }, { passive: false });

      panel.addEventListener('pointerup', function (event) {
        if (dockTouchPointerId === null || event.pointerId !== dockTouchPointerId) return;
        if (dockTouchDragStarted) {
          lastDragEndedAt = Date.now();
        }
        clearDockTouchReorder();
      });

      panel.addEventListener('pointercancel', function (event) {
        if (dockTouchPointerId === null || event.pointerId !== dockTouchPointerId) return;
        clearDockTouchReorder();
      });

      syncPanelState();
    });

    const sandboxTabs = Array.from(document.querySelectorAll('.sandbox-tabs .sandbox-tab'));

    function setPanelPreset(panelId, options) {
      const panel = panelWindows.find(function (item) { return item.id === panelId; });
      if (!panel) return;

      const next = options || {};
      const collapse = typeof next.collapsed === 'boolean' ? next.collapsed : panel.classList.contains('is-collapsed');
      const minimize = typeof next.minimized === 'boolean' ? next.minimized : panel.classList.contains('is-minimized');

      panel.classList.toggle('is-collapsed', collapse);
      panel.classList.toggle('is-minimized', minimize);
      panel.classList.remove('is-marked');
      panel.setAttribute('aria-selected', 'false');

      if (next.expandMode) {
        panel.dataset.expandMode = next.expandMode;
      }

      const syncFn = panelSyncFns.get(panel);
      if (typeof syncFn === 'function') syncFn();
    }

    function applySectionPreset(sectionName, options) {
      const section = sectionName || 'workspace';
      const extraOpenIds = new Set((options && Array.isArray(options.openIds)) ? options.openIds : []);

      sandboxTabs.forEach(function (tab) {
        tab.classList.toggle('is-active', tab.dataset.section === section);
      });

      if (sandboxShell) {
        sandboxShell.classList.toggle('is-components-mode', section === 'components');
      }

      if (pushToWorkspaceButton) {
        pushToWorkspaceButton.hidden = false;
      }

      if (structureHint) {
        const title = structureHint.querySelector('.sandbox-structure-hint-title');
        const copy = structureHint.querySelector('.sandbox-structure-hint-copy');
        if (section === 'components') {
          if (title) title.textContent = 'glabs.nexus.engines.alphafold';
          if (copy) copy.textContent = 'Developed order view with large code pearls, small plot pearls, and registry JSON for each step.';
        } else {
          if (title) title.textContent = 'Workflow View';
          if (copy) copy.textContent = 'Graph-centered execution workspace with active workflow panels.';
        }
      }

      clearMarkedPanels();

      if (section === 'components') {
        panelWindows.forEach(function (panel) {
          const shouldOpen = panel.id === 'panel-graph'
            || panel.id === 'panel-registry'
            || panel.id === 'panel-selection'
            || panel.id === 'panel-linked'
            || panel.id === 'panel-contents'
            || panel.id === 'panel-terminal';
          const shouldOverlay = shouldOpen;
          setPanelPreset(panel.id, {
            collapsed: !shouldOpen,
            minimized: false,
            expandMode: shouldOverlay ? 'overlay' : 'home'
          });
        });
        requestAnimationFrame(function () {
          applyOverlayLayout('columns');
        });
        window.dispatchEvent(new CustomEvent(GLABS_SECTION_EVENT, { detail: { section: section } }));
        refreshCollapsedButtons();
        return;
      }

      if (section === 'registry') {
        panelWindows.forEach(function (panel) {
          const shouldOpen = panel.id === 'panel-registry' || panel.id === 'panel-compose' || panel.id === 'panel-terminal';
          setPanelPreset(panel.id, {
            collapsed: !shouldOpen,
            minimized: false,
            expandMode: shouldOpen ? 'overlay' : 'home'
          });
        });
        requestAnimationFrame(function () {
          applyOverlayLayout('columns');
        });
        window.dispatchEvent(new CustomEvent(GLABS_SECTION_EVENT, { detail: { section: section } }));
        return;
      }

      panelWindows.forEach(function (panel) {
        const shouldOpen = panel.id === 'panel-graph'
          || panel.id === 'panel-selection'
          || panel.id === 'panel-linked'
          || panel.id === 'panel-terminal'
          || panel.id === 'panel-comment'
          || extraOpenIds.has(panel.id);
        setPanelPreset(panel.id, { collapsed: !shouldOpen, minimized: false, expandMode: 'home' });
      });

      window.dispatchEvent(new CustomEvent(GLABS_SECTION_EVENT, { detail: { section: section } }));
      refreshCollapsedButtons();
    }

    sandboxTabs.forEach(function (tab) {
      tab.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        applySectionPreset(tab.dataset.section || 'workspace');
      });
    });

    if (pushToWorkspaceButton) {
      pushToWorkspaceButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        const selectedIds = markedPanels().map(function (panel) {
          return panel.id;
        });
        if (!selectedIds.length) return;
        applySectionPreset('workspace', { openIds: selectedIds });
      });
    }

    const initialTab = sandboxTabs.find(function (tab) {
      return tab.classList.contains('is-active');
    });
    applySectionPreset(initialTab ? (initialTab.dataset.section || 'workspace') : 'workspace');

    syncOverlayVisibility();
    syncMenuShellState();

    refreshCollapsedButtons();
  }

  function getNodeConnections(node, nodes, edges) {
    const labels = [];
    const seen = new Set();

    (node.data.links || []).forEach(function (label) {
      const key = 'label:' + label;
      if (!label || seen.has(key)) return;
      seen.add(key);
      labels.push({ label: label, id: null });
    });

    edges.forEach(function (edge) {
      if (edge.source === node.id) {
        const target = nodes.find(function (item) { return item.id === edge.target; });
        if (target && !seen.has('node:' + target.id)) {
          seen.add('node:' + target.id);
          labels.push({ label: target.data.name, id: target.id });
        }
      }
      if (edge.target === node.id) {
        const source = nodes.find(function (item) { return item.id === edge.source; });
        if (source && !seen.has('node:' + source.id)) {
          seen.add('node:' + source.id);
          labels.push({ label: source.data.name, id: source.id });
        }
      }
    });
    return labels;
  }

  function renderCodeView(node) {
    const moduleName = String(node.id || node.data.name).replace(/-/g, '_');
    return [
      '# ' + node.data.name,
      'path: /sandbox/nodes/' + moduleName + '/',
      'module: calyr.nodes.' + moduleName,
      'entry: python -m calyr.nodes.' + moduleName,
      '',
      'commands:',
      '  ls',
      '  pwd',
      '  python -m calyr.nodes.' + moduleName + ' --help',
      '  rg "' + node.data.name.split(' ')[0].toLowerCase() + '" src tests'
    ].join('\n');
  }

  function buildHoverCodePreview(data) {
    const moduleName = String(data.id || data.name || 'node').replace(/-/g, '_');
    return [
      { label: 'path', value: '/sandbox/nodes/' + moduleName },
      { label: 'module', value: 'calyr.nodes.' + moduleName },
      { label: 'entry', value: 'python -m calyr.nodes.' + moduleName },
      { label: 'surface', value: String(data.kind || 'Module').toLowerCase() + ' interface' },
    ];
  }

  function formatTerminalPrompt(cwd, shellName) {
    const normalized = String(cwd || '~').replace(/\\/g, '/');
    const segments = normalized.split('/').filter(Boolean);
    const label = normalized === '/' ? '/' : (segments[segments.length - 1] || '~');
    return (shellName || 'zsh') + ':' + label + '$';
  }

  function terminalTabLabel(viewName) {
    if (viewName === 'graph') return 'Graph View';
    if (viewName === 'code') return 'Code Browser';
    return viewName.charAt(0).toUpperCase() + viewName.slice(1);
  }

  function trimTrailingNewline(value) {
    return String(value).replace(/\n+$/g, '');
  }

  function randomBits() {
    return Array.from({ length: 6 }, function () {
      return Math.random() > 0.5 ? '1' : '0';
    }).join('');
  }

  function getTerminalSessionId() {
    const storageKey = 'nexus-terminal-session';
    const existing = window.sessionStorage.getItem(storageKey);
    if (existing) return existing;
    const created = window.crypto && typeof window.crypto.randomUUID === 'function'
      ? window.crypto.randomUUID()
      : 'nexus-' + Date.now();
    window.sessionStorage.setItem(storageKey, created);
    return created;
  }

  function extractCommentTitle(value) {
    const lines = String(value || '').split('\n').map(function (line) { return line.trim(); }).filter(Boolean);
    const heading = lines.find(function (line) { return line.charAt(0) === '#'; });
    if (heading) return heading.replace(/^#+\s*/, '');
    return lines[0] || 'Markdown note';
  }

  function extractCommentChips(value) {
    const headings = String(value || '').split('\n').map(function (line) {
      const match = line.trim().match(/^#{1,3}\s+(.+)$/);
      return match ? match[1] : null;
    }).filter(Boolean);
    if (headings.length) return headings.slice(0, 3);
    return ['Markdown', 'Comment', 'Edit'];
  }
})();
