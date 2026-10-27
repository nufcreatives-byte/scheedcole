/* Updates selected fields without altering the project's other stories and galleries. */
(async () => {
  try {
    const filename = location.pathname.split('/').pop();
    const response = await fetch('cms-preparation/projects.json', {cache:'no-cache'});
    if (!response.ok) return;
    const {projects} = await response.json();
    const project = projects.find(item => item.project_url === filename);
    if (!project) return;
    const hero = document.querySelector('.page-hero');
    const heading = hero?.querySelector('h1');
    const intro = hero?.querySelector('p:last-of-type');
    const normalized = value => (value || '').replace(/\s+/g, ' ').trim();
    const updateHeading = (node, value) => {
      const emphasis = node.querySelector('em');
      if (!emphasis) {
        const icon = node.querySelector('svg');
        if (!icon) { node.textContent = value; return; }
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
        const texts = []; while (walker.nextNode()) { const n = walker.currentNode; if (!n.parentElement?.closest('svg')) texts.push(n); }
        if (texts.length) { texts[0].textContent = value; texts.slice(1).forEach(n => n.textContent = ''); }
        else node.insertBefore(document.createTextNode(value), icon);
        return;
      }
      const original = normalized(emphasis.textContent);
      let prefix, suffix;
      if (original && value.endsWith(original)) { prefix = value.slice(0, -original.length).trimEnd(); suffix = original; }
      else { const words = value.trim().split(/\s+/); const count = Math.min(words.length, Math.max(1, original.split(/\s+/).length)); suffix = words.splice(-count).join(' '); prefix = words.join(' '); }
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      const nodes = []; while (walker.nextNode()) { const n = walker.currentNode; if (!emphasis.contains(n) && !n.parentElement?.closest('svg')) nodes.push(n); }
      if (nodes.length) { nodes[0].textContent = prefix + (node.querySelector('br') ? '' : ' '); nodes.slice(1).forEach(n => n.textContent = ''); }
      else node.insertBefore(document.createTextNode(prefix + ' '), emphasis);
      emphasis.textContent = suffix;
    };
    if (heading && project.page_heading && normalized(heading.innerText) !== normalized(project.page_heading)) updateHeading(heading, project.page_heading);
    if (intro && typeof project.page_intro === 'string' && normalized(intro.textContent) !== normalized(project.page_intro)) intro.textContent = project.page_intro;
    const img = document.querySelector('main img');
    const path = (project.page_image || '').replace(/^\/+/, '');
    if (img && /^images\/[a-zA-Z0-9._/ -]+$/.test(path) && !path.split('/').includes('..') && img.getAttribute('src').split('?')[0] !== path) {
      img.src = path; img.alt = project.page_image_alt || project.image_alt || '';
    }

    if (img && typeof project.page_image_alt === 'string' && img.alt !== project.page_image_alt) img.alt = project.page_image_alt;
    const blocks = [...document.querySelectorAll('main p, main h2, main h3, main figcaption, main .landmark-stat strong, main .landmark-stat span')]
      .filter(node => !node.closest('.page-hero') && !node.closest('a') && !node.querySelector('a') && normalized(node.textContent));
    if (Array.isArray(project.page_blocks)) {
      for (const item of project.page_blocks) {
        const node = Number.isInteger(item.position) ? blocks[item.position] : null;
        if (node && typeof item.text === 'string' && normalized(node.innerText) !== normalized(item.text)) { if (node.matches('h2, h3')) updateHeading(node, item.text); else node.textContent = item.text; }
      }
    }
    if (Array.isArray(project.page_gallery) || Number.isInteger(project.page_gallery_count)) {
      const gallery = Array.isArray(project.page_gallery) ? project.page_gallery : [];
      const originals = [...document.querySelectorAll('main img')].slice(1);
      const used = new Set();
      const valid = value => { const p = (value || '').replace(/^\/+/, ''); return /^images\/[a-zA-Z0-9._/ -]+$/.test(p) && !p.split('/').includes('..') ? p : ''; };
      for (const item of gallery) {
        if (!Number.isInteger(item.position) || !originals[item.position]) continue;
        used.add(item.position);
        const node = originals[item.position];
        const path = valid(item.image);
        if (path && node.getAttribute('src').split('?')[0] !== path) node.src = path;
        if (typeof item.alt === 'string') node.alt = item.alt;
      }
      originals.forEach((node, i) => { if (!used.has(i)) { const figure = node.closest('figure'); if (figure) figure.hidden = true; else node.hidden = true; } });
      const extra = gallery.filter(item => !Number.isInteger(item.position) && valid(item.image));
      if (extra.length) {
        const section = document.createElement('section'); section.className = 'section';
        const grid = document.createElement('div'); grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:24px';
        for (const item of extra) { const figure = document.createElement('figure'); figure.style.margin = '0'; const photo = document.createElement('img'); photo.src = valid(item.image); photo.alt = item.alt || ''; photo.loading = 'lazy'; photo.style.cssText = 'display:block;width:100%;height:auto'; figure.append(photo); grid.append(figure); }
        section.append(grid); const main = document.querySelector('main'); const cta = main.querySelector('.commission'); main.insertBefore(section, cta || null);
      }
    }
  } catch (error) { console.warn('Project content could not be loaded; original content remains.', error); }
})();
