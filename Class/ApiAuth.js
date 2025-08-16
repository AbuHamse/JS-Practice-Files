/**
 * Node.js API with Buffer-based data handling + JWT Authentication
 * ---------------------------------------------------------------
 * Stack: Express, JSON Web Tokens (JWT), bcryptjs
 *
 * How to run:
 *  1) Save as server.js
 *  2) npm init -y
 *  3) npm i express jsonwebtoken bcryptjs uuid
 *  4) Set env (optional):
 *       - PORT=3000
 *       - JWT_SECRET=super_secret_change_me
 *       - MAX_UPLOAD_BYTES=10485760   // 10 MB
 *  5) node server.js
 *
 * Example usage (PowerShell/curl):
 *  - Register:   curl -s -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d '{"email":"a@b.com","password":"Passw0rd!"}'
 *  - Login:      curl -s -X POST http://localhost:3000/auth/login    -H "Content-Type: application/json" -d '{"email":"a@b.com","password":"Passw0rd!"}'
 *                 # copy token from response
 *  - Upload bin: curl -s -X POST http://localhost:3000/files -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/octet-stream" --data-binary @path/to/file
 *  - Get meta:   curl -s http://localhost:3000/files/<id> -H "Authorization: Bearer <TOKEN>"
 *  - Download:   curl -s http://localhost:3000/files/<id>/raw -H "Authorization: Bearer <TOKEN>" -o out.bin
 *  - List:       curl -s http://localhost:3000/files -H "Authorization: Bearer <TOKEN>"
 *  - Delete:     curl -s -X DELETE http://localhost:3000/files/<id> -H "Authorization: Bearer <TOKEN>"
 *
 * Notes:
 *  - This demo keeps users and file buffers in memory (Maps). For production, use a database and object storage.
 *  - JWT tokens are stateless; rotate JWT_SECRET regularly.
 *  - Input sizes are capped with MAX_UPLOAD_BYTES.
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();

// ---- Config ----
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_only_change_me';
const MAX_UPLOAD_BYTES = parseInt(process.env.MAX_UPLOAD_BYTES || `${10 * 1024 * 1024}`, 10); // 10 MB

// ---- In-memory stores (replace with DB/storage in production) ----
const users = new Map(); // email -> { id, email, passHash }
const files = new Map(); // id -> { id, ownerId, contentType, size, createdAt, data: Buffer, filename }

// ---- Middleware ----
app.use(express.json({ limit: '1mb' })); // for auth endpoints

// Auth guard
function authRequired(req, res, next) {
  const hdr = req.headers['authorization'] || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing Bearer token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid/expired token' });
  }
}

// ---- Helpers ----
function validPassword(pw = '') {
  // Simple policy: 8+ chars, at least one letter and one number
  return typeof pw === 'string' && pw.length >= 8 && /[A-Za-z]/.test(pw) && /[0-9]/.test(pw);
}

function jsonifyFileMeta(file) {
  const { data, ...meta } = file; // exclude raw buffer
  return meta;
}

// ---- Auth Routes ----
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    if (users.has(email)) return res.status(409).json({ error: 'email already registered' });
    if (!validPassword(password)) return res.status(400).json({ error: 'weak password (8+ chars, letters+numbers)' });

    const passHash = await bcrypt.hash(password, 10);
    const id = uuidv4();
    users.set(email, { id, email, passHash });
    return res.status(201).json({ message: 'registered', user: { id, email } });
  } catch (e) {
    return res.status(500).json({ error: 'server error', detail: e.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = users.get(email);
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    const ok = await bcrypt.compare(password, user.passHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token, token_type: 'Bearer', expires_in: 3600 });
  } catch (e) {
    return res.status(500).json({ error: 'server error', detail: e.message });
  }
});

// ---- File/Buffer Routes ----
// Raw binary upload handler only for this route
app.post('/files', authRequired, express.raw({ type: 'application/octet-stream', limit: MAX_UPLOAD_BYTES }), (req, res) => {
  try {
    const data = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body);
    const id = uuidv4();
    const contentType = req.headers['content-type'] || 'application/octet-stream';
    const filename = req.headers['x-filename'] || undefined; // optional client-provided name

    const file = {
      id,
      ownerId: req.user.id,
      contentType,
      size: data.length,
      createdAt: new Date().toISOString(),
      data,
      filename,
    };
    files.set(id, file);
    return res.status(201).json({ message: 'uploaded', file: jsonifyFileMeta(file) });
  } catch (e) {
    return res.status(500).json({ error: 'upload failed', detail: e.message });
  }
});

// Create from base64 (JSON)
app.post('/files/base64', authRequired, (req, res) => {
  try {
    const { base64, contentType = 'application/octet-stream', filename } = req.body || {};
    if (!base64) return res.status(400).json({ error: 'base64 required' });
    const data = Buffer.from(base64, 'base64');
    if (data.length > MAX_UPLOAD_BYTES) return res.status(413).json({ error: 'payload too large' });

    const id = uuidv4();
    const file = {
      id,
      ownerId: req.user.id,
      contentType,
      size: data.length,
      createdAt: new Date().toISOString(),
      data,
      filename,
    };
    files.set(id, file);
    return res.status(201).json({ message: 'uploaded', file: jsonifyFileMeta(file) });
  } catch (e) {
    return res.status(500).json({ error: 'upload failed', detail: e.message });
  }
});

// List own files
app.get('/files', authRequired, (req, res) => {
  const list = [...files.values()].filter(f => f.ownerId === req.user.id).map(jsonifyFileMeta);
  return res.json({ files: list });
});

// Get file metadata by id
app.get('/files/:id', authRequired, (req, res) => {
  const file = files.get(req.params.id);
  if (!file || file.ownerId !== req.user.id) return res.status(404).json({ error: 'not found' });
  return res.json({ file: jsonifyFileMeta(file) });
});

// Download raw buffer
app.get('/files/:id/raw', authRequired, (req, res) => {
  const file = files.get(req.params.id);
  if (!file || file.ownerId !== req.user.id) return res.status(404).end();
  res.setHeader('Content-Type', file.contentType || 'application/octet-stream');
  res.setHeader('Content-Length', file.size);
  if (file.filename) res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
  return res.send(file.data);
});

// Delete a file
app.delete('/files/:id', authRequired, (req, res) => {
  const file = files.get(req.params.id);
  if (!file || file.ownerId !== req.user.id) return res.status(404).json({ error: 'not found' });
  files.delete(req.params.id);
  return res.json({ message: 'deleted', id: req.params.id });
});

// Healthcheck
app.get('/health', (req, res) => res.json({ ok: true }));

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'route not found' }));

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
