(function () {
  'use strict';

  const stage = document.getElementById('glabs-stage');
  const centerPanel = document.querySelector('.sandbox-centerpanel');
  const graphNodeLayer = document.getElementById('graph-node-layer');
  const backpackGrid = document.getElementById('backpack-grid');
  const backpackAdd = document.getElementById('backpack-add');
  const brailleMaker = document.getElementById('braille-maker');
  const clearBraille = document.getElementById('clear-braille');
  const randomBraille = document.getElementById('random-braille');
  const activateBraille = document.getElementById('activate-braille');
  const terminalLog = document.getElementById('terminal-log');
  const terminalStatusLog = document.getElementById('terminal-status-log');
  const terminalInput = document.getElementById('terminal-input');
  const terminalEntryRow = document.getElementById('terminal-entry-row');
  const terminalPrompt = document.querySelector('.terminal-prompt');
  const terminalTabs = Array.from(document.querySelectorAll('[data-terminal-view]'));
  const terminalPanels = Array.from(document.querySelectorAll('[data-terminal-panel]'));
  const graphViewPanel = document.getElementById('graph-view-panel');
  const codeBrowserPanel = document.getElementById('code-browser-panel');
  const outputPanel = document.getElementById('output-panel');
  const activeNodeName = document.getElementById('active-node-name');
  const activeNodeBraille = document.getElementById('active-node-braille');
  const activeNodeDescription = document.getElementById('active-node-description');
  const connectedList = document.getElementById('connected-list');
  const graphLinks = document.getElementById('graph-links');
  if (!backpackGrid || !backpackAdd || !centerPanel || !graphNodeLayer || !brailleMaker || !clearBraille || !randomBraille || !activateBraille || !terminalLog || !terminalStatusLog || !terminalInput || !terminalEntryRow || !graphViewPanel || !codeBrowserPanel || !outputPanel || !activeNodeName || !activeNodeBraille || !activeNodeDescription || !connectedList || !graphLinks) return;

  const terminalSessionId = getTerminalSessionId();
  const terminalApiBase = window.location.protocol + '//' + window.location.hostname + ':8000';

  const nodeSpecs = [
    {
      id: 'structural-biology',
      name: 'Structural Biology',
      short: 'Structural\nBiology',
      bits: '101111',
      x: 600,
      y: 380,
      accent: 'white',
      description: 'Tools and pipelines for structural analysis, modeling, and interpretation of biological macromolecules.',
      links: ['Holography', 'PCA Analysis', 'Transform Engine', 'Metabolic Model', 'Runtime Orchestrator', '+7 more'],
      hub: true,
    },
    { id: 'holography', name: 'Holography', short: 'Holography', bits: '110010', x: 600, y: 130, accent: 'cyan' },
    { id: 'lattice-systems', name: 'Lattice Systems', short: 'Lattice\nSystems', bits: '101010', x: 855, y: 178, accent: 'white' },
    { id: 'visualization', name: 'Visualization', short: 'Visualization', bits: '100110', x: 1020, y: 400, accent: 'cyan' },
    { id: 'simulation', name: 'Simulation', short: 'Simulation', bits: '110101', x: 915, y: 610, accent: 'white' },
    { id: 'memory-bank', name: 'Memory Bank', short: 'Memory\nBank', bits: '101100', x: 600, y: 700, accent: 'white' },
    { id: 'pca-analysis', name: 'PCA Analysis', short: 'PCA\nAnalysis', bits: '111000', x: 395, y: 610, accent: 'white' },
    { id: 'data-streams', name: 'Data Streams', short: 'Data\nStreams', bits: '100111', x: 170, y: 610, accent: 'white' },
    { id: 'ai-agents', name: 'AI Agents', short: 'AI Agents', bits: '101001', x: 105, y: 410, accent: 'white' },
    { id: 'transform-engine', name: 'Transform Engine', short: 'Transform\nEngine', bits: '100101', x: 300, y: 380, accent: 'white' },
    { id: 'embeddings', name: 'Embeddings', short: 'Embeddings', bits: '110001', x: 300, y: 180, accent: 'white' },
    { id: 'metabolic-model', name: 'Metabolic Model', short: 'Metabolic\nModel', bits: '111010', x: 820, y: 395, accent: 'white' },
    { id: 'runtime-orchestrator', name: 'Runtime Orchestrator', short: 'Runtime\nOrchestrator', bits: '110110', x: 765, y: 585, accent: 'white' },
  ];

  const backpackItems = ['101001', '110001', '100111', '101100', '110010', '101010', '111000', '100101'];
  let activeNode = nodeSpecs[0];
  let activeTerminalView = 'terminal';
  let selectedEdgeKey = null;
  const manualNodes = [];
  const graphNodes = [];
  const graphConnections = [];

  renderBackpack();
  renderBrailleMaker('000000');
  syncGraphViewport();
  renderGraph();
  updateActiveNode(activeNode);
  seedTerminal();
  seedStatusLog();
  bindTerminalTabs();
  bindPanelWindows();
  window.addEventListener('resize', syncGraphViewport);
  graphLinks.addEventListener('click', handleGraphLinkClick);
  document.addEventListener('keydown', handleGraphKeydown);

  backpackAdd.addEventListener('click', function () {
    backpackItems.push(randomBits());
    renderBackpack();
    appendTerminal('> Backpack extended with a new braille brick.');
  });

  clearBraille.addEventListener('click', function () {
    renderBrailleMaker('000000');
  });

  randomBraille.addEventListener('click', function () {
    renderBrailleMaker(randomBits());
  });

  activateBraille.addEventListener('click', function () {
    const bits = currentMakerBits();
    const node = createManualNode(bits);
    manualNodes.push(node);
    graphNodes.push(node);
    graphNodeLayer.appendChild(node.element);
    renderConnections();
    appendTerminal('> Manual braille node drawn: ' + node.name + ' [' + node.bits + ']');
    appendStatus('manual node created: ' + node.name);
  });

  terminalInput.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter') return;
    const command = terminalInput.value.trim();
    if (!command) return;
    appendTerminal('glabs:~$ ' + command);
    terminalInput.value = '';
    void handleTerminal(command);
  });

  function braille(bits, accent) {
    return bits.map(function (bit) {
      const on = bit ? ' is-on ' + accent : '';
      return '<span class="braille-dot' + on + '"></span>';
    }).join('');
  }

  function brailleMakerDots(accent) {
    return [0, 1, 2, 3, 4, 5].map(function (index) {
      return '<button class="braille-maker-dot" type="button" data-dot="' + index + '" data-accent="' + accent + '" aria-label="Toggle braille dot ' + (index + 1) + '"></button>';
    }).join('');
  }

  function readMakerBits(maker) {
    return Array.from(maker.querySelectorAll('[data-dot]')).map(function (dot) {
      return dot.classList.contains('is-active') ? '1' : '0';
    }).join('');
  }

  function createGraphNode(config) {
    const element = document.createElement('button');
    element.type = 'button';
    element.className = 'graph-node is-' + config.accent + (config.hub ? ' is-focused' : '');
    element.style.left = (config.x - 48) + 'px';
    element.style.top = (config.y - 56) + 'px';
    element.setAttribute('aria-label', config.name);
    element.title = config.name;
    element.innerHTML = (config.manual ? '<span class="graph-node-delete" data-delete-node="true" aria-hidden="true">x</span>' : '') +
      '<div class="braille-row">' + braille(config.bits.split('').map(Number), config.accent) + '</div>';

    const node = {
      id: config.id || config.name.toLowerCase().replace(/\s+/g, '-'),
      name: config.name,
      short: config.short || config.name,
      bits: config.bits,
      accent: config.accent,
      x: config.x,
      y: config.y,
      description: config.description || 'Manual braille node placed in the sandbox graph.',
      links: Array.isArray(config.links) ? config.links.slice() : [],
      manual: Boolean(config.manual),
      element: element
    };

    setupGraphNodeDrag(node);
    element.addEventListener('click', function (event) {
      const deleteChip = event.target.closest('[data-delete-node="true"]');
      if (!deleteChip) return;
      event.preventDefault();
      event.stopPropagation();
      deleteNode(node);
    });
    element.addEventListener('pointerdown', function () {
      focusGraphNode(element);
      updateActiveNode(node);
    });

    syncNodePosition(node);
    return node;
  }

  function setupGraphNodeDrag(node) {
    const element = node.element;
    let dragging = false;
    let dropTarget = null;
    let activePointerId = null;
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originY = 0;

    function handleDragMove(event) {
      if (!dragging || event.pointerId !== activePointerId) return;
      const nextX = originX + (event.clientX - startX);
      const nextY = originY + (event.clientY - startY);
      element.style.left = clamp(nextX, 10, stage.clientWidth - 110) + 'px';
      element.style.top = clamp(nextY, 10, stage.clientHeight - 80) + 'px';
      syncNodePosition(node);
      dropTarget = updateDropTarget(node, dropTarget);
      renderConnections();
    }

    function stopDragging(event) {
      if (!dragging || event.pointerId !== activePointerId) return;

      dragging = false;
      syncNodePosition(node);
      const target = findDropTargetAtCenter(node) || dropTarget || findOverlappingNode(node);
      setDropTarget(null);
      dropTarget = null;
      if (target && ensureConnection(node, target)) {
        appendTerminal('> Connected ' + node.name + ' to ' + target.name + '.');
        appendStatus('connection added: ' + node.name + ' -> ' + target.name);
        if (activeNode === node || activeNode === target) {
          updateActiveNode(activeNode);
        }
      }
      renderConnections();
      cleanupDragging();
    }

    function cleanupDragging() {
      dragging = false;
      activePointerId = null;
      setDropTarget(null);
      dropTarget = null;
      window.removeEventListener('pointermove', handleDragMove);
      window.removeEventListener('pointerup', stopDragging);
      window.removeEventListener('pointercancel', stopDragging);
    }

    element.addEventListener('pointerdown', function (event) {
      if (event.target.closest('[data-delete-node="true"]')) {
        return;
      }
      dragging = true;
      dropTarget = null;
      activePointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      originX = element.offsetLeft;
      originY = element.offsetTop;
      clearSelectedEdge();
      focusGraphNode(element);
      window.addEventListener('pointermove', handleDragMove);
      window.addEventListener('pointerup', stopDragging);
      window.addEventListener('pointercancel', stopDragging);
    });
  }

  function focusGraphNode(element) {
    graphNodeLayer.querySelectorAll('.graph-node').forEach(function (node) {
      node.classList.toggle('is-focused', node === element);
    });
  }

  function refreshGraphNodeStates() {
    const connectedNodeIds = getConnectedNodeIds(activeNode);
    graphNodes.forEach(function (node) {
      node.element.classList.toggle('is-focused', node.id === activeNode.id);
      node.element.classList.toggle('is-connected-node', node.id !== activeNode.id && connectedNodeIds.has(node.id));
    });
  }

  function renderBackpack() {
    backpackGrid.innerHTML = backpackItems.map(function (bits) {
      return '<div class="backpack-brick"><div class="braille-row">' + braille(bits.split('').map(Number), 'white') + '</div></div>';
    }).join('');
  }

  function renderBrailleMaker(bits) {
    brailleMaker.innerHTML = brailleMakerDots('white');
    brailleMaker.querySelectorAll('[data-dot]').forEach(function (dot, index) {
      if (bits.charAt(index) === '1') {
        dot.classList.add('is-active');
      }
      dot.addEventListener('click', function () {
        dot.classList.toggle('is-active');
      });
    });
  }

  function currentMakerBits() {
    return Array.from(brailleMaker.querySelectorAll('[data-dot]')).map(function (dot) {
      return dot.classList.contains('is-active') ? '1' : '0';
    }).join('');
  }

  function renderGraph() {
    graphNodes.length = 0;
    graphConnections.length = 0;
    graphNodeLayer.innerHTML = '';
    nodeSpecs.forEach(function (spec) {
      const node = createGraphNode(spec);
      graphNodes.push(node);
      graphNodeLayer.appendChild(node.element);
    });
    seedDefaultConnections();
    renderConnections();
  }

  function updateActiveNode(node) {
    activeNode = node;
    activeNodeName.textContent = node.name;
    activeNodeBraille.innerHTML = braille(node.bits.split('').map(Number), 'white');
    activeNodeDescription.textContent = 'Braille pattern ' + node.bits;
    connectedList.innerHTML = getNodeConnections(node).map(function (item) {
      return '<div>' + escapeHtml(item) + '</div>';
    }).join('');
    graphViewPanel.innerHTML = renderGraphView(node);
    codeBrowserPanel.textContent = renderCodeView(node);
    outputPanel.innerHTML = renderOutputView(node);
    refreshGraphNodeStates();
    appendStatus('active node: ' + node.name);
  }

  function seedTerminal() {
    terminalLog.textContent = [
      'zsh shell ready.',
      'This terminal executes real commands through the local Calyr backend.',
      'Examples: pwd, ls, cd src, git status, python --version',
      'If the backend is not running on port 8000, command execution will fail.',
      ''
    ].join('\n');
    updateTerminalPrompt('~', 'zsh');
  }

  function seedStatusLog() {
    terminalStatusLog.textContent = [
      '[ui] braille workspace ready',
      '[ui] terminal tabs available: terminal, logs, graph, code, output',
      '[ui] select a node to inspect its code in the lower panel'
    ].join('\n');
  }

  function appendTerminal(line) {
    terminalLog.textContent += '\n' + line;
    terminalLog.scrollTop = terminalLog.scrollHeight;
  }

  function appendStatus(line) {
    terminalStatusLog.textContent += '\n' + line;
    terminalStatusLog.scrollTop = terminalStatusLog.scrollHeight;
  }

  async function handleTerminal(command) {
    if (command === 'clear') {
      terminalLog.textContent = '';
      return;
    }

    terminalInput.disabled = true;
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
        appendTerminal('[error] ' + (payload.detail || 'Command failed.'));
        appendStatus('shell error: ' + (payload.detail || 'command failed'));
        return;
      }

      if (payload.stdout) {
        appendTerminal(trimTrailingNewline(payload.stdout));
      }
      if (payload.stderr) {
        appendTerminal(trimTrailingNewline(payload.stderr));
      }
      if (!payload.stdout && !payload.stderr && payload.exit_code !== 0) {
        appendTerminal('[exit ' + payload.exit_code + ']');
      }
      updateTerminalPrompt(payload.cwd, payload.shell);
      appendStatus('shell [' + payload.shell + '] exit ' + payload.exit_code + ': ' + command);
    } catch (error) {
      appendTerminal('[error] Terminal backend unavailable on ' + terminalApiBase + '.');
      appendStatus('shell backend unavailable: ' + terminalApiBase);
    } finally {
      terminalInput.disabled = false;
      terminalInput.focus();
    }
  }

  function createManualNode(bits) {
    const index = manualNodes.length + 1;
    return createGraphNode({
      id: 'manual-' + index,
      name: 'Manual Node ' + index,
      short: 'Manual\nNode ' + index,
      bits: bits,
      accent: 'white',
      manual: true,
      x: 490 + index * 22,
      y: 320 + index * 18,
      description: 'Manually drawn braille brick placed onto the sandbox graph.',
      links: ['Manual sandbox brick']
    });
  }

  function deleteNode(node) {
    if (!node.manual) {
      appendTerminal('> System braille nodes cannot be deleted.');
      appendStatus('delete rejected: ' + node.name);
      return;
    }
    removeNodeFromList(manualNodes, node.id);
    removeNodeFromList(graphNodes, node.id);
    removeConnectionsForNode(node.id);
    if (node.element.parentNode) {
      node.element.parentNode.removeChild(node.element);
    }
    appendTerminal('> Deleted ' + node.name + '.');
    appendStatus('manual node deleted: ' + node.name);
    renderConnections();
    if (activeNode && activeNode.id === node.id) {
      updateActiveNode(graphNodes[0] || nodeSpecs[0]);
      return;
    }
    if (activeNode) {
      updateActiveNode(activeNode);
    }
  }

  function seedDefaultConnections() {
    const hub = graphNodes[0];
    graphNodes.slice(1).forEach(function (node) {
      ensureConnection(hub, node);
    });
  }

  function syncNodePosition(node) {
    node.x = node.element.offsetLeft + node.element.offsetWidth / 2;
    node.y = node.element.offsetTop + node.element.offsetHeight / 2;
  }

  function syncGraphViewport() {
    const width = Math.max(1, Math.round(centerPanel.clientWidth));
    const height = Math.max(1, Math.round(centerPanel.clientHeight));
    const svg = graphLinks.ownerSVGElement;
    if (!svg) return;
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
  }

  function findOverlappingNode(node) {
    const sourceRect = node.element.getBoundingClientRect();
    const sourceCenterX = sourceRect.left + sourceRect.width / 2;
    const sourceCenterY = sourceRect.top + sourceRect.height / 2;
    let bestTarget = null;
    let bestDistance = Infinity;

    graphNodes.forEach(function (candidate) {
      if (candidate === node) return;

      const targetRect = candidate.element.getBoundingClientRect();
      const overlapPadding = 24;
      const isOverlapping = sourceRect.left < targetRect.right + overlapPadding &&
        sourceRect.right > targetRect.left - overlapPadding &&
        sourceRect.top < targetRect.bottom + overlapPadding &&
        sourceRect.bottom > targetRect.top - overlapPadding;

      const targetCenterX = targetRect.left + targetRect.width / 2;
      const targetCenterY = targetRect.top + targetRect.height / 2;
      const centerDistance = Math.hypot(targetCenterX - sourceCenterX, targetCenterY - sourceCenterY);
      const snapDistance = Math.max(sourceRect.width, targetRect.width) * 1.05;

      if ((isOverlapping || centerDistance <= snapDistance) && centerDistance < bestDistance) {
        bestTarget = candidate;
        bestDistance = centerDistance;
      }
    });

    return bestTarget;
  }

  function findDropTargetAtCenter(node) {
    const rect = node.element.getBoundingClientRect();
    const probePoints = [
      [rect.left + rect.width / 2, rect.top + rect.height / 2],
      [rect.left + rect.width * 0.35, rect.top + rect.height * 0.35],
      [rect.left + rect.width * 0.65, rect.top + rect.height * 0.65]
    ];

    for (let index = 0; index < probePoints.length; index += 1) {
      const point = probePoints[index];
      const hit = findNodeAtViewportPoint(point[0], point[1], node);
      if (hit) return hit;
    }

    return null;
  }

  function findNodeAtViewportPoint(x, y, ignoredNode) {
    const elements = document.elementsFromPoint(x, y);
    for (let index = 0; index < elements.length; index += 1) {
      const element = elements[index];
      const nodeElement = element.closest('.graph-node');
      if (!nodeElement || nodeElement === ignoredNode.element) continue;
      const hitNode = graphNodes.find(function (candidate) {
        return candidate.element === nodeElement;
      });
      if (hitNode) return hitNode;
    }
    return null;
  }

  function updateDropTarget(node, currentTarget) {
    const nextTarget = findOverlappingNode(node);
    if (currentTarget === nextTarget) {
      return currentTarget;
    }
    setDropTarget(nextTarget);
    return nextTarget;
  }

  function setDropTarget(targetNode) {
    graphNodes.forEach(function (candidate) {
      candidate.element.classList.toggle('is-drop-target', candidate === targetNode);
    });
  }

  function ensureConnection(source, target) {
    const key = [source.id, target.id].sort().join('::');
    if (graphConnections.some(function (connection) { return connection.key === key; })) {
      return false;
    }
    graphConnections.push({ key: key, sourceId: source.id, targetId: target.id });
    selectedEdgeKey = key;
    return true;
  }

  function removeConnectionsForNode(nodeId) {
    for (let index = graphConnections.length - 1; index >= 0; index -= 1) {
      if (graphConnections[index].sourceId === nodeId || graphConnections[index].targetId === nodeId) {
        graphConnections.splice(index, 1);
      }
    }
  }

  function removeNodeFromList(list, nodeId) {
    const index = list.findIndex(function (node) {
      return node.id === nodeId;
    });
    if (index !== -1) {
      list.splice(index, 1);
    }
  }

  function renderConnections() {
    syncGraphViewport();
    graphLinks.innerHTML = graphConnections.map(function (connection) {
      const source = findNodeById(connection.sourceId);
      const target = findNodeById(connection.targetId);
      if (!source || !target) return '';
      if (!isNodeVisibleInCenterPanel(source) || !isNodeVisibleInCenterPanel(target)) return '';
      const activeClass = connection.key === selectedEdgeKey ? ' class="is-active-edge"' : '';
      return '<line' + activeClass + ' data-connection-key="' + connection.key + '" x1="' + source.x + '" y1="' + source.y + '" x2="' + target.x + '" y2="' + target.y + '" stroke-dasharray="none" stroke-dashoffset="0" stroke-linecap="round"></line>';
    }).join('');
  }

  function handleGraphLinkClick(event) {
    const line = event.target.closest('line[data-connection-key]');
    if (!line) return;
    event.preventDefault();
    event.stopPropagation();
    selectedEdgeKey = line.getAttribute('data-connection-key');
    renderConnections();
    appendStatus('edge selected: ' + selectedEdgeKey);
  }

  function clearSelectedEdge() {
    if (!selectedEdgeKey) return;
    selectedEdgeKey = null;
    renderConnections();
  }

  function handleGraphKeydown(event) {
    const target = event.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      return;
    }
    if (!selectedEdgeKey) return;
    if (event.key !== 'd' && event.key !== 'D' && event.key !== 'Backspace') return;
    event.preventDefault();
    deleteSelectedEdge();
  }

  function deleteSelectedEdge() {
    if (!selectedEdgeKey) return;
    const index = graphConnections.findIndex(function (connection) {
      return connection.key === selectedEdgeKey;
    });
    if (index === -1) {
      selectedEdgeKey = null;
      renderConnections();
      return;
    }
    const removed = graphConnections[index];
    graphConnections.splice(index, 1);
    selectedEdgeKey = null;
    renderConnections();
    appendTerminal('> Deleted edge ' + removed.sourceId + ' <-> ' + removed.targetId + '.');
    appendStatus('edge deleted: ' + removed.sourceId + ' <-> ' + removed.targetId);
    if (activeNode) {
      updateActiveNode(activeNode);
    }
  }

  function isNodeVisibleInCenterPanel(node) {
    const rect = node.element.getBoundingClientRect();
    const panelRect = centerPanel.getBoundingClientRect();
    return rect.right > panelRect.left &&
      rect.left < panelRect.right &&
      rect.bottom > panelRect.top &&
      rect.top < panelRect.bottom;
  }

  function findNodeById(nodeId) {
    return graphNodes.find(function (node) {
      return node.id === nodeId;
    }) || null;
  }

  function getNodeConnections(node) {
    const labels = node.links.slice();
    graphConnections.forEach(function (connection) {
      if (connection.sourceId === node.id) {
        const target = findNodeById(connection.targetId);
        if (target) labels.push(target.name);
      }
      if (connection.targetId === node.id) {
        const source = findNodeById(connection.sourceId);
        if (source) labels.push(source.name);
      }
    });
    return labels.filter(function (label, index, array) {
      return label && array.indexOf(label) === index;
    });
  }

  function getConnectedNodeIds(node) {
    const ids = new Set();
    graphConnections.forEach(function (connection) {
      if (connection.sourceId === node.id) {
        ids.add(connection.targetId);
      }
      if (connection.targetId === node.id) {
        ids.add(connection.sourceId);
      }
    });
    return ids;
  }

  function bindTerminalTabs() {
    terminalTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        setTerminalView(tab.getAttribute('data-terminal-view') || 'terminal');
      });
    });
    setTerminalView(activeTerminalView);
  }

  function bindPanelWindows() {
    const panelWindows = Array.from(document.querySelectorAll('[data-panel-window]'));
    panelWindows.forEach(function (panel) {
      const handle = panel.querySelector('h2');
      if (!handle) return;

      let startX = 0;
      let startY = 0;
      let offsetX = 0;
      let offsetY = 0;
      let activePointerId = null;

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
        const nextX = offsetX + (event.clientX - startX);
        const nextY = offsetY + (event.clientY - startY);
        panel.style.transform = 'translate(' + nextX + 'px, ' + nextY + 'px)';
      }

      handle.addEventListener('pointerdown', function (event) {
        if (event.button !== 0) return;
        event.preventDefault();
        const panelRect = panel.getBoundingClientRect();
        startX = event.clientX;
        startY = event.clientY;
        offsetX = Number(panel.dataset.translateX || '0');
        offsetY = Number(panel.dataset.translateY || '0');
        panel.dataset.originLeft = String(panelRect.left);
        panel.dataset.originTop = String(panelRect.top);
        activePointerId = event.pointerId;
        panel.classList.add('is-dragging');
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', function onPointerUp(pointerEvent) {
          if (pointerEvent.pointerId !== activePointerId) return;
          const finalX = offsetX + (pointerEvent.clientX - startX);
          const finalY = offsetY + (pointerEvent.clientY - startY);
          panel.dataset.translateX = String(finalX);
          panel.dataset.translateY = String(finalY);
          stopDragging(pointerEvent);
          window.removeEventListener('pointerup', onPointerUp);
        });
        window.addEventListener('pointercancel', stopDragging);
      });

      handle.addEventListener('dblclick', function () {
        panel.classList.toggle('is-collapsed');
      });
    });
  }

  function setTerminalView(viewName) {
    activeTerminalView = viewName;
    terminalTabs.forEach(function (tab) {
      tab.classList.toggle('is-active', tab.getAttribute('data-terminal-view') === viewName);
    });
    terminalPanels.forEach(function (panel) {
      panel.classList.toggle('is-active', panel.getAttribute('data-terminal-panel') === viewName);
    });
    terminalEntryRow.hidden = viewName !== 'terminal';
  }

  function renderGraphView(node) {
    return '' +
      '<div class="terminal-copy-title">Graph Node</div>' +
      '<div>' + escapeHtml(node.name) + '</div>' +
      '<div class="terminal-copy-title">Connections</div>' +
      '<div>' + escapeHtml(getNodeConnections(node).join(' | ') || 'none') + '</div>';
  }

  function renderCodeView(node) {
    const moduleName = String(node.id || node.name).replace(/-/g, '_');
    return [
      '# ' + node.name,
      'path: /sandbox/nodes/' + moduleName + '/',
      'module: calyr.nodes.' + moduleName,
      'entry: python -m calyr.nodes.' + moduleName,
      '',
      'commands:',
      '  ls',
      '  pwd',
      '  python -m calyr.nodes.' + moduleName + ' --help',
      '  rg "' + node.name.split(' ')[0].toLowerCase() + '" src tests'
    ].join('\n');
  }

  function renderOutputView(node) {
    return '' +
      '<div class="terminal-copy-title">Node Runtime</div>' +
      '<div>' + escapeHtml(node.description || 'Semantic sandbox node.') + '</div>' +
      '<div class="terminal-copy-title">Braille</div>' +
      '<div>' + escapeHtml(node.bits) + '</div>';
  }

  function randomBits() {
    return Array.from({ length: 6 }, function () {
      return Math.random() > 0.5 ? '1' : '0';
    }).join('');
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getTerminalSessionId() {
    const storageKey = 'glabs-terminal-session';
    const existing = window.sessionStorage.getItem(storageKey);
    if (existing) return existing;
    const created = window.crypto && typeof window.crypto.randomUUID === 'function'
      ? window.crypto.randomUUID()
      : 'glabs-' + Date.now();
    window.sessionStorage.setItem(storageKey, created);
    return created;
  }

  function updateTerminalPrompt(cwd, shellName) {
    if (!terminalPrompt) return;
    const normalized = String(cwd || '~').replace(/\\/g, '/');
    const segments = normalized.split('/').filter(Boolean);
    const label = normalized === '/' ? '/' : (segments[segments.length - 1] || '~');
    terminalPrompt.textContent = (shellName || 'zsh') + ':' + label + '$';
  }

  function trimTrailingNewline(value) {
    return String(value).replace(/\n+$/g, '');
  }
})();