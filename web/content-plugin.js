import { readFileSync } from 'node:fs';
const copyPath = new URL('../content/homepage.json', import.meta.url);
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function homepageContent() {
  return {
    name: 'calyr-homepage-content',
    transformIndexHtml: { order: 'pre', handler(html) {
      const copy = JSON.parse(readFileSync(copyPath, 'utf8'));
      const math = `<section class="calyr-math" aria-labelledby="math-title"><h2 id="math-title">${escape(copy.math.label)}</h2><div class="calyr-math-grid">${copy.math.items.map(item => `<article><h3>${escape(item.title)}</h3><div class="formula">${escape(item.formula)}</div><p>${escape(item.text)}</p></article>`).join('')}</div></section>`;
      return html.replace('{{math}}', math).replace(/\{\{copy\.([a-z0-9_]+)\}\}/g, (_, key) => {
        if (typeof copy[key] !== 'string') throw new Error(`Missing homepage text: ${key}`);
        return escape(copy[key]);
      });
    } },
    configureServer(server) {
      server.watcher.add(copyPath.pathname);
      server.watcher.on('change', path => { if (path === copyPath.pathname) server.ws.send({type:'full-reload'}); });
    },
  };
}
