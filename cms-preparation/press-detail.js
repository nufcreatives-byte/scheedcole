/* Connect each project-specific press page to the editor. */
(async () => {
  try {
    const filename = location.pathname.split('/').pop();
    const response = await fetch('cms-preparation/press-pages.json', {cache: 'no-cache'});
    if (!response.ok) return;
    const {pages} = await response.json();
    const page = pages.find(item => item.page === filename);
    const container = document.querySelector('.press-list');
    if (!page || !container || !Array.isArray(page.articles)) return;
    const originals = new Map([...container.querySelectorAll('.press-card')].map(node => [node.getAttribute('href'), node]));
    const fragment = document.createDocumentFragment();
    for (const item of page.articles) {
      let url; try { url = new URL(item.url); if (!['http:', 'https:'].includes(url.protocol)) continue; } catch { continue; }
      const existing = originals.get(item.url);
      if (existing) {
        const card = existing.cloneNode(true);
        const title = card.querySelector('h2'), source = card.querySelector('span'), description = card.querySelector('p');
        if (title) title.textContent = item.title || '';
        if (source) source.textContent = item.source_date || '';
        if (description) description.textContent = item.description || '';
        const strong = card.querySelector('strong');
        if (strong && item.button_label) { const text = [...strong.childNodes].find(n => n.nodeType === Node.TEXT_NODE); if (text) text.textContent = item.button_label; }
        fragment.append(card); continue;
      }
      const card = document.createElement('a'); card.className = 'press-card'; card.href = url.href; card.target = '_blank'; card.rel = 'noopener noreferrer';
      const inner = document.createElement('div');
      for (const [tag, value] of [['span',item.source_date],['h2',item.title],['p',item.description]]) { const node = document.createElement(tag); node.textContent = value || ''; inner.append(node); }
      const button = document.createElement('strong'); button.textContent = item.button_label || 'Read feature';
      const icon = document.querySelector('.project-cta-arrow'); if (icon) button.append(icon.cloneNode(true));
      card.append(inner, button); fragment.append(card);
    }
    if (!fragment.childNodes.length) { const p = document.createElement('p'); p.textContent = 'No press articles are listed for this project yet.'; fragment.append(p); }
    container.replaceChildren(fragment);
  } catch (error) { console.warn('Project press content could not be loaded; original content remains.', error); }
})();
