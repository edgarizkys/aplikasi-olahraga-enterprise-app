// controllers/appController.js

const { tursoClient } = require('../config/database');

const getTenant = (req) => req.headers['x-tenant-id'] || 'default_tenant';

exports.getAthletes = async (req, res) => {
    try {
        const tenantId = getTenant(req);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const result = await tursoClient.execute({
            sql: 'SELECT * FROM athletes WHERE tenant_id = ? LIMIT ? OFFSET ?',
            args: [tenantId, limit, offset]
        });

        const count = await tursoClient.execute({
            sql: 'SELECT COUNT(*) as total FROM athletes WHERE tenant_id = ?',
            args: [tenantId]
        });

        res.json({ success: true, data: result.rows, pagination: { page, total: count.rows[0].total } });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.createAthlete = async (req, res) => {
    try {
        const tenantId = getTenant(req);
        const { name, sport, status } = req.body;

        const result = await tursoClient.execute({
            sql: 'INSERT INTO athletes (tenant_id, name, sport, status) VALUES (?, ?, ?, ?)',
            args: [tenantId, name, sport, status]
        });

        res.status(201).json({ success: true, id: Number(result.lastInsertRowid) });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.getEvents = async (req, res) => {
    try {
        const tenantId = getTenant(req);
        const result = await tursoClient.execute({
            sql: 'SELECT * FROM events WHERE tenant_id = ? ORDER BY date ASC',
            args: [tenantId]
        });

        res.json({ success: true, data: result.rows });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.createEvent = async (req, res) => {
    try {
        const tenantId = getTenant(req);
        const { title, date, location } = req.body;

        const result = await tursoClient.execute({
            sql: 'INSERT INTO events (tenant_id, title, date, location) VALUES (?, ?, ?, ?)',
            args: [tenantId, title, date, location]
        });

        res.status(201).json({ success: true, id: Number(result.lastInsertRowid) });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};