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
    for (const [id, value] of [['title', project.title], ['location', project.metadata], ['type', project.type], ['description', project.description]]) document.getElementById(id).textContent = value || '';
    const path = (project.image || '').replace(/^\/+/, '');
    if (/^images\/[a-zA-Z0-9._/ -]+$/.test(path) && !path.split('/').includes('..')) {
      const photo = document.getElementById('photo'); photo.src = path; photo.alt = project.image_alt || ''; photo.style.display = 'block';
    }
  } catch { message.textContent = 'This project is temporarily unavailable.'; }
})();
