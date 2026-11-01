(function () {
  'use strict';
  const D = window.KimwanyaData;

  // Demo access
  const loginScreen = document.getElementById('loginScreen');
  const dashboard = document.getElementById('dashboard');
  const loginBtn = document.getElementById('loginBtn');
  const loginFeedback = document.getElementById('loginFeedback');

  function showDashboard() {
    loginScreen.hidden = true;
    dashboard.hidden = false;
    initDashboard();
  }
  if (sessionStorage.getItem('kimwanya_admin') === '1') {
    showDashboard();
  } else if (sessionStorage.getItem('kimwanya_admin_logout') === '1') {
    // Stay on the login screen after an explicit logout.
    loginScreen.hidden = false;
    dashboard.hidden = true;
  } else {
    // Grant demo access automatically so the dashboard is always reachable.
    sessionStorage.setItem('kimwanya_admin', '1');
    showDashboard();
  }
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const pass = document.getElementById('loginPass').value;
      if (pass === 'demo') {
        sessionStorage.setItem('kimwanya_admin', '1');
        showDashboard();
      } else {
        loginFeedback.textContent = 'Incorrect password. Demo password is "demo".';
        loginFeedback.className = 'form-feedback error';
      }
    });
  }
  const guestLink = document.getElementById('guestLink');
  if (guestLink) {
    guestLink.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.setItem('kimwanya_admin', '1');
      showDashboard();
    });
  }
  const loginPass = document.getElementById('loginPass');
  if (loginPass) {
    loginPass.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') loginBtn.click();
    });
  }
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('kimwanya_admin');
      sessionStorage.setItem('kimwanya_admin_logout', '1');
      location.reload();
    });
  }

  // Sidebar nav
  let currentSection = 'overview';
  function gotoSection(name) {
    currentSection = name;
    document.querySelectorAll('.side-link[data-section]').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-section') === name);
    });
    document.querySelectorAll('.dash-section').forEach(s => { s.hidden = true; });
    const sec = document.getElementById('sec-' + name);
    if (sec) sec.hidden = false;
    const titles = { overview:'Overview', properties:'All Properties', addproperty:'Add / Edit Property', enquiries:'Property Enquiries', favourites:'Favourites Analytics', categories:'Categories', content:'Website Content', settings:'Settings' };
    const t = document.getElementById('sectionTitle'); if (t) t.textContent = titles[name] || name;
    if (name === 'overview') renderOverview();
    if (name === 'properties') renderProperties();
    if (name === 'enquiries') renderEnquiries();
    if (name === 'favourites') renderFavAnalytics();
    if (name === 'categories') renderCategories();
    if (name === 'content') loadContentForm();
    if (name === 'settings') loadSettingsForm();
  }
  function initDashboard() {
    // sidebar clicks
    document.querySelectorAll('.side-link[data-section]').forEach(b => {
      b.addEventListener('click', () => gotoSection(b.getAttribute('data-section')));
    });
    document.querySelectorAll('[data-goto]').forEach(b => {
      b.addEventListener('click', () => gotoSection(b.getAttribute('data-goto')));
    });
    // side toggle
    const sideToggle = document.getElementById('sideToggle');
    const sidebar = document.getElementById('sidebar');
    if (sideToggle && sidebar) sideToggle.addEventListener('click', () => sidebar.classList.toggle('open'));

    // Populate category selects
    populateCatSelects();

    // Property form submit
    const pf = document.getElementById('propertyForm');
    if (pf) pf.addEventListener('submit', saveProperty);
    const pfReset = document.getElementById('pfReset');
    if (pfReset) pfReset.addEventListener('click', () => { pf.reset(); document.getElementById('pfId').value = ''; document.getElementById('formTitle').textContent = 'Add Property'; });

    // Properties toolbar
    const ps = document.getElementById('propSearch'); if (ps) ps.addEventListener('input', renderProperties);
    const pfs = document.getElementById('propFilterStatus'); if (pfs) pfs.addEventListener('change', renderProperties);
    const pfc = document.getElementById('propFilterCat'); if (pfc) pfc.addEventListener('change', renderProperties);
    const exp = document.getElementById('exportPropsBtn'); if (exp) exp.addEventListener('click', exportPropsCSV);

    // Enquiries toolbar
    const es = document.getElementById('enqSearch'); if (es) es.addEventListener('input', renderEnquiries);
    const efs = document.getElementById('enqFilterStatus'); if (efs) efs.addEventListener('change', renderEnquiries);
    const expe = document.getElementById('exportEnqBtn'); if (expe) expe.addEventListener('click', exportEnqCSV);

    // Categories form
    const cf = document.getElementById('catForm'); if (cf) cf.addEventListener('submit', addCategory);

    // Content form
    const cof = document.getElementById('contentForm'); if (cof) cof.addEventListener('submit', saveContentForm);

    // Settings form
    const sf = document.getElementById('settingsForm'); if (sf) sf.addEventListener('submit', saveSettingsForm);

    // Reset data
    const rd = document.getElementById('resetDataBtn'); if (rd) rd.addEventListener('click', () => {
      if (confirm('Reset all demonstration data to defaults? This cannot be undone.')) {
        D.resetDemoData();
        renderOverview();
        alert('Demo data reset.');
      }
    });

    gotoSection('overview');

    // sync across tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'kimwanya_broadcast') {
        renderOverview(); renderProperties(); renderEnquiries(); renderFavAnalytics(); renderCategories();
      }
    });
  }

  function populateCatSelects() {
    const cats = D.getCategories();
    const pfCat = document.getElementById('pfCategory');
    if (pfCat) {
      pfCat.innerHTML = cats.map(c => `<option value="${D.escapeHtml(c.slug || c.name)}">${D.escapeHtml(c.name)}</option>`).join('');
    }
    const pfc = document.getElementById('propFilterCat');
    if (pfc) {
      pfc.innerHTML = '<option value="">All categories</option>' + cats.map(c => `<option value="${D.escapeHtml(c.slug || c.name)}">${D.escapeHtml(c.name)}</option>`).join('');
    }
  }

  function renderOverview() {
    const props = D.getProperties();
    const enqs = D.getEnquiries();
    const favs = D.getFavourites();
    document.getElementById('mTotal').textContent = props.length;
    document.getElementById('mPublished').textContent = props.filter(p => p.status === 'published').length;
    document.getElementById('mDraft').textContent = props.filter(p => p.status === 'draft').length;
    document.getElementById('mNew').textContent = enqs.filter(e => e.status === 'New').length;
    document.getElementById('mUnread').textContent = enqs.filter(e => e.status === 'New' || e.status === 'Follow-up Required').length;
    document.getElementById('mFavs').textContent = favs.length;
  }

  function renderProperties() {
    const tbody = document.querySelector('#propsTable tbody');
    if (!tbody) return;
    const q = (document.getElementById('propSearch').value || '').toLowerCase();
    const st = document.getElementById('propFilterStatus').value;
    const cat = document.getElementById('propFilterCat').value;
    let list = D.getProperties();
    if (q) list = list.filter(p => (p.title + ' ' + p.ref + ' ' + p.location).toLowerCase().includes(q));
    if (st) list = list.filter(p => p.status === st);
    if (cat) list = list.filter(p => p.category === cat);
    tbody.innerHTML = list.map(p => `
      <tr>
        <td>${D.escapeHtml(p.ref)}</td>
        <td>${D.escapeHtml(p.title)}${p.sample ? ' <span style="color:var(--color-bronze);font-size:.7rem">SAMPLE</span>' : ''}</td>
        <td>${D.escapeHtml(p.category)}</td>
        <td>${D.escapeHtml(p.location)}</td>
        <td>${D.escapeHtml(D.formatPrice(p.price))}</td>
        <td><span class="status-pill ${p.status}">${D.escapeHtml(p.status)}</span></td>
        <td>${D.escapeHtml(p.availability)}</td>
        <td class="actions">
          <button class="btn btn-outline btn-sm" onclick="window._editProp('${D.escapeHtml(p.id)}')">Edit</button>
          <button class="btn btn-outline btn-sm" onclick="window._togglePub('${D.escapeHtml(p.id)}')">${p.status === 'published' ? 'Unpublish' : 'Publish'}</button>
          <button class="btn btn-outline btn-sm" onclick="window._deleteProp('${D.escapeHtml(p.id)}')">Delete</button>
        </td>
      </tr>`).join('');
  }

  window._editProp = function (id) {
    const p = D.getPropertyById(id);
    if (!p) return;
    document.getElementById('pfId').value = p.id;
    document.getElementById('pfTitle').value = p.title;
    document.getElementById('pfRef').value = p.ref;
    document.getElementById('pfCategory').value = p.category;
    document.getElementById('pfTransaction').value = p.transaction;
    document.getElementById('pfLocation').value = p.location;
    document.getElementById('pfPrice').value = p.price;
    document.getElementById('pfBedrooms').value = p.bedrooms || '';
    document.getElementById('pfBathrooms').value = p.bathrooms || '';
    document.getElementById('pfLand').value = p.landSize || '';
    document.getElementById('pfBuilt').value = p.builtUpArea || '';
    document.getElementById('pfAvailability').value = p.availability;
    document.getElementById('pfStatus').value = p.status;
    document.getElementById('pfDesc').value = p.description;
    document.getElementById('pfAmenities').value = (p.amenities || []).join(', ');
    document.getElementById('pfImages').value = (p.images || []).join('\n');
    document.getElementById('pfFeatured').checked = !!p.featured;
    document.getElementById('pfSample').checked = !!p.sample;
    document.getElementById('formTitle').textContent = 'Edit Property';
    gotoSection('addproperty');
  };

  window._togglePub = function (id) {
    const props = D.getProperties();
    const p = props.find(x => x.id === id);
    if (!p) return;
    p.status = p.status === 'published' ? 'draft' : 'published';
    D.saveProperties(props);
    renderProperties();
    renderOverview();
  };

  window._deleteProp = function (id) {
    if (!confirm('Delete this property? This cannot be undone.')) return;
    const props = D.getProperties().filter(x => x.id !== id);
    D.saveProperties(props);
    // remove from comparison/favourites
    const favs = D.getFavourites().filter(x => x !== id);
    D.saveFavourites(favs);
    const comp = D.getComparison().filter(x => x !== id);
    D.saveComparison(comp);
    renderProperties();
    renderOverview();
  };

  function saveProperty(e) {
    e.preventDefault();
    const fb = document.getElementById('pfFeedback');
    const title = document.getElementById('pfTitle').value.trim();
    const ref = document.getElementById('pfRef').value.trim();
    const category = document.getElementById('pfCategory').value;
    const transaction = document.getElementById('pfTransaction').value;
    const location = document.getElementById('pfLocation').value.trim();
    const price = Number(document.getElementById('pfPrice').value);
    const availability = document.getElementById('pfAvailability').value;
    const status = document.getElementById('pfStatus').value;
    const desc = document.getElementById('pfDesc').value.trim();
    if (!title || !ref || !location || isNaN(price) || !desc) {
      fb.textContent = 'Please fill in all required fields.';
      fb.className = 'form-feedback error';
      return;
    }
    // unique ref check
    const existing = D.getProperties().find(p => p.ref === ref && p.id !== document.getElementById('pfId').value);
    if (existing) {
      fb.textContent = 'A property with this reference already exists.';
      fb.className = 'form-feedback error';
      return;
    }
    const bedsRaw = document.getElementById('pfBedrooms').value;
    const bathsRaw = document.getElementById('pfBathrooms').value;
    const amenities = document.getElementById('pfAmenities').value.split(',').map(s => s.trim()).filter(Boolean);
    const images = document.getElementById('pfImages').value.split('\n').map(s => s.trim()).filter(Boolean);
    const obj = {
      id: document.getElementById('pfId').value || D.uid('p'),
      ref, title, category, transaction, location, price,
      bedrooms: bedsRaw === '' ? null : Number(bedsRaw),
      bathrooms: bathsRaw === '' ? null : Number(bathsRaw),
      landSize: document.getElementById('pfLand').value.trim() || null,
      builtUpArea: document.getElementById('pfBuilt').value.trim() || null,
      description: desc,
      amenities, images: images.length ? images : ['assets/images/img_1.jpg'],
      status, availability,
      featured: document.getElementById('pfFeatured').checked,
      sample: document.getElementById('pfSample').checked,
      dateAdded: new Date().toISOString().slice(0,10)
    };
    // preserve dateAdded on edit
    if (document.getElementById('pfId').value) {
      const old = D.getPropertyById(obj.id);
      if (old && old.dateAdded) obj.dateAdded = old.dateAdded;
    }
    const props = D.getProperties();
    const idx = props.findIndex(p => p.id === obj.id);
    if (idx === -1) props.unshift(obj); else props[idx] = obj;
    D.saveProperties(props);
    fb.textContent = 'Property saved. ' + (status === 'published' ? 'It will appear on the public website.' : 'It is saved as a draft.');
    fb.className = 'form-feedback success';
    document.getElementById('propertyForm').reset();
    document.getElementById('pfId').value = '';
    document.getElementById('formTitle').textContent = 'Add Property';
    renderProperties();
    renderOverview();
  }

  function renderEnquiries() {
    const tbody = document.querySelector('#enqTable tbody');
    if (!tbody) return;
    const q = (document.getElementById('enqSearch').value || '').toLowerCase();
    const st = document.getElementById('enqFilterStatus').value;
    let list = D.getEnquiries();
    if (q) list = list.filter(e => (e.name + ' ' + e.phone + ' ' + e.propertyRef + ' ' + (e.email||'')).toLowerCase().includes(q));
    if (st) list = list.filter(e => e.status === st);
    tbody.innerHTML = list.map(e => `
      <tr>
        <td>${D.escapeHtml(e.id)}</td>
        <td>${D.escapeHtml(e.name)}</td>
        <td>${D.escapeHtml(e.phone)}</td>
        <td>${D.escapeHtml(e.email || '—')}</td>
        <td>${D.escapeHtml(e.propertyRef)}</td>
        <td>${D.escapeHtml(new Date(e.date).toLocaleDateString())}</td>
        <td>
          <select data-enq-status="${D.escapeHtml(e.id)}">
            ${['New','Contacted','Follow-up Required','Closed'].map(s => `<option ${e.status===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </td>
        <td class="actions">
          <button class="btn btn-outline btn-sm" onclick="window._viewEnq('${D.escapeHtml(e.id)}')">View</button>
          <button class="btn btn-outline btn-sm" onclick="window._deleteEnq('${D.escapeHtml(e.id)}')">Delete</button>
        </td>
      </tr>`).join('');
    // status change handlers
    tbody.querySelectorAll('[data-enq-status]').forEach(sel => {
      sel.addEventListener('change', () => {
        const id = sel.getAttribute('data-enq-status');
        const enqs = D.getEnquiries();
        const e = enqs.find(x => x.id === id);
        if (e) { e.status = sel.value; D.saveEnquiries(enqs); renderOverview(); }
      });
    });
  }

  window._viewEnq = function (id) {
    const e = D.getEnquiries().find(x => x.id === id);
    if (!e) return;
    const detail = document.getElementById('enqDetail');
    detail.hidden = false;
    detail.innerHTML = `
      <h3 style="font-family:var(--font-serif);color:var(--color-midnight);margin:0 0 .6rem">Enquiry ${D.escapeHtml(e.id)}</h3>
      <p><strong>Name:</strong> ${D.escapeHtml(e.name)}</p>
      <p><strong>Phone:</strong> ${D.escapeHtml(e.phone)}</p>
      <p><strong>Email:</strong> ${D.escapeHtml(e.email || '—')}</p>
      <p><strong>Preferred contact:</strong> ${D.escapeHtml(e.method || '—')}</p>
      <p><strong>Property ref:</strong> ${D.escapeHtml(e.propertyRef)}</p>
      <p><strong>Date:</strong> ${D.escapeHtml(new Date(e.date).toLocaleString())}</p>
      <p><strong>Status:</strong> ${D.escapeHtml(e.status)}</p>
      <p><strong>Message:</strong> ${D.escapeHtml(e.message)}</p>
      <p><strong>Source:</strong> ${D.escapeHtml(e.source || '—')}</p>
    `;
    detail.scrollIntoView({ behavior: 'smooth' });
  };

  window._deleteEnq = function (id) {
    if (!confirm('Delete this enquiry?')) return;
    const enqs = D.getEnquiries().filter(x => x.id !== id);
    D.saveEnquiries(enqs);
    renderEnquiries();
    renderOverview();
    document.getElementById('enqDetail').hidden = true;
  };

  function exportEnqCSV() {
    const rows = D.getEnquiries();
    const header = ['ID','Name','Phone','Email','PropertyRef','Date','Status','Message'];
    const csv = [header.join(',')].concat(rows.map(e => [
      e.id, e.name, e.phone, e.email || '', e.propertyRef, e.date, e.status, (e.message||'').replace(/"/g,'""')
    ].map(v => '"' + String(v).replace(/"/g,'""') + '"').join(','))).join('\n');
    downloadCSV(csv, 'enquiries.csv');
  }

  function renderFavAnalytics() {
    const favs = D.getFavourites();
    document.getElementById('fTotal').textContent = favs.length;
    // count per property
    const counts = {};
    favs.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
    const tbody = document.querySelector('#favTable tbody');
    const props = D.getProperties();
    tbody.innerHTML = Object.keys(counts).map(id => {
      const p = props.find(x => x.id === id);
      return `<tr><td>${D.escapeHtml(p ? p.ref : id)}</td><td>${D.escapeHtml(p ? p.title : 'Unknown')}</td><td>${counts[id]}</td></tr>`;
    }).join('') || '<tr><td colspan="3">No favourites saved yet.</td></tr>';
  }

  function renderCategories() {
    const tbody = document.querySelector('#catTable tbody');
    const cats = D.getCategories();
    tbody.innerHTML = cats.map(c => `
      <tr>
        <td>${D.escapeHtml(c.name)}</td>
        <td><button class="btn btn-outline btn-sm" onclick="window._deleteCat('${D.escapeHtml(c.id)}')">Delete</button></td>
      </tr>`).join('');
  }

  window._deleteCat = function (id) {
    if (!confirm('Delete this category?')) return;
    const cats = D.getCategories().filter(c => c.id !== id);
    D.saveCategories(cats);
    populateCatSelects();
    renderCategories();
  };

  function addCategory(e) {
    e.preventDefault();
    const name = document.getElementById('catName').value.trim();
    if (!name) return;
    const cats = D.getCategories();
    if (cats.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      alert('Category already exists.');
      return;
    }
    cats.push({ id: D.uid('cat'), name, slug: name });
    D.saveCategories(cats);
    document.getElementById('catName').value = '';
    populateCatSelects();
    renderCategories();
  }

  function loadContentForm() {
    const c = D.getContent();
    document.getElementById('cHeroHeadline').value = c.heroHeadline || '';
    document.getElementById('cHeroDesc').value = c.heroDesc || '';
    document.getElementById('cAboutTitle').value = c.aboutTitle || '';
    document.getElementById('cAboutText').value = c.aboutText || '';
    document.getElementById('cContactText').value = c.contactText || '';
    document.getElementById('cFooterText').value = c.footerText || '';
    document.getElementById('cAnnounce').value = c.announce || '';
  }

  function saveContentForm(e) {
    e.preventDefault();
    const c = {
      heroHeadline: document.getElementById('cHeroHeadline').value.trim(),
      heroDesc: document.getElementById('cHeroDesc').value.trim(),
      aboutTitle: document.getElementById('cAboutTitle').value.trim(),
      aboutText: document.getElementById('cAboutText').value.trim(),
      contactText: document.getElementById('cContactText').value.trim(),
      footerText: document.getElementById('cFooterText').value.trim(),
      announce: document.getElementById('cAnnounce').value.trim()
    };
    D.saveContent(c);
    const fb = document.getElementById('contentFeedback');
    fb.textContent = 'Content saved. The public website will reflect the changes.';
    fb.className = 'form-feedback success';
  }

  function loadSettingsForm() {
    const s = D.getSettings();
    document.getElementById('sBusinessName').value = s.businessName || '';
    document.getElementById('sLocation').value = s.location || '';
    document.getElementById('sCurrency').value = s.currency || '';
    document.getElementById('sPhone').value = s.phone || '';
    document.getElementById('sEmail').value = s.email || '';
    document.getElementById('sTheme').value = s.theme || 'light';
  }

  function saveSettingsForm(e) {
    e.preventDefault();
    const s = {
      businessName: document.getElementById('sBusinessName').value.trim(),
      location: document.getElementById('sLocation').value.trim(),
      currency: document.getElementById('sCurrency').value.trim(),
      phone: document.getElementById('sPhone').value.trim(),
      email: document.getElementById('sEmail').value.trim(),
      theme: document.getElementById('sTheme').value
    };
    D.saveSettings(s);
    const fb = document.getElementById('settingsFeedback');
    fb.textContent = 'Settings saved (demonstration only).';
    fb.className = 'form-feedback success';
  }

  function exportPropsCSV() {
    const rows = D.getProperties();
    const header = ['ID','Ref','Title','Category','Transaction','Location','Price','Status','Availability','Bedrooms','Bathrooms','LandSize','BuiltUp','Sample','DateAdded'];
    const csv = [header.join(',')].concat(rows.map(p => [
      p.id, p.ref, p.title, p.category, p.transaction, p.location, p.price, p.status, p.availability,
      p.bedrooms, p.bathrooms, p.landSize || '', p.builtUpArea || '', p.sample, p.dateAdded
    ].map(v => '"' + String(v === null || v === undefined ? '' : v).replace(/"/g,'""') + '"').join(','))).join('\n');
    downloadCSV(csv, 'properties.csv');
  }

  function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Status pill style injection
  const style = document.createElement('style');
  style.textContent = '.status-pill{display:inline-block;padding:.2rem .5rem;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;border:1px solid var(--color-border)}.status-pill.published{background:#E6F0EA;color:var(--color-green);border-color:#BFD9C8}.status-pill.draft{background:#F4EFE3;color:#8A6A2A;border-color:#E0D3B0}';
  document.head.appendChild(style);
})();
