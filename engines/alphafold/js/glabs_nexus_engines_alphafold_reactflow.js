import React, { useEffect, useMemo, useRef, useState } from 'https://esm.sh/react@18.3.1';
import { createRoot } from 'https://esm.sh/react-dom@18.3.1/client';
import htm from 'https://esm.sh/htm@3.1.1';
import ReactFlow, {
  applyNodeChanges,
  Background,
  ControlButton,
  Controls,
  Handle,
  MiniMap,
  MarkerType,
  Position
} from 'https://esm.sh/reactflow@11.11.4?deps=react@18.3.1,react-dom@18.3.1';

const html = htm.bind(React.createElement);

// Resolve getBezierPath lazily from the ReactFlow namespace import
// to avoid named import destructuring issues in some environments
let _getBezierPath = null;
async function loadGetBezierPath() {
  if (_getBezierPath) return;
  const rf = await import('https://esm.sh/reactflow@11.11.4?deps=react@18.3.1,react-dom@18.3.1');
  _getBezierPath = rf.getBezierPath;
}
loadGetBezierPath();

(function () {
  'use strict';

  const appRoot = document.getElementById('af-app-root');
  if (!appRoot) return;

  function accentRgb(accent) {
    if (accent === 'magenta') return '255, 72, 196';
    if (accent === 'white') return '255, 255, 255';
    return '93, 200, 255';
  }

  // Semantic domain → RGB triple (field glow color)
  function domainGlowRgb(domain) {
    if (domain === 'structural-biology') return '60, 130, 255';
    if (domain === 'reciprocal-space')   return '255, 165, 50';
    if (domain === 'ai-transform')       return '160, 80, 255';
    if (domain === 'runtime-hpc')        return '60, 210, 120';
    if (domain === 'topology')           return '60, 220, 220';
    if (domain === 'error')              return '255, 60, 70';
    return '93, 200, 255';
  }

  function domainHex(domain) {
    if (domain === 'structural-biology') return '#3c82ff';
    if (domain === 'reciprocal-space')   return '#ffa552';
    if (domain === 'ai-transform')       return '#a050ff';
    if (domain === 'runtime-hpc')        return '#3cd278';
    if (domain === 'topology')           return '#3cdcdc';
    if (domain === 'error')              return '#ff3c46';
    return '#5dc8ff';
  }

  function domainClass(domain) {
    return String(domain || 'structural-biology').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  // 1.2 — Semantic pulse edge: white coherent pulses travel source→target
  function PulseEdge(props) {
    const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd, style } = props;
    const edgePath = _getBezierPath
      ? _getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, curvature: 0.12 })[0]
      : 'M ' + sourceX + ' ' + sourceY + ' C ' + (sourceX + 50) + ' ' + sourceY + ', ' + (targetX - 50) + ' ' + targetY + ', ' + targetX + ' ' + targetY;
    const runtime = (data && data.runtime) || 'idle';
    const cycleDuration = ((data && data.cycleDuration) || 7.2) + 's';
    const pulseStart = data && data.pulseStart != null ? data.pulseStart : 0.06;
    const pulseEnd = data && data.pulseEnd != null ? data.pulseEnd : 0.18;
    const pulseOpacityTimes = [
      '0',
      String(Math.max(0, pulseStart - 0.012)),
      String(pulseStart),
      String(pulseEnd),
      '1'
    ].join(';');
    const pulseOpacityValues = '0;0;1;1;0';
    const pulseMotionTimes = ['0', String(pulseStart), String(pulseEnd), '1'].join(';');
    const pulseStyle = {
      '--pulse-rgb': (data && data.pulseRgb) || '255, 255, 255'
    };
    return html`
      <g className=${'pulse-edge-group pulse-edge-group--' + runtime}>
        <path
          id=${id}
          className="react-flow__edge-path pulse-edge-base"
          d=${edgePath}
          markerEnd=${markerEnd}
          style=${style}
        />
        <g className=${'pulse-edge-pulse pulse-edge-pulse--' + runtime} style=${pulseStyle}>
          <ellipse className="pulse-edge-drop pulse-edge-drop-tail" cx="-3.6" cy="0" rx="2.2" ry="1.5" />
          <ellipse className="pulse-edge-drop pulse-edge-drop-core" cx="0" cy="0" rx="2.7" ry="2.25" />
          <circle className="pulse-edge-drop pulse-edge-drop-head" cx="3.4" cy="0" r="1" />
          <animateMotion dur=${cycleDuration} repeatCount="indefinite" rotate="auto" keyPoints="0;0;1;1" keyTimes=${pulseMotionTimes} calcMode="linear">
            <mpath href=${'#' + id}></mpath>
          </animateMotion>
          <animate attributeName="opacity" dur=${cycleDuration} repeatCount="indefinite" keyTimes=${pulseOpacityTimes} values=${pulseOpacityValues} calcMode="linear"></animate>
        </g>
      </g>
    `;
  }

  function brailleMarkup(bits, accent) {
    const safe = String(bits || '000000').padEnd(6, '0').slice(0, 6);
    // Render in row-major grid order while preserving braille dot numbering:
    // visual cells [1,4,2,5,3,6] map back to bit indices [0,3,1,4,2,5].
    const gridOrder = [0, 3, 1, 4, 2, 5];
    return gridOrder.map(function (bitIndex, index) {
      const bit = safe[bitIndex];
      const cls = ['braille-dot', bit === '1' ? 'is-on' : '', accent || 'cyan'].filter(Boolean).join(' ');
      return html`<span key=${'dot-' + index + '-' + bitIndex + '-' + safe} className=${cls}></span>`;
    });
  }

  function bitsToBrailleChar(bits) {
    var safe = String(bits || '000000').padEnd(6, '0').slice(0, 6);
    var weights = [1, 2, 4, 8, 16, 32];
    var value = 0;
    for (var i = 0; i < 6; i += 1) {
      if (safe[i] === '1') value += weights[i];
    }
    return String.fromCharCode(0x2800 + value);
  }

  function BraillePearl(props) {
    const className = [
      'braille-pearl',
      props.mini ? 'is-mini' : '',
      'is-' + (props.accent || 'cyan'),
      props.active ? 'is-active' : '',
      props.relayEnabled === false ? 'is-relay-off' : ''
    ].filter(Boolean).join(' ');

    const motionStyle = {
      '--pearl-rgb': accentRgb(props.accent),
      '--ring-a-duration': '20s',
      '--ring-b-duration': '28s',
      '--ring-c-duration': '36s',
      '--ring-a-delay': '0s',
      '--ring-b-delay': '0s',
      '--ring-c-delay': '0s',
      '--relay-cycle': String(props.cycleDuration || 7.2) + 's',
      '--relay-delay': String(props.relayDelay || 0) + 's',
      '--handoff-node-dwell': String(props.nodeDwell || 3.2) + 's',
      '--relay-enabled': props.relayEnabled === false ? '0' : '1'
    };

    return html`
      <div className=${className} style=${motionStyle}>
        <div className="braille-pearl-halo"></div>
        <div className="braille-ring braille-ring-a"></div>
        <div className="braille-ring braille-ring-b"></div>
        <div className="braille-ring braille-ring-c"></div>
        <div className="af-node-relay-orbit"></div>
        <div className="af-node-relay-core"></div>
        <div className="af-node-light-orbit">
          <div className="af-node-light-bulb"></div>
        </div>
        <div className="braille-pearl-core"></div>
        <div className="braille-pearl-label">
          <span className="braille-pearl-label-line">${String(props.label || 'Node')}</span>
        </div>
        <div className="braille-pearl-braille">
          <span className="braille-row">${brailleMarkup(props.bits || '000000', props.accent || 'cyan')}</span>
        </div>
      </div>
    `;
  }

  function BrailleNode(props) {
    const data = props.data || {};
    const className = [
      'rf-braille-node',
      'is-' + (data.accent || 'cyan'),
      data.isActive ? 'is-focused' : '',
      data.isLoadEntry ? 'is-load-entry' : '',
      data.progressState ? 'is-progress-' + data.progressState : ''
    ].filter(Boolean).join(' ');

    const coherence = data.coherence != null ? data.coherence : 1;
    const domainStyle = {
      '--domain-rgb': domainGlowRgb(data.semanticDomain),
      '--domain-coherence': String(coherence),
      '--domain-glow-alpha': String((coherence * 0.42).toFixed(2)),
      '--entry-delay': String(Math.max(0, Number(data.loadOrder || 0)) * 0.16) + 's'
    };

    return html`
      <div className=${className} style=${domainStyle} onClick=${function () { data.onSelect(props.id); }}>
        <${Handle} className="node-handle node-handle-target" type="target" position=${Position.Left} isConnectable=${false} />
        <${Handle} className="node-handle node-handle-source" type="source" position=${Position.Right} isConnectable=${false} />
        <div className="rf-node-wrap">
          <${BraillePearl}
            label=${data.shortLabel || data.name}
            bits=${data.bits || '000000'}
            accent=${data.accent || 'cyan'}
            active=${data.isActive}
            relayDelay=${data.relayDelay}
            cycleDuration=${data.cycleDuration}
            nodeDwell=${data.nodeDwell}
            relayEnabled=${data.relayEnabled}
          />
          ${data.note ? html`<div className="workflow-note-chip" title=${data.note}>note</div>` : null}
        </div>
      </div>
    `;
  }

  const nodeTypes = { braille: BrailleNode };
  const edgeTypes = { pulse: PulseEdge };
  const workflowNodeOrder = ['input', 'parse', 'mask', 'build', 'submit'];
  const HANDOFF_EDGE_TRAVEL_SECONDS = 8.2;
  const HANDOFF_NODE_DWELL_SECONDS = 2.4;
  const PANEL_DRAG_STORAGE_KEY = 'af.workflow.panelDrag.v1';

  function clampDrag(value, min, max) {
    var v = Number(value);
    if (!Number.isFinite(v)) return 0;
    return Math.max(min, Math.min(max, v));
  }

  // Craft.js-style palette — node templates available to drag/click onto canvas
  const NODE_TEMPLATES = [
    { id: 'input',    type: 'braille', data: { name: 'FASTA Input',          shortLabel: 'FASTA',       description: 'Primary FASTA sequence intake',             bits: '100000', accent: 'cyan',    semanticDomain: 'structural-biology', coherence: 0.90, relayDelay: 0, cycleDuration: 24 } },
    { id: 'parse',    type: 'braille', data: { name: 'QTY Transform',         shortLabel: 'QTY',         description: 'Semantic QTY transformation',               bits: '110000', accent: 'cyan',    semanticDomain: 'ai-transform',       coherence: 0.82, relayDelay: 0, cycleDuration: 24 } },
    { id: 'mask',     type: 'braille', data: { name: 'Domain Segmentation',    shortLabel: 'Domain',      description: 'Domain-aware segmentation and masking',     bits: '111000', accent: 'magenta', semanticDomain: 'ai-transform',       coherence: 0.78, relayDelay: 0, cycleDuration: 24 } },
    { id: 'build',    type: 'braille', data: { name: 'AF3 Payload Builder',    shortLabel: 'AF3 Build',   description: 'Compile AF3 submission payload',            bits: '111100', accent: 'white',   semanticDomain: 'runtime-hpc',        coherence: 0.85, relayDelay: 0, cycleDuration: 24 } },
    { id: 'submit',   type: 'braille', data: { name: 'ASC Submission',         shortLabel: 'ASC Submit',  description: 'Dispatch runtime payload to ASC cluster',   bits: '111110', accent: 'cyan',    semanticDomain: 'runtime-hpc',        coherence: 0.80, relayDelay: 0, cycleDuration: 24 } },
    { id: 'annotate', type: 'braille', data: { name: 'Annotation Step',        shortLabel: 'Annotate',    description: 'Manual annotation checkpoint',              bits: '010101', accent: 'cyan',    semanticDomain: 'topology',           coherence: 0.75, relayDelay: 0, cycleDuration: 24 } },
    { id: 'custom',   type: 'braille', data: { name: 'Custom Step',            shortLabel: 'Custom',      description: 'User-defined workflow step',                bits: '101010', accent: 'magenta', semanticDomain: 'topology',           coherence: 0.70, relayDelay: 0, cycleDuration: 24 } }
  ];

  const baseNodes = [
    {
      id: 'input',
      type: 'braille',
      position: { x: 84, y: 118 },
      data: { name: 'FASTA Input', shortLabel: 'FASTA', description: 'Primary FASTA sequence intake', bits: '100000', accent: 'cyan', semanticDomain: 'structural-biology', coherence: 0.90, relayDelay: 0.0, cycleDuration: 24 }
    },
    {
      id: 'parse',
      type: 'braille',
      position: { x: 314, y: 92 },
      data: { name: 'QTY Transform', shortLabel: 'QTY', description: 'Semantic QTY transformation', bits: '110000', accent: 'cyan', semanticDomain: 'ai-transform', coherence: 0.82, relayDelay: 5.28, cycleDuration: 24 }
    },
    {
      id: 'mask',
      type: 'braille',
      position: { x: 564, y: 76 },
      data: { name: 'Domain Segmentation', shortLabel: 'Domain', description: 'Domain-aware segmentation and masking', bits: '111000', accent: 'magenta', semanticDomain: 'ai-transform', coherence: 0.78, relayDelay: 10.56, cycleDuration: 24 }
    },
    {
      id: 'build',
      type: 'braille',
      position: { x: 814, y: 92 },
      data: { name: 'AF3 Payload Builder', shortLabel: 'AF3 Build', description: 'Compile AF3 submission payload', bits: '111100', accent: 'white', semanticDomain: 'runtime-hpc', coherence: 0.85, relayDelay: 15.84, cycleDuration: 24 }
    },
    {
      id: 'submit',
      type: 'braille',
      position: { x: 1044, y: 118 },
      data: { name: 'ASC Submission', shortLabel: 'ASC Submit', description: 'Dispatch runtime payload to ASC cluster', bits: '111110', accent: 'cyan', semanticDomain: 'runtime-hpc', coherence: 0.80, relayDelay: 21.12, cycleDuration: 24 }
    }
  ];

  const initialEdges = [
    { id: 'e1', type: 'pulse', source: 'input', target: 'parse', data: { runtime: 'idle', cycleDuration: 24, pulseStart: 0.08, pulseEnd: 0.20, pulseRgb: '60, 130, 255' }, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e2', type: 'pulse', source: 'parse', target: 'mask', data: { runtime: 'idle', cycleDuration: 24, pulseStart: 0.30, pulseEnd: 0.42, pulseRgb: '160, 80, 255' }, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e3', type: 'pulse', source: 'mask', target: 'build', data: { runtime: 'idle', cycleDuration: 24, pulseStart: 0.52, pulseEnd: 0.64, pulseRgb: '160, 80, 255' }, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e4', type: 'pulse', source: 'build', target: 'submit', data: { runtime: 'idle', cycleDuration: 24, pulseStart: 0.74, pulseEnd: 0.86, pulseRgb: '60, 210, 120' }, markerEnd: { type: MarkerType.ArrowClosed } }
  ];

  const initialRegistry = {
    input: { step: 'input_fasta_sequence', accepts: 'fasta_amino_acid_string' },
    parse: { step: 'qty_transform', semanticClass: 'nexus.qty.transform' },
    mask: { step: 'domain_segmentation', policies: ['withheld', 'transformed'] },
    build: { step: 'af3_payload_builder', version: 1 },
    submit: { step: 'asc_submission', target: 'asc.cluster.local' }
  };

  function App() {
    const [activeNodeId, setActiveNodeId] = useState(null);
    const [moveModeEnabled, setMoveModeEnabled] = useState(false);
    const [nodeVisibleCount, setNodeVisibleCount] = useState(0);
    const [handoffState, setHandoffState] = useState({ phase: 'edge', edgeIndex: 0 });
    const [flowRenderKey, setFlowRenderKey] = useState(0);
    const [flowHidden, setFlowHidden] = useState(false);
    const [inspectorHidden, setInspectorHidden] = useState(false);
    const [collapsedSections, setCollapsedSections] = useState({});
    const [graphNodes, setGraphNodes] = useState(baseNodes);
    const [hasUserMovedNodes, setHasUserMovedNodes] = useState(false);
    const [flowSize, setFlowSize] = useState({ width: 1280, height: 560 });
    const [digestingNodeId, setDigestingNodeId] = useState(null);
    const [registryData, setRegistryData] = useState(initialRegistry);
    const [workflowNotes, setWorkflowNotes] = useState({});
    const [sequence, setSequence] = useState('MGAGAGGAGGAGGAGGAGGAGGAGGAGGAGGAGA');
    const [jobName, setJobName] = useState('NX-AF3-001');
    const [chainId, setChainId] = useState('A');
    const [seedsText, setSeedsText] = useState('1');
    const [apiBase, setApiBase] = useState(window.location.protocol + '//' + window.location.hostname + ':8000');
    const [activity, setActivity] = useState(['workflow ready']);
    const [busy, setBusy] = useState(false);
    const [jobState, setJobState] = useState({ jobId: '', status: 'idle', progress: 0 });
    const [lastPayload, setLastPayload] = useState(null);
    const [paletteVisible, setPaletteVisible] = useState(false);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [panelDrag, setPanelDrag] = useState({
      left: { x: 0, y: 0 },
      right: { x: 0, y: 0 }
    });

    const [flowInstance, setFlowInstance] = useState(null);
    const flowShellRef = useRef(null);
    const resizeHandleRef = useRef(null);
    const rulerSliderRef = useRef(null);
    const digestTimeoutRef = useRef(null);
    const resetLockRef = useRef(false);
    const flowToggleLockRef = useRef(false);
    const initialAutoLayoutDoneRef = useRef(false);
    const initialViewportFitDoneRef = useRef(false);
    const panelDragRef = useRef(panelDrag);
    const historyRef = useRef({ stack: [baseNodes.map(function(n) { return Object.assign({}, n); })], index: 0 });
    const nodeCounterRef = useRef(0);

    useEffect(function () {
      panelDragRef.current = panelDrag;
    }, [panelDrag]);

    useEffect(function () {
      try {
        var raw = window.localStorage.getItem(PANEL_DRAG_STORAGE_KEY);
        if (!raw) return;
        var parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return;
        setPanelDrag({
          left: {
            x: clampDrag(parsed.left && parsed.left.x, -240, 240),
            y: clampDrag(parsed.left && parsed.left.y, -240, 240)
          },
          right: {
            x: clampDrag(parsed.right && parsed.right.x, -240, 240),
            y: clampDrag(parsed.right && parsed.right.y, -240, 240)
          }
        });
      } catch (_err) {
        // ignore invalid stored drag state
      }
    }, []);

    useEffect(function () {
      try {
        window.localStorage.setItem(PANEL_DRAG_STORAGE_KEY, JSON.stringify(panelDrag));
      } catch (_err) {
        // localStorage can fail in private contexts; keep runtime state only
      }
    }, [panelDrag]);

    useEffect(function () {
      var nextCount = 0;
      setNodeVisibleCount(0);
      var timerId = setTimeout(function step() {
        nextCount += 1;
        setNodeVisibleCount(nextCount);
        if (nextCount < workflowNodeOrder.length) {
          timerId = setTimeout(step, 280);
        }
      }, 240);
      return function () {
        clearTimeout(timerId);
      };
    }, []);

    useEffect(function () {
      return function () {
        if (digestTimeoutRef.current) {
          clearTimeout(digestTimeoutRef.current);
        }
      };
    }, []);

    useEffect(function () {
      const durationMs = (handoffState.phase === 'edge' ? HANDOFF_EDGE_TRAVEL_SECONDS : HANDOFF_NODE_DWELL_SECONDS) * 1000;
      const timer = setTimeout(function () {
        setHandoffState(function (current) {
          if (current.phase === 'edge') {
            return { phase: 'node', edgeIndex: current.edgeIndex };
          }
          return {
            phase: 'edge',
            edgeIndex: (current.edgeIndex + 1) % initialEdges.length
          };
        });
      }, durationMs);
      return function () {
        clearTimeout(timer);
      };
    }, [handoffState]);

    useEffect(function () {
      if (!flowShellRef.current || typeof ResizeObserver === 'undefined') return;
      const element = flowShellRef.current;
      const observer = new ResizeObserver(function (entries) {
        const rect = entries && entries[0] && entries[0].contentRect ? entries[0].contentRect : null;
        if (!rect) return;
        const nextWidth = Math.round(rect.width);
        const nextHeight = Math.round(rect.height);
        // During hide/show transitions ReactFlow can briefly report tiny heights.
        // Ignoring those prevents destructive clamping of node positions.
        if (nextHeight < 380) return;
        setFlowSize({
          width: Math.max(320, nextWidth),
          height: Math.max(440, nextHeight)
        });
      });
      observer.observe(element);
      return function () {
        observer.disconnect();
      };
    }, []);


    const handleNodeDragStop = function () {
      setHasUserMovedNodes(true);
      // Keep moved nodes fully visible and avoid clipping at panel edges.
      fitCanvasToViewport(260, currentViewMode === 'flow' ? 0.08 : 0.12);
    };

    // ── Craft.js-style history, palette & layer helpers ──────────────────────
    function setNodesWithHistory(updater) {
      setGraphNodes(function(current) {
        const next = typeof updater === 'function' ? updater(current) : updater;
        const h = historyRef.current;
        h.stack = h.stack.slice(0, h.index + 1).concat([next.map(function(n) { return Object.assign({}, n); })]);
        h.index = h.stack.length - 1;
        setCanUndo(true);
        setCanRedo(false);
        return next;
      });
    }

    function undo() {
      const h = historyRef.current;
      if (h.index <= 0) return;
      h.index -= 1;
      setGraphNodes(h.stack[h.index].map(function(n) { return Object.assign({}, n); }));
      setCanUndo(h.index > 0);
      setCanRedo(true);
    }

    function redo() {
      const h = historyRef.current;
      if (h.index >= h.stack.length - 1) return;
      h.index += 1;
      setGraphNodes(h.stack[h.index].map(function(n) { return Object.assign({}, n); }));
      setCanUndo(true);
      setCanRedo(h.index < h.stack.length - 1);
    }

    function addNodeFromTemplate(template, position) {
      nodeCounterRef.current += 1;
      const newId = template.id + '-c' + nodeCounterRef.current;
      const newNode = {
        id: newId,
        type: template.type,
        position: position || {
          x: 160 + ((nodeCounterRef.current * 52) % 360),
          y: 160 + ((nodeCounterRef.current * 40) % 200)
        },
        data: Object.assign({}, template.data)
      };
      setNodesWithHistory(function(current) { return current.concat(newNode); });
      setHasUserMovedNodes(true);
      setActivity(function(lines) { return lines.concat('added: ' + template.data.name); });
    }

    function removeNode(nodeId) {
      setNodesWithHistory(function(current) {
        return current.filter(function(n) { return n.id !== nodeId; });
      });
      setActiveNodeId(function(current) { return current === nodeId ? null : current; });
      setActivity(function(lines) { return lines.concat('removed: ' + nodeId); });
    }

    const onDrop = function(e) {
      e.preventDefault();
      const templateId = e.dataTransfer ? e.dataTransfer.getData('application/af-node-template') : null;
      if (!templateId || !flowInstance) return;
      const template = NODE_TEMPLATES.find(function(t) { return t.id === templateId; });
      if (!template) return;
      const position = typeof flowInstance.screenToFlowPosition === 'function'
        ? flowInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY })
        : { x: e.clientX, y: e.clientY };
      addNodeFromTemplate(template, position);
    };

    const onDragOver = function(e) {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    };
    // ─────────────────────────────────────────────────────────────────────────

    function layoutNodesForWidth(width, viewMode) {
      if (viewMode === 'split') {
        var splitSpacing = Math.max(190, Math.min(250, Math.round(width * 0.23)));
        var splitStartX = Math.max(24, Math.round((width - (splitSpacing * 4)) / 2));
        var splitY = width <= 780 ? 164 : 98;
        return [
          { id: 'input', position: { x: splitStartX, y: splitY } },
          { id: 'parse', position: { x: splitStartX + splitSpacing, y: splitY } },
          { id: 'mask', position: { x: splitStartX + (splitSpacing * 2), y: splitY } },
          { id: 'build', position: { x: splitStartX + (splitSpacing * 3), y: splitY } },
          { id: 'submit', position: { x: splitStartX + (splitSpacing * 4), y: splitY } }
        ];
      }
      if (width <= 780) {
        var triangleWidth = Math.max(220, Math.min(300, Math.round(width * 0.64)));
        var leftX = Math.max(24, Math.round((width - triangleWidth) / 2));
        var rightX = leftX + triangleWidth;
        var centerX = leftX + Math.round(triangleWidth / 2);
        return [
          { id: 'input', position: { x: leftX, y: 64 } },
          { id: 'parse', position: { x: rightX, y: 64 } },
          { id: 'mask', position: { x: leftX + 34, y: 236 } },
          { id: 'build', position: { x: rightX - 34, y: 236 } },
          { id: 'submit', position: { x: centerX, y: 424 } }
        ];
      }
      // Wide layout (width > 780): distribute nodes across the available canvas width.
      var sidePadding = Math.max(32, Math.round(width * 0.065));
      var usableWidth = Math.max(620, width - (sidePadding * 2));
      var wideSpacing = Math.max(160, Math.round(usableWidth / 4));
      var wideStartX = Math.round((width - (wideSpacing * 4)) / 2);
      return [
        { id: 'input', position: { x: wideStartX, y: 98 } },
        { id: 'parse', position: { x: wideStartX + wideSpacing, y: 98 } },
        { id: 'mask', position: { x: wideStartX + (wideSpacing * 2), y: 98 } },
        { id: 'build', position: { x: wideStartX + (wideSpacing * 3), y: 98 } },
        { id: 'submit', position: { x: wideStartX + (wideSpacing * 4), y: 98 } }
      ];
    }

    const currentViewMode = flowHidden ? 'editor' : (inspectorHidden ? 'flow' : 'split');
    const editorMode = currentViewMode === 'editor';

    useEffect(function () {
      if (hasUserMovedNodes || initialAutoLayoutDoneRef.current) return;
      var byId = {};
      layoutNodesForWidth(flowSize.width, currentViewMode).forEach(function (item) {
        byId[item.id] = item.position;
      });
      setGraphNodes(function (currentNodes) {
        return currentNodes.map(function (node) {
          if (!byId[node.id]) return node;
          return { ...node, position: byId[node.id] };
        });
      });
      initialAutoLayoutDoneRef.current = true;
    }, [flowSize.width, hasUserMovedNodes, currentViewMode]);

    useEffect(function () {
      if (hasUserMovedNodes || currentViewMode === 'editor') return;
      var byId = {};
      layoutNodesForWidth(flowSize.width, currentViewMode).forEach(function (item) {
        byId[item.id] = item.position;
      });
      setGraphNodes(function (currentNodes) {
        return currentNodes.map(function (node) {
          if (!byId[node.id]) return node;
          return { ...node, position: byId[node.id] };
        });
      });
    }, [currentViewMode, flowSize.width, hasUserMovedNodes]);

    function focusNodeForEditing(nodeId) {
      setActiveNodeId(nodeId);
      setWorkspaceMode('editor');
    }

    function clearNodeSelection() {
      setActiveNodeId(null);
      setWorkspaceMode('flow');
    }

    function restoreFlowCanvasLayout() {
      flowToggleLockRef.current = true;
      var applyLayout = function () {
        var byId = {};
        layoutNodesForWidth(flowSize.width, currentViewMode).forEach(function (item) {
          byId[item.id] = item.position;
        });
        setGraphNodes(function (currentNodes) {
          return currentNodes.map(function (node) {
            if (!byId[node.id]) return node;
            return { ...node, position: { x: byId[node.id].x, y: byId[node.id].y } };
          });
        });
      };

      applyLayout();
      requestAnimationFrame(applyLayout);
      setTimeout(applyLayout, 360);
      setTimeout(function () {
        flowToggleLockRef.current = false;
      }, 1200);
      setFlowRenderKey(function (value) { return value + 1; });
    }

    const setWorkspaceMode = function (mode) {
      const nextFlowHidden = mode === 'editor';
      const nextInspectorHidden = mode === 'flow';

      if (flowHidden && !nextFlowHidden) {
        restoreFlowCanvasLayout();
      }

      setFlowHidden(nextFlowHidden);
      setInspectorHidden(nextInspectorHidden);
    };

    useEffect(function () {
      if (typeof window === 'undefined') return;
      if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) {
        setFlowHidden(false);
        setInspectorHidden(true);
      }
    }, []);

    useEffect(function () {
      if (!activeNodeId) return;
    }, [activeNodeId, currentViewMode]);

    const relayNodeId = useMemo(function () {
      if (handoffState.phase !== 'node') return null;
      const edge = initialEdges[handoffState.edgeIndex];
      return edge ? edge.target : null;
    }, [handoffState]);

    const nodes = useMemo(function () {
      return graphNodes
      .filter(function (node) {
        return workflowNodeOrder.indexOf(node.id) < nodeVisibleCount;
      })
      .map(function (node) {
        return {
          ...node,
          data: {
            ...node.data,
            isActive: node.id === activeNodeId,
            progressState: node.id === digestingNodeId ? 'active' : 'pending',
            note: workflowNotes[node.id] || '',
            relayEnabled: node.id === relayNodeId,
            loadOrder: workflowNodeOrder.indexOf(node.id),
            isLoadEntry: true,
            nodeDwell: HANDOFF_NODE_DWELL_SECONDS,
            onSelect: focusNodeForEditing
          }
        };
      });
    }, [activeNodeId, graphNodes, digestingNodeId, workflowNotes, relayNodeId, nodeVisibleCount]);

    const edges = useMemo(function () {
      return initialEdges
      .filter(function (edge) {
        return workflowNodeOrder.indexOf(edge.source) < nodeVisibleCount && workflowNodeOrder.indexOf(edge.target) < nodeVisibleCount;
      })
      .map(function (edge) {
        const edgeIndex = initialEdges.findIndex(function (candidate) { return candidate.id === edge.id; });
        const isActiveEdge = handoffState.phase === 'edge' && edgeIndex === handoffState.edgeIndex;
        const runtime = isActiveEdge ? 'active' : 'complete';
        return {
          ...edge,
          data: {
            ...(edge.data || {}),
            cycleDuration: HANDOFF_EDGE_TRAVEL_SECONDS,
            pulseStart: 0,
            pulseEnd: 0.985,
            runtime: runtime
          }
        };
      });
    }, [handoffState, nodeVisibleCount]);

    const activeNode = useMemo(function () {
      if (!activeNodeId) return null;
      return nodes.find(function (n) { return n.id === activeNodeId; }) || null;
    }, [nodes, activeNodeId]);

    useEffect(function () {
      if (!editorMode) return;
      const target = flowShellRef.current ? document.querySelector('.af-inspector-panel .af-json') : null;
      if (!target) return;
      requestAnimationFrame(function () {
        if (typeof target.focus === 'function') target.focus();
        if (typeof target.scrollIntoView === 'function') {
          target.scrollIntoView({ block: 'start', behavior: 'smooth' });
        }
      });
    }, [editorMode, activeNodeId]);

    function runDigestPulse(nodeId, durationMs) {
      if (digestTimeoutRef.current) {
        clearTimeout(digestTimeoutRef.current);
      }
      setDigestingNodeId(nodeId);
      digestTimeoutRef.current = setTimeout(function () {
        setDigestingNodeId(function (current) {
          return current === nodeId ? null : current;
        });
        digestTimeoutRef.current = null;
      }, durationMs || 1200);
    }

    function updateRegistryJson(nodeId, text) {
      try {
        const parsed = JSON.parse(text);
        setRegistryData(function (current) {
          return { ...current, [nodeId]: parsed };
        });
      } catch (_error) {
        setActivity(function (lines) {
          return lines.concat('[registry] invalid JSON for ' + nodeId + ', changes not committed');
        });
      }
    }

    function updateSelectedNodeNote(text) {
      if (!activeNode) return;
      setWorkflowNotes(function (current) {
        return { ...current, [activeNode.id]: String(text || '') };
      });
    }

    function toggleInspectorSection(sectionId) {
      setCollapsedSections(function (current) {
        return { ...current, [sectionId]: !current[sectionId] };
      });
    }

    function renderInspectorSection(sectionId, title, content) {
      const isCollapsed = !!collapsedSections[sectionId];
      return html`
        <section className=${'af-collapsible-section' + (isCollapsed ? ' is-collapsed' : '')}>
          <button
            className="af-section-toggle"
            type="button"
            aria-expanded=${!isCollapsed}
            onClick=${function () { toggleInspectorSection(sectionId); }}
          >
            <span>${title}</span>
            <span className="af-section-toggle-icon" aria-hidden="true">${isCollapsed ? '▸' : '▾'}</span>
          </button>
          ${isCollapsed ? null : html`<div className="af-section-body">${content}</div>`}
        </section>
      `;
    }

    const workflowBrailleSummary = useMemo(function () {
      return nodes.map(function (node) {
        return {
          id: node.id,
          name: node.data.name,
          bits: node.data.bits,
          note: workflowNotes[node.id] || ''
        };
      });
    }, [nodes, workflowNotes]);

    const workflowDocumentation = useMemo(function () {
      return {
        title: 'AlphaFold workflow braille notes',
        generatedAt: new Date().toISOString(),
        steps: workflowBrailleSummary
      };
    }, [workflowBrailleSummary]);

    function updateActiveNodeDataJson(text) {
      if (!activeNode) return;
      try {
        const parsed = JSON.parse(text);
        setGraphNodes(function (currentNodes) {
          return currentNodes.map(function (node) {
            if (node.id !== activeNode.id) return node;
            return {
              ...node,
              data: {
                ...node.data,
                name: String(parsed.name != null ? parsed.name : node.data.name),
                shortLabel: String(parsed.shortLabel != null ? parsed.shortLabel : (parsed.name != null ? parsed.name : node.data.shortLabel)),
                description: String(parsed.description != null ? parsed.description : node.data.description),
                bits: String(parsed.bits != null ? parsed.bits : node.data.bits),
                accent: String(parsed.accent != null ? parsed.accent : node.data.accent)
              },
              position: {
                x: Number.isFinite(Number(parsed.x)) ? Number(parsed.x) : node.position.x,
                y: Number.isFinite(Number(parsed.y)) ? Number(parsed.y) : node.position.y
              }
            };
          });
        });
      } catch (_error) {
        setActivity(function (lines) {
          return lines.concat('[inspector] invalid node JSON, changes not committed');
        });
      }
    }

    function buildPayload() {
      runDigestPulse('build', 1400);
      const next = {
        name: jobName || 'NX-AF3-001',
        modelSeeds: seedsText.split(',').map(function (s) { return Number(String(s).trim()); }).filter(function (n) { return Number.isFinite(n); }),
        sequences: [{ chain_id: chainId || 'A', sequence: sequence || '' }],
        pipeline: nodes.map(function (n) {
          return {
            id: n.id,
            label: n.data.name,
            settings: registryData[n.id] || {}
          };
        })
      };
      setLastPayload(next);
      setActivity(function (lines) {
        return lines.concat('payload built: ' + next.name);
      });
      return next;
    }

    async function enterManualSubmissionMode(payload, reason) {
      setJobState(function (current) {
        return {
          jobId: current.jobId,
          status: 'manual-submit-required',
          progress: current.progress || 0
        };
      });
      setActivity(function (lines) {
        var next = lines.slice();
        next.push('manual mode: AlphaFold Server web upload required');
        if (reason) next.push('reason: ' + reason);
        next.push('next: open https://alphafoldserver.com and import/paste payload JSON');
        return next;
      });

      try {
        await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
        setActivity(function (lines) {
          return lines.concat('payload copied to clipboard for manual submit');
        });
      } catch (_error) {
        setActivity(function (lines) {
          return lines.concat('clipboard unavailable: copy payload from Output panel');
        });
      }
    }

    async function submitToBackend() {
      if (busy) return;
      const payload = lastPayload || buildPayload();
      setBusy(true);
      setDigestingNodeId('submit');
      setActivity(function (lines) { return lines.concat('submitting AlphaFold request...'); });

      try {
        const response = await fetch(String(apiBase).replace(/\/$/, '') + '/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'alphafold',
            params: payload,
            user: 'homepage'
          })
        });
        const payloadData = await response.json();
        if (!response.ok) {
          throw new Error(payloadData.detail || 'submit failed');
        }
        setJobState({
          jobId: String(payloadData.job_id || ''),
          status: String(payloadData.status || 'queued'),
          progress: Number(payloadData.progress || 0)
        });
        setActivity(function (lines) {
          return lines.concat('submitted: job ' + String(payloadData.job_id || 'unknown'));
        });
      } catch (error) {
        await enterManualSubmissionMode(payload, String((error && error.message) || 'submission failed'));
      } finally {
        setBusy(false);
        if (digestingNodeId === 'submit') {
          setDigestingNodeId(null);
        } else {
          setDigestingNodeId(function (current) {
            return current === 'submit' ? null : current;
          });
        }
      }
    }

    async function refreshJob() {
      const jobId = String(jobState.jobId || '').trim();
      if (busy) return;
      if (!jobId) {
        setActivity(function (lines) {
          return lines.concat('refresh: no backend job id. Track progress in AlphaFold Server history for manual submissions.');
        });
        return;
      }
      setBusy(true);
      setDigestingNodeId('submit');
      try {
        const response = await fetch(String(apiBase).replace(/\/$/, '') + '/jobs/' + encodeURIComponent(jobId));
        const payloadData = await response.json();
        if (!response.ok) {
          throw new Error(payloadData.detail || 'status fetch failed');
        }
        setJobState(function (current) {
          return {
            jobId: current.jobId,
            status: String(payloadData.status || current.status),
            progress: Number(payloadData.progress || current.progress || 0)
          };
        });
        setActivity(function (lines) {
          return lines.concat('job ' + jobId + ': ' + String(payloadData.status || 'unknown') + ' (' + String(payloadData.progress || 0) + '%)');
        });
      } catch (error) {
        setActivity(function (lines) {
          return lines.concat('error: ' + String((error && error.message) || 'status failed'));
        });
      } finally {
        setBusy(false);
        setDigestingNodeId(function (current) {
          return current === 'submit' ? null : current;
        });
      }
    }

    const onNodesChange = function (changes) {
      if ((resetLockRef.current || flowToggleLockRef.current) && Array.isArray(changes)) {
        changes = changes.filter(function (change) {
          return !(change && change.type === 'position');
        });
      }
      if (Array.isArray(changes)) {
        changes = changes.filter(function (change) {
          return !(change && change.type === 'position' && change.dragging !== true);
        });
      }
      setGraphNodes(function (currentNodes) {
        return applyNodeChanges(changes, currentNodes);
      });
    };

    const toggleFlowPanel = function () {
      setWorkspaceMode(flowHidden ? 'split' : 'editor');
    };

    const toggleInspectorPanel = function () {
      setInspectorHidden(function (current) {
        const next = !current;
        if (next && flowHidden) {
          setFlowHidden(false);
        }
        return next;
      });
    };

    const startResize = function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      const mainGrid = document.querySelector('.af-main-grid-job');
      if (!mainGrid) return;
      
      const startX = e.clientX;
      const startTemplate = mainGrid.style.gridTemplateColumns;
      
      const doResize = function (moveEvent) {
        const deltaX = moveEvent.clientX - startX;
        const mainRect = mainGrid.getBoundingClientRect();
        const totalWidth = mainRect.width;
        const newWidth = Math.max(300, Math.min(totalWidth - 320, totalWidth * 0.618 + deltaX));
        const ratio = (newWidth / totalWidth * 100).toFixed(1);
        mainGrid.style.gridTemplateColumns = ratio + '% ' + (100 - ratio) + '%';
      };
      
      const stopResize = function () {
        document.removeEventListener('mousemove', doResize);
        document.removeEventListener('mouseup', stopResize);
      };
      
      document.addEventListener('mousemove', doResize);
      document.addEventListener('mouseup', stopResize);
    };

    const startRulerDrag = function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      const slider = rulerSliderRef.current;
      if (!slider) return;

      const wrapper = slider.parentElement;
      const resolveStops = function () {
        var wrapperRect = wrapper.getBoundingClientRect();
        var width = Math.max(1, wrapperRect.width);
        var centerFor = function (selector) {
          var el = wrapper.querySelector(selector);
          if (!el) return null;
          var rect = el.getBoundingClientRect();
          return rect.left - wrapperRect.left + rect.width / 2;
        };

        var flowX = centerFor('.af-mode-flow .af-mode-button-cell');
        var splitX = centerFor('.af-mode-split .af-mode-button-cell');
        var editorX = centerFor('.af-mode-editor .af-mode-button-cell');

        if (![flowX, splitX, editorX].every(function (value) { return Number.isFinite(value); })) {
          var markers = wrapper.querySelector('.af-ruler-markers');
          var markersRect = markers ? markers.getBoundingClientRect() : wrapperRect;
          var left = Math.max(0, markersRect.left - wrapperRect.left);
          var laneWidth = Math.max(1, markersRect.width);
          flowX = left;
          splitX = left + laneWidth / 2;
          editorX = left + laneWidth;
        }

        return {
          flowX: flowX,
          splitX: splitX,
          editorX: editorX,
          thresholdFlowSplit: (flowX + splitX) / 2,
          thresholdSplitEditor: (splitX + editorX) / 2,
          width: width
        };
      };

      const doRulerDrag = function (moveEvent) {
        const stops = resolveStops();
        const wrapperRect = wrapper.getBoundingClientRect();
        const x = Math.max(0, Math.min(stops.width, moveEvent.clientX - wrapperRect.left));

        if (x < stops.thresholdFlowSplit) {
          setWorkspaceMode('flow');
        } else if (x < stops.thresholdSplitEditor) {
          setWorkspaceMode('split');
        } else {
          setWorkspaceMode('editor');
        }
      };

      const stopRulerDrag = function () {
        slider.classList.remove('is-dragging');
        document.removeEventListener('mousemove', doRulerDrag);
        document.removeEventListener('mouseup', stopRulerDrag);
      };

      slider.classList.add('is-dragging');
      document.addEventListener('mousemove', doRulerDrag);
      document.addEventListener('mouseup', stopRulerDrag);
    };

    useEffect(function () {
      const slider = rulerSliderRef.current;
      if (!slider) return;

      const wrapper = slider.parentElement;
      if (!wrapper) return;

      const wrapperRect = wrapper.getBoundingClientRect();
      const wrapperWidth = Math.max(1, wrapperRect.width);
      const centerFor = function (selector) {
        const el = wrapper.querySelector(selector);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return rect.left - wrapperRect.left + rect.width / 2;
      };

      var flowX = centerFor('.af-mode-flow .af-mode-button-cell');
      var splitX = centerFor('.af-mode-split .af-mode-button-cell');
      var editorX = centerFor('.af-mode-editor .af-mode-button-cell');

      if (![flowX, splitX, editorX].every(function (value) { return Number.isFinite(value); })) {
        const markers = wrapper.querySelector('.af-ruler-markers');
        const markersRect = markers ? markers.getBoundingClientRect() : wrapperRect;
        const left = Math.max(0, markersRect.left - wrapperRect.left);
        const laneWidth = Math.max(1, markersRect.width);
        flowX = left;
        splitX = left + laneWidth / 2;
        editorX = left + laneWidth;
      }

      var flowStop = (flowX / wrapperWidth) * 100;
      var splitStop = (splitX / wrapperWidth) * 100;
      var editorStop = (editorX / wrapperWidth) * 100;
      
      let position = 0;
      if (currentViewMode === 'flow') {
        position = flowStop;
        slider.className = 'af-ruler-slider is-flow';
      } else if (currentViewMode === 'split') {
        position = splitStop;
        slider.className = 'af-ruler-slider is-split';
      } else {
        position = editorStop;
        slider.className = 'af-ruler-slider is-editor';
      }
      
      slider.style.left = position + '%';
    }, [currentViewMode]);

    const fitCanvasToViewport = function (duration, padding) {
      if (!flowInstance) return;
      const normalizedPadding = Math.max(0.03, Math.min(0.2, Number(padding || 0.08)));

      const bounds = (function () {
        if (!Array.isArray(graphNodes) || graphNodes.length === 0) return null;
        var minX = Infinity;
        var minY = Infinity;
        var maxX = -Infinity;
        var maxY = -Infinity;
        graphNodes.forEach(function (node) {
          var x = Number(node && node.position && node.position.x);
          var y = Number(node && node.position && node.position.y);
          if (!Number.isFinite(x) || !Number.isFinite(y)) return;
          // Approximate pearl node footprint so fit bounds uses actual visual extents.
          var left = x - 46;
          var top = y - 38;
          var right = x + 202;
          var bottom = y + 126;
          minX = Math.min(minX, left);
          minY = Math.min(minY, top);
          maxX = Math.max(maxX, right);
          maxY = Math.max(maxY, bottom);
        });
        if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
          return null;
        }
        return {
          x: minX,
          y: minY,
          width: Math.max(1, maxX - minX),
          height: Math.max(1, maxY - minY)
        };
      }());

      if (bounds && typeof flowInstance.fitBounds === 'function') {
        flowInstance.fitBounds(bounds, {
          duration: duration,
          padding: normalizedPadding,
          minZoom: 0.24,
          maxZoom: 1.95
        });
        return;
      }

      if (typeof flowInstance.fitView === 'function') {
        flowInstance.fitView({
          duration: duration,
          padding: normalizedPadding,
          minZoom: 0.24,
          maxZoom: 1.9,
          includeHiddenNodes: false
        });
      }
    };

    useEffect(function () {
      if (flowHidden) return;
      const frameId = requestAnimationFrame(function () {
        var isPhoneViewport = flowSize.width <= 560;
        var isTabletViewport = flowSize.width <= 780;
        var fitDuration = initialViewportFitDoneRef.current ? 520 : 0;
        var fitPadding = isPhoneViewport
          ? (currentViewMode === 'flow' ? 0.085 : 0.11)
          : isTabletViewport
          ? (currentViewMode === 'flow' ? 0.05 : 0.075)
          : (currentViewMode === 'flow' ? 0.01 : 0.04);
        fitCanvasToViewport(fitDuration, fitPadding);

        if (isPhoneViewport && typeof flowInstance.setViewport === 'function') {
          try {
            var viewport = flowInstance.getViewport && flowInstance.getViewport();
            if (viewport && Number.isFinite(viewport.zoom)) {
              var mobileZoom = Math.min(1.15, Math.max(0.42, viewport.zoom));
              if (Math.abs(mobileZoom - viewport.zoom) > 0.001) {
                flowInstance.setViewport({ x: viewport.x, y: viewport.y, zoom: mobileZoom }, { duration: 240 });
              }
            }
          } catch (_err) {
            // keep silent; fitView still applies even if viewport read/write is unavailable
          }
        }
        initialViewportFitDoneRef.current = true;
      });
      return function () {
        cancelAnimationFrame(frameId);
      };
    }, [currentViewMode, flowHidden, flowInstance, flowRenderKey, flowSize.width]);

    const resetNodesLayout = function () {
      resetLockRef.current = true;
      const layout = layoutNodesForWidth(flowSize.width, currentViewMode);
      const byId = {};
      layout.forEach(function (item) {
        byId[item.id] = item.position;
      });

      setGraphNodes(function (currentNodes) {
        return currentNodes.map(function (node) {
          var nextPosition = byId[node.id];
          if (!nextPosition) return node;
          return { ...node, position: { x: nextPosition.x, y: nextPosition.y } };
        });
      });

      setHasUserMovedNodes(false);
      setFlowHidden(false);
      setInspectorHidden(false);
      setFlowRenderKey(function (current) {
        return current + 1;
      });
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          resetLockRef.current = false;
        });
      });
      setActivity(function (lines) {
        return lines.concat('nodes reset to default layout');
      });
    };

    const recenterCanvas = function () {
      fitCanvasToViewport(360, 0.24);
      setActivity(function (lines) {
        return lines.concat('canvas recentered');
      });
    };

    const startPanelDrag = function (side, event) {
      if (!event) return;
      event.preventDefault();
      event.stopPropagation();

      var startX = Number(event.clientX) || 0;
      var startY = Number(event.clientY) || 0;
      var start = panelDragRef.current && panelDragRef.current[side]
        ? panelDragRef.current[side]
        : { x: 0, y: 0 };

      var onMove = function (moveEvent) {
        var dx = (Number(moveEvent.clientX) || 0) - startX;
        var dy = (Number(moveEvent.clientY) || 0) - startY;

        setPanelDrag(function (current) {
          var next = {
            x: clampDrag(start.x + dx, -240, 240),
            y: clampDrag(start.y + dy, -240, 240)
          };
          if (side === 'left') return { left: next, right: current.right };
          return { left: current.left, right: next };
        });
      };

      var onUp = function () {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    };

    var flowRootStyle = {
      '--af-left-panel-shift-x': clampDrag(panelDrag.left && panelDrag.left.x, -240, 240) + 'px',
      '--af-left-panel-shift-y': clampDrag(panelDrag.left && panelDrag.left.y, -240, 240) + 'px',
      '--af-right-panel-shift-x': clampDrag(panelDrag.right && panelDrag.right.x, -240, 240) + 'px',
      '--af-right-panel-shift-y': clampDrag(panelDrag.right && panelDrag.right.y, -240, 240) + 'px'
    };

    return html`
      <div className="af-editor-shell">
        <section className="af-toolbar">
          <div className="af-toolbar-actions">
            <button
              className=${'af-action-btn af-palette-toggle' + (paletteVisible ? ' is-active' : '')}
              type="button"
              onClick=${function() { setPaletteVisible(function(v) { return !v; }); }}
              title="Toggle node palette"
              aria-label="Toggle node palette"
            >
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" aria-hidden="true">
                <rect x="2" y="4" width="5" height="5" rx="1" fill="currentColor"/>
                <rect x="2" y="11" width="5" height="5" rx="1" fill="currentColor"/>
                <rect x="2" y="17" width="5" height="4" rx="1" fill="currentColor"/>
                <line x1="10" y1="6.5" x2="22" y2="6.5" stroke="currentColor" stroke-width="1.8"/>
                <line x1="10" y1="13.5" x2="22" y2="13.5" stroke="currentColor" stroke-width="1.8"/>
                <line x1="10" y1="19" x2="22" y2="19" stroke="currentColor" stroke-width="1.8"/>
              </svg>
              Palette
            </button>
            <button className="af-action-btn af-undo-btn" type="button" disabled=${!canUndo} onClick=${undo} title="Undo" aria-label="Undo">
              <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" fill="currentColor"/></svg>
              Undo
            </button>
            <button className="af-action-btn af-redo-btn" type="button" disabled=${!canRedo} onClick=${redo} title="Redo" aria-label="Redo">
              <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 15.7c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 15.5h9V6.5l-3.6 4.1z" fill="currentColor"/></svg>
              Redo
            </button>
          </div>
          <div className="af-mode-ruler">
            <div className="af-ruler-wrapper">
              <div className="af-ruler-track"></div>
              <div className="af-ruler-markers">
                <button
                  className=${'af-ruler-marker af-mode-button af-mode-flow' + (currentViewMode === 'flow' ? ' is-active' : '')}
                  type="button"
                  onClick=${function () { setWorkspaceMode('flow'); }}
                  aria-label="Switch to Flow layout"
                >
                  <span className="af-mode-button-cell" aria-hidden="true"></span>
                  <span className="af-ruler-marker-label">Flow</span>
                </button>
                <button
                  className=${'af-ruler-marker af-mode-button af-mode-split' + (currentViewMode === 'split' ? ' is-active' : '')}
                  type="button"
                  onClick=${function () { setWorkspaceMode('split'); }}
                  aria-label="Switch to Split layout"
                >
                  <span className="af-mode-button-cell" aria-hidden="true"></span>
                  <span className="af-ruler-marker-label">Split</span>
                </button>
                <button
                  className=${'af-ruler-marker af-mode-button af-mode-editor' + (currentViewMode === 'editor' ? ' is-active' : '')}
                  type="button"
                  onClick=${function () { setWorkspaceMode('editor'); }}
                  aria-label="Switch to Editor layout"
                >
                  <span className="af-mode-button-cell" aria-hidden="true"></span>
                  <span className="af-ruler-marker-label">Editor</span>
                </button>
              </div>
              <div className="af-ruler-slider" ref=${rulerSliderRef} onMouseDown=${startRulerDrag}>
                <div className="af-ruler-label"></div>
              </div>
            </div>
          </div>
        </section>


        <div className=${'af-main-grid af-main-grid-job' + (flowHidden ? ' is-flow-hidden' : '') + (inspectorHidden ? ' is-inspector-hidden' : '')}>

          <section className=${'af-canvas-panel' + (flowHidden ? ' is-hidden' : '')}>
            ${paletteVisible ? html`
              <aside className="af-palette-panel">
                <div className="af-palette-head">Components</div>
                <div className="af-palette-body">
                  ${NODE_TEMPLATES.map(function(tpl) {
                    return html`
                      <div
                        key=${tpl.id}
                        className="af-palette-item"
                        draggable=${true}
                        onDragStart=${function(e) {
                          if (e.dataTransfer) {
                            e.dataTransfer.setData('application/af-node-template', tpl.id);
                            e.dataTransfer.effectAllowed = 'copy';
                          }
                        }}
                        onClick=${function() { addNodeFromTemplate(tpl); }}
                        title=${'Add ' + tpl.data.name}
                      >
                        <span className=${'af-palette-dot is-domain-' + domainClass(tpl.data.semanticDomain)}></span>
                        <span className="af-palette-label">${tpl.data.shortLabel}</span>
                      </div>
                    `;
                  })}
                </div>
              </aside>
            ` : null}
            <div className=${'af-flow-root af-canvas nexus-flow-root' + (activeNodeId ? ' has-active-node' : '') + (moveModeEnabled ? ' is-move-mode' : '')} ref=${flowShellRef} style=${flowRootStyle}>
              <${ReactFlow}
                key=${'reactflow-' + flowRenderKey}
                nodes=${nodes}
                edges=${edges}
                nodeTypes=${nodeTypes}
                edgeTypes=${edgeTypes}
                onInit=${setFlowInstance}
                onNodesChange=${onNodesChange}
                onNodeClick=${function (_event, node) { focusNodeForEditing(node.id); }}
                onPaneClick=${clearNodeSelection}
                fitView=${false}
                fitViewOptions=${{ padding: 0.1 }}
                onDrop=${onDrop}
                onDragOver=${onDragOver}
                nodesDraggable=${moveModeEnabled}
                nodesConnectable=${false}
                elementsSelectable=${false}
                onNodeDragStop=${function () { setHasUserMovedNodes(true); }}
                panOnDrag=${moveModeEnabled}
                panOnScroll=${true}
                zoomOnScroll=${true}
                zoomOnPinch=${true}
                zoomOnDoubleClick=${true}
                preventScrolling=${false}
                minZoom=${0.05}
                maxZoom=${8}
              >
                <${Background} gap=${18} size=${1} color="rgba(120,180,220,0.18)" />
                <${Controls}
                  className="af-flow-controls"
                  position="top-right"
                  showInteractive=${false}
                >
                  <${ControlButton}
                    className=${'af-move-toggle-btn' + (moveModeEnabled ? ' is-active' : '')}
                    title=${moveModeEnabled ? 'Move mode active' : 'Move mode inactive'}
                    aria-label=${moveModeEnabled ? 'Move mode active' : 'Move mode inactive'}
                    onClick=${function () { setMoveModeEnabled(function (value) { return !value; }); }}
                  >
                    ${moveModeEnabled
                      ? html`<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
                          <path d="M12 3l2.6 2.6-1.1 1.1h-3V3h1.5zm0 18h-1.5v-3h3l1.1 1.1L12 21zm9-9v1.5h-3v-3l1.1-1.1L21 12zM3 12l2.6-2.6 1.1 1.1v3h-3V12zm9-4.5L8.9 10.6 10 11.7 12 9.7l2 2 1.1-1.1L12 7.5zM12 16.5l3.1-3.1-1.1-1.1-2 2-2-2-1.1 1.1L12 16.5z" fill="currentColor"/>
                        </svg>`
                      : html`<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
                          <path d="M12 3l2.6 2.6-1.1 1.1h-3V3h1.5zm0 18h-1.5v-3h3l1.1 1.1L12 21zm9-9v1.5h-3v-3l1.1-1.1L21 12zM3 12l2.6-2.6 1.1 1.1v3h-3V12z" fill="currentColor" opacity="0.55"/>
                          <path d="M5 5l14 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>`}
                  </${ControlButton}>
                </${Controls}>
                <${MiniMap}
                  className="af-overview-minimap"
                  pannable=${true}
                  zoomable=${true}
                  nodeBorderRadius=${999}
                  nodeColor=${function (node) {
                    const rgb = domainGlowRgb(node.data && node.data.semanticDomain);
                    const alpha = node.id === activeNodeId ? 0.95 : 0.72;
                    return 'rgba(' + rgb + ', ' + alpha + ')';
                  }}
                  nodeStrokeColor=${function (node) {
                    return node.id === activeNodeId
                      ? domainHex(node.data && node.data.semanticDomain)
                      : 'transparent';
                  }}
                  nodeStrokeWidth=${3}
                  nodeClassName=${function (node) {
                    return node.id === activeNodeId ? 'af-mm-active' : '';
                  }}
                  maskColor="rgba(93, 200, 255, 0.14)"
                />
              </${ReactFlow}>
              <div className="af-flow-overlay">
                <button className="af-reset-symbol" type="button" onClick=${resetNodesLayout} title="Reset Nodes Layout">⟲</button>
              </div>
              <button
                className="af-float-drag-handle af-float-drag-handle--left"
                type="button"
                title="Drag left floating panel"
                onPointerDown=${function (e) { startPanelDrag('left', e); }}
              >↕</button>
              <button
                className="af-float-drag-handle af-float-drag-handle--right"
                type="button"
                title="Drag right floating panel"
                onPointerDown=${function (e) { startPanelDrag('right', e); }}
              >↕</button>
            </div>
          </section>

          <div className="af-resize-handle" ref=${resizeHandleRef} onMouseDown=${startResize} title="Drag to resize panels" />

          ${inspectorHidden ? html`<aside className="af-panel af-inspector-panel is-hidden"></aside>` : html`
          <aside className=${'af-panel af-inspector-panel' + (editorMode ? ' is-editor-mode' : '')}>
            <div className="af-inspector-head">
              <h2>${editorMode ? 'Node Editor' : 'Job'}</h2>
            </div>
            ${editorMode ? html`
              <div className="af-editor-banner">
                <strong>${activeNode ? activeNode.data.shortLabel || activeNode.data.name : 'Node'}</strong>
                <span>Editing ${activeNode ? activeNode.data.name : 'selected node'}</span>
              </div>
            ` : null}
            <div className="af-inline-status">
              <div className="af-status-item">
                <span className="af-status-label">Job</span>
                <strong className="af-status-value">${jobState.jobId || '-'}</strong>
              </div>
              <div className="af-status-item">
                <span className="af-status-label">Status</span>
                <strong className="af-status-value">${jobState.status}</strong>
              </div>
              <div className="af-status-item">
                <span className="af-status-label">Progress</span>
                <strong className="af-status-value">${jobState.progress}%</strong>
              </div>
            </div>
            ${renderInspectorSection('workflow', 'Workflow', html`
              <div className="af-braille-line" aria-label="Workflow braille symbols">
                ${workflowBrailleSummary.map(function (item) {
                  const isActive = item.id === activeNodeId;
                  return html`
                    <button
                      key=${'workflow-braille-symbol-' + item.id}
                      className=${'af-braille-symbol' + (isActive ? ' is-active' : '')}
                      title=${item.name + ' ' + item.bits}
                      type="button"
                      onClick=${function () { setActiveNodeId(item.id); }}
                    >
                      ${bitsToBrailleChar(item.bits)}
                    </button>
                  `;
                })}
              </div>
            `)}

            ${renderInspectorSection('layers', 'Layers', html`
              <div className="af-layers-list">
                ${graphNodes.slice().reverse().map(function(node) {
                  const isActive = node.id === activeNodeId;
                  return html`
                    <div
                      key=${node.id}
                      className=${'af-layer-item' + (isActive ? ' is-active' : '')}
                      onClick=${function() { setActiveNodeId(node.id); }}
                    >
                      <span className=${'af-layer-dot is-domain-' + domainClass(node.data.semanticDomain)}></span>
                      <span className="af-layer-name">${node.data.shortLabel || node.data.name}</span>
                      <button
                        className="af-layer-delete"
                        type="button"
                        title="Remove node"
                        onClick=${function(e) { e.stopPropagation(); removeNode(node.id); }}
                      >×</button>
                    </div>
                  `;
                })}
              </div>
            `)}

            ${renderInspectorSection('active-node', 'Active Node', activeNode ? html`
              <textarea
                className="af-input af-json"
                value=${JSON.stringify({
                  id: activeNode.id,
                  name: activeNode.data.name,
                  shortLabel: activeNode.data.shortLabel,
                  description: activeNode.data.description,
                  bits: activeNode.data.bits,
                  accent: activeNode.data.accent,
                  x: Math.round(activeNode.position.x),
                  y: Math.round(activeNode.position.y)
                }, null, 2)}
                onInput=${function (e) { updateActiveNodeDataJson(e.currentTarget.value); }}
              ></textarea>
            ` : html`<textarea className="af-input af-json" disabled>Select a node to inspect data.</textarea>`)}

            ${renderInspectorSection('node-config', 'Node Config', activeNode ? html`
              <textarea
                className="af-input af-json"
                value=${JSON.stringify(registryData[activeNode.id] || {}, null, 2)}
                onInput=${function (e) { updateRegistryJson(activeNode.id, e.currentTarget.value); }}
              ></textarea>
            ` : html`<textarea className="af-input af-json" disabled>No node selected.</textarea>`)}

            ${renderInspectorSection('workflow-note', 'Workflow Note', activeNode ? html`
              <textarea
                className="af-input af-json"
                placeholder="Add workflow note for selected node..."
                value=${workflowNotes[activeNode.id] || ''}
                onInput=${function (e) { updateSelectedNodeNote(e.currentTarget.value); }}
              ></textarea>
            ` : html`<textarea className="af-input af-json" disabled>Select a node to add note.</textarea>`)}

            ${renderInspectorSection('run-inputs', 'Run Inputs', html`
              <div className="af-row af-row-run-main">
                <div className="af-field">
                  <span>Backend API</span>
                  <input className="af-input" value=${apiBase} onInput=${function (e) { setApiBase(e.currentTarget.value); }} />
                </div>
                <div className="af-field">
                  <span>Sequence</span>
                  <textarea className="af-input af-textarea-code" value=${sequence} onInput=${function (e) { setSequence(e.currentTarget.value); }}></textarea>
                </div>
                <div className="af-field">
                  <span>Job</span>
                  <input className="af-input" value=${jobName} onInput=${function (e) { setJobName(e.currentTarget.value); }} />
                </div>
              </div>
              <div className="af-row af-row-run-meta">
                <div className="af-field">
                  <span>Chain</span>
                  <input className="af-input" value=${chainId} onInput=${function (e) { setChainId(e.currentTarget.value); }} />
                </div>
                <div className="af-field">
                  <span>Seeds</span>
                  <input className="af-input" value=${seedsText} onInput=${function (e) { setSeedsText(e.currentTarget.value); }} />
                </div>
              </div>
            `)}

            ${renderInspectorSection('output', 'Output', html`
              <pre className="af-term">${lastPayload ? JSON.stringify(lastPayload, null, 2) : '[build payload to preview output]'}</pre>
            `)}

            ${renderInspectorSection('workflow-documentation', 'Workflow Documentation', html`
              <pre className="af-term">${JSON.stringify(workflowDocumentation, null, 2)}</pre>
            `)}

            ${renderInspectorSection('activity', 'Activity', html`
              <pre className="af-term">${activity.join('\n')}</pre>
            `)}
          </aside>
          `}
        </div>
      </div>
    `;
  }

  createRoot(appRoot).render(html`<${App} />`);
})();
