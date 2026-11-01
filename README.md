# Kimwanya Enterprises — Real Estate Website & Property Management Dashboard (Demonstration)

A front-end demonstration of a real estate website and property management dashboard for **Kimwanya Enterprises**, a property business concept based in Migori County, Kenya.

Developer: **Thomas Hondo Chacha — Software Engineer**.

## Overview

This project is an independent website concept. It is not an official Kimwanya Enterprises product and has not been commissioned or approved by the business. Publicly available information about Kimwanya Enterprises is limited, so company details, contact information, and property listings are clearly labelled as unverified placeholders or sample data. No company facts, ownership details, or property listings have been fabricated.

## Technologies

- HTML5
- CSS3 (custom design system, responsive)
- Vanilla JavaScript
- Browser LocalStorage for persistence

No backend, database, paid API, or build step is required.

## Folder structure

```
kimwanya-real-estate/
├── index.html
├── property.html
├── admin.html
├── README.md
├── css/
│   ├── style.css
│   ├── property.css
│   └── admin.css
├── js/
│   ├── data.js
│   ├── main.js
│   ├── property.js
│   └── admin.js
└── assets/
    ├── images/
    └── icons/
```

## How to open

1. Open the folder in VS Code.
2. Use the Live Server extension, or open `index.html` directly in a modern browser.
3. The public website is `index.html`. Property details open via `property.html?id=...`.

## Admin dashboard access

Open `admin.html`. The demonstration access password is:

```
demo
```

Username can be anything (default `admin`). This is **not** secure authentication — it exists only to demonstrate the dashboard flow. See the security note below.

## Editing property data

- Use the dashboard (Add Property / All Properties) to create, edit, publish, unpublish, or delete listings.
- Changes are saved to LocalStorage and appear on the public website.
- You can also edit `js/data.js` to change the seed sample data (clear LocalStorage afterwards, or use "Reset Demo Data" in the dashboard).

## How LocalStorage works

All data (properties, categories, enquiries, favourites, content, settings) is stored in the browser's LocalStorage under keys prefixed with `kimwanya_`. Data persists per browser and per origin. Clearing site data or using a different browser starts fresh. Open tabs synchronize through storage events.

## Replacing illustrative photographs

Place new images in `assets/images/` and update the image URLs in the dashboard or in `js/data.js`. Photographs used are from Wikimedia Commons (Kenyan subjects) and are used for demonstration. Always confirm licensing and attribution before production use. Do not imply that an illustrative photograph represents an actual Kimwanya Enterprises property.

## Details requiring verification

- Business name spelling and registration status
- Services offered
- Physical address and contact details (phone, email, WhatsApp, social media)
- Official website, if any
- Property listings, prices, and availability
- Ownership documentation, titles, surveys, and legal status
- Company history, founding date, directors, years of experience
- Any testimonials, reviews, or awards

## What a production deployment would require

- Server-side authentication and role-based authorization
- A real database with backups
- Server-side input validation and sanitization
- Secure file uploads and image processing
- Privacy protections and compliance with data protection law
- Audit logging
- HTTPS and secure session management
- Real enquiry delivery (email/SMS/CRM integration)
- Real map integration with verified coordinates

## Developer credit

Website concept designed by Thomas Hondo Chacha — Software Engineer.
