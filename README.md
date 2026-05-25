# University Maintenance Reporting System

Full-stack web app for reporting and managing campus maintenance issues.

**Stack:** React.js · Express.js · PostgreSQL

## Features

- User registration and login (JWT)
- Two roles: **reporter** (submit & track own reports) and **admin** (view/update all reports)
- CRUD for maintenance reports
- File upload (images and PDF, max 5MB)
- Responsive React UI

## Project structure

```
full-stack-final-project/
├── client/          # React frontend (Vite)
├── server/          # Express API
│   ├── sql/         # PostgreSQL schema
│   └── uploads/     # Uploaded files
├── docs/
│   ├── POSTGRES_SETUP.md
│   └── postman/     # Postman collection for API testing
└── README.md
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Setup

### 1. Create the database

On Linux, `createdb` often fails if your Linux user is not a PostgreSQL role. Use:

```bash
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
sudo -u postgres psql -c "CREATE DATABASE maintenance_reporting;"
```

Test:

```bash
psql -h localhost -U postgres -d maintenance_reporting
```

Use `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/maintenance_reporting` in `.env` (note `@localhost`).

See [docs/POSTGRES_SETUP.md](docs/POSTGRES_SETUP.md) if you get peer authentication or role errors.

### 2. Backend

```bash
cd server
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npm install
npm run db:init
npm run dev
```

Default admin account (change after first login):

- Email: `admin@university.ac.zm`
- Password: `admin123`

Override in `.env` before `db:init`:

```
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password
ADMIN_NAME=Campus Admin
```

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Vite dev server proxies API requests to port 5000.

## Swagger API docs

With the server running:

- **Swagger UI:** [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **OpenAPI JSON:** [http://localhost:5000/api-docs.json](http://localhost:5000/api-docs.json)

1. Call `POST /api/auth/login` with admin credentials.
2. Copy the `token` from the response.
3. Click **Authorize** in Swagger UI and enter: `Bearer YOUR_TOKEN` (or paste the token only if Swagger adds `Bearer` for you).

## Testing with Postman

You can test the API with [Postman](https://www.postman.com/) while the server is running on port 5000.

### Import the collection

1. Open Postman → **Import** → **Upload Files**.
2. Choose [docs/postman/maintenance-reporting.postman_collection.json](docs/postman/maintenance-reporting.postman_collection.json).
3. Open the collection variables (`baseUrl` defaults to `http://localhost:5000`).
4. Run **Auth → Login (admin)**. The test script saves the JWT to `token` automatically.
5. Run other requests (reports, uploads, etc.). Bearer auth is applied at collection level.

Manual flow (without the collection): `POST /api/auth/login`, copy `token`, then set **Authorization → Bearer Token** on protected routes. For uploads, use **form-data** with field name `file`.

Swagger UI and Postman both hit the same Express API; use whichever you prefer.

## API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register as reporter |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/reports` | List reports (own or all for admin) |
| POST | `/api/reports` | Create report |
| GET | `/api/reports/:id` | Report detail |
| PUT | `/api/reports/:id` | Update report |
| DELETE | `/api/reports/:id` | Delete report |
| POST | `/api/reports/:id/attachments` | Upload file |

## Roles

| Action | Reporter | Admin |
|--------|----------|-------|
| Register | Yes | No (seeded) |
| Create report | Yes | Yes |
| View own reports | Yes | Yes |
| View all reports | No | Yes |
| Edit pending own report | Yes | Yes |
| Update status / admin notes | No | Yes |
| Delete pending own report | Yes | Yes |
| Delete any report | No | Yes |

## Submission deadline

29 May 2026
