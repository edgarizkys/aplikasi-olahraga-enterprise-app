const express = require('express');
const { createClient } = require('@libsql/client');
const cors = require('cors');

const app = express();
const db = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_TOKEN
});

app.use(cors());
app.use(express.json());

// Middleware: Tenant Isolation
const tenantMiddleware = (req, res, next) => {
  const tenantId = req.headers['x-tenant-id'];
  if (!tenantId) return res.status(403).json({ error: 'Tenant ID wajib' });
  req.tenantId = tenantId;
  next();
};

// CRUD Athletes
app.get('/athletes', tenantMiddleware, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  try {
    const rs = await db.execute({
      sql: 'SELECT * FROM athletes WHERE tenant_id = ? LIMIT ? OFFSET ?',
      args: [req.tenantId, limit, offset]
    });
    res.json(rs.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/athletes', tenantMiddleware, async (req, res) => {
  const { name, sport, status } = req.body;
  try {
    await db.execute({
      sql: 'INSERT INTO athletes (tenant_id, name, sport, status) VALUES (?, ?, ?, ?)',
      args: [req.tenantId, name, sport, status]
    });
    res.status(201).json({ message: 'Atlet dibuat' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// CRUD Events
app.get('/events', tenantMiddleware, async (req, res) => {
  try {
    const rs = await db.execute({
      sql: 'SELECT * FROM events WHERE tenant_id = ?',
      args: [req.tenantId]
    });
    res.json(rs.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/events', tenantMiddleware, async (req, res) => {
  const { title, date, location } = req.body;
  try {
    await db.execute({
      sql: 'INSERT INTO events (tenant_id, title, date, location) VALUES (?, ?, ?, ?)',
      args: [req.tenantId, title, date, location]
    });
    res.status(201).json({ message: 'Acara dibuat' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Health Check
app.get('/health', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));