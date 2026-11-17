if (/^project-/.test(location.pathname.split('/').pop() || '')) {
 document.documentElement.classList.add('project-detail');
 document.querySelectorAll('link[rel="stylesheet"]').forEach(link => { const url = new URL(link.href); if (url.origin === location.origin && url.pathname.endsWith('/styles.css')) { url.searchParams.set('v','next-work-nav-1'); link.href = url.href; } });
}
// Subtle next-project navigation, following the public Work portfolio order.
(function addNextWorkNavigation() {
  const order = [
    'project-together-we-rise.html',
    'project-doctor-bird.html',
    'project-sintra-bronte.html',
    'project-usain-bolt.html',
    'project-bob-marley.html',
    'project-wallabee.html',
    'project-marine-installation.html',
    'project-swing-a-ling.html',
    'project-jamaica-bobsleigh.html',
    'project-pf-changs-horse.html',
    'project-miss-lou.html',
    'project-first-union-horses.html',
    'project-york-town-playground.html',
    'project-hellshire-beach.html',
    'project-falmouth-jam-iconic-experience.html',
    'project-sir-alexander-bustamante.html',
    'project-legends-circle.html',
    'project-natural-history-museum.html',
    'project-port-authority.html',
    'project-heritage-mall-elephant.html',
    'project-selected-archive.html'
  ];
  const current = location.pathname.split('/').pop();
  const index = order.indexOf(current);
  const hero = document.querySelector('main > .page-hero');
  if (index === -1 || !hero || hero.querySelector('.next-work-top')) return;
  const a = document.createElement('a');
  a.className = 'next-work-top';
  a.href = order[(index + 1) % order.length];
  a.setAttribute('aria-label', 'Next work');
  a.innerHTML = '<span>Next Work</span><svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true" focusable="false"><path d="M3 10h13m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  hero.append(a);
})();

