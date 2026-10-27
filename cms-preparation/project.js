(async () => {
  const message = document.getElementById('message');
  try {
    const id = new URLSearchParams(location.search).get('id');
    const response = await fetch('cms-preparation/projects.json', {cache:'no-cache'});
    if (!response.ok) throw new Error('unavailable');
    const data = await response.json();
    const project = data.projects.find(item => (item.id || item.title) === id);
    if (!project) { message.textContent = 'This project could not be found.'; return; }
    document.title = project.title + ' — Scheed Cole';
    for (const [id, value] of [['title', project.page_heading || project.title], ['location', project.metadata], ['type', project.type], ['description', project.page_intro || project.description]]) document.getElementById(id).textContent = value || '';
    const path = (project.page_image || project.image || '').replace(/^\/+/, '');
    if (/^images\/[a-zA-Z0-9._/ -]+$/.test(path) && !path.split('/').includes('..')) {
      const photo = document.getElementById('photo'); photo.src = path; photo.alt = project.page_image_alt || project.image_alt || ''; photo.style.display = 'block';
    }

    if (project.page_story) {
      const story = document.createElement('p'); story.textContent = project.page_story;
      story.style.cssText = 'max-width:760px;font-size:20px;line-height:1.7;white-space:pre-line';
      message.before(story);
    }
    if (Array.isArray(project.page_gallery) && project.page_gallery.length) {
      const section = document.createElement('section'); section.className = 'section';
      const grid = document.createElement('div'); grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:24px';
      for (const item of project.page_gallery) {
        const path = (item.image || '').replace(/^\/+/, '');
        if (!/^images\/[a-zA-Z0-9._/ -]+$/.test(path) || path.split('/').includes('..')) continue;
        const figure = document.createElement('figure'); figure.style.margin = '0';
        const photo = document.createElement('img'); photo.src = path; photo.alt = item.alt || ''; photo.loading = 'lazy'; photo.style.cssText = 'display:block;width:100%;height:auto';
        figure.append(photo); grid.append(figure);
      }
      if (grid.childNodes.length) { section.append(grid); document.querySelector('main').append(section); }
    }
  } catch { message.textContent = 'This project is temporarily unavailable.'; }
})();
