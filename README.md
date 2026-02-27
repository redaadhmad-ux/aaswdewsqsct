# Ethical Multimedia GH Website

Professional, modern, and lightweight multi-page website for **Ethical Multimedia GH** with a secure contact workflow.

## Features
- Required pages: Home, Services, About, Contact, Social Hub.
- Premium visual direction with brand color system.
- Responsive layout for mobile/tablet/desktop.
- Secure contact endpoint with:
  - Basic anti-spam honeypot
  - Input validation and sanitization
  - Rate limiting by client IP
  - Persistent submission storage (`data/contact-submissions.ndjson`)
  - Email notification via local `sendmail` when configured

## Run locally
```bash
npm start
```
Then open `http://localhost:3000`.

## Email setup
Set environment variables before starting:

```bash
export CONTACT_TO_EMAIL="bookings@example.com"
export CONTACT_FROM_EMAIL="no-reply@example.com"
```

If `sendmail` or env vars are unavailable, notifications are saved to `data/email-outbox.log`.