// Keep the footer navigation label consistent with Next Work above.
document.querySelectorAll('.project-footer .next-project-link').forEach(link => {
  const label = Array.from(link.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
  if (label) label.textContent = 'Next Work';
  else link.insertBefore(document.createTextNode('Next Work'), link.firstChild);
  link.setAttribute('aria-label', 'Next Work');
});

// Match every existing project's press coverage layout to Together We Rise.
(function standardizeProjectPress() {
  if (!/^project-[a-z0-9-]+\.html$/.test(location.pathname.split('/').pop())) return;
  const press = document.querySelector('main > section.press-teaser, main > section#project-press');
  if (!press) return;
  press.classList.add('press-teaser', 'project-press-consistent');
  press.removeAttribute('style');
  press.id ||= 'in-the-press';
  const heading = press.querySelector(':scope > .section-heading');
  if (!heading) return;
  const eyebrow = heading.querySelector('.eyebrow');
  if (eyebrow) eyebrow.textContent = 'In the press';
  const title = heading.querySelector('h2');
  const page = location.pathname.split('/').pop();
  if (title && page === 'project-sir-alexander-bustamante.html') title.innerHTML = 'Honouring a<br><em>national legacy.</em>';
  if (title && page === 'project-falmouth-jam-iconic-experience.html') title.innerHTML = 'A landmark<br><em>for Falmouth.</em>';
  const arrow = () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 20 20');
    svg.setAttribute('class', 'project-cta-arrow');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.5');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M4 16 16 4M5 4h11v11');
    svg.append(path);
    return svg;
  };
  // Existing dedicated project press destinations are retained.
  let more = heading.querySelector(':scope > a[href]');
  if (!more) {
    const earlier = Array.from(press.querySelectorAll('a[href]')).find(a => /explore all press|view all press/i.test(a.textContent));
    more = document.createElement('a');
    more.href = earlier?.getAttribute('href') || 'press.html';
    more.className = 'text-link';
    more.textContent = 'View All Press';
    more.append(arrow());
    heading.append(more);
    if (earlier) earlier.closest('p')?.remove();
  } else {
    more.textContent = 'View All Press';
    more.append(arrow());
  }
  // Legacy Bustamante and Falmouth article cards become the same compact list as TWR.
  const cards = Array.from(press.querySelectorAll('a.press-card'));
  const mini = press.querySelector('.press-mini');
  const direct = !cards.length && !mini && !press.querySelector('ul')
    ? Array.from(press.querySelectorAll(':scope > a[href]')).filter(a => a !== more && /^https?:/.test(a.href))
    : [];
  const list = press.querySelector(':scope > ul') || document.createElement('ul');
  list.classList.add('project-press-list');
  const createItem = (label, headline, link) => {
    const li = document.createElement('li');
    const meta = document.createElement('p'); meta.className = 'eyebrow'; meta.textContent = label;
    const a = document.createElement('a'); a.className = 'text-link';
    a.href = link.getAttribute('href');
    if (link.target) a.target = link.target;
    if (link.rel) a.rel = link.rel;
    a.textContent = headline;
    a.append(arrow());
    li.append(meta, a);
    list.append(li);
  };
  for (const card of cards) {
    createItem(card.querySelector('span')?.textContent.trim() || '', card.querySelector('h2')?.textContent.trim() || card.textContent.trim(), card);
    card.remove();
  }
  if (mini) {
    const a = mini.querySelector('a[href]');
    const paragraphs = Array.from(mini.querySelectorAll(':scope > p'));
    if (a) createItem(paragraphs[0]?.textContent.trim() || '', a.textContent.trim(), a);
    const note = paragraphs.length > 1 ? paragraphs.slice(1).map(p => p.textContent.trim()).filter(Boolean) : [];
    if (note.length) {
      const annotation = document.createElement('p');
      annotation.className = 'project-press-note';
      annotation.textContent = note.join(' ');
      press.append(annotation);
    }
    mini.remove();
  }
  for (const a of direct) {
    const preceding = a.previousElementSibling;
    createItem(preceding?.matches('.eyebrow') ? preceding.textContent.trim() : '', a.textContent.trim().replace(/\s*↗\s*$/, ''), a);
    if (preceding?.matches('.eyebrow')) preceding.remove();
    a.remove();
  }
  if (list.children.length && !list.parentElement) press.append(list);
  if (list.children.length) {
    const intro = Array.from(press.children).find(e => e.tagName === 'P' && !e.classList.contains('eyebrow') && !e.classList.contains('project-press-note'));
    if (!intro) {
      const p = document.createElement('p');
      p.className = 'project-press-intro';
      p.textContent = 'Selected articles and interviews related to this project.';
      heading.after(p);
    } else {
      intro.classList.add('project-press-intro');
    }
  }
})();

const primaryNav = document.querySelector('.desktop-nav, .cover-nav');
if (primaryNav) {
  const current = location.pathname.split('/').pop() || 'index.html';
  const links = [["Work","work.html"],["About","about.html"],["Studio","studio.html"],["Services","services.html"],["Press","press.html"],["Contact","start-a-project.html"]];
  primaryNav.replaceChildren(...links.map(([label, href]) => {
    const link = document.createElement('a'); link.href = href; link.textContent = label;
    if (href === current) link.setAttribute('aria-current', 'page');
    return link;
  }));
}

const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('visible'));
}

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.desktop-nav, .cover-nav');

if (menuButton && nav) {
  nav.id ||= 'primary-navigation';
  menuButton.setAttribute('aria-controls', nav.id);
  const setMenuOpen = (open) => {
    document.body.classList.toggle('menu-open', open);
    nav.classList.toggle('mobile-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menuButton.textContent = open ? 'Close' : 'Menu';
  };
  menuButton.addEventListener('click', () => {
    setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenuOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(false);
      menuButton.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target) && !menuButton.contains(event.target)) setMenuOpen(false);
  });
  window.matchMedia('(max-width: 800px)').addEventListener('change', () => setMenuOpen(false));
  setMenuOpen(false);
}

