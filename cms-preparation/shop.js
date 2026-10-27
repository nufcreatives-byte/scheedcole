(async () => {
  const grid = document.getElementById('shop-products');
  const empty = document.getElementById('shop-empty');
  const count = document.getElementById('shop-count');
  try {
    const response = await fetch('cms-preparation/shop.json', {cache:'no-cache'});
    if (!response.ok) throw new Error('Content unavailable');
    const data = await response.json();
    const products = (Array.isArray(data.products) ? data.products : []).filter(p => {
      const path = (p.image || '').replace(/^\/+/, '');
      return p.active === true && p.name && path.startsWith('images/') && !path.split('/').includes('..');
    });
    if (!products.length) return;
    empty.hidden = true;
    count.textContent = products.length + (products.length === 1 ? ' item' : ' items');
    for (const p of products) {
      const card = document.createElement('article'); card.className = 'shop-card';
      const image = document.createElement('img'); image.src = p.image.replace(/^\/+/, ''); image.alt = p.image_alt || p.name; image.loading = 'lazy'; card.append(image);
      const title = document.createElement('h2'); title.textContent = p.name; card.append(title);
      for (const [value, cls] of [[p.price, 'shop-price'], [p.description, 'shop-description']]) {
        if (value) { const node = document.createElement('p'); node.className = cls; node.textContent = value; card.append(node); }
      }
      try {
        const url = new URL(p.payment_url);
        if (url.protocol === 'https:' && (url.hostname === 'paypal.com' || url.hostname.endsWith('.paypal.com') || url.hostname === 'paypal.me')) {
          const link = document.createElement('a'); link.className = 'text-link'; link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Buy with PayPal ';
          const icon = document.querySelector('.project-cta-arrow'); if (icon) link.append(icon.cloneNode(true)); card.append(link);
        }
      } catch {}
      grid.append(card);
    }
  } catch (error) { console.warn('Shop content unavailable', error); }
})();
