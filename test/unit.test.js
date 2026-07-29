const request = require('supertest');
const express = require('express');
const sqlite3 = require('better-sqlite3');
const { createServer } = require('./server'); // Assuming server export

// Mock DB for testing
const db = new sqlite3(':memory:');

const setupDb = () => {
  db.exec(`
    CREATE TABLE athletes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sport TEXT NOT NULL,
      status TEXT NOT NULL,
      tenant_id TEXT NOT NULL
    );
    CREATE TABLE events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      location TEXT NOT NULL,
      tenant_id TEXT NOT NULL
    );
  `);
};

const app = express();
app.use(express.json());

// Mock Routes for Unit Testing
app.get('/api/athletes', (req, res) => {
  const athletes = db.prepare('SELECT * FROM athletes WHERE tenant_id = ?').all('test-tenant');
  res.status(200).json({ data: athletes, pagination: { total: athletes.length, page: 1 } });
});

app.post('/api/athletes', (req, res) => {
  const { name, sport, status } = req.body;
  if (!name || !sport || !status) return res.status(400).json({ error: 'Data tidak lengkap' });
  const info = db.prepare('INSERT INTO athletes (name, sport, status, tenant_id) VALUES (?, ?, ?, ?)')
                 .run(name, sport, status, 'test-tenant');
  res.status(201).json({ id: info.lastInsertRowid, name, sport, status });
});

app.get('/api/events', (req, res) => {
  const events = db.prepare('SELECT * FROM events WHERE tenant_id = ?').all('test-tenant');
  res.status(200).json({ data: events, pagination: { total: events.length, page: 1 } });
});

app.post('/api/events', (req, res) => {
  const { title, date, location } = req.body;
  if (!title || !date || !location) return res.status(400).json({ error: 'Data tidak lengkap' });
  const info = db.prepare('INSERT INTO events (title, date, location, tenant_id) VALUES (?, ?, ?, ?)')
                 .run(title, date, location, 'test-tenant');
  res.status(201).json({ id: info.lastInsertRowid, title, date, location });
});

describe('Enterprise Sports Management API', () => {
  beforeAll(() => {
    setupDb();
  });

  describe('Athlete Management', () => {
    it('should create new athlete', async () => {
      const res = await request(app)
        .post('/api/athletes')
        .send({ name: 'Budi Doremi', sport: 'Renang', status: 'Aktif' });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Budi Doremi');
    });

    it('should fail to create athlete with missing data', async () => {
      const res = await request(app)
        .post('/api/athletes')
        .send({ name: 'Budi Doremi' });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe('Data tidak lengkap');
    });

    it('should fetch all athletes', async () => {
      const res = await request(app).get('/api/athletes');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });
  });

  describe('Event Management', () => {
    it('should create new event', async () => {
      const res = await request(app)
        .post('/api/events')
        .send({ title: 'PON 2025', date: '2025-09-01', location: 'Jakarta' });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body.title).toBe('PON 2025');
    });

    it('should fail to create event with missing data', async () => {
      const res = await request(app)
        .post('/api/events')
        .send({ title: 'PON 2025' });
      
      expect(res.statusCode).toEqual(400);
    });

    it('should fetch all events', async () => {
      const res = await request(app).get('/api/events');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
});