const projectForm = document.getElementById('project-form');
if (projectForm) projectForm.addEventListener('submit', event => {
  event.preventDefault();
  const values = [...projectForm.querySelectorAll('label')].map(label => {
    const field = label.querySelector('input, select, textarea');
    const name = label.childNodes[0]?.textContent.trim() || 'Details';
    return field && field.value.trim() ? name + ': ' + field.value.trim() : '';
  }).filter(Boolean).join('\n\n');
  location.href = 'mailto:scheedcole@gmail.com?subject=' + encodeURIComponent('Project enquiry') + '&body=' + encodeURIComponent(values);
});

/* Full-screen project galleries, including images added through the CMS. */
(() => {
  if (!/^project-(?!view)/.test(location.pathname.split('/').pop() || '') && !location.pathname.endsWith('/project-view.html')) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'photo-viewer';
  dialog.setAttribute('aria-label', 'Project photo gallery');
  const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m14 5-7 7 7 7"/></svg>';
  dialog.innerHTML = '<button class="photo-close" type="button" aria-label="Close gallery">×</button><button class="photo-prev" type="button" aria-label="Previous photo">'+arrow+'</button><figure><img alt=""><figcaption aria-live="polite"></figcaption></figure><button class="photo-next" type="button" aria-label="Next photo">'+arrow+'</button>';
  document.body.append(dialog);
  const photo = dialog.querySelector('img'), caption = dialog.querySelector('figcaption');
  const prev = dialog.querySelector('.photo-prev'), next = dialog.querySelector('.photo-next');
  let images = [], index = 0, trigger, oldOverflow;
  const candidates = () => [...document.querySelectorAll('main img')].filter(img => !img.hidden && !img.closest('[hidden]') && img.getAttribute('src'));
  const show = value => {
    index = (value + images.length) % images.length;
    const source = images[index];
    photo.src = source.currentSrc || source.src; photo.alt = source.alt || '';
    caption.textContent = (index + 1) + ' / ' + images.length + (source.alt ? ' — ' + source.alt : '');
    prev.hidden = next.hidden = images.length < 2;
    const preload = new Image(); preload.src = images[(index + 1) % images.length].src;
  };
  const open = img => {
    // Keep Doctor Bird's two editorial photographs together when navigating the viewer.
    const birdGallery = img.closest('.doctor-bird-process-gallery');
    images = birdGallery ? candidates().filter(candidate => birdGallery.contains(candidate)) : candidates();
    index = images.indexOf(img); if (index < 0) return;
    trigger = document.activeElement; oldOverflow = document.body.style.overflow;
    show(index); dialog.showModal(); document.body.style.overflow = 'hidden';
    dialog.querySelector('.photo-close').focus();
  };
  const close = () => dialog.close();
  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  dialog.querySelector('.photo-close').addEventListener('click', close);
  dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
  dialog.addEventListener('close', () => { document.body.style.overflow = oldOverflow || ''; trigger?.focus(); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
  });
  let startX = 0, startY = 0;
  dialog.addEventListener('touchstart', event => { startX = event.changedTouches[0].clientX; startY = event.changedTouches[0].clientY; }, {passive:true});
  dialog.addEventListener('touchend', event => {
    const dx = event.changedTouches[0].clientX - startX, dy = event.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(index + (dx < 0 ? 1 : -1));
  }, {passive:true});
  const enhance = () => {
    document.querySelectorAll('main div').forEach(grid => {
      if ([...grid.children].filter(child => child.tagName === 'FIGURE' && child.querySelector('img')).length > 1) grid.classList.add('project-photo-grid');
    });
    candidates().forEach(img => {
    if (img.dataset.photoViewer) return;
    img.dataset.photoViewer = 'true'; img.style.cursor = 'zoom-in';
    const anchor = img.closest('a');
    if (anchor) {
      anchor.setAttribute('aria-haspopup','dialog');
      anchor.addEventListener('click', event => { event.preventDefault(); open(img); });
    } else {
      img.tabIndex = 0; img.setAttribute('role','button'); img.setAttribute('aria-haspopup','dialog');
      img.setAttribute('aria-label','Open photo: ' + (img.alt || 'Project photograph'));
      img.addEventListener('click', () => open(img));
      img.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(img); } });
    }
  });
  };
  enhance();
  const main = document.querySelector('main');
  if (main) new MutationObserver(enhance).observe(main,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
})();
