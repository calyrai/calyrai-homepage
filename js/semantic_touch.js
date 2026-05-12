(function () {
  'use strict';

  var canvas = document.getElementById('touch-canvas');
  if (!canvas) return;

  var panelTitle = document.getElementById('panel-title');
  var panelBody = document.getElementById('panel-body');
  var panelState = document.getElementById('panel-state');
  var panelDynamics = document.getElementById('panel-dynamics');
  var panelRelation = document.getElementById('panel-relation');

  var scanTimer = null;
  var scanMode = false;
  var activeIndex = -1;

  var nodes = [
    {
      id: 'wissen',
      label: 'Wissen',
      color: '85,239,255',
      radius: '30%',
      angle: '-28deg',
      speed: '34s',
      delay: '-2.5s',
      title: 'Wissen als Feldzustand',
      body: 'Wissen erscheint hier nicht als Liste, sondern als lokale Verdichtung im semantischen Feld.',
      state: 'Resonant memory',
      dynamics: 'Context alignment and retention',
      relation: 'Couples to Beziehung and Dynamik under model pressure'
    },
    {
      id: 'zustand',
      label: 'Zustand',
      color: '255,125,107',
      radius: '40%',
      angle: '22deg',
      speed: '43s',
      delay: '-6s',
      title: 'Zustand als tastbare Lage',
      body: 'Ein Zustand ist eine Momentaufnahme der semantischen Spannung. Kontakt zeigt nicht nur was da ist, sondern wie stabil es ist.',
      state: 'Transient but legible',
      dynamics: 'Phase shifts under interaction',
      relation: 'Bridges Wissen with Orientierung'
    },
    {
      id: 'dynamik',
      label: 'Dynamik',
      color: '150,255,190',
      radius: '34%',
      angle: '98deg',
      speed: '36s',
      delay: '-12s',
      title: 'Dynamik statt statischer Ansicht',
      body: 'Bedeutung ist Bewegung. Erst im Übergang zwischen Knoten wird die Form einer Hypothese sichtbar.',
      state: 'Flow-active',
      dynamics: 'Trajectory aware transitions',
      relation: 'Constrains relation paths between nodes'
    },
    {
      id: 'beziehung',
      label: 'Beziehung',
      color: '208,168,255',
      radius: '46%',
      angle: '164deg',
      speed: '48s',
      delay: '-8.2s',
      title: 'Beziehung als Erkenntnispfad',
      body: 'Strukturkontakt koppelt Knoten. Dadurch werden Pfade sichtbar, die linearer Text allein nicht tragen kann.',
      state: 'Coupled graph',
      dynamics: 'Semantic edge activation',
      relation: 'Links Wissen, Zustand, Orientierung'
    },
    {
      id: 'orientierung',
      label: 'Orientierung',
      color: '248,231,122',
      radius: '38%',
      angle: '232deg',
      speed: '40s',
      delay: '-10s',
      title: 'Orientierung vor Vollerklärung',
      body: 'Wie bei SAXS entsteht zuerst eine orientierende Form. Aus dieser Form wächst schrittweise präzise Erklärung.',
      state: 'Low certainty, high directionality',
      dynamics: 'Pattern first, formalism later',
      relation: 'Aligns interpretation across uncertain states'
    },
    {
      id: 'resonanz',
      label: 'Resonanz',
      color: '108,187,255',
      radius: '32%',
      angle: '304deg',
      speed: '31s',
      delay: '-14.6s',
      title: 'Resonanz als Interface-Modus',
      body: 'Semantische Resonanz misst Passung zwischen Frage, Zustand und Modell. Sie ist nicht Dekoration, sondern Messprinzip.',
      state: 'Matching signature',
      dynamics: 'Feedback-tuned amplification',
      relation: 'Amplifies compatible structures'
    }
  ];

  function createNode(node, index) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'touch-node';
    button.id = 'touch-node-' + node.id;
    button.setAttribute('role', 'listitem');
    button.setAttribute('aria-label', node.label);
    button.style.setProperty('--node-rgb', node.color);
    button.style.setProperty('--radius', node.radius);
    button.style.setProperty('--angle', node.angle);
    button.style.setProperty('--speed', node.speed);
    button.style.setProperty('--delay', node.delay);

    var label = document.createElement('span');
    label.className = 'touch-node-label';
    label.textContent = node.label;
    button.appendChild(label);

    button.addEventListener('mouseenter', function () {
      setActive(index);
    });

    button.addEventListener('focus', function () {
      setActive(index);
    });

    button.addEventListener('click', function () {
      if (scanMode) {
        stopScan();
      }
      setActive(index);
    });

    return button;
  }

  function renderNodes() {
    nodes.forEach(function (node, index) {
      canvas.appendChild(createNode(node, index));
    });
  }

  function paintPanel(node) {
    panelTitle.textContent = node.title;
    panelBody.textContent = node.body;
    panelState.textContent = node.state;
    panelDynamics.textContent = node.dynamics;
    panelRelation.textContent = node.relation;
  }

  function setActive(index) {
    if (index < 0 || index >= nodes.length) return;

    activeIndex = index;
    canvas.classList.add('is-focused');
    var buttons = canvas.querySelectorAll('.touch-node');

    buttons.forEach(function (button, idx) {
      var isActive = idx === index;
      button.classList.toggle('is-active', isActive);
      button.classList.toggle('is-dim', !isActive);
    });

    paintPanel(nodes[index]);
  }

  function clearActive() {
    activeIndex = -1;
    canvas.classList.remove('is-focused');
    var buttons = canvas.querySelectorAll('.touch-node');
    buttons.forEach(function (button) {
      button.classList.remove('is-active');
      button.classList.remove('is-dim');
    });

    panelTitle.textContent = 'Scan the field';
    panelBody.textContent = 'Move through nodes with pointer, arrow keys, or press Space to start resonance scan mode.';
    panelState.textContent = 'Dormant';
    panelDynamics.textContent = 'No active coupling';
    panelRelation.textContent = 'Awaiting semantic contact';
  }

  function nextNode() {
    var next = activeIndex + 1;
    if (next >= nodes.length || next < 0) next = 0;
    setActive(next);
  }

  function prevNode() {
    var prev = activeIndex - 1;
    if (prev < 0) prev = nodes.length - 1;
    setActive(prev);
  }

  function startScan() {
    if (scanMode) return;
    scanMode = true;
    nextNode();
    scanTimer = window.setInterval(nextNode, 1700);
  }

  function stopScan() {
    scanMode = false;
    if (scanTimer) {
      window.clearInterval(scanTimer);
      scanTimer = null;
    }
  }

  window.addEventListener('keydown', function (event) {
    if (event.key === ' ' || event.code === 'Space') {
      event.preventDefault();
      if (scanMode) {
        stopScan();
      } else {
        startScan();
      }
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      stopScan();
      nextNode();
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      stopScan();
      prevNode();
      return;
    }

    if (event.key === 'Escape') {
      stopScan();
      clearActive();
    }
  });

  canvas.addEventListener('mouseleave', function () {
    if (!scanMode) {
      clearActive();
    }
  });

  renderNodes();
})();
