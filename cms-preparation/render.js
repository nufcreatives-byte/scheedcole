/* Draft integration for the CMS test branch. */
(async () => {
  const root = document.documentElement.dataset.cmsPage;
  if (!root) return;
  const load = async name => {
    const response = await fetch('cms-preparation/' + name + '.json', {cache: 'no-cache'});
    if (!response.ok) throw new Error('Content unavailable');
    return response.json();
  };
  const el = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value != null) node.textContent = value;
    return node;
  };
  const link = (url, label, external = false) => {
    const a = el('a', '', label);
    if (external) {
      try { const parsed = new URL(url); if (!['http:', 'https:'].includes(parsed.protocol)) return null; a.href = parsed.href; }
      catch { return null; }
      a.target = '_blank'; a.rel = 'noopener noreferrer';
    } else {
      if (!/^[a-zA-Z0-9][a-zA-Z0-9._/-]*\.html$/.test(url || '')) return null;
      a.href = url;
    }
    return a;
  };
  try {
    if (root === 'home') {
      const data = await load('home');
      const set = (selector, value) => { const node = document.querySelector(selector); if (node && typeof value === 'string') node.textContent = value; };
      set('.cover-copy h1', data.hero_name);
      set('.cover-role', data.hero_role);
      set('.practice-copy > p:not(.worldwide-line)', data.about_intro);
      set('.contact-copy > p', data.contact_intro);
      const statement = document.querySelector('.manifesto h2');
      if (statement && typeof data.practice_statement === 'string' && statement.textContent.trim() !== data.practice_statement.trim()) statement.textContent = data.practice_statement;
      const email = document.querySelector('.contact-copy a[href^="mailto:"]');
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || '')) { email.href = 'mailto:' + data.email; email.textContent = data.email; }
    }
    if (root === 'work') {
      const {projects} = await load('projects');
      if (!Array.isArray(projects)) throw new Error('Invalid projects');
      const container = document.querySelector('.editorial-projects');
      if (!container) return;
      const fragment = document.createDocumentFragment();
      const originals = new Map([...container.querySelectorAll('.editorial-project')].map(node => [node.querySelector('.editorial-links a')?.getAttribute('href'), node]));
      for (const item of projects) {
        if (!item.title) continue;
        const original = originals.get(item.project_url);
        if (original) {
          const node = original.cloneNode(true);
          node.classList.remove('reveal');
          node.querySelector('h2').textContent = item.title;
          node.querySelector('.editorial-meta').textContent = item.metadata || '';
          node.querySelector('.editorial-type').textContent = item.type || '';
          node.querySelector('.editorial-description').textContent = item.description || '';
          const img = node.querySelector('img');
          const path = (item.image || '').replace(/^\/+/, '');
          if (img && path.startsWith('images/') && !path.split('/').includes('..')) { img.src = path; img.alt = item.image_alt || ''; }
          const links = node.querySelectorAll('.editorial-links a');
          if (links[1] && !item.press_url) links[1].remove();
          else if (links[1] && item.press_url && !item.press_url.includes(':') && !item.press_url.startsWith('/')) links[1].href = item.press_url;
          fragment.append(node);
          continue;
        }
        const article = el('article', 'editorial-project');
        const media = el('div', 'editorial-media');
        const imagePath = (item.image || '').replace(/^\/+/, '');
        if (/^images\/[a-zA-Z0-9._/ -]+$/.test(imagePath) && !imagePath.split('/').includes('..')) {
          const img = document.createElement('img'); img.src = imagePath; img.alt = item.image_alt || ''; img.loading = 'lazy'; img.style.cssText = 'display:block;width:100%;height:100%;object-fit:cover;object-position:center'; media.append(img);
        }
        const copy = el('div', 'editorial-copy');
        copy.append(el('h2', '', item.title), el('p', 'editorial-meta', item.metadata || ''), el('p', 'editorial-type', item.type || ''), el('p', 'editorial-description', item.description || ''));
        const links = el('div', 'editorial-links');
        const projectLink = link(item.project_url, 'PROJECT ↗') || Object.assign(el('a', '', 'PROJECT ↗'), {href: 'project-view.html?id=' + encodeURIComponent(item.id || item.title)}); const pressLink = link(item.press_url, 'PRESS ↗');
        if (projectLink) links.append(projectLink); if (pressLink) links.append(pressLink);
        copy.append(links); article.append(media, copy); fragment.append(article);
      }
      container.replaceChildren(fragment);
    }
    if (root === 'press') {
      const {articles} = await load('press');
      if (!Array.isArray(articles)) throw new Error('Invalid press');
      const container = document.querySelector('.press-list');
      if (!container) return;
      const groups = new Map();
      for (const item of articles) {
        const year = /^\d{4}/.exec(item.date || '')?.[0] || /\b(?:19|20)\d{2}\b/.exec(item.source_date || '')?.[0] || 'undated';
        if (!groups.has(year)) groups.set(year, []);
        groups.get(year).push(item);
      }
      const fragment = document.createDocumentFragment(), nav = el('nav');
      nav.setAttribute('aria-label', 'Browse press by year'); nav.style.cssText = 'display:flex;flex-wrap:wrap;gap:18px;margin-bottom:48px';
      for (const year of groups.keys()) { const a = el('a', 'text-link', year === 'undated' ? 'Date not confirmed' : year); a.href = '#press-' + year; nav.append(a); }
      fragment.append(nav);
      for (const [year, items] of groups) {
        const head = el('div'); head.id = 'press-' + year; head.style.cssText = 'scroll-margin-top:100px;margin:48px 0 20px'; head.append(el('p', 'eyebrow', year === 'undated' ? 'Date not confirmed' : year)); fragment.append(head);
        for (const item of items) {
          const a = link(item.url, '', true); if (!a || !item.title) continue;
          a.className = 'press-card'; const inner = el('div');
          inner.append(el('span', '', item.source_date || ''), el('h2', '', item.title), el('p', '', item.project || ''));
          a.append(inner, el('strong', '', 'Read feature ↗')); fragment.append(a);
        }
      }
      container.replaceChildren(fragment);
    }
  } catch (error) { console.warn('Draft CMS content could not be loaded; original content remains.', error); }
})();
