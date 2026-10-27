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
      img.src = path; img.alt = project.image_alt || '';
    }
  } catch (error) { console.warn('Project content could not be loaded; original content remains.', error); }
})();
