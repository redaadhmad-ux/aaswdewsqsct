const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const SUBMISSION_FILE = path.join(DATA_DIR, 'contact-submissions.ndjson');
const OUTBOX_FILE = path.join(DATA_DIR, 'email-outbox.log');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

const rateMap = new Map();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_SUBMISSIONS_PER_WINDOW = 6;

fs.mkdirSync(DATA_DIR, { recursive: true });

function safeJoin(base, targetPath) {
  const resolved = path.normalize(path.join(base, targetPath));
  return resolved.startsWith(base) ? resolved : null;
}

function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'; script-src 'self' https://unpkg.com 'unsafe-eval'; connect-src 'self'; frame-ancestors 'none'; form-action 'self';"
  );
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 50_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function clean(value, maxLength = 500) {
  return String(value || '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function validateSubmission(body) {
  const errors = [];
  const name = clean(body.name, 100);
  const email = clean(body.email, 150).toLowerCase();
  const phone = clean(body.phone, 50);
  const service = clean(body.service, 80);
  const eventDate = clean(body.eventDate, 50);
  const message = clean(body.message, 2000);
  const website = clean(body.website, 100);

  if (!name || name.length < 2) errors.push('Please provide your full name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Please provide a valid email address.');
  if (!message || message.length < 10) errors.push('Please enter a detailed message (minimum 10 characters).');
  if (website) errors.push('Spam check failed.');

  return { errors, data: { name, email, phone, service, eventDate, message } };
}

function isRateLimited(ip) {
  const now = Date.now();
  const records = rateMap.get(ip) || [];
  const active = records.filter((timestamp) => now - timestamp < RATE_WINDOW_MS);
  active.push(now);
  rateMap.set(ip, active);
  return active.length > MAX_SUBMISSIONS_PER_WINDOW;
}

function persistSubmission(entry) {
  fs.appendFileSync(SUBMISSION_FILE, `${JSON.stringify(entry)}\n`, 'utf8');
}

function notifyByEmail(entry) {
  return new Promise((resolve) => {
    const to = process.env.CONTACT_TO_EMAIL;
    const from = process.env.CONTACT_FROM_EMAIL || 'no-reply@ethicalmultimediagh.local';

    const subject = `New Booking Inquiry: ${entry.service || 'General'} | ${entry.name}`;
    const body = [
      `From: ${entry.name} <${entry.email}>`,
      `Phone: ${entry.phone || 'N/A'}`,
      `Service: ${entry.service || 'N/A'}`,
      `Event Date: ${entry.eventDate || 'N/A'}`,
      '',
      entry.message,
      '',
      `Submission ID: ${entry.id}`,
      `Timestamp: ${entry.timestamp}`
    ].join('\n');

    const fallbackLog = () => {
      const record = `[${entry.timestamp}] ${subject}\n${body}\n---\n`;
      fs.appendFileSync(OUTBOX_FILE, record, 'utf8');
      resolve(false);
    };

    if (!to) {
      fallbackLog();
      return;
    }

    const sendmail = spawn('sendmail', ['-t', '-oi']);
    sendmail.on('error', fallbackLog);
    sendmail.on('close', (code) => resolve(code === 0));

    sendmail.stdin.write(`To: ${to}\n`);
    sendmail.stdin.write(`From: ${from}\n`);
    sendmail.stdin.write(`Reply-To: ${entry.email}\n`);
    sendmail.stdin.write(`Subject: ${subject}\n`);
    sendmail.stdin.write('Content-Type: text/plain; charset=utf-8\n\n');
    sendmail.stdin.write(body);
    sendmail.stdin.end();
  });
}

function serveStatic(req, res) {
  const requestPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const filePath = safeJoin(PUBLIC_DIR, requestPath);
  if (!filePath) {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      const notFoundPath = path.join(PUBLIC_DIR, '404.html');
      fs.readFile(notFoundPath, (nfErr, content) => {
        if (nfErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Not found');
          return;
        }
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(content);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=604800, immutable'
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  setSecurityHeaders(res);

  if (req.method === 'POST' && req.url === '/api/contact') {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';

    if (isRateLimited(ip)) {
      res.writeHead(429, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, message: 'Too many requests. Please try again later.' }));
      return;
    }

    try {
      const body = await parseJsonBody(req);
      const { errors, data } = validateSubmission(body);
      if (errors.length) {
        res.writeHead(422, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, errors }));
        return;
      }

      const entry = {
        ...data,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        ipHash: crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16)
      };

      persistSubmission(entry);
      const mailed = await notifyByEmail(entry);

      res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(
        JSON.stringify({
          success: true,
          message: 'Thank you! Your message has been received. We will contact you shortly.',
          mailed
        })
      );
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, message: 'Unable to process your submission.' }));
    }
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
    return;
  }

  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Ethical Multimedia GH site running on http://localhost:${PORT}`);
});
