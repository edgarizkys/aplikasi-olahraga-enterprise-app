const express = require('express');
const cors = require('cors');
const { createClient } = require('@libsql/client');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Multi-tenant Middleware
const tenantMiddleware = (req, res, next) => {
  const tenantId = req.headers['x-tenant-id'];
  if (!tenantId) {
    return res.status(400).json({ error: 'Header x-tenant-id wajib ada' });
  }
  req.tenantId = tenantId;
  next();
};

app.use('/api', tenantMiddleware);

// Database Initialization
const initDb = async () => {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS athletes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT,
      name TEXT,
      sport TEXT,
      status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT,
      title TEXT,
      date DATE,
      location TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
};
initDb().catch(console.error);

// Generic CRUD Handler
const handleRequest = async (req, res) => {
  const { entity } = req.params;
  const { id } = req.params;
  const { tenantId } = req;
  const { page = 1, limit = 10, ...body } = req.query;

  try {
    if (req.method === 'GET') {
      const offset = (page - 1) * limit;
      const result = await client.execute({
        sql: `SELECT * FROM ${entity} WHERE tenant_id = ? LIMIT ? OFFSET ?`,
        args: [tenantId, parseInt(limit), parseInt(offset)],
      });
      
      const totalResult = await client.execute({
        sql: `SELECT COUNT(*) as count FROM ${entity} WHERE tenant_id = ?`,
        args: [tenantId],
      });

      return res.json({
        data: result.rows,
        pagination: {
          total: totalResult.rows[0].count,
          page: parseInt(page),
          limit: parseInt(limit),
        },
      });
    }

    if (req.method === 'POST') {
      const fields = Object.keys(req.body);
      const values = Object.values(req.body);
      const placeholders = fields.map(() => '?').join(',');
      
      const result = await client.execute({
        sql: `INSERT INTO ${entity} (tenant_id, ${fields.join(',')}) VALUES (?, ${placeholders})`,
        args: [tenantId, ...values],
      });
      
      return res.status(201).json({ id: result.lastInsertRowid, message: 'Data berhasil disimpan' });
    }

    if (req.method === 'PUT') {
      const fields = Object.keys(req.body);
      const updates = fields.map(f => `${f} = ?`).join(',');
      const values = Object.values(req.body);
      
      await client.execute({
        sql: `UPDATE ${entity} SET ${updates} WHERE id = ? AND tenant_id = ?`,
        args: [...values, id, tenantId],
      });
      
      return res.json({ message: 'Data berhasil diperbarui' });
    }

    if (req.method === 'DELETE') {
      await client.execute({
        sql: `DELETE FROM ${entity} WHERE id = ? AND tenant_id = ?`,
        args: [id, tenantId],
      });
      return res.json({ message: 'Data berhasil dihapus' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

// Routes
app.get('/api/:entity', handleRequest);
app.post('/api/:entity', handleRequest);
app.put('/api/:entity/:id', handleRequest);
app.delete('/api/:entity/:id', handleRequest);

// Performance Report Endpoint
app.get('/api/reports/performance', async (req, res) => {
  const { tenantId } = req;
  try {
    const result = await client.execute({
      sql: `SELECT sport, COUNT(*) as total FROM athletes WHERE tenant_id = ? GROUP BY sport`,
      args: [tenantId],
    });
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Gagal generate laporan' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});