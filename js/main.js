(function () {
  'use strict';
  const D = window.KimwanyaData;

  // Nav toggle
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const open = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Populate location filter
  const locSelect = document.getElementById('sLocation');
  if (locSelect) {
    const locs = [...new Set(D.getProperties().map(p => p.location))].sort();
    locs.forEach(l => {
      const opt = document.createElement('option');
      opt.value = l; opt.textContent = l;
      locSelect.appendChild(opt);
    });
  }

  // Render helpers
  function sampleBadge(p) {
    return p.sample ? '<span class="card-badge sample">SAMPLE</span>' : '<span class="card-badge">LISTING</span>';
  }

  function propertyCard(p, large) {
    const fav = D.isFavourite(p.id);
    const price = D.formatPrice(p.price);
    const meta = [];
    if (!D.isLand(p) && p.bedrooms) meta.push(p.bedrooms + ' bed');
    if (!D.isLand(p) && p.bathrooms) meta.push(p.bathrooms + ' bath');
    if (p.landSize) meta.push(p.landSize);
    if (p.builtUpArea) meta.push(p.builtUpArea);
    const cls = large ? 'card featured-large' : 'card';
    return `
      <article class="${cls}" data-id="${D.escapeHtml(p.id)}">
        <div class="card-media">
          <img src="${D.escapeHtml(p.images && p.images[0] ? p.images[0] : 'assets/images/img_1.jpg')}" alt="${D.escapeHtml(p.title)}" loading="lazy">
          ${sampleBadge(p)}
        </div>
        <div class="card-body">
          <h3 class="card-title">${D.escapeHtml(p.title)}</h3>
          <p class="card-loc">${D.escapeHtml(p.location)} &middot; ${D.escapeHtml(p.category)}</p>
          <p class="card-price">${D.escapeHtml(price)}${p.transaction === 'For Rent' ? ' / month' : ''}</p>
          <div class="card-meta">${meta.map(m => '<span>' + D.escapeHtml(m) + '</span>').join('')}</div>
          <p class="card-desc">${D.escapeHtml(p.description)}</p>
          <p class="card-ref">Ref: ${D.escapeHtml(p.ref)} &middot; ${D.escapeHtml(p.transaction)} &middot; ${D.escapeHtml(p.availability)}</p>
          <div class="card-actions">
            <a class="btn btn-outline btn-sm" href="property.html?id=${encodeURIComponent(p.id)}">VIEW PROPERTY</a>
            <button class="fav-btn ${fav ? 'active' : ''}" data-fav="${D.escapeHtml(p.id)}" aria-pressed="${fav}">${fav ? 'SAVED' : 'SAVE'}</button>
            <button class="btn btn-outline btn-sm" data-compare="${D.escapeHtml(p.id)}">COMPARE</button>
          </div>
        </div>
      </article>`;
  }

  // State
  let currentFilters = { category: '', transaction: '', location: '', minPrice: '', maxPrice: '', beds: '', ref: '' };
  let currentSort = 'recent';

  function parseFiltersFromForm() {
    currentFilters = {
      category: document.getElementById('sCategory').value,
      transaction: document.getElementById('sTransaction').value,
      location: document.getElementById('sLocation').value,
      minPrice: document.getElementById('sMinPrice').value,
      maxPrice: document.getElementById('sMaxPrice').value,
      beds: document.getElementById('sBeds').value,
      ref: document.getElementById('sRef').value.trim()
    };
  }

  function applyFilters(list) {
    return list.filter(p => {
      if (currentFilters.category && p.category !== currentFilters.category) return false;
      if (currentFilters.transaction && p.transaction !== currentFilters.transaction) return false;
      if (currentFilters.location && p.location !== currentFilters.location) return false;
      if (currentFilters.minPrice && p.price < Number(currentFilters.minPrice)) return false;
      if (currentFilters.maxPrice && p.price > Number(currentFilters.maxPrice)) return false;
      if (currentFilters.beds && !(p.bedrooms >= Number(currentFilters.beds))) return false;
      if (currentFilters.ref && !p.ref.toLowerCase().includes(currentFilters.ref.toLowerCase())) return false;
      return true;
    });
  }

  function applySort(list) {
    const arr = list.slice();
    switch (currentSort) {
      case 'priceAsc': arr.sort((a,b) => a.price - b.price); break;
      case 'priceDesc': arr.sort((a,b) => b.price - a.price); break;
      case 'name': arr.sort((a,b) => a.title.localeCompare(b.title)); break;
      case 'recent': arr.sort((a,b) => new Date(b.dateAdded) - new Date(a.dateAdded)); break;
    }
    return arr;
  }

  function renderGrid() {
    const grid = document.getElementById('propertyGrid');
    if (!grid) return;
    const published = D.publishedProperties();
    const filtered = applySort(applyFilters(published));
    const countEl = document.getElementById('resultsCount');
    if (countEl) countEl.textContent = filtered.length + ' matching sample listing' + (filtered.length === 1 ? '' : 's') + '.';
    const empty = document.getElementById('emptyState');
    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    // editorial: first featured large
    let html = '';
    filtered.forEach((p, i) => {
      const large = i === 0 && p.featured;
      html += propertyCard(p, large);
    });
    grid.innerHTML = html;
    attachCardEvents(grid);
  }

  function renderLand() {
    const el = document.getElementById('landGrid');
    if (!el) return;
    const items = D.publishedProperties().filter(p => p.category === 'Land & Plots');
    el.innerHTML = items.map(p => `
      <article class="land-card card">
        <div class="card-media">
          <img src="${D.escapeHtml(p.images && p.images[0] ? p.images[0] : 'assets/images/img_1.jpg')}" alt="${D.escapeHtml(p.title)}" loading="lazy">
          <span class="card-badge sample">SAMPLE</span>
        </div>
        <div class="card-body">
          <h3 class="card-title">${D.escapeHtml(p.title)}</h3>
          <p class="card-loc">${D.escapeHtml(p.location)}</p>
          <p class="card-price">${D.escapeHtml(D.formatPrice(p.price))}</p>
          <p class="card-desc">${D.escapeHtml(p.description)}</p>
          <p class="card-ref">Ref: ${D.escapeHtml(p.ref)}</p>
          <div class="card-actions">
            <a class="btn btn-outline btn-sm" href="property.html?id=${encodeURIComponent(p.id)}">VIEW PROPERTY</a>
            <a class="btn btn-primary btn-sm" href="property.html?id=${encodeURIComponent(p.id)}#enquiry">ENQUIRE</a>
          </div>
        </div>
        <dl class="land-specs">
          <div><dt>Plot size</dt><dd>${D.escapeHtml(p.landSize || '—')}</dd></div>
          <div><dt>Location</dt><dd>${D.escapeHtml(p.location)}</dd></div>
          <div><dt>Status</dt><dd>${D.escapeHtml(p.availability)}</dd></div>
          <div><dt>Reference</dt><dd>${D.escapeHtml(p.ref)}</dd></div>
        </dl>
      </article>`).join('');
    attachCardEvents(el);
  }

  function renderRentals() {
    const el = document.getElementById('rentalGrid');
    if (!el) return;
    const items = D.publishedProperties().filter(p => p.transaction === 'For Rent');
    el.innerHTML = items.map(p => {
      const meta = [];
      if (p.bedrooms) meta.push(p.bedrooms + ' bed');
      if (p.bathrooms) meta.push(p.bathrooms + ' bath');
      if (p.builtUpArea) meta.push(p.builtUpArea);
      return `
      <article class="card">
        <div class="card-media">
          <img src="${D.escapeHtml(p.images && p.images[0] ? p.images[0] : 'assets/images/img_1.jpg')}" alt="${D.escapeHtml(p.title)}" loading="lazy">
          <span class="card-badge sample">SAMPLE</span>
        </div>
        <div class="card-body">
          <h3 class="card-title">${D.escapeHtml(p.title)}</h3>
          <p class="card-loc">${D.escapeHtml(p.location)} &middot; ${D.escapeHtml(p.category)}</p>
          <p class="card-price">${D.escapeHtml(D.formatPrice(p.price))} / month</p>
          <div class="card-meta">${meta.map(m => '<span>' + D.escapeHtml(m) + '</span>').join('')}</div>
          <p class="card-desc">${D.escapeHtml(p.description)}</p>
          <p class="card-ref">Ref: ${D.escapeHtml(p.ref)} &middot; ${D.escapeHtml(p.availability)}</p>
          <div class="card-actions">
            <a class="btn btn-outline btn-sm" href="property.html?id=${encodeURIComponent(p.id)}">VIEW PROPERTY</a>
            <button class="fav-btn ${D.isFavourite(p.id) ? 'active' : ''}" data-fav="${D.escapeHtml(p.id)}">${D.isFavourite(p.id) ? 'SAVED' : 'SAVE'}</button>
          </div>
        </div>
      </article>`;
    }).join('');
    attachCardEvents(el);
  }

  function attachCardEvents(root) {
    root.querySelectorAll('[data-fav]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-fav');
        const added = D.toggleFavourite(id);
        btn.classList.toggle('active', added);
        btn.textContent = added ? 'SAVED' : 'SAVE';
        btn.setAttribute('aria-pressed', String(added));
        showToast(added ? 'Saved to favourites' : 'Removed from favourites');
      });
    });
    root.querySelectorAll('[data-compare]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-compare');
        const res = D.toggleComparison(id);
        if (res.reason === 'limit') { showToast('You can compare up to 3 properties'); return; }
        showToast(res.added ? 'Added to comparison' : 'Removed from comparison');
        renderCompare();
      });
    });
  }

  function renderCompare() {
    const bar = document.getElementById('compareBar');
    const wrap = document.getElementById('compareTableWrap');
    if (!bar || !wrap) return;
    const ids = D.getComparison();
    const props = ids.map(id => D.getPropertyById(id)).filter(Boolean);
    bar.innerHTML = props.map(p => `
      <span class="compare-chip">${D.escapeHtml(p.title)} <button data-remove-compare="${D.escapeHtml(p.id)}" aria-label="Remove">&times;</button></span>`).join('');
    bar.querySelectorAll('[data-remove-compare]').forEach(b => {
      b.addEventListener('click', () => {
        D.toggleComparison(b.getAttribute('data-remove-compare'));
        renderCompare();
      });
    });
    if (props.length === 0) { wrap.innerHTML = '<p class="note">No properties selected for comparison.</p>'; return; }
    const fields = [
      ['Reference', p => p.ref],
      ['Price', p => D.formatPrice(p.price) + (p.transaction === 'For Rent' ? ' / month' : '')],
      ['Location', p => p.location],
      ['Category', p => p.category],
      ['Transaction', p => p.transaction],
      ['Bedrooms', p => D.isLand(p) ? '—' : (p.bedrooms || '—')],
      ['Bathrooms', p => D.isLand(p) ? '—' : (p.bathrooms || '—')],
      ['Land size', p => p.landSize || '—'],
      ['Built-up area', p => p.builtUpArea || '—'],
      ['Availability', p => p.availability],
      ['Sample listing', p => p.sample ? 'Yes (illustrative)' : 'No']
    ];
    let html = '<table class="compare-table"><thead><tr><th>Attribute</th>';
    props.forEach(p => { html += '<th>' + D.escapeHtml(p.title) + '</th>'; });
    html += '</tr></thead><tbody>';
    fields.forEach(([label, fn]) => {
      html += '<tr><td>' + D.escapeHtml(label) + '</td>';
      props.forEach(p => { html += '<td>' + D.escapeHtml(fn(p)) + '</td>'; });
      html += '</tr>';
    });
    html += '</tbody></table>';
    wrap.innerHTML = html;
  }

  // Search form
  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      parseFiltersFromForm();
      renderGrid();
      document.getElementById('listings').scrollIntoView({ behavior: 'smooth' });
    });
  }
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      searchForm.reset();
      currentFilters = { category: '', transaction: '', location: '', minPrice: '', maxPrice: '', beds: '', ref: '' };
      renderGrid();
    });
  }
  const emptyReset = document.getElementById('emptyReset');
  if (emptyReset) emptyReset.addEventListener('click', () => {
    if (searchForm) searchForm.reset();
    currentFilters = { category: '', transaction: '', location: '', minPrice: '', maxPrice: '', beds: '', ref: '' };
    renderGrid();
  });

  // Sort
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => { currentSort = sortSelect.value; renderGrid(); });
  }

  // Contact form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('cName').value.trim();
      const phone = document.getElementById('cPhone').value.trim();
      const email = document.getElementById('cEmail').value.trim();
      const method = document.getElementById('cMethod').value;
      const message = document.getElementById('cMessage').value.trim();
      const fb = document.getElementById('contactFeedback');
      const btn = document.getElementById('contactSubmit');
      if (!name || !phone || !message) {
        fb.textContent = 'Please fill in all required fields.';
        fb.className = 'form-feedback error';
        return;
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        fb.textContent = 'Please enter a valid email address.';
        fb.className = 'form-feedback error';
        return;
      }
      btn.disabled = true;
      setTimeout(() => {
        const enq = { name, phone, email, method, message, propertyRef: 'General enquiry', source: 'contact' };
        D.addEnquiry(enq);
        contactForm.reset();
        fb.textContent = 'Your enquiry has been saved in this demonstration. It has not been delivered to Kimwanya Enterprises.';
        fb.className = 'form-feedback success';
        btn.disabled = false;
      }, 400);
    });
  }

  // Lightbox (generic)
  const lb = document.getElementById('lightbox');
  if (lb) {
    const lbImg = document.getElementById('lbImg');
    const lbClose = document.getElementById('lbClose');
    const lbPrev = document.getElementById('lbPrev');
    const lbNext = document.getElementById('lbNext');
    let lbImages = []; let lbIndex = 0;
    window.openLightbox = function (images, index) {
      lbImages = images; lbIndex = index || 0;
      lbImg.src = lbImages[lbIndex];
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
    };
    function lbShow(i) {
      lbIndex = (i + lbImages.length) % lbImages.length;
      lbImg.src = lbImages[lbIndex];
    }
    if (lbClose) lbClose.addEventListener('click', () => { lb.hidden = true; document.body.style.overflow = ''; });
    if (lbPrev) lbPrev.addEventListener('click', () => lbShow(lbIndex - 1));
    if (lbNext) lbNext.addEventListener('click', () => lbShow(lbIndex + 1));
    lb.addEventListener('click', (e) => { if (e.target === lb) { lb.hidden = true; document.body.style.overflow = ''; } });
    document.addEventListener('keydown', (e) => {
      if (lb.hidden) return;
      if (e.key === 'Escape') { lb.hidden = true; document.body.style.overflow = ''; }
      if (e.key === 'ArrowLeft') lbShow(lbIndex - 1);
      if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
    });
  }

  // Toast
  function showToast(msg) {
    let t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.style.cssText = 'position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#1F2A24;color:#F4F1EA;padding:.7rem 1.2rem;font-size:.85rem;z-index:200;box-shadow:0 4px 14px rgba(0,0,0,.2);opacity:0;transition:opacity .2s;';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.opacity = '0'; }, 2200);
  }
  window.showToast = showToast;

  // Apply content from storage
  function applyContent() {
    const c = D.getContent();
    const heroH = document.getElementById('heroHeadline');
    const heroD = document.getElementById('heroDesc');
    if (heroH) heroH.textContent = c.heroHeadline;
    if (heroD) heroD.textContent = c.heroDesc;
    const aboutT = document.getElementById('aboutTitle');
    const aboutX = document.getElementById('aboutText');
    if (aboutT) aboutT.textContent = c.aboutTitle;
    if (aboutX) aboutX.textContent = c.aboutText;
    const contactX = document.getElementById('contactText');
    if (contactX) contactX.textContent = c.contactText;
    const footerX = document.getElementById('footerText');
    if (footerX) footerX.textContent = c.footerText;
    const ann = document.getElementById('announceBar');
    if (ann) ann.textContent = c.announce;
    const settings = D.getSettings();
    const nameEl = document.querySelector('.brand-name');
    // keep brand name fixed
  }
  applyContent();

  // Sync across tabs
  window.addEventListener('storage', (e) => {
    if (e.key === 'kimwanya_broadcast') {
      renderGrid(); renderLand(); renderRentals(); renderCompare(); applyContent();
    }
    if (e.key === D.STORAGE.favourites) { renderGrid(); renderRentals(); }
  });

  // Initial render
  renderGrid();
  renderLand();
  renderRentals();
  renderCompare();
})();
