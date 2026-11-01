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
    heroHeadline: 'Find a Place to Belong. Discover a Place to Grow.',
    heroDesc: 'Explore residential properties, land opportunities, and commercial spaces with a property discovery experience designed around your needs.',
    aboutTitle: 'Kimwanya Enterprises',
    aboutText: 'Kimwanya Enterprises is presented here as a property business concept based in Migori County, Kenya. This page is a demonstration that can be customized with information approved by the business owner. Verified company details, services, and history should replace this placeholder copy.',
    contactText: 'Contact details for Kimwanya Enterprises have not been verified for this demonstration. Please replace the placeholder below with approved business contact information.',
    footerText: 'Property. Possibility. Progress.',
    announce: 'DISCOVER PROPERTY OPPORTUNITIES WITH KIMWANYA ENTERPRISES'
  };

  const DEFAULT_SETTINGS = {
    businessName: 'Kimwanya Enterprises',
    location: 'Migori County, Kenya',
    currency: 'KSh',
    theme: 'light',
    phone: '[Unverified placeholder — to be confirmed]',
    email: '[Unverified placeholder — to be confirmed]'
  };

  const SAMPLE_PROPERTIES = [
    { id:'p1', ref:'KE-2024-001', title:'Three-Bedroom Family Bungalow', category:'Houses', transaction:'For Sale', location:'Migori Town', price:4500000, bedrooms:3, bathrooms:2, landSize:'1/8 acre', builtUpArea:'120 sqm', description:'Sample listing. A spacious three-bedroom bungalow with a living and dining area, modern kitchen, and private parking. Illustrative details for demonstration purposes.', amenities:['Parking','Water connection (illustrative)','Electricity (illustrative)'], images:['assets/images/img_3.jpg','assets/images/img_4.jpg'], status:'published', availability:'Available', featured:true, sample:true, dateAdded:'2024-09-12' },
    { id:'p2', ref:'KE-2024-002', title:'Two-Bedroom Apartment', category:'Apartments', transaction:'For Rent', location:'Rongo Town', price:25000, bedrooms:2, bathrooms:1, landSize:null, builtUpArea:'75 sqm', description:'Sample listing. A two-bedroom apartment suitable for a small family, located near town amenities. Illustrative details.', amenities:['Shared parking','Water (illustrative)'], images:['assets/images/img_4.jpg','assets/images/img_3.jpg'], status:'published', availability:'Available', featured:false, sample:true, dateAdded:'2024-09-18' },
    { id:'p3', ref:'KE-2024-003', title:'Residential Plot (50x100)', category:'Land & Plots', transaction:'Land for Sale', location:'Kehancha', price:800000, bedrooms:null, bathrooms:null, landSize:'50x100 ft', builtUpArea:null, description:'Sample listing. A residential plot in a growing neighbourhood. Illustrative details; no title or survey verification is claimed.', amenities:[], images:['assets/images/img_1.jpg'], status:'published', availability:'Available', featured:true, sample:true, dateAdded:'2024-09-20' },
    { id:'p4', ref:'KE-2024-004', title:'Commercial Shop Space', category:'Commercial', transaction:'Commercial Property', location:'Migori Town', price:12000000, bedrooms:null, bathrooms:1, landSize:'1/8 acre', builtUpArea:'200 sqm', description:'Sample listing. Ground-floor commercial space suitable for retail or office use. Illustrative details.', amenities:['Road frontage (illustrative)','Parking (illustrative)'], images:['assets/images/img_5.jpg','assets/images/img_2.jpg'], status:'published', availability:'Available', featured:false, sample:true, dateAdded:'2024-09-25' },
    { id:'p5', ref:'KE-2024-005', title:'Four-Bedroom Maisonette', category:'Houses', transaction:'For Sale', location:'Awendo', price:6800000, bedrooms:4, bathrooms:3, landSize:'1/4 acre', builtUpArea:'220 sqm', description:'Sample listing. A four-bedroom maisonette with ensuite master bedroom and a small garden. Illustrative details.', amenities:['Garden (illustrative)','Parking'], images:['assets/images/img_3.jpg','assets/images/img_6.jpg'], status:'published', availability:'Available', featured:true, sample:true, dateAdded:'2024-10-01' },
    { id:'p6', ref:'KE-2024-006', title:'Studio Apartment', category:'Apartments', transaction:'For Rent', location:'Migori Town', price:15000, bedrooms:1, bathrooms:1, landSize:null, builtUpArea:'35 sqm', description:'Sample listing. A compact studio apartment ideal for a single occupant. Illustrative details.', amenities:['Water (illustrative)'], images:['assets/images/img_4.jpg'], status:'published', availability:'Available', featured:false, sample:true, dateAdded:'2024-10-03' },
    { id:'p7', ref:'KE-2024-007', title:'Agricultural Land (2 Acres)', category:'Land & Plots', transaction:'Land for Sale', location:'Nyatike', price:2500000, bedrooms:null, bathrooms:null, landSize:'2 acres', builtUpArea:null, description:'Sample listing. Agricultural land suitable for farming activities. Illustrative details; no verification of soil, access, or title is claimed.', amenities:[], images:['assets/images/img_1.jpg','assets/images/img_2.jpg'], status:'draft', availability:'Available', featured:false, sample:true, dateAdded:'2024-10-05' },
    { id:'p8', ref:'KE-2024-008', title:'Three-Bedroom Rental House', category:'Houses', transaction:'For Rent', location:'Suna East', price:30000, bedrooms:3, bathrooms:2, landSize:'1/8 acre', builtUpArea:'130 sqm', description:'Sample listing. A three-bedroom house available for rent. Illustrative details.', amenities:['Parking','Water (illustrative)'], images:['assets/images/img_6.jpg','assets/images/img_3.jpg'], status:'published', availability:'Available', featured:false, sample:true, dateAdded:'2024-10-08' },
    { id:'p9', ref:'KE-2024-009', title:'Modern Townhouse', category:'Houses', transaction:'For Sale', location:'Rongo Town', price:5500000, bedrooms:3, bathrooms:2, landSize:'1/8 acre', builtUpArea:'150 sqm', description:'Sample listing. A modern townhouse with open-plan living and a small courtyard. Illustrative details.', amenities:['Courtyard (illustrative)','Parking'], images:['assets/images/img_3.jpg','assets/images/img_4.jpg'], status:'published', availability:'Available', featured:true, sample:true, dateAdded:'2024-10-10' },
    { id:'p10', ref:'KE-2024-010', title:'Office Space (First Floor)', category:'Commercial', transaction:'Commercial Property', location:'Migori Town', price:8500000, bedrooms:null, bathrooms:1, landSize:null, builtUpArea:'120 sqm', description:'Sample listing. First-floor office space in a commercial building. Illustrative details.', amenities:['Stair access (illustrative)'], images:['assets/images/img_5.jpg'], status:'draft', availability:'Available', featured:false, sample:true, dateAdded:'2024-10-12' },
    { id:'p11', ref:'KE-2024-011', title:'Corner Residential Plot', category:'Land & Plots', transaction:'Land for Sale', location:'Awendo', price:1100000, bedrooms:null, bathrooms:null, landSize:'1/4 acre', builtUpArea:null, description:'Sample listing. A corner plot suitable for residential development. Illustrative details.', amenities:[], images:['assets/images/img_2.jpg'], status:'published', availability:'Available', featured:false, sample:true, dateAdded:'2024-10-14' },
    { id:'p12', ref:'KE-2024-012', title:'Two-Bedroom Bungalow', category:'Houses', transaction:'For Sale', location:'Kehancha', price:3200000, bedrooms:2, bathrooms:1, landSize:'1/8 acre', builtUpArea:'90 sqm', description:'Sample listing. A compact two-bedroom bungalow. Illustrative details.', amenities:['Parking'], images:['assets/images/img_6.jpg','assets/images/img_1.jpg'], status:'published', availability:'Sold', featured:false, sample:true, dateAdded:'2024-10-16' }
  ];

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
      write(STORAGE.properties, SAMPLE_PROPERTIES);
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

  function resetDemoData() {
    Object.values(STORAGE).forEach(k => localStorage.removeItem(k));
    localStorage.removeItem('kimwanya_broadcast');
    init();
  }

  init();

  window.KimwanyaData = {
    STORAGE, DEFAULT_CATEGORIES, DEFAULT_CONTENT, DEFAULT_SETTINGS, SAMPLE_PROPERTIES,
    read, write, init, resetDemoData,
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
