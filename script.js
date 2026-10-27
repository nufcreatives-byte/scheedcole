const primaryNav = document.querySelector('.desktop-nav, .cover-nav');
if (primaryNav && !primaryNav.querySelector('a[href="studio.html"]')) {
  const aboutLink = primaryNav.querySelector('a[href="about.html"]');
  if (aboutLink) {
    const studioLink = document.createElement('a');
    studioLink.href = 'studio.html';
    studioLink.textContent = 'Studio';
    if (location.pathname.endsWith('/studio.html')) studioLink.setAttribute('aria-current', 'page');
    aboutLink.after(studioLink);
  }
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
