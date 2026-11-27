(function () {
  'use strict';

  const STORAGE = {
    properties: 'kimwanya_properties',
    categories: 'kimwanya_categories',
    enquiries: 'kimwanya_enquiries',
    favourites: 'kimwanya_favourites',
    content: 'kimwanya_content',
    settings: 'kimwanya_settings',
    comparison: 'kimwanya_comparison'
  };

  const DEFAULT_CATEGORIES = [
    { id: 'cat_houses', name: 'Houses', slug: 'Houses' },
    { id: 'cat_apartments', name: 'Apartments', slug: 'Apartments' },
    { id: 'cat_land', name: 'Land & Plots', slug: 'Land & Plots' },
    { id: 'cat_commercial', name: 'Commercial', slug: 'Commercial' },
    { id: 'cat_other', name: 'Other Property', slug: 'Other Property' }
  ];

  const DEFAULT_CONTENT = {
    heroHeadline: 'Property, Possibility, Progress.',
    heroDesc: 'Property management and sales, auctioneering, debt recovery and agency services across Migori and Kuria.',
    aboutTitle: 'Kimwanya Enterprises',
    aboutText: 'Kimwanya Enterprises connects clients with rental homes, residential properties, and commercial or agricultural land across Migori and Kuria. The firm also provides licensed auctioneering services, commercial and private debt recovery, and investigative and general agency representation.',
    contactText: 'Talk to the Migori or Kehancha office about property, auctioneering, debt recovery or agency services. Current availability and engagement terms are confirmed directly by the office.',
    footerText: 'Property. Possibility. Progress.',
    announce: 'PROPERTY, AUCTIONEERING AND AGENCY SERVICES IN MIGORI & KURIA'
  };

  const DEFAULT_SETTINGS = {
    businessName: 'Kimwanya Enterprises',
    location: 'Migori & Kehancha, Kenya',
    currency: 'KSh',
    theme: 'light',
    phone: '+254 718 266967',
    email: '',
    address: 'Will Business Park, Door 10, Wing A, Migori–Rongo Road, near Bansi Mega, opposite Texas Petrol Station, Migori',
    kehanchaAddress: 'Mobhoke House, Kehancha–Ntimaru Road, near Father Angelo, Kehancha',
    landmark: 'Near Bansi Mega, opposite Texas Petrol Station',
    facebook: '',
    offices: 'Migori • Kehancha'
  };

  const SEED_PROPERTIES = [];

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }

  function init() {
    if (localStorage.getItem(STORAGE.properties) === null) {
      write(STORAGE.properties, SEED_PROPERTIES);
    } else {
      const stored = read(STORAGE.properties, []);
      if (stored.some(p => p.sample === true || String(p.ref || '').indexOf('KE-2024-') === 0)) {
        write(STORAGE.properties, SEED_PROPERTIES);
        write(STORAGE.favourites, []);
        write(STORAGE.comparison, []);
      }
    }
    if (localStorage.getItem(STORAGE.categories) === null) {
      write(STORAGE.categories, DEFAULT_CATEGORIES);
    }
    if (localStorage.getItem(STORAGE.enquiries) === null) {
      write(STORAGE.enquiries, []);
    }
    if (localStorage.getItem(STORAGE.favourites) === null) {
      write(STORAGE.favourites, []);
    }
    if (localStorage.getItem(STORAGE.content) === null) {
      write(STORAGE.content, DEFAULT_CONTENT);
    }
    if (localStorage.getItem(STORAGE.settings) === null) {
      write(STORAGE.settings, DEFAULT_SETTINGS);
    }
    if (localStorage.getItem(STORAGE.comparison) === null) {
      write(STORAGE.comparison, []);
    }
    migrateBusinessDetails();
  }

  // Adds verified business details to existing browser data
  // without overwriting custom content the user may have edited.
  function migrateBusinessDetails() {
    const content = read(STORAGE.content, DEFAULT_CONTENT);
    let contentChanged = false;
    if (!content.aboutText || content.aboutText.indexOf('presented here as a property business concept') !== -1) {
      content.aboutText = DEFAULT_CONTENT.aboutText; contentChanged = true;
    }
    if (!content.contactText || content.contactText.indexOf('have not been verified') !== -1) {
      content.contactText = DEFAULT_CONTENT.contactText; contentChanged = true;
    }
    ['heroHeadline', 'heroDesc', 'footerText', 'announce'].forEach(k => {
      if (!content[k] || /designed around your needs|Discover a Place to Belong|DISCOVER PROPERTY OPPORTUNITIES/i.test(content[k])) {
        content[k] = DEFAULT_CONTENT[k]; contentChanged = true;
      }
    });
    if (contentChanged) write(STORAGE.content, content);

    const settings = read(STORAGE.settings, DEFAULT_SETTINGS);
    let settingsChanged = false;
    Object.keys(DEFAULT_SETTINGS).forEach(k => {
      if (settings[k] === undefined || settings[k] === '' || String(settings[k]).indexOf('Unverified placeholder') !== -1) {
        settings[k] = DEFAULT_SETTINGS[k]; settingsChanged = true;
      }
    });
    if (settingsChanged) write(STORAGE.settings, settings);
  }

  // Properties
  function getProperties() { return read(STORAGE.properties, []); }
  function saveProperties(list) { write(STORAGE.properties, list); broadcast('properties'); }
  function getPropertyById(id) { return getProperties().find(p => p.id === id) || null; }
  function getPropertyByRef(ref) { return getProperties().find(p => p.ref === ref) || null; }

  // Categories
  function getCategories() { return read(STORAGE.categories, DEFAULT_CATEGORIES); }
  function saveCategories(list) { write(STORAGE.categories, list); broadcast('categories'); }

  // Enquiries
  function getEnquiries() { return read(STORAGE.enquiries, []); }
  function saveEnquiries(list) { write(STORAGE.enquiries, list); broadcast('enquiries'); }
  function addEnquiry(enq) {
    const list = getEnquiries();
    enq.id = 'E' + Date.now().toString(36).toUpperCase();
    enq.date = new Date().toISOString();
    enq.status = enq.status || 'New';
    list.unshift(enq);
    saveEnquiries(list);
    return enq;
  }

  // Favourites
  function getFavourites() { return read(STORAGE.favourites, []); }
  function saveFavourites(list) { write(STORAGE.favourites, list); broadcast('favourites'); }
  function toggleFavourite(id) {
    const list = getFavourites();
    const idx = list.indexOf(id);
    if (idx === -1) list.push(id); else list.splice(idx, 1);
    saveFavourites(list);
    return idx === -1;
  }
  function isFavourite(id) { return getFavourites().indexOf(id) !== -1; }

  // Comparison
  function getComparison() { return read(STORAGE.comparison, []); }
  function saveComparison(list) { write(STORAGE.comparison, list); broadcast('comparison'); }
  function toggleComparison(id) {
    const list = getComparison();
    const idx = list.indexOf(id);
    if (idx === -1) {
      if (list.length >= 3) return { added:false, reason:'limit' };
      list.push(id);
    } else {
      list.splice(idx, 1);
    }
    saveComparison(list);
    return { added: idx === -1, list: list.slice() };
  }

  // Content
  function getContent() { return read(STORAGE.content, DEFAULT_CONTENT); }
  function saveContent(c) { write(STORAGE.content, c); broadcast('content'); }

  // Settings
  function getSettings() { return read(STORAGE.settings, DEFAULT_SETTINGS); }
  function saveSettings(s) { write(STORAGE.settings, s); broadcast('settings'); }

  // Broadcast via storage event (for cross-tab)
  function broadcast(topic) {
    try {
      localStorage.setItem('kimwanya_broadcast', JSON.stringify({ topic: topic, ts: Date.now() }));
    } catch (e) {}
  }

  // Helpers
  function formatPrice(amount, settings) {
    const s = settings || getSettings();
    const cur = (s && s.currency) ? s.currency : 'KSh';
    const n = Number(amount);
    if (isNaN(n)) return String(amount);
    return cur + ' ' + n.toLocaleString('en-KE');
  }
  function isLand(p) { return p.category === 'Land & Plots'; }
  function isCommercial(p) { return p.category === 'Commercial'; }
  function publishedProperties() { return getProperties().filter(p => p.status === 'published'); }
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function uid(prefix) { return (prefix || 'id') + '_' + Math.random().toString(36).slice(2, 9); }

  function resetRegisterData() {
    Object.values(STORAGE).forEach(k => localStorage.removeItem(k));
    localStorage.removeItem('kimwanya_broadcast');
    init();
  }

  init();

  window.KimwanyaData = {
    STORAGE, DEFAULT_CATEGORIES, DEFAULT_CONTENT, DEFAULT_SETTINGS, SEED_PROPERTIES,
    read, write, init, resetRegisterData,
    getProperties, saveProperties, getPropertyById, getPropertyByRef,
    getCategories, saveCategories,
    getEnquiries, saveEnquiries, addEnquiry,
    getFavourites, saveFavourites, toggleFavourite, isFavourite,
    getComparison, saveComparison, toggleComparison,
    getContent, saveContent,
    getSettings, saveSettings,
    formatPrice, isLand, isCommercial, publishedProperties, escapeHtml, uid, broadcast
  };
})();
