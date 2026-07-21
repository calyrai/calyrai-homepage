const state = { data: null, query: '', kind: 'all' };
const esc = (value = '') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const list = value => Array.isArray(value) ? value : value == null ? [] : [value];
const searchText = record => JSON.stringify(record).toLowerCase();
function entities(data) {
  return [
    ...data.ideas.map(x => ({...x, entityKind:'idea', subtitle:`${x.kind} · ${x.source}`, summary:x.statement, tags:x.tags, link:''})),
    ...data.papers.map(x => ({...x, entityKind:'paper', subtitle:`${list(x.authors).join(', ')} · ${x.year}`, summary:x.extractable_idea, tags:x.topics, link:x.url || x.pdf || ''})),
    ...data.dataset_source_citations.map(x => ({...x, entityKind:'paper', subtitle:`${list(x.authors).join(', ')} · ${x.year}`, summary:'Dataset source citation used by the seed paper.', tags:['dataset source'], link:x.url || ''})),
    ...data.datasets.map(x => ({...x, entityKind:'dataset', subtitle:`${x.domain} · cited by ${x.cited_by}`, summary:list(x.ideas).join(' · '), tags:[x.availability, x.license_status], link:x.url || ''}))
  ];
}
function render() {
  const q = state.query.trim().toLowerCase();
  const records = entities(state.data).filter(x => (state.kind === 'all' || x.entityKind === state.kind) && (!q || searchText(x).includes(q)));
  document.querySelector('#result-count').textContent = `${records.length} of ${entities(state.data).length} entities`;
  document.querySelector('#results').innerHTML = records.length ? records.map(x => `<article class="record"><div><span class="record-kind">${esc(x.entityKind)}</span><p class="meta">${esc(x.subtitle)}</p></div><div><h3>${esc(x.title || x.name)}</h3><p>${esc(x.summary || '')}</p><div class="tags">${list(x.tags).filter(Boolean).map(t => `<span>${esc(t)}</span>`).join('')}</div></div>${x.link ? `<a class="record-link" href="${esc(x.link)}" rel="noreferrer">Open source →</a>` : '<span></span>'}</article>`).join('') : '<p class="empty">No matching evidence. Try a broader term.</p>';
}
fetch('/generated/literature.index.json').then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(data => { state.data = data; render(); }).catch(error => { document.querySelector('#results').innerHTML = `<p class="empty">The evidence index could not be loaded: ${esc(error.message)}</p>`; });
document.querySelector('#search').addEventListener('input', event => { state.query = event.target.value; render(); });
document.querySelector('#kind').addEventListener('change', event => { state.kind = event.target.value; render(); });
