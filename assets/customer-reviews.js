document.addEventListener('DOMContentLoaded', () => {
  function renderReviews(container, reviews) {
    const list = container.querySelector('.customer-reviews__list');
    list.innerHTML = '';
    if (!Array.isArray(reviews) || reviews.length === 0) {
      list.innerHTML = '<div class="customer-reviews__empty">No reviews available yet.</div>';
      return;
    }
    reviews.forEach(r => {
      const card = document.createElement('div');
      card.className = 'customer-reviews__card';
      const meta = document.createElement('div'); meta.className = 'customer-reviews__meta';
      const name = r.name ? r.name : 'Anonymous';
      const date = r.date ? ' • ' + r.date : '';
      meta.innerHTML = `<span class="customer-reviews__rating">${'★'.repeat(Math.max(0, Math.min(5, Math.round(r.rating || 0))))}</span><strong>${name}</strong>${date}`;
      const text = document.createElement('div'); text.className = 'customer-reviews__text'; text.textContent = r.text || '';
      card.appendChild(meta); card.appendChild(text);
      list.appendChild(card);
    });
  }

  document.querySelectorAll('.customer-reviews').forEach(section => {
    const endpoint = section.dataset.endpoint || '';
    const productId = section.dataset.productId;
    const list = section.querySelector('.customer-reviews__list');

    if (!endpoint) {
      // no remote endpoint configured — leave placeholder (optionally extend to render metafields)
      return;
    }

    // Append product_id param if not present
    const url = new URL(endpoint, window.location.origin);
    if (productId && !url.searchParams.has('product_id')) url.searchParams.set('product_id', productId);

    fetch(url.toString(), { credentials: 'same-origin' })
      .then(r => r.json())
      .then(data => {
        // if endpoint returns an object with `reviews` property, accept that
        const reviews = Array.isArray(data) ? data : (Array.isArray(data.reviews) ? data.reviews : []);
        renderReviews(section, reviews);
      })
      .catch(() => {
        list.innerHTML = '<div class="customer-reviews__empty">Unable to load reviews.</div>';
      });
  });
});
