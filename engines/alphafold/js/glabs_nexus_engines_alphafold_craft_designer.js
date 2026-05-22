import React from 'https://esm.sh/react@18.3.1';
import { createRoot } from 'https://esm.sh/react-dom@18.3.1/client';
import htm from 'https://esm.sh/htm@3.1.1';
import {
  Editor,
  Frame,
  Element,
  useEditor,
  useNode
} from 'https://esm.sh/@craftjs/core@0.2.12?deps=react@18.3.1,react-dom@18.3.1';

const html = htm.bind(React.createElement);
const STORAGE_KEY = 'af.craft.designer.state.v1';

function DesignCanvas(props) {
  const { connectors, selected } = useNode(function (node) {
    return { selected: node.events.selected };
  });

  return html`
    <div
      ref=${function (ref) { if (ref) connectors.connect(connectors.drag(ref)); }}
      className=${'af-canvas-root' + (selected ? ' af-craft-selected' : '')}
    >
      ${props.children}
    </div>
  `;
}
DesignCanvas.craft = {
  displayName: 'Canvas'
};

function GridRow(props) {
  const { connectors, selected } = useNode(function (node) {
    return { selected: node.events.selected };
  });

  return html`
    <div
      ref=${function (ref) { if (ref) connectors.connect(connectors.drag(ref)); }}
      className=${'af-canvas-grid' + (selected ? ' af-craft-selected' : '')}
    >
      ${props.children}
    </div>
  `;
}
GridRow.craft = {
  displayName: 'Grid Row'
};

function PanelCard(props) {
  const { connectors, selected } = useNode(function (node) {
    return { selected: node.events.selected };
  });

  return html`
    <article
      ref=${function (ref) { if (ref) connectors.connect(connectors.drag(ref)); }}
      className=${'af-craft-card' + (selected ? ' af-craft-selected' : '')}
    >
      <h3>${props.title || 'Panel'}</h3>
      <p className="af-craft-copy">${props.copy || 'Describe what this panel does in the workflow.'}</p>
      ${props.children}
    </article>
  `;
}
PanelCard.craft = {
  displayName: 'Panel Card',
  props: {
    title: 'Panel',
    copy: 'Describe what this panel does in the workflow.'
  }
};

function CopyBlock(props) {
  const { connectors, selected } = useNode(function (node) {
    return { selected: node.events.selected };
  });

  return html`
    <p
      ref=${function (ref) { if (ref) connectors.connect(connectors.drag(ref)); }}
      className=${'af-craft-copy' + (selected ? ' af-craft-selected' : '')}
    >
      ${props.text || 'Workflow note'}
    </p>
  `;
}
CopyBlock.craft = {
  displayName: 'Copy Block',
  props: {
    text: 'Workflow note'
  }
};

function ActionsBar() {
  const { actions, query } = useEditor();

  function saveToBrowser() {
    const data = query.serialize();
    window.localStorage.setItem(STORAGE_KEY, data);
  }

  function loadFromBrowser() {
    const data = window.localStorage.getItem(STORAGE_KEY);
    if (!data) return;
    actions.deserialize(data);
  }

  function clearCanvas() {
    actions.deserialize('');
  }

  async function copyJson() {
    const data = query.serialize();
    try {
      await navigator.clipboard.writeText(data);
    } catch (_err) {
      // Ignore clipboard errors.
    }
  }

  return html`
    <div className="af-craft-actions">
      <button className="af-craft-btn" type="button" onClick=${saveToBrowser}>Save</button>
      <button className="af-craft-btn" type="button" onClick=${loadFromBrowser}>Load</button>
      <button className="af-craft-btn" type="button" onClick=${copyJson}>Copy JSON</button>
      <button className="af-craft-btn" type="button" onClick=${clearCanvas}>Clear</button>
    </div>
  `;
}

function Toolbox() {
  const { connectors } = useEditor();

  return html`
    <aside className="af-craft-tools">
      <h2>Toolbox</h2>
      <p>Drag from here into the canvas, or tap to create blocks.</p>

      <div className="af-craft-tool-list">
        <button
          className="af-craft-tool"
          ref=${function (ref) {
            if (!ref) return;
            connectors.create(ref, html`<${PanelCard} title="Input Panel" copy="Sequence and job metadata." />`);
          }}
          type="button"
        >
          Panel Card
        </button>

        <button
          className="af-craft-tool"
          ref=${function (ref) {
            if (!ref) return;
            connectors.create(ref, html`<${CopyBlock} text="Explain this workflow section." />`);
          }}
          type="button"
        >
          Copy Block
        </button>

        <button
          className="af-craft-tool"
          ref=${function (ref) {
            if (!ref) return;
            connectors.create(ref, html`
              <${GridRow}>
                <${PanelCard} title="Left" copy="Navigation / registry" />
                <${PanelCard} title="Canvas" copy="Main graph area" />
                <${PanelCard} title="Inspector" copy="Node editor and status" />
              </${GridRow}>
            `);
          }}
          type="button"
        >
          3-Panel Row
        </button>
      </div>
    </aside>
  `;
}

function App() {
  return html`
    <${Editor} resolver=${{ DesignCanvas, GridRow, PanelCard, CopyBlock }}>
      <div className="af-craft-shell">
        <${Toolbox} />

        <section className="af-craft-stage">
          <${ActionsBar} />

          <div className="af-craft-canvas-wrap">
            <${Frame}>
              <${Element} is=${DesignCanvas} canvas=${true}>
                <${GridRow}>
                  <${PanelCard} title="Left Panel" copy="Workflow registry, sequence parsing, payload build steps." />
                  <${PanelCard} title="Center Canvas" copy="AlphaFold graph map and interaction area." />
                  <${PanelCard} title="Right Panel" copy="Job status, progress and editor controls." />
                </${GridRow}>
                <${CopyBlock} text="Drag cards to restructure the workflow editor page. Save state locally and export JSON." />
              </${Element}>
            </${Frame}>
          </div>
        </section>
      </div>
    </${Editor}>
  `;
}

const rootEl = document.getElementById('af-craft-root');
if (rootEl) {
  createRoot(rootEl).render(html`<${App} />`);
}
