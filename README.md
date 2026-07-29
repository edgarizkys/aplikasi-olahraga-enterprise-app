# Aplikasi Olahraga Enterprise

Enterprise Sports Management System. Manage athletes, schedule events, track performance.

## Tech Stack
- **Backend**: Express.js
- **Database**: Turso (LibSQL/SQLite)
- **Frontend**: Tailwind CSS
- **Architecture**: Multi-tenant Enterprise Pattern

## Features
- **Manajemen Atlet**: CRUD athlete data, status tracking.
- **Jadwal Acara**: Event planning, location management.
- **Laporan Performa**: Performance analytics.
- **Notifikasi Push**: Real-time alerts.

## Installation

1. Clone repo:
   ```bash
   git clone <repo-url>
   cd enterprise-sports
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables `.env`:
   ```env
   PORT=3000
   TURSO_DATABASE_URL=libsql://your-db-name.turso.io
   TURSO_AUTH_TOKEN=your-auth-token
   JWT_SECRET=your-secret-key
   ```

4. Run migrations:
   ```bash
   npm run migrate
   ```

5. Start server:
   ```bash
   npm start
   ```

## API Endpoints

### Athletes
- `GET /api/athletes` - List all athletes (supports pagination/filter)
- `POST /api/athletes` - Create athlete
- `GET /api/athletes/:id` - Get athlete detail
- `PUT /api/athletes/:id` - Update athlete
- `DELETE /api/athletes/:id` - Remove athlete

### Events
- `GET /api/events` - List all events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event detail
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Remove event

## Database Schema
- `athletes`: `id`, `name`, `sport`, `status`, `tenant_id`
- `events`: `id`, `title`, `date`, `location`, `tenant_id`

## UI Theme
- **Primary**: `#1E40AF` (Blue)
- **Accent**: `#EF4444` (Red)