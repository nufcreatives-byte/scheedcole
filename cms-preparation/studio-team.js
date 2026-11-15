(() => {
  const gallery = document.querySelector('[data-team-photos]');
  if (!gallery) return;
  const original = gallery.querySelector('img');
  const family = gallery.querySelector('.studio-family-photo');
  const caption = gallery.parentElement.querySelector('figcaption');
  const show = (index) => {
    family.hidden = index === 0;
    original.style.visibility = index === 0 ? '' : 'hidden';
    original.setAttribute('aria-hidden', String(index !== 0));
    caption.style.visibility = index === 0 ? '' : 'hidden';
  };
  show(0);
  window.addEventListener('pageshow', () => show(0));
  const toggle = () => show(family.hidden ? 1 : 0);
  gallery.querySelectorAll('button').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', toggle);
    button.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        toggle();
      }
    });
  });
  let start;
  gallery.addEventListener('touchstart', event => {
    start = event.touches.length === 1
      ? {x: event.touches[0].clientX, y: event.touches[0].clientY} : null;
  }, {passive: true});
  gallery.addEventListener('touchend', event => {
    if (!start || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    start = null;
    if (Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy)) toggle();
  }, {passive: true});
  gallery.addEventListener('touchcancel', () => { start = null; }, {passive: true});
})();
