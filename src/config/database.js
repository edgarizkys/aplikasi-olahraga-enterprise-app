// config/database.js
const { createClient } = require('@libsql/client');

const tursoClient = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

async function initializeDatabase() {
    try {
        await tursoClient.execute(`
            CREATE TABLE IF NOT EXISTS athletes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tenant_id TEXT DEFAULT 'default',
                name TEXT NOT NULL,
                sport TEXT NOT NULL,
                status TEXT DEFAULT 'Aktif',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await tursoClient.execute(`
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tenant_id TEXT DEFAULT 'default',
                title TEXT NOT NULL,
                date TEXT NOT NULL,
                location TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('[DB] Tables athletes, events ready');
    } catch(e) {
        console.error('[DB] Init fail:', e.message);
        process.exit(1);
    }
}

module.exports = { tursoClient, initializeDatabase };