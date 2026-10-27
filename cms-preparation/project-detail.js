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
    if (heading && project.page_heading && normalized(heading.innerText) !== normalized(project.page_heading)) heading.textContent = project.page_heading;
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
        if (node && typeof item.text === 'string' && normalized(node.textContent) !== normalized(item.text)) node.textContent = item.text;
      }
    }
    if (Array.isArray(project.page_gallery)) {
      const originals = [...document.querySelectorAll('main img')].slice(1);
      const used = new Set();
      const valid = value => { const p = (value || '').replace(/^\/+/, ''); return /^images\/[a-zA-Z0-9._/ -]+$/.test(p) && !p.split('/').includes('..') ? p : ''; };
      for (const item of project.page_gallery) {
        if (!Number.isInteger(item.position) || !originals[item.position]) continue;
        used.add(item.position);
        const node = originals[item.position];
        const path = valid(item.image);
        if (path && node.getAttribute('src').split('?')[0] !== path) node.src = path;
        if (typeof item.alt === 'string') node.alt = item.alt;
      }
      originals.forEach((node, i) => { if (!used.has(i)) { const figure = node.closest('figure'); if (figure) figure.hidden = true; else node.hidden = true; } });
      const extra = project.page_gallery.filter(item => !Number.isInteger(item.position) && valid(item.image));
      if (extra.length) {
        const section = document.createElement('section'); section.className = 'section';
        const grid = document.createElement('div'); grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:24px';
        for (const item of extra) { const figure = document.createElement('figure'); figure.style.margin = '0'; const photo = document.createElement('img'); photo.src = valid(item.image); photo.alt = item.alt || ''; photo.loading = 'lazy'; photo.style.cssText = 'display:block;width:100%;height:auto'; figure.append(photo); grid.append(figure); }
        section.append(grid); document.querySelector('main').append(section);
      }
    }
  } catch (error) { console.warn('Project content could not be loaded; original content remains.', error); }
})();
