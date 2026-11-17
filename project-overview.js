/* Shared project overview: applies to portfolio pages that have not yet been given bespoke tabs. */
(async () => {
  if (window.projectContentReady) await window.projectContentReady;
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
  // Keep the opening brief; supporting prose belongs to the optional story.
  const introCopy = first.querySelector('.sustainability-copy');
  const extraParagraphs = introCopy ? [...introCopy.children].filter(node => node.matches('p:not(.eyebrow)')).slice(1) : [];
  if (extraParagraphs.length) {
    const reading = document.createElement('div');
    reading.className = 'shared-project-summary';
    extraParagraphs.forEach(node => reading.append(node));
    continuation.unshift(reading);
  }
  const hasFullStory = continuation.length > 0;
  // A concise project needs no empty or disabled navigation.
  if (!hasFullStory) return;
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
  const heading = make('h2');
  heading.append(document.createTextNode('The project'), make('br'), make('em', '', 'at a glance.'));
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
  const authoredFacts = document.getElementById('project-overview-facts');
  if (authoredFacts?.content) facts.replaceChildren(authoredFacts.content.cloneNode(true));
  overview.append(facts);
  section.append(overview);

  if (hasFullStory) {
    const panel = make('div','shared-project-story');
    panel.id = storyId;
    panel.hidden = true;
    panel.setAttribute('role','tabpanel');
    panel.setAttribute('aria-labelledby',secondTab.id);
    panel.tabIndex = 0;
    // A single common section label, followed by the project's existing editorial headings.
    const storyLead = make('div', 'shared-project-story-lead');
    storyLead.append(make('p', 'eyebrow', 'Project story'));
    const storyTitle = make('h2');
    storyTitle.append(document.createTextNode('Behind'), make('br'), make('em', '', 'the work.'));
    storyLead.append(storyTitle);
    panel.append(storyLead);
    continuation.forEach(node => panel.append(node));
    // Name the optional long read by its subject, beneath one shared story heading.
    for (const details of panel.querySelectorAll('details.behind-work')) {
      const label = details.querySelector('summary span:first-child');
      if (label) label.textContent = ['project-doctor-bird.html','project-natural-history-museum.html','project-wallabee.html','project-national-heroes-parade.html'].includes(page) ? 'Explore the process' : 'Read more';
      const heading = details.closest('.behind-work-section')?.querySelector('.behind-work-heading');
      if (heading) heading.textContent = ({"project-doctor-bird.html":"Design & construction","project-natural-history-museum.html":"Research & making","project-wallabee.html":"Culture & craftsmanship","project-swing-a-ling.html":"Historical context","project-bob-marley.html":"The portrait commissions","project-legends-circle.html":"The collection","project-national-heroes-parade.html":"Making the portraits","project-pf-changs-horse.html":"The commission","project-selected-archive.html":"Studio archive","project-sintra-bronte.html":"The original campaign","project-usain-bolt.html":"International presentation"})[page] || 'Project context';
    }
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