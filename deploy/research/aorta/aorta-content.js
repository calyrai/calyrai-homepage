(() => {
  const root = document.querySelector('[data-aorta-content]');
  if (!root) return;

  const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);

  const parse = (source) => {
    const frontmatterMatch = source.match(/^---\n([\s\S]*?)\n---\n/);
    const meta = {};
    if (frontmatterMatch) {
      frontmatterMatch[1].split('\n').forEach((line) => {
        const separator = line.indexOf(':');
        if (separator > -1) meta[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
      });
    }
    const body = source.slice(frontmatterMatch ? frontmatterMatch[0].length : 0).trim();
    const blocks = body.split(/\n(?=## )/);
    const introLines = blocks.shift().split('\n').map((line) => line.trim()).filter(Boolean);
    const sections = Object.fromEntries(blocks.map((block) => {
      const lines = block.split('\n');
      const name = lines.shift().replace(/^##\s+/, '').trim().toLowerCase();
      return [name, lines.join('\n').trim()];
    }));
    return {
      meta,
      title: introLines[0].replace(/^#\s+/, ''),
      deck: introLines[1] || '',
      subtitle: introLines[2] || '',
      sections
    };
  };

  const paragraphs = (text) => text.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
  const bullets = (text) => text.split('\n').filter((line) => /^[-\d]+[.)]?\s/.test(line.trim())).map((line) => line.replace(/^[-\d]+[.)]?\s+/, '').trim());
  const phases = (text) => text.split(/(?=^### )/m).map((block) => block.trim()).filter(Boolean).map((block) => {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
    return { title: lines.shift().replace(/^###\s+/, ''), copy: lines.join(' ') };
  });

  fetch('./aorta-content.md')
    .then((response) => {
      if (!response.ok) throw new Error(`Content request failed: ${response.status}`);
      return response.text();
    })
    .then((source) => {
      const content = parse(source);
      const objective = paragraphs(content.sections.objective || '');
      const assets = bullets(content.sections['core assets'] || '');
      const methodology = bullets(content.sections.methodology || '');
      const phaseItems = phases(content.sections.phases || '');
      const impact = bullets(content.sections.impact || '');
      root.innerHTML = `<header class="topbar"><span aria-hidden="true"></span><span>${escapeHtml(content.meta.platform)}</span><span>${escapeHtml(content.meta.version)}</span><span>${escapeHtml(content.meta.date)}</span></header><section class="hero"><article class="intro"><span class="number">01</span><h1>${escapeHtml(content.title)}<br>${escapeHtml(content.deck)}</h1><div class="dash"></div><p class="subtitle">${escapeHtml(content.subtitle)}</p></article><div class="visual" role="img" aria-label="Aortic arch, stent-graft and flow visualization"></div></section><section class="details"><article class="panel"><span class="panel-no">02</span><h2>OBJECTIVE</h2>${objective.map((item) => `<p>${escapeHtml(item)}</p>`).join('')}</article><article class="panel"><span class="panel-no">03</span><h2>CORE ASSETS</h2><ul class="assets">${assets.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></article><article class="panel"><span class="panel-no">04</span><h2>METHODOLOGY</h2><div class="flow">${methodology.map((item, index) => `${index ? '<span>↓</span>' : ''}${escapeHtml(item)}`).join('')}</div></article><article class="panel phases"><span class="panel-no">05</span><h2>PHASES</h2>${phaseItems.map((item) => `<p><strong>${escapeHtml(item.title.toUpperCase())}</strong>${escapeHtml(item.copy)}</p>`).join('')}</article><article class="panel impact"><span class="panel-no">06</span><h2>IMPACT</h2>${impact.map((item) => `<p>${escapeHtml(item.toUpperCase())}</p>`).join('')}</article></section>`;
      document.dispatchEvent(new CustomEvent('calyr:aorta-content-ready'));
    })
    .catch((error) => {
      root.innerHTML = `<section class="content-error"><strong>Content unavailable</strong><span>${escapeHtml(error.message)}</span></section>`;
    });
})();
