// controllers/sportsController.js
const { tursoClient } = require('../config/database');

exports.getEntities = async (req, res) => {
    const { entity } = req.params;
    const tenantId = req.headers['x-tenant-id'] || 'default';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    try {
        const data = await tursoClient.execute({
            sql: `SELECT * FROM ${entity} WHERE tenant_id = ? LIMIT ? OFFSET ?`,
            args: [tenantId, limit, offset]
        });
        const count = await tursoClient.execute({
            sql: `SELECT COUNT(*) as total FROM ${entity} WHERE tenant_id = ?`,
            args: [tenantId]
        });

        res.json({
            success: true,
            data: data.rows,
            meta: { page, limit, total: count.rows[0].total }
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.createEntity = async (req, res) => {
    const { entity } = req.params;
    const tenantId = req.headers['x-tenant-id'] || 'default';
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    
    const sql = `INSERT INTO ${entity} (tenant_id, ${fields.join(', ')}) VALUES (?, ${fields.map(() => '?').join(', ')})`;
    
    try {
        const result = await tursoClient.execute({
            sql,
            args: [tenantId, ...values]
        });
        res.status(201).json({ success: true, id: Number(result.lastInsertRowid) });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

// routes/sportsRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/sportsController');

router.get('/:entity', ctrl.getEntities);
router.post('/:entity', ctrl.createEntity);

module.exports = router;

// frontend/components/Dashboard.jsx
/* 
<div className="bg-[#1E40AF] p-4 text-white">
  <h1 className="text-xl font-bold">Aplikasi Olahraga Enterprise</h1>
</div>
<button className="bg-[#EF4444] text-white px-4 py-2 rounded">
  Tambah Data
</button>
*/