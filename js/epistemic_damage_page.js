(function () {
  'use strict';

  const mount = document.getElementById('damage-prototype');
  if (!mount) return;

  const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

  const humanizeCluster = (value) => String(value ?? '')
    .replaceAll(/[-_]+/g, ' ')
    .replaceAll(/\b\w/g, (match) => match.toUpperCase());

  const paperUrl = (node) => {
    const doi = String(node?.doi || '').trim();
    if (doi) return `https://doi.org/${doi}`;
    const openalexId = String(node?.openalex_id || node?.binding || '').trim();
    if (openalexId.startsWith('https://openalex.org/')) return openalexId;
    return '';
  };

  const openalexCitationsUrl = (node) => {
    const openalexId = String(node?.openalex_id || node?.binding || '').trim();
    if (!openalexId.startsWith('https://openalex.org/')) return '';
    const workId = openalexId.replace('https://openalex.org/', '');
    return `https://api.openalex.org/works?filter=cites:${workId}`;
  };

  const readEmbeddedJson = (scriptId) => {
    const element = document.getElementById(scriptId);
    if (!element) return null;
    try {
      return JSON.parse(element.textContent || '');
    } catch (error) {
      console.warn(`Failed to parse embedded JSON from #${scriptId}`, error);
      return null;
    }
  };

  const loadJsonResource = async (url, embeddedScriptId) => {
    const embedded = readEmbeddedJson(embeddedScriptId);
    const isFileProtocol = window.location.protocol === 'file:';
    if (embedded && isFileProtocol) return embedded;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (embedded) return embedded;
      throw error;
    }
  };

  const renderArchitecture = (items) => `
    <div class="damage-architecture-shell">
      <div class="damage-architecture-kicker">Execution Flow</div>
      <div class="damage-architecture" aria-label="Pipeline architecture">
        ${items.map((item, index) => `
          <article class="damage-architecture-step" data-step-order="${index + 1}">
            <div class="damage-step-topline">
              <span class="damage-step-index">0${index + 1}</span>
              <span class="damage-step-phase">${index === items.length - 1 ? 'Output' : 'Stage'}</span>
            </div>
            <div class="damage-step-label">${escapeHtml(item)}</div>
            <div class="damage-step-bar" aria-hidden="true"></div>
          </article>
        `).join('')}
      </div>
    </div>
  `;

  const renderThought = (thought) => `
    <article class="damage-card" data-status="${escapeHtml(thought.status)}">
      <div class="damage-card-topline">
        <span class="damage-status">${escapeHtml(thought.status)}</span>
        <span class="damage-id">${escapeHtml(thought.id)}</span>
      </div>
      <h3>${escapeHtml(thought.title)}</h3>
      <p class="damage-core">${escapeHtml(thought.core_statement)}</p>
      <div class="damage-grid">
        <div>
          <h4>Problem</h4>
          <p>${escapeHtml(thought.problem)}</p>
        </div>
        <div>
          <h4>Method</h4>
          <p>${escapeHtml(thought.method)}</p>
        </div>
        <div class="damage-impact-block">
          <h4>Impact</h4>
          <p>${escapeHtml(thought.impact)}</p>
        </div>
      </div>
      <div class="damage-connections">
        ${(thought.connections || []).map((entry) => `<span class="damage-pill">${escapeHtml(entry)}</span>`).join('')}
      </div>
    </article>
  `;

  const renderBinding = (binding) => `
    <div data-binding-id="${escapeHtml(binding.id)}">
      <h4>${escapeHtml(binding.title)}</h4>
      <p>${escapeHtml(binding.description)}</p>
      <code>${escapeHtml(binding.repo_path)}</code>
      ${binding.artifact ? `<p><strong>Artifact:</strong> ${escapeHtml(binding.artifact)}</p>` : ''}
      ${binding.nexus_binding ? `<p><strong>Nexus binding:</strong> ${escapeHtml(binding.nexus_binding)}</p>` : ''}
    </div>
  `;

  const renderResults = (data, network) => {
    const results = Array.isArray(data?.results) ? data.results : [];
    const nodeMap = new Map((network?.nodes || []).map((node) => [node.id, node]));
    if (!results.length) return '';

    return `
      <section id="results" class="project-section damage-results">
        <div class="damage-section-heading">
          <span class="damage-section-kicker">Literature Analysis</span>
          <h3>Results</h3>
          <p>The page now reads downward like a literature analysis. The cards below are the distilled outcomes of the argument, each tied to the publications that carry the claim.</p>
        </div>
        <div class="damage-results-grid">
          ${results.map((result) => {
            const publications = (result.publication_ids || [])
              .map((publicationId) => nodeMap.get(publicationId))
              .filter(Boolean);
            return `
              <article id="result-${escapeHtml(result.id)}" class="damage-result-card">
                <div class="damage-card-topline">
                  <span class="damage-status">result</span>
                  <span class="damage-id">${escapeHtml(result.id)}</span>
                </div>
                <h3>${escapeHtml(result.title)}</h3>
                <p class="damage-core">${escapeHtml(result.summary || '')}</p>
                ${result.nexus_binding ? `<p class="damage-result-binding"><strong>Nexus binding:</strong> <code>${escapeHtml(result.nexus_binding)}</code></p>` : ''}
                <div class="damage-result-links">
                  <h4>Linked Publications</h4>
                  <div class="damage-connections">
                    ${publications.map((node) => `
                      <a class="damage-pill damage-pill-link" href="#bibliography-${escapeHtml(node.id)}" data-focus-publication="${escapeHtml(node.id)}">${escapeHtml(node.label || node.title || node.id)}</a>
                    `).join('')}
                  </div>
                </div>
              </article>
            `;
          }).join('')}
        </div>
      </section>
    `;
  };

  const buildBibliographyExport = (entries, nodeMap, resultMap) => entries
    .map((entry, index) => {
      const node = nodeMap.get(entry.publication_id);
      if (!node) return '';
      const linkedResults = (entry.result_ids || [])
        .map((resultId) => resultMap.get(resultId)?.title)
        .filter(Boolean);
      const note = String(entry.note || '').trim();
      const resultLine = linkedResults.length ? ` Linked results: ${linkedResults.join('; ')}.` : '';
      const noteLine = note ? ` Note: ${note}` : '';
      return `${index + 1}. ${formatNodeCitation(node)}${noteLine}${resultLine}`;
    })
    .filter(Boolean)
    .join('\n');

  const selectBibliographyEntries = (bibliography, network) => {
    const configuredEntries = Array.isArray(bibliography?.entries) ? bibliography.entries : [];
    const nodes = Array.isArray(network?.nodes) ? network.nodes : [];
    const edges = Array.isArray(network?.edges) ? network.edges : [];
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    const seedIds = new Set((bibliography?.seed_publication_ids || []).map((value) => String(value)));
    const configuredMap = new Map(configuredEntries.map((entry) => [String(entry.publication_id || ''), entry]));
    const limit = Number(bibliography?.limit) || configuredEntries.length;

    if (!nodes.length) return [];

    const adjacency = new Map();
    const weightMap = new Map();
    const connect = (left, right, weight) => {
      if (!adjacency.has(left)) adjacency.set(left, new Set());
      adjacency.get(left)?.add(right);
      weightMap.set(`${left}:${right}`, Number(weight) || 0);
    };
    edges.forEach((edge) => {
      connect(String(edge.from), String(edge.to), edge.weight);
      connect(String(edge.to), String(edge.from), edge.weight);
    });

    const ranked = nodes
      .filter((node) => {
        const id = String(node.id || '');
        if (!id) return false;
        if (id === 'framework_paper' || id === 'citation_frontier' || id === 'correction_layer') return false;
        if (!['references', 'seed', 'upstream', 'citations', 'corrections'].includes(String(node.kind || ''))) return false;
        if (seedIds.has(id)) return true;
        return Array.from(seedIds).some((seedId) => adjacency.get(seedId)?.has(id));
      })
      .map((node) => {
        const entryId = String(node.id || '');
        const configuredEntry = configuredMap.get(entryId) || {};
        const directWeights = Array.from(seedIds)
          .map((seedId) => weightMap.get(`${seedId}:${entryId}`) || 0)
          .filter((value) => value > 0);
        const directSeedWeight = directWeights.length ? Math.max(...directWeights) : 0;
        const resultCoverage = Array.isArray(configuredEntry.result_ids) ? configuredEntry.result_ids.length : 0;
        const citationStrength = Number(node?.cited_by_count) || 0;
        const seedPriority = seedIds.has(entryId) ? 1 : 0;
        return {
          entry: {
            publication_id: entryId,
            result_ids: configuredEntry.result_ids || [],
            note: configuredEntry.note || '',
          },
          rank: (seedPriority * 1000) + (directSeedWeight * 100) + (resultCoverage * 10) + Math.min(citationStrength / 100, 9.99),
          citationStrength,
          directSeedWeight,
        };
      })
      .sort((left, right) => right.rank - left.rank || right.directSeedWeight - left.directSeedWeight || right.citationStrength - left.citationStrength);

    return ranked.slice(0, limit).map((item) => item.entry);
  };

  const renderBibliography = (data, network) => {
    const bibliography = data?.bibliography || {};
    const entries = selectBibliographyEntries(bibliography, network);
    const nodeMap = new Map((network?.nodes || []).map((node) => [node.id, node]));
    const resultMap = new Map((data?.results || []).map((result) => [result.id, result]));
    if (!entries.length) return '';
    const overviewText = String(
      bibliography.intro
      || `This closing bibliography keeps ${Number(bibliography?.limit) || entries.length} papers that are most directly relevant to the seed paper.`
    ).trim();
    const bibliographyText = buildBibliographyExport(entries, nodeMap, resultMap);
    const exportText = [
      overviewText,
      '',
      'Bibliography',
      bibliographyText,
    ].join('\n');

    return `
      <section id="bibliography" class="project-section damage-bibliography">
        <div class="damage-section-heading">
          <span class="damage-section-kicker">Research Record</span>
          <h3>${escapeHtml(bibliography.title || 'Bibliography')}</h3>
          ${bibliography.note ? `<p>${escapeHtml(bibliography.note)}</p>` : ''}
          ${bibliography.selection_note ? `<p><strong>Selection rule:</strong> ${escapeHtml(bibliography.selection_note)}</p>` : ''}
        </div>
        <div class="damage-bibliography-export">
          <div class="damage-bibliography-export-topline">
            <span class="damage-status">literature research</span>
            <button
              type="button"
              class="damage-network-control"
              data-copy-bibliography
              data-bibliography-export-text="${escapeHtml(exportText)}"
            >Copy bibliography</button>
          </div>
          <div class="damage-bibliography-overview">
            <p>${escapeHtml(overviewText)}</p>
          </div>
        </div>
        <div class="damage-bibliography-list">
          ${entries.map((entry) => {
            const node = nodeMap.get(entry.publication_id);
            if (!node) return '';
            const backlinks = (entry.result_ids || [])
              .map((resultId) => resultMap.get(resultId))
              .filter(Boolean);
            return `
              <article id="bibliography-${escapeHtml(node.id)}" class="damage-bibliography-entry">
                <div class="damage-card-topline">
                  <span class="damage-status">${escapeHtml(node.kind || 'paper')}</span>
                  <span class="damage-id">${escapeHtml(node.id)}</span>
                </div>
                <h4>${escapeHtml(node.title || node.label || node.id)}</h4>
                <p class="damage-bibliography-citation">${escapeHtml(formatNodeCitation(node))}</p>
                ${entry.note ? `<p>${escapeHtml(entry.note)}</p>` : ''}
                <div class="damage-bibliography-meta">
                  <a class="damage-network-action" href="#publications" data-focus-publication="${escapeHtml(node.id)}">Show in graph</a>
                  ${paperUrl(node) ? `<a class="damage-network-action" href="${escapeHtml(paperUrl(node))}" target="_blank" rel="noreferrer">Open publication</a>` : ''}
                </div>
                ${backlinks.length ? `
                  <div class="damage-result-links">
                    <h5>Used In Results</h5>
                    <div class="damage-connections">
                      ${backlinks.map((result) => `
                        <a class="damage-pill damage-pill-link" href="#result-${escapeHtml(result.id)}">${escapeHtml(result.title)}</a>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
              </article>
            `;
          }).join('')}
        </div>
      </section>
    `;
  };

  const renderPublicationLegend = (items) => `
    <div class="damage-network-legend" aria-label="Publication network legend">
      ${(items || []).map((item) => `
        <div class="damage-network-legend-item">
          <span class="damage-network-swatch" style="--damage-swatch:${escapeHtml(item.color || '#24f3ff')}"></span>
          <span>${escapeHtml(item.label)}</span>
        </div>
      `).join('')}
    </div>
  `;

  const renderPublicationProvenance = (network) => {
    const sources = Array.isArray(network?.data_sources) ? network.data_sources : [];
    if (!network?.generated_at && !sources.length && !network?.scan_note) return '';

    return `
      <div class="damage-network-provenance">
        ${network.generated_at ? `<p><strong>Last graph build:</strong> ${escapeHtml(network.generated_at)}</p>` : ''}
        ${network.latest_citation_scan_upto ? `<p><strong>Latest citation scan up to:</strong> ${escapeHtml(network.latest_citation_scan_upto)}</p>` : ''}
        ${sources.length ? `<p><strong>Scanned databases:</strong> ${escapeHtml(sources.join(', '))}</p>` : ''}
        ${network.crossreference_analysis ? `<p><strong>Crossreference analysis:</strong> ${escapeHtml(`${network.crossreference_analysis.analysis_links || 0} links across ${network.crossreference_analysis.candidate_count || 0} candidate papers`)}</p>` : ''}
        ${network.scan_note ? `<p>${escapeHtml(network.scan_note)}</p>` : ''}
      </div>
    `;
  };

  const renderPublicationMetrics = (network) => {
    const nodes = Array.isArray(network?.nodes) ? network.nodes : [];
    const latestCitations = nodes.filter((node) => node.status === 'latest');
    const crossreference = network?.crossreference_analysis || {};
    const metrics = [
      {
        label: 'Latest citation scan',
        value: network?.latest_citation_scan_upto || 'n/a',
        note: 'OpenAlex refresh boundary',
      },
      {
        label: 'Crossreference clusters',
        value: crossreference.cluster_count || 0,
        note: `${crossreference.analysis_links || 0} inferred links`,
      },
      {
        label: 'Tracked papers',
        value: nodes.length,
        note: 'Current homepage graph nodes',
      },
      {
        label: 'Latest citations added',
        value: latestCitations.length,
        note: 'Newest downstream papers in view',
      },
    ];

    return `
      <div class="damage-network-metrics" aria-label="Publication graph metrics">
        ${metrics.map((metric) => `
          <article class="damage-network-metric-card">
            <p class="damage-network-metric-label">${escapeHtml(metric.label)}</p>
            <p class="damage-network-metric-value">${escapeHtml(metric.value)}</p>
            <p class="damage-network-metric-note">${escapeHtml(metric.note)}</p>
          </article>
        `).join('')}
      </div>
    `;
  };

  const renderClusterSummary = (network) => {
    const nodes = Array.isArray(network?.nodes) ? network.nodes : [];
    const counts = new Map();
    nodes.forEach((node) => {
      const cluster = String(node.cluster || node.kind || 'default');
      if (cluster === 'framework') return;
      counts.set(cluster, (counts.get(cluster) || 0) + 1);
    });

    const entries = Array.from(counts.entries())
      .sort((left, right) => right[1] - left[1])
      .map(([cluster, count]) => ({ cluster, count }));
    if (!entries.length) return '';

    return `
      <div class="damage-network-clusters">
        <div class="damage-network-subhead">
          <h4>Derived Citation Clusters</h4>
          <p>Clusters are inferred from crossreferences among the cited papers, then used as anchors in the spring layout.</p>
        </div>
        <div class="damage-network-cluster-grid">
          ${entries.map((entry) => `
            <article class="damage-network-cluster-card">
              <p class="damage-network-cluster-name">${escapeHtml(humanizeCluster(entry.cluster))}</p>
              <p class="damage-network-cluster-count">${escapeHtml(entry.count)} papers</p>
            </article>
          `).join('')}
        </div>
      </div>
    `;
  };

  const renderLatestCitations = (network) => {
    const nodes = Array.isArray(network?.nodes) ? network.nodes : [];
    const latest = nodes
      .filter((node) => node.status === 'latest')
      .sort((left, right) => String(right.publication_date || '').localeCompare(String(left.publication_date || '')));
    if (!latest.length) return '';

    return `
      <div class="damage-network-latest">
        <div class="damage-network-subhead">
          <h4>Latest Citing Papers</h4>
          <p>Newest downstream records pulled at build time. This list updates when the homepage rebuilds.</p>
        </div>
        <div class="damage-network-latest-list">
          ${latest.map((node) => `
            <article class="damage-network-latest-card">
              <div class="damage-card-topline">
                <span class="damage-status">${escapeHtml(node.year || 'n.d.')}</span>
                <span class="damage-id">${escapeHtml(node.cited_by_count || 0)} cites</span>
              </div>
              <h4>${escapeHtml(node.title || node.label || node.id)}</h4>
              <p>${escapeHtml(node.subtitle || '')}</p>
              ${node.doi ? `<code>${escapeHtml(node.doi)}</code>` : ''}
            </article>
          `).join('')}
        </div>
      </div>
    `;
  };

  const describeRelations = (network, nodeId) => {
    const nodes = Array.isArray(network?.nodes) ? network.nodes : [];
    const edges = Array.isArray(network?.edges) ? network.edges : [];
    const nodeById = new Map(nodes.map((node) => [node.id, node]));

    return edges
      .filter((edge) => edge.from === nodeId || edge.to === nodeId)
      .map((edge) => {
        const otherId = edge.from === nodeId ? edge.to : edge.from;
        const other = nodeById.get(otherId);
        if (!other) return '';
        const relation = edge.from === nodeId ? 'connects to' : 'receives from';
        return `
          <li>
            <strong>${escapeHtml(relation)}</strong> ${escapeHtml(other.title || other.label || other.id)}
            ${edge.label ? `<span> via ${escapeHtml(edge.label)}</span>` : ''}
          </li>
        `;
      })
      .join('');
  };

  const collectCitationRelations = (network, nodeId) => {
    const nodes = Array.isArray(network?.nodes) ? network.nodes : [];
    const edges = Array.isArray(network?.edges) ? network.edges : [];
    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    const citedPapers = [];
    const citingPapers = [];

    edges.forEach((edge) => {
      const from = nodeById.get(edge.from);
      const to = nodeById.get(edge.to);
      if (!from || !to) return;

      if (edge.from === nodeId) {
        citedPapers.push({ node: to, label: edge.label || 'linked record' });
      }
      if (edge.to === nodeId) {
        citingPapers.push({ node: from, label: edge.label || 'linked record' });
      }
    });

    const dedupe = (items) => {
      const seen = new Set();
      return items.filter((item) => {
        const key = String(item?.node?.id || '');
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };

    return {
      citedPapers: dedupe(citedPapers),
      citingPapers: dedupe(citingPapers),
    };
  };

  const renderCitationList = (title, items, emptyLabel) => `
    <div class="damage-network-citations-block">
      <h5>${escapeHtml(title)}</h5>
      ${items.length ? `
        <ul class="damage-network-citations-list">
          ${items.map(({ node, label }) => `
            <li>
              <a href="${escapeHtml(paperUrl(node) || '#')}" ${paperUrl(node) ? 'target="_blank" rel="noreferrer"' : ''}>${escapeHtml(node.title || node.label || node.id)}</a>
              <span>${escapeHtml(label)}</span>
            </li>
          `).join('')}
        </ul>
      ` : `<p class="damage-network-empty">${escapeHtml(emptyLabel)}</p>`}
    </div>
  `;

  const formatNodeCitation = (node) => {
    if (!node) return '';
    const title = node.title || node.label || node.id || 'Untitled';
    const subtitle = node.subtitle || '';
    const year = node.year ? `(${node.year})` : '';
    const doi = node.doi ? ` DOI: ${node.doi}` : '';
    return [title, subtitle, year].filter(Boolean).join('. ') + doi;
  };

  const renderPublicationDetail = (network, node) => {
    const { citedPapers, citingPapers } = collectCitationRelations(network, node.id);
    const citationsUrl = openalexCitationsUrl(node);
    const citation = formatNodeCitation(node);
    return `
    <div class="damage-network-detail-card">
      <div class="damage-card-topline">
        <span class="damage-status">${escapeHtml(node.kind || 'paper')}</span>
        <span class="damage-id">${escapeHtml(node.status || 'tracked')}</span>
      </div>
      <h4>${escapeHtml(node.title || node.label || node.id)}</h4>
      <p>${escapeHtml(node.subtitle || '')}</p>
      <div class="damage-network-actions">
        ${paperUrl(node) ? `<a class="damage-network-action" href="${escapeHtml(paperUrl(node))}" target="_blank" rel="noreferrer">Open paper</a>` : ''}
        ${citationsUrl ? `<a class="damage-network-action" href="${escapeHtml(citationsUrl)}" target="_blank" rel="noreferrer">Open citations</a>` : ''}
      </div>
      <div class="damage-network-meta">
        ${citation ? `<p><strong>Citation:</strong> ${escapeHtml(citation)}</p>` : ''}
        ${node.year ? `<p><strong>Year:</strong> ${escapeHtml(node.year)}</p>` : ''}
        ${node.cluster ? `<p><strong>Cluster:</strong> ${escapeHtml(humanizeCluster(node.cluster))}</p>` : ''}
        ${Number.isFinite(Number(node.depth)) ? `<p><strong>Depth:</strong> ${escapeHtml(node.depth)}</p>` : ''}
        ${node.doi ? `<p><strong>DOI:</strong> ${escapeHtml(node.doi)}</p>` : ''}
        ${node.cited_by_count ? `<p><strong>Cited by:</strong> ${escapeHtml(node.cited_by_count)}</p>` : ''}
        ${node.binding ? `<p><strong>Binding:</strong></p><code>${escapeHtml(node.binding)}</code>` : ''}
      </div>
      <div class="damage-network-citations-shell">
        ${renderCitationList('References', citedPapers, 'No outgoing citation links are mapped yet.')}
        ${renderCitationList('Cited By', citingPapers, 'No incoming citation links are mapped yet.')}
      </div>
      <div class="damage-network-relations">
        <h5>Relations</h5>
        <ul>
          ${describeRelations(network, node.id) || '<li>No linked records yet.</li>'}
        </ul>
      </div>
    </div>
  `;
  };

  const renderPublicationNetwork = (network) => {
    const nodes = Array.isArray(network?.nodes) ? network.nodes : [];
    const edges = Array.isArray(network?.edges) ? network.edges : [];
    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    const viewWidth = Number(network?.viewbox?.width) || 1120;
    const viewHeight = Number(network?.viewbox?.height) || 520;

    const edgeMarkup = edges.map((edge) => {
      const from = nodeById.get(edge.from);
      const to = nodeById.get(edge.to);
      if (!from || !to) return '';

      const midX = (Number(from.x) + Number(to.x)) / 2;
      const midY = (Number(from.y) + Number(to.y)) / 2 - 10;

      return `
        <g class="damage-network-edge-group">
          <line
            class="damage-network-edge"
            data-from="${escapeHtml(edge.from)}"
            data-to="${escapeHtml(edge.to)}"
            data-weight="${escapeHtml(edge.weight || 0.5)}"
            x1="${escapeHtml(from.x)}"
            y1="${escapeHtml(from.y)}"
            x2="${escapeHtml(to.x)}"
            y2="${escapeHtml(to.y)}"
          ></line>
          ${edge.label ? `
            <text class="damage-network-edge-label" data-edge-label="${escapeHtml(edge.from)}:${escapeHtml(edge.to)}" x="${escapeHtml(midX)}" y="${escapeHtml(midY)}">
              ${escapeHtml(edge.label)}
            </text>
          ` : ''}
        </g>
      `;
    }).join('');

    const analysisEdgeMarkup = (Array.isArray(network?.analysis_links) ? network.analysis_links : []).map((edge) => {
      const from = nodeById.get(edge.from);
      const to = nodeById.get(edge.to);
      if (!from || !to) return '';

      return `
        <line
          class="damage-network-analysis-edge"
          data-analysis-from="${escapeHtml(edge.from)}"
          data-analysis-to="${escapeHtml(edge.to)}"
          data-analysis-type="${escapeHtml(edge.type || 'analysis')}"
          x1="${escapeHtml(from.x)}"
          y1="${escapeHtml(from.y)}"
          x2="${escapeHtml(to.x)}"
          y2="${escapeHtml(to.y)}"
        ></line>
      `;
    }).join('');

    const nodeMarkup = nodes.map((node) => {
      const color = node.color || (network.legend || []).find((entry) => entry.kind === node.kind)?.color || '#24f3ff';
      const labelText = String(node.label || node.title || '').slice(0, 24);
      const chipWidth = Math.min(164, Math.max(78, labelText.length * 8.4));
      const isLeftSide = Number(node.x) > viewWidth * 0.68;
      const isTopBand = Number(node.y) < viewHeight * 0.24;
      let chipX = -(chipWidth / 2);
      let textAnchor = 'middle';
      let labelTextX = 0;
      let chipY = -((Number(node.radius) || 14) + 40);
      let labelTextY = -((Number(node.radius) || 14) + 22);

      if (isLeftSide) {
        chipX = -chipWidth - ((Number(node.radius) || 14) + 10);
        textAnchor = 'start';
        labelTextX = chipX + 16;
      } else if (Number(node.x) < viewWidth * 0.22) {
        chipX = (Number(node.radius) || 14) + 10;
        textAnchor = 'start';
        labelTextX = chipX + 16;
      }

      if (isTopBand) {
        chipY = (Number(node.radius) || 14) + 12;
        labelTextY = chipY + 18;
      }

      return `
        <g class="damage-network-node" style="--node-color:${escapeHtml(color)}" data-node-id="${escapeHtml(node.id)}" data-node-x="${escapeHtml(node.x)}" data-node-y="${escapeHtml(node.y)}" data-node-radius="${escapeHtml(node.radius || 14)}" data-cluster="${escapeHtml(node.cluster || node.kind || 'default')}" data-depth="${escapeHtml(node.depth || 0)}" tabindex="0" role="button" aria-label="${escapeHtml(node.title || node.label || node.id)}" transform="translate(${escapeHtml(node.x)} ${escapeHtml(node.y)})">
          <circle class="damage-network-node-glow" r="${escapeHtml((Number(node.radius) || 14) + 10)}" fill="${escapeHtml(color)}"></circle>
          <circle class="damage-network-node-ring" r="${escapeHtml((Number(node.radius) || 14) + 2)}" stroke="${escapeHtml(color)}"></circle>
          <circle class="damage-network-node-core" r="${escapeHtml(node.radius || 14)}" fill="${escapeHtml(color)}"></circle>
          <rect class="damage-network-node-chip" x="${escapeHtml(chipX)}" y="${escapeHtml(chipY)}" rx="10" ry="10" width="${escapeHtml(chipWidth)}" height="28"></rect>
          <text class="damage-network-node-label" x="${escapeHtml(labelTextX)}" y="${escapeHtml(labelTextY)}" text-anchor="${escapeHtml(textAnchor)}">${escapeHtml(labelText)}</text>
        </g>
      `;
    }).join('');

    const initialNode = nodes.find((node) => node.id === 'framework_paper') || nodes[0] || null;

    return `
      <section id="publications" class="project-section damage-publications">
        <h3>${escapeHtml(network.title || 'Publication Network')}</h3>
        <p>${escapeHtml(network.summary || '')}</p>
        ${network.source_binding ? `<p class="damage-network-source"><strong>Source binding:</strong> ${escapeHtml(network.source_binding)}</p>` : ''}
        ${renderPublicationProvenance(network)}
        ${renderPublicationMetrics(network)}
        ${renderPublicationLegend(network.legend || [])}
        ${renderClusterSummary(network)}
        ${renderLatestCitations(network)}
        <div class="damage-network-shell damage-network-shell--connected">
          <div class="damage-network-canvas">
            <div class="damage-network-toolbar" aria-label="Graph controls">
              <button type="button" class="damage-network-control" data-network-zoom="in">+</button>
              <button type="button" class="damage-network-control" data-network-zoom="out">-</button>
              <button type="button" class="damage-network-control" data-network-zoom="reset">Reset</button>
              <span class="damage-network-hint">Wheel to zoom, drag background to pan, drag nodes to refine.</span>
            </div>
          <svg class="damage-network-svg" viewBox="0 0 ${escapeHtml(viewWidth)} ${escapeHtml(viewHeight)}" role="img" aria-label="Publication network">
            <g class="damage-network-viewport" data-network-viewport>
              ${edgeMarkup}
              ${analysisEdgeMarkup}
              ${nodeMarkup}
            </g>
          </svg>
          </div>
          <aside class="damage-network-detail" data-network-detail>
            ${initialNode ? renderPublicationDetail(network, initialNode) : ''}
          </aside>
        </div>
      </section>
    `;
  };

  const initPublicationNetwork = (network) => {
    const section = mount.querySelector('#publications');
    if (!section || !network) return;

    const detail = section.querySelector('[data-network-detail]');
    const nodeMap = new Map((network.nodes || []).map((node) => [node.id, node]));
    const nodeElements = Array.from(section.querySelectorAll('[data-node-id]'));
    const edgeElements = Array.from(section.querySelectorAll('.damage-network-edge'));
    const analysisEdgeElements = Array.from(section.querySelectorAll('.damage-network-analysis-edge'));
    const edgeLabels = Array.from(section.querySelectorAll('[data-edge-label]'));
    const svg = section.querySelector('.damage-network-svg');
    const viewport = section.querySelector('[data-network-viewport]');
    const zoomControls = Array.from(section.querySelectorAll('[data-network-zoom]'));
    const canvas = section.querySelector('.damage-network-canvas');

    const clusterEntries = Array.from(new Set((network.nodes || []).map((node) => node.cluster || node.kind || 'default')));
    const clusterCenterMap = new Map(clusterEntries.map((clusterName, index) => [
      clusterName,
      {
        x: (Number(network?.viewbox?.width) || 1120) * (0.22 + (index % 4) * 0.16),
        y: (Number(network?.viewbox?.height) || 520) * (0.24 + Math.floor(index / 4) * 0.22),
      },
    ]));

    const simulationNodes = nodeElements.map((element) => {
      const nodeId = element.getAttribute('data-node-id') || '';
      const node = nodeMap.get(nodeId) || {};
      return {
        id: nodeId,
        element,
        node,
        x: Number(element.getAttribute('data-node-x')) || 0,
        y: Number(element.getAttribute('data-node-y')) || 0,
        vx: 0,
        vy: 0,
        radius: Number(element.getAttribute('data-node-radius')) || 18,
        cluster: element.getAttribute('data-cluster') || 'default',
        depth: Number(element.getAttribute('data-depth')) || 0,
      };
    });
    const simulationNodeMap = new Map(simulationNodes.map((entry) => [entry.id, entry]));
    const simulationEdges = edgeElements.map((element) => ({
      element,
      label: edgeLabels.find((label) => label.getAttribute('data-edge-label') === `${element.getAttribute('data-from')}:${element.getAttribute('data-to')}`) || null,
      from: element.getAttribute('data-from') || '',
      to: element.getAttribute('data-to') || '',
      weight: Number(element.getAttribute('data-weight')) || 0.5,
    }));
    const simulationAnalysisEdges = Array.isArray(network?.analysis_links)
      ? network.analysis_links
          .map((link) => ({
            from: String(link.from || ''),
            to: String(link.to || ''),
            strength: Number(link.strength) || 1,
          }))
          .filter((link) => simulationNodeMap.has(link.from) && simulationNodeMap.has(link.to))
      : [];
    const relatedAnalysisNodeMap = new Map();
    simulationAnalysisEdges.forEach((edge) => {
      if (!relatedAnalysisNodeMap.has(edge.from)) relatedAnalysisNodeMap.set(edge.from, new Set());
      if (!relatedAnalysisNodeMap.has(edge.to)) relatedAnalysisNodeMap.set(edge.to, new Set());
      relatedAnalysisNodeMap.get(edge.from)?.add(edge.to);
      relatedAnalysisNodeMap.get(edge.to)?.add(edge.from);
    });

    let animationFrame = 0;
    let draggingId = '';
    let isPanning = false;
    let zoomScale = 1;
    let panX = 0;
    let panY = 0;
    let lastPointer = null;
    const isCompactViewport = window.matchMedia('(max-width: 720px)').matches;

    const toViewportPoint = (clientX, clientY) => {
      if (!svg) return { x: 0, y: 0 };
      const point = svg.createSVGPoint();
      point.x = clientX;
      point.y = clientY;
      const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());
      return {
        x: (svgPoint.x - panX) / zoomScale,
        y: (svgPoint.y - panY) / zoomScale,
      };
    };

    const updateZoomState = () => {
      if (!canvas || !viewport) return;
      viewport.setAttribute('transform', `translate(${panX.toFixed(2)} ${panY.toFixed(2)}) scale(${zoomScale.toFixed(3)})`);
      canvas.dataset.zoomed = zoomScale > 1.15 ? 'true' : 'false';
    };

    const zoomAround = (nextScale, centerX, centerY) => {
      const clampedScale = Math.max(0.72, Math.min(2.8, nextScale));
      const scaleRatio = clampedScale / zoomScale;
      panX = centerX - ((centerX - panX) * scaleRatio);
      panY = centerY - ((centerY - panY) * scaleRatio);
      zoomScale = clampedScale;
      updateZoomState();
    };

    const applyTransforms = () => {
      simulationNodes.forEach((entry) => {
        entry.element.setAttribute('transform', `translate(${entry.x.toFixed(2)} ${entry.y.toFixed(2)})`);
      });

      simulationEdges.forEach((edge) => {
        const from = simulationNodeMap.get(edge.from);
        const to = simulationNodeMap.get(edge.to);
        if (!from || !to) return;
        edge.element.setAttribute('x1', String(from.x));
        edge.element.setAttribute('y1', String(from.y));
        edge.element.setAttribute('x2', String(to.x));
        edge.element.setAttribute('y2', String(to.y));
        if (edge.label) {
          edge.label.setAttribute('x', String((from.x + to.x) / 2));
          edge.label.setAttribute('y', String((from.y + to.y) / 2 - 12));
        }
      });

      analysisEdgeElements.forEach((element) => {
        const from = simulationNodeMap.get(element.getAttribute('data-analysis-from') || '');
        const to = simulationNodeMap.get(element.getAttribute('data-analysis-to') || '');
        if (!from || !to) return;
        element.setAttribute('x1', String(from.x));
        element.setAttribute('y1', String(from.y));
        element.setAttribute('x2', String(to.x));
        element.setAttribute('y2', String(to.y));
      });

      updateZoomState();
    };

    const anchorForNode = (entry, width, height) => {
      const clusterIndex = clusterEntries.indexOf(entry.cluster);
      const clusterOffset = (clusterIndex < 0 ? 0 : clusterIndex) % 4;

      if (entry.id === 'framework_paper') return { x: width * 0.34, y: height * 0.16 };
      if (entry.id === 'seed_corpus') return { x: width * 0.47, y: height * 0.38 };
      if (entry.id === 'reference_set') return { x: width * 0.43, y: height * 0.6 };
      if (entry.id === 'citation_frontier') return { x: width * 0.72, y: height * 0.45 };
      if (entry.id === 'correction_layer') return { x: width * 0.68, y: height * 0.82 };

      if (entry.node?.status === 'latest') {
        const latestIndex = simulationNodes.filter((item) => item.node?.status === 'latest').findIndex((item) => item.id === entry.id);
        const row = Math.floor(Math.max(latestIndex, 0) / 3);
        const col = Math.max(latestIndex, 0) % 3;
        return { x: width * (0.48 + col * 0.12), y: height * (0.12 + row * 0.18) };
      }

      if (entry.node?.kind === 'citations') {
        return { x: width * 0.9, y: height * (0.2 + clusterOffset * 0.17) };
      }

      if (entry.node?.kind === 'upstream') {
        return { x: width * (0.1 + (clusterOffset % 3) * 0.14), y: height * (0.24 + Math.floor(clusterOffset / 3) * 0.2 + entry.depth * 0.08) };
      }

      const clusterCenter = clusterCenterMap.get(entry.cluster) || { x: width * 0.5, y: height * 0.5 };
      return clusterCenter;
    };

    const tickSimulation = () => {
      const width = Number(network?.viewbox?.width) || 1120;
      const height = Number(network?.viewbox?.height) || 520;

      for (let index = 0; index < simulationNodes.length; index += 1) {
        const left = simulationNodes[index];
        for (let otherIndex = index + 1; otherIndex < simulationNodes.length; otherIndex += 1) {
          const right = simulationNodes[otherIndex];
          const dx = left.x - right.x;
          const dy = left.y - right.y;
          const distanceSq = dx * dx + dy * dy + 0.01;
          const distance = Math.sqrt(distanceSq);
          const repulsion = 6200 / distanceSq;
          const ux = dx / distance;
          const uy = dy / distance;
          left.vx += ux * repulsion;
          left.vy += uy * repulsion;
          right.vx -= ux * repulsion;
          right.vy -= uy * repulsion;
        }
      }

      simulationEdges.forEach((edge) => {
        const from = simulationNodeMap.get(edge.from);
        const to = simulationNodeMap.get(edge.to);
        if (!from || !to) return;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const distance = Math.sqrt(dx * dx + dy * dy) + 0.01;
        const target = 110 + (Math.max(from.depth, to.depth) * 24) + (1 - edge.weight) * 54;
        const spring = (distance - target) * 0.0085;
        const ux = dx / distance;
        const uy = dy / distance;
        from.vx += ux * spring;
        from.vy += uy * spring;
        to.vx -= ux * spring;
        to.vy -= uy * spring;
      });

      simulationAnalysisEdges.forEach((edge) => {
        const from = simulationNodeMap.get(edge.from);
        const to = simulationNodeMap.get(edge.to);
        if (!from || !to) return;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const distance = Math.sqrt(dx * dx + dy * dy) + 0.01;
        const target = 84 + (1 - Math.min(edge.strength / 4, 0.9)) * 52;
        const spring = (distance - target) * (0.01 + Math.min(edge.strength, 3.5) * 0.004);
        const ux = dx / distance;
        const uy = dy / distance;
        from.vx += ux * spring;
        from.vy += uy * spring;
        to.vx -= ux * spring;
        to.vy -= uy * spring;
      });

      simulationNodes.forEach((entry) => {
        const anchor = anchorForNode(entry, width, height);
        entry.vx += (anchor.x - entry.x) * 0.0044;
        entry.vy += (anchor.y - entry.y) * 0.0044;

        if (entry.id !== draggingId) {
          entry.vx *= 0.86;
          entry.vy *= 0.86;
          entry.x = Math.max(54, Math.min(width - 54, entry.x + entry.vx));
          entry.y = Math.max(54, Math.min(height - 54, entry.y + entry.vy));
        }
      });

      applyTransforms();
      animationFrame = window.requestAnimationFrame(tickSimulation);
    };

    const setActive = (nodeId) => {
      const node = nodeMap.get(nodeId);
      if (!node || !detail) return;
      const relatedAnalysisNodes = relatedAnalysisNodeMap.get(nodeId) || new Set();

      nodeElements.forEach((element) => {
        const elementNodeId = element.getAttribute('data-node-id') || '';
        element.classList.toggle('is-active', elementNodeId === nodeId);
        element.classList.toggle('is-related', relatedAnalysisNodes.has(elementNodeId));
        element.classList.toggle('is-dimmed', elementNodeId !== nodeId && !relatedAnalysisNodes.has(elementNodeId));
      });

      edgeElements.forEach((element) => {
        const from = element.getAttribute('data-from');
        const to = element.getAttribute('data-to');
        const active = from === nodeId || to === nodeId;
        element.classList.toggle('is-active', active);
        element.classList.toggle('is-dimmed', !active);
        const label = edgeLabels.find((entry) => entry.getAttribute('data-edge-label') === `${from}:${to}`);
        if (label) label.classList.toggle('is-active', active);
      });

      analysisEdgeElements.forEach((element) => {
        const from = element.getAttribute('data-analysis-from');
        const to = element.getAttribute('data-analysis-to');
        const active = from === nodeId || to === nodeId;
        element.classList.toggle('is-active', active);
        element.classList.toggle('is-dimmed', !active);
      });

      detail.innerHTML = renderPublicationDetail(network, node);
    };

    nodeElements.forEach((element) => {
      const nodeId = element.getAttribute('data-node-id');
      if (!nodeId) return;
      element.addEventListener('click', () => setActive(nodeId));
      element.addEventListener('mouseenter', () => setActive(nodeId));
      element.addEventListener('focus', () => setActive(nodeId));
      element.addEventListener('pointerdown', (event) => {
        event.stopPropagation();
        draggingId = nodeId;
        const current = simulationNodeMap.get(nodeId);
        if (!current || !svg) return;
        const transformed = toViewportPoint(event.clientX, event.clientY);
        current.x = transformed.x;
        current.y = transformed.y;
        current.vx = 0;
        current.vy = 0;
        applyTransforms();
      });
      element.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setActive(nodeId);
        }
      });
    });

    svg?.addEventListener('wheel', (event) => {
      event.preventDefault();
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());
      const delta = event.deltaY < 0 ? 1.12 : 0.9;
      zoomAround(zoomScale * delta, svgPoint.x, svgPoint.y);
    }, { passive: false });

    svg?.addEventListener('pointerdown', (event) => {
      if (event.target.closest('[data-node-id]')) return;
      isPanning = true;
      lastPointer = { x: event.clientX, y: event.clientY };
    });

    window.addEventListener('pointermove', (event) => {
      if (draggingId && svg) {
        const current = simulationNodeMap.get(draggingId);
        if (!current) return;
        const transformed = toViewportPoint(event.clientX, event.clientY);
        current.x = transformed.x;
        current.y = transformed.y;
        current.vx = 0;
        current.vy = 0;
        applyTransforms();
        return;
      }

      if (isPanning && lastPointer) {
        panX += event.clientX - lastPointer.x;
        panY += event.clientY - lastPointer.y;
        lastPointer = { x: event.clientX, y: event.clientY };
        updateZoomState();
      }
    });

    window.addEventListener('pointerup', () => {
      draggingId = '';
      isPanning = false;
      lastPointer = null;
    });

    zoomControls.forEach((control) => {
      control.addEventListener('click', () => {
        const mode = control.getAttribute('data-network-zoom');
        const width = Number(network?.viewbox?.width) || 1120;
        const height = Number(network?.viewbox?.height) || 520;
        if (mode === 'in') zoomAround(zoomScale * 1.16, width / 2, height / 2);
        if (mode === 'out') zoomAround(zoomScale * 0.86, width / 2, height / 2);
        if (mode === 'reset') {
          zoomScale = 1;
          panX = 0;
          panY = 0;
          updateZoomState();
        }
      });
    });

    if (isCompactViewport) {
      zoomScale = 1.18;
      panX = -120;
      panY = -22;
      updateZoomState();
    }

    setActive((network.nodes || []).find((node) => node.id === 'framework_paper')?.id || (network.nodes || [])[0]?.id || '');
    Array.from(mount.querySelectorAll('[data-focus-publication]')).forEach((element) => {
      const nodeId = element.getAttribute('data-focus-publication') || '';
      if (!nodeMap.has(nodeId)) return;
      element.addEventListener('click', () => {
        setActive(nodeId);
      });
    });
    animationFrame = window.requestAnimationFrame(tickSimulation);
  };

  async function main() {
    try {
      const [data, publicationNetwork] = await Promise.all([
        loadJsonResource('../data/epistemic_damage_homepage.json', 'epistemic-damage-homepage-json'),
        loadJsonResource('../data/epistemic_damage_publications.json', 'epistemic-damage-publications-json'),
      ]);

      mount.innerHTML = `
        <section id="overview" class="project-section damage-overview">
          <div class="damage-section-heading">
            <span class="damage-section-kicker">Overview</span>
            <h3>Core Statement</h3>
          </div>
          <p class="damage-abstract">${escapeHtml(data.abstract)}</p>
        </section>

        <section id="methods" class="project-section damage-methods">
          <div class="damage-section-heading">
            <span class="damage-section-kicker">Method</span>
            <h3>System Architecture</h3>
            <p>The homepage remains metadata-driven, but the presentation is now arranged as a scrollable research note rather than a control panel.</p>
          </div>
          ${renderArchitecture(data.architecture || [])}
        </section>

        <section id="demo" class="project-section damage-demo">
          <div class="damage-section-heading">
            <span class="damage-section-kicker">Analysis</span>
            <h3>Analysis Blocks</h3>
            <p>These blocks hold the conceptual analysis. The results and bibliography below turn that analysis into a readable literature trace.</p>
          </div>
          <div class="damage-card-grid">
            ${(data.thoughts || []).map(renderThought).join('')}
          </div>
        </section>

        ${renderResults(data, publicationNetwork)}

        ${publicationNetwork ? renderPublicationNetwork(publicationNetwork) : ''}

        <section id="links" class="project-section damage-links">
          <h3>Current Binding</h3>
          <div class="damage-link-grid">
            ${(data.bindings || []).map(renderBinding).join('')}
          </div>
        </section>

        ${renderBibliography(data, publicationNetwork)}
      `;

      Array.from(mount.querySelectorAll('[data-copy-bibliography]')).forEach((button) => {
        button.addEventListener('click', async () => {
          const exportText = button.getAttribute('data-bibliography-export-text') || '';
          if (!exportText) return;
          try {
            await navigator.clipboard.writeText(exportText);
            button.textContent = 'Copied';
            window.setTimeout(() => {
              button.textContent = 'Copy bibliography';
            }, 1400);
          } catch (_error) {
            button.textContent = 'Select text below';
            window.setTimeout(() => {
              button.textContent = 'Copy bibliography';
            }, 1600);
          }
        });
      });

      initPublicationNetwork(publicationNetwork);
    } catch (error) {
      mount.innerHTML = `
        <section class="project-section">
          <h3>Prototype unavailable</h3>
          <p>Failed to load the metadata-driven homepage prototype.</p>
          <pre>${escapeHtml(error instanceof Error ? error.message : String(error))}</pre>
        </section>
      `;
    }
  }

  main();
}());
