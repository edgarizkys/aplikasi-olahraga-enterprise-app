// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const token = req.headers['authorization'];
    const secret = process.env.JWT_SECRET || 'enterprise_secret_key_2025';

    if (!token) {
        return res.status(401).json({ 
            status: 'error', 
            message: 'Token otentikasi diperlukan' 
        });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), secret);
        req.user = decoded;
        req.tenantId = decoded.tenantId || 'default';
        next();
    } catch(e) {
        res.status(401).json({ 
            status: 'error', 
            message: 'Token tidak valid atau kedaluwarsa' 
        });
    }
};