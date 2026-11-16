/* Shared project overview: applies to portfolio pages that have not yet been given bespoke tabs. */
(async () => {
  const page = location.pathname.split('/').pop();
  if (!/^project-[a-z0-9-]+\.html$/.test(page)) return;
  const main = document.querySelector('main');
  if (!main || main.querySelector('.project-view-tabs')) return;

  const sections = [...main.children].filter(node => node.tagName === 'SECTION');
  const hero = sections.find(node => node.classList.contains('page-hero'));
  if (!hero) return;
  const pressIndex = sections.findIndex(node => node.classList.contains('press-teaser') || /press/i.test(node.id || '') && node !== hero);
  const commissionIndex = sections.findIndex(node => node.classList.contains('commission'));
  const ending = [pressIndex, commissionIndex].filter(n => n >= 0);
  const limit = ending.length ? Math.min(...ending) : sections.length;
  const bodySections = sections.slice(sections.indexOf(hero) + 1, limit);
  if (!bodySections.length) return;

  const first = bodySections[0];
  const continuation = bodySections.slice(1);
  const hasFullStory = continuation.length > 0;
  const title = hero.querySelector('h1')?.textContent.trim() || 'The project';
  const heroIntro = hero.querySelector('h1 + p')?.textContent.trim() || hero.querySelector('p:last-child')?.textContent.trim() || '';
  let info = {};
  try {
    const resp = await fetch('cms-preparation/projects.json', {cache:'no-cache'});
    if (resp.ok) {
      const data = await resp.json();
      info = data.projects?.find(item => item.project_url === page) || {};
    }
  } catch (_) { /* The page continues to work with its original information. */ }

  const make = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  };
  const section = make('section', 'section shared-project-views');
  section.id = 'project-information';
  section.setAttribute('aria-label', 'Project information');
  const tabs = make('div', 'project-view-tabs');
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', 'Project information');
  const prefix = page.replace(/\.html$/, '');
  const overviewId = prefix + '-overview';
  const storyId = prefix + '-story';
  const firstTab = make('button', '', 'Project Overview');
  firstTab.type = 'button';
  firstTab.id = prefix + '-tab-overview';
  firstTab.setAttribute('role', 'tab');
  firstTab.setAttribute('aria-controls', overviewId);
  firstTab.setAttribute('aria-selected', 'true');
  firstTab.tabIndex = 0;
  tabs.append(firstTab);
  let secondTab;
  if (hasFullStory) {
    secondTab = make('button', '', 'Full Story');
    secondTab.type = 'button';
    secondTab.id = prefix + '-tab-story';
    secondTab.setAttribute('role', 'tab');
    secondTab.setAttribute('aria-controls', storyId);
    secondTab.setAttribute('aria-selected', 'false');
    secondTab.tabIndex = -1;
    tabs.append(secondTab);
  } else {
    tabs.classList.add('single-tab');
    tabs.setAttribute('role', 'group');
    firstTab.removeAttribute('role');
    firstTab.removeAttribute('aria-controls');
    firstTab.removeAttribute('aria-selected');
    firstTab.disabled = true;
  }
  section.append(tabs);

  const overview = make('div', 'shared-project-overview');
  overview.id = overviewId;
  if (hasFullStory) {
    overview.setAttribute('role','tabpanel');
    overview.setAttribute('aria-labelledby',firstTab.id);
    overview.tabIndex = 0;
  }
  overview.append(make('p', 'eyebrow', 'Project details'));
  const heading = make('h2', '', 'The project at a glance.');
  overview.append(heading);
  const facts = make('div','shared-project-facts');
  const addFact = (label, value) => {
    if (!value) return;
    const p = make('p');
    const strong = make('strong','', label + ': ');
    p.append(strong, document.createTextNode(value));
    facts.append(p);
  };
  addFact('Project', info.title || title.replace(/\s+/g, ' '));
  addFact('Location / Year', info.metadata || hero.querySelector('.eyebrow')?.textContent.trim() || '');
  addFact('Type', info.type || '');
  overview.append(facts);
  const description = info.description || heroIntro;
  if (description) overview.append(make('p','shared-project-summary',description));
  section.append(overview);

  if (hasFullStory) {
    const panel = make('div','shared-project-story');
    panel.id = storyId;
    panel.hidden = true;
    panel.setAttribute('role','tabpanel');
    panel.setAttribute('aria-labelledby',secondTab.id);
    panel.tabIndex = 0;
    // Use each project's existing editorial headings instead of a generic repeated title.
    continuation.forEach(node => panel.append(node));
    section.append(panel);
    const select = (tab, focus = false) => {
      const isOverview = tab === firstTab;
      firstTab.setAttribute('aria-selected',String(isOverview));
      firstTab.tabIndex = isOverview ? 0 : -1;
      secondTab.setAttribute('aria-selected',String(!isOverview));
      secondTab.tabIndex = isOverview ? -1 : 0;
      overview.hidden = !isOverview;
      panel.hidden = isOverview;
      if (focus) tab.focus();
    };
    [firstTab,secondTab].forEach((tab,index) => {
      tab.addEventListener('click',() => select(tab));
      tab.addEventListener('keydown',event => {
        if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : (index + 1) % 2;
        select([firstTab,secondTab][next],true);
      });
    });
    const currentTarget = location.hash.slice(1);
    if (currentTarget && document.getElementById(currentTarget) && panel.contains(document.getElementById(currentTarget))) select(secondTab);
  }
  // Keep the introduction photograph visible above the selector. Press and
  // commission sections remain outside both panels, like the Bustamante pilot.
  first.insertAdjacentElement('afterend',section);
  if (hasFullStory && location.hash && document.getElementById(location.hash.slice(1)) && section.contains(document.getElementById(location.hash.slice(1)))) {
    document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }
})();