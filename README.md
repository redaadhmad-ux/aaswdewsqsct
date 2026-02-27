# Ethical Multimedia GH Website

Professional, modern, and lightweight website for **Ethical Multimedia GH** built with a **React JSX frontend** and a secure Node.js backend.

## What is included
- React JSX single-page frontend (`public/app.jsx`) with page views for:
  - Homepage
  - Services (Live Band, Catering, Decor, Multimedia)
  - About Us (Who We Are, What We Do)
  - Contact
  - Social Hub
- Premium responsive design in `public/styles.css` using the brand colors.
- Secure contact API (`POST /api/contact`) with:
  - Input sanitization + validation
  - Honeypot anti-spam
  - Rate limiting
  - Security headers
  - Submission storage in `data/contact-submissions.ndjson`
  - Email notification via `sendmail` (fallback to `data/email-outbox.log`)

## Run locally
```bash
npm start
```
Open: `http://localhost:3000`

## Optional email env vars
```bash
export CONTACT_TO_EMAIL="bookings@example.com"
export CONTACT_FROM_EMAIL="no-reply@example.com"
```

## Create a downloadable ZIP
```bash
zip -r ethical-multimedia-gh.zip . -x ".git/*" "node_modules/*"
```
