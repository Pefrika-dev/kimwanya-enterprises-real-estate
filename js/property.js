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

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const content = document.getElementById('propertyContent');
  const notFound = document.getElementById('propertyNotFound');
  const p = id ? D.getPropertyById(id) : null;

  if (!p) {
    if (notFound) notFound.hidden = false;
    return;
  }

  document.getElementById('bcTitle').textContent = p.title;
  document.title = p.title + ' | Kimwanya Enterprises';

  const images = (p.images && p.images.length) ? p.images : ['assets/images/img_1.jpg'];
  let currentImg = 0;

  const specs = [];
  if (!D.isLand(p) && p.bedrooms) specs.push({ label: 'Bedrooms', value: p.bedrooms });
  if (!D.isLand(p) && p.bathrooms) specs.push({ label: 'Bathrooms', value: p.bathrooms });
  if (p.landSize) specs.push({ label: 'Land area', value: p.landSize });
  if (p.builtUpArea) specs.push({ label: 'Built-up area', value: p.builtUpArea });
  specs.push({ label: 'Property type', value: p.category });
  specs.push({ label: 'Transaction', value: p.transaction });
  specs.push({ label: 'Availability', value: p.availability });
  specs.push({ label: 'Reference', value: p.ref });

  const amenities = (p.amenities || []).map(a => `<span class="amenity">${D.escapeHtml(a)}</span>`).join('');

  const similar = D.publishedProperties().filter(x => x.id !== p.id && x.category === p.category).slice(0, 3);

  content.innerHTML = `
    <div class="gallery">
      <div class="gallery-main">
        <button class="gallery-nav prev" id="gPrev" aria-label="Previous image">&#10094;</button>
        <img id="gMain" src="${D.escapeHtml(images[0])}" alt="${D.escapeHtml(p.title)}" loading="eager">
        <button class="gallery-nav next" id="gNext" aria-label="Next image">&#10095;</button>
      </div>
      <div class="gallery-thumbs" id="gThumbs">
        ${images.map((im, i) => `<div class="gallery-thumb ${i === 0 ? 'active' : ''}" data-idx="${i}"><img src="${D.escapeHtml(im)}" alt="Thumbnail ${i+1}" loading="lazy"></div>`).join('')}
      </div>
    </div>

    <div class="property-head">
      <div>
        <h1 class="property-title">${D.escapeHtml(p.title)}</h1>
        <p class="property-loc">${D.escapeHtml(p.location)} &middot; ${D.escapeHtml(p.category)}</p>
        <p class="property-ref">Ref: ${D.escapeHtml(p.ref)} &middot; ${D.escapeHtml(p.transaction)}</p>
      </div>
      <div style="text-align:right">
        <div class="property-price">${D.escapeHtml(D.formatPrice(p.price))}${p.transaction === 'For Rent' ? ' / month' : ''}</div>
        <div class="fav-row" style="justify-content:flex-end;margin-top:0.6rem">
          <button class="fav-btn ${D.isFavourite(p.id) ? 'active' : ''}" id="favBtn">${D.isFavourite(p.id) ? 'SAVED' : 'SAVE TO FAVOURITES'}</button>
          <button class="btn btn-outline btn-sm" id="compareBtn">ADD TO COMPARE</button>
        </div>
      </div>
    </div>

    <div class="specs-grid">
      ${specs.map(s => `<div class="spec"><span class="label">${D.escapeHtml(s.label)}</span><span class="value">${D.escapeHtml(s.value)}</span></div>`).join('')}
    </div>

    <div class="content-block">
      <h3>Description</h3>
      <p>${D.escapeHtml(p.description)}</p>
    </div>

    ${amenities ? `<div class="content-block"><h3>Amenities &amp; Features</h3><div class="amenities">${amenities}</div></div>` : ''}

    <div class="content-block">
      <h3>Location</h3>
      <div class="map-box">
        <div>
          <p><strong>${D.escapeHtml(p.location)}</strong></p>
          <p class="note">Ask the office for directions and viewing arrangements before you travel.</p>
        </div>
      </div>
    </div>

    <div class="content-block" id="enquiry">
      <h3>Enquire About This Property</h3>
      <div class="enquiry-card">
        <form id="enquiryForm" novalidate>
          <div class="field"><label for="eName">Full name *</label><input type="text" id="eName" required></div>
          <div class="field"><label for="ePhone">Phone number *</label><input type="tel" id="ePhone" required></div>
          <div class="field"><label for="eEmail">Email (optional)</label><input type="email" id="eEmail"></div>
          <div class="field"><label for="eMethod">Preferred contact method</label>
            <select id="eMethod"><option>Phone</option><option>Email</option><option>WhatsApp</option></select>
          </div>
          <div class="field"><label for="eMessage">Message *</label><textarea id="eMessage" rows="4" required></textarea></div>
          <input type="hidden" id="eRef" value="${D.escapeHtml(p.ref)}">
          <button type="submit" class="btn btn-primary" id="eSubmit">SEND ENQUIRY</button>
          <p class="form-feedback" id="eFeedback"></p>
        </form>
      </div>
    </div>

    ${similar.length ? `<div class="content-block"><h3>Similar Properties</h3><div class="similar-grid" id="similarGrid"></div></div>` : ''}
  `;

  // Gallery logic
  const gMain = document.getElementById('gMain');
  const gThumbs = document.getElementById('gThumbs');
  function showImg(i) {
    currentImg = (i + images.length) % images.length;
    gMain.src = images[currentImg];
    gThumbs.querySelectorAll('.gallery-thumb').forEach((t, idx) => {
      t.classList.toggle('active', idx === currentImg);
    });
  }
  document.getElementById('gPrev').addEventListener('click', () => showImg(currentImg - 1));
  document.getElementById('gNext').addEventListener('click', () => showImg(currentImg + 1));
  gThumbs.querySelectorAll('.gallery-thumb').forEach(t => {
    t.addEventListener('click', () => showImg(Number(t.getAttribute('data-idx'))));
  });
  gMain.addEventListener('click', () => {
    if (window.openLightbox) window.openLightbox(images, currentImg);
  });

  // Fav
  const favBtn = document.getElementById('favBtn');
  if (favBtn) {
    favBtn.addEventListener('click', () => {
      const added = D.toggleFavourite(p.id);
      favBtn.classList.toggle('active', added);
      favBtn.textContent = added ? 'SAVED' : 'SAVE TO FAVOURITES';
      showToast(added ? 'Saved to favourites' : 'Removed from favourites');
    });
  }
  // Compare
  const compareBtn = document.getElementById('compareBtn');
  if (compareBtn) {
    compareBtn.addEventListener('click', () => {
      const res = D.toggleComparison(p.id);
      if (res.reason === 'limit') { showToast('You can compare up to 3 properties'); return; }
      showToast(res.added ? 'Added to comparison' : 'Removed from comparison');
      compareBtn.textContent = res.added ? 'REMOVE FROM COMPARE' : 'ADD TO COMPARE';
    });
  }

  // Enquiry form
  const eForm = document.getElementById('enquiryForm');
  if (eForm) {
    eForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('eName').value.trim();
      const phone = document.getElementById('ePhone').value.trim();
      const email = document.getElementById('eEmail').value.trim();
      const method = document.getElementById('eMethod').value;
      const message = document.getElementById('eMessage').value.trim();
      const ref = document.getElementById('eRef').value;
      const fb = document.getElementById('eFeedback');
      const btn = document.getElementById('eSubmit');
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
      const body = [
        'Hello Kimwanya Enterprises, I have an enquiry about ' + ref + '.',
        'Name: ' + name,
        'Phone: ' + phone,
        email ? 'Email: ' + email : '',
        'Preferred contact: ' + method,
        '',
        message
      ].filter(Boolean).join('\n');
      const wa = (D.getSettings().phone || '+254 718 266967').replace(/[^0-9]/g, '');
      fb.textContent = 'WhatsApp will open with your message ready to send.';
      fb.className = 'form-feedback success';
      window.open('https://wa.me/' + wa + '?text=' + encodeURIComponent(body), '_blank', 'noopener,noreferrer');
    });
  }

  // Similar
  const sg = document.getElementById('similarGrid');
  if (sg) {
    sg.innerHTML = similar.map(p2 => `
      <article class="card">
        <div class="card-media">
          <img src="${D.escapeHtml(p2.images && p2.images[0] ? p2.images[0] : 'assets/images/img_1.jpg')}" alt="${D.escapeHtml(p2.title)}" loading="lazy">

        </div>
        <div class="card-body">
          <h3 class="card-title">${D.escapeHtml(p2.title)}</h3>
          <p class="card-loc">${D.escapeHtml(p2.location)}</p>
          <p class="card-price">${D.escapeHtml(D.formatPrice(p2.price))}${p2.transaction === 'For Rent' ? ' / month' : ''}</p>
          <div class="card-actions">
            <a class="btn btn-outline btn-sm" href="property.html?id=${encodeURIComponent(p2.id)}">VIEW PROPERTY</a>
          </div>
        </div>
      </article>`).join('');
  }

  // Lightbox
  const lb = document.getElementById('lightbox');
  if (lb) {
    const lbImg = document.getElementById('lbImg');
    const lbClose = document.getElementById('lbClose');
    const lbPrev = document.getElementById('lbPrev');
    const lbNext = document.getElementById('lbNext');
    let lbImages = images; let lbIndex = 0;
    window.openLightbox = function (imgs, index) {
      lbImages = imgs; lbIndex = index || 0;
      lbImg.src = lbImages[lbIndex];
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
    };
    function lbShow(i) { lbIndex = (i + lbImages.length) % lbImages.length; lbImg.src = lbImages[lbIndex]; }
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
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.style.cssText = 'position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#1F2A24;color:#F4F1EA;padding:.7rem 1.2rem;font-size:.85rem;z-index:200;box-shadow:0 4px 14px rgba(0,0,0,.2);opacity:0;transition:opacity .2s;'; document.body.appendChild(t); }
    t.textContent = msg; t.style.opacity = '1';
    clearTimeout(t._timer); t._timer = setTimeout(() => { t.style.opacity = '0'; }, 2200);
  }
  window.showToast = showToast;

  // Apply content
  const c = D.getContent();
  const ann = document.getElementById('announceBar'); if (ann) ann.textContent = c.announce;
  const ft = document.getElementById('footerText'); if (ft) ft.textContent = c.footerText;

  window.addEventListener('storage', (e) => {
    if (e.key === 'kimwanya_broadcast') { location.reload(); }
  });
})();
