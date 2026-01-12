(function(){
  const STORAGE_KEY = 'theme_wishlist_items_v1';

  function read() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch(e){ return []; }
  }
  function write(items){ localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
  function has(id){ return read().includes(String(id)); }
  function add(id){ const arr = new Set(read().map(String)); arr.add(String(id)); write(Array.from(arr)); dispatch(); }
  function remove(id){ const arr = read().filter(i => String(i) !== String(id)); write(arr); dispatch(); }
  function toggle(id){ if(has(id)) remove(id); else add(id); }

  function dispatch(){ const evt = new CustomEvent('wishlist:change', {detail: {items: read()}}); window.dispatchEvent(evt); }

  function updateHeaderCount() {
    const countEls = document.querySelectorAll('.wishlist-count-bubble');
    const n = read().length;
    countEls.forEach(el => { el.textContent = n; el.style.display = n ? 'inline-block' : 'none'; });
  }

  function updateCardButtons() {
    document.querySelectorAll('[data-wishlist-btn]').forEach(btn => {
      const id = btn.getAttribute('data-wishlist-id');
      if(has(id)) btn.classList.add('is-wishlisted'); else btn.classList.remove('is-wishlisted');
    });
  }

  function onClick(e){
    const btn = e.target.closest('[data-wishlist-btn]');
    if(!btn) return;
    e.preventDefault();
    const id = btn.getAttribute('data-wishlist-id');
    toggle(id);
  }

  function renderWishlistPage() {
    const container = document.querySelector('.wishlist-list');
    if(!container) return;
    const items = read();
    container.innerHTML = '';
    if(!items.length) {
      container.innerHTML = '<div class="wishlist-empty">Your wishlist is empty.</div>';
      return;
    }
    // Create simple product links (assumes product URLs are /products/{handle} stored in localStorage as full path or id)
    // We stored product ids; to keep this simple we will attempt to find product links on the page by data-product-id attributes.
    items.forEach(id => {
      const el = document.querySelector(`[data-product-id="${id}"]`) || document.querySelector(`[data-product-id='${id}']`);
      const card = document.createElement('div');
      card.className = 'card-wrapper product-card-wrapper';
      let html = '';
      if(el) {
        const clone = el.cloneNode(true);
        html = clone.outerHTML;
      } else {
        // fallback: link to /products/{id}
        html = `<a href="/products/${id}" class="card">View product</a>`;
      }
      card.innerHTML = html;
      container.appendChild(card);
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    document.body.addEventListener('click', onClick);
    window.addEventListener('wishlist:change', () => { updateHeaderCount(); updateCardButtons(); renderWishlistPage(); });
    updateHeaderCount(); updateCardButtons(); renderWishlistPage();
  });

  // Expose API for other scripts
  window.Wishlist = { read, write, has, add, remove, toggle };
})();