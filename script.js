const primaryNav = document.querySelector('.desktop-nav, .cover-nav');
if (primaryNav) {
  const current = location.pathname.split('/').pop() || 'index.html';
  const links = [["Work","work.html"],["About","about.html"],["Studio","studio.html"],["Services","services.html"],["Press","press.html"],["Contact","start-a-project.html"],["Shop","shop.html"]];
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
  const candidates = () => [...document.querySelectorAll('main img')].filter(img => img.closest('figure') && !img.hidden && !img.closest('[hidden]') && img.getAttribute('src'));
  const show = value => {
    index = (value + images.length) % images.length;
    const source = images[index];
    photo.src = source.currentSrc || source.src; photo.alt = source.alt || '';
    caption.textContent = (index + 1) + ' / ' + images.length + (source.alt ? ' — ' + source.alt : '');
    prev.hidden = next.hidden = images.length < 2;
    const preload = new Image(); preload.src = images[(index + 1) % images.length].src;
  };
  const open = img => {
    images = candidates(); index = images.indexOf(img); if (index < 0) return;
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
  const enhance = () => candidates().forEach(img => {
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
  enhance();
  const main = document.querySelector('main');
  if (main) new MutationObserver(enhance).observe(main,{childList:true,subtree:true});
})();
