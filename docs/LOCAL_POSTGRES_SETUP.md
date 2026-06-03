# Local PostgreSQL Setup Guide

This guide helps you set up PostgreSQL locally for development.

## Quick Start

### 1. Linux/macOS
```bash
chmod +x scripts/setup-postgres-local.sh
./scripts/setup-postgres-local.sh
```

### 2. Windows
```bash
scripts/setup-postgres-local.bat
```

## Manual Setup (if automated script doesn't work)

### Prerequisites
- PostgreSQL 12+ installed ([Download](https://www.postgresql.org/download/))
- PostgreSQL service running

### Step 1: Open PostgreSQL
```bash
# Linux/macOS
sudo -u postgres psql

# Windows (as Administrator)
psql -U postgres
```

### Step 2: Create Database and Set Password
Inside the `psql` prompt, run:
```sql
ALTER USER postgres PASSWORD 'admin';
CREATE DATABASE maintenance_reporting;
\q
```

### Step 3: Test Connection
```bash
psql -h localhost -U postgres -d maintenance_reporting
```
When prompted, enter password: `admin`

### Step 4: Initialize Schema
```bash
cd server
npm run db:init
```

## Local Credentials

The local PostgreSQL is configured with these credentials:

| Setting | Value |
|---------|-------|
| **Database Name** | `maintenance_reporting` |
| **Username** | `postgres` |
| **Password** | `admin` |
| **Host** | `localhost` |
| **Port** | `5432` |
| **Connection String** | `postgresql://postgres:admin@localhost:5432/maintenance_reporting` |

## Changing Credentials

To use different credentials:

1. **Update PostgreSQL:**
   ```sql
   ALTER USER postgres PASSWORD 'your-new-password';
   ```

2. **Update `.env` file:**
   ```
   DATABASE_USER=postgres
   DATABASE_PASSWORD=your-new-password
   DATABASE_NAME=maintenance_reporting
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_URL=postgresql://postgres:your-new-password@localhost:5432/maintenance_reporting
   ```

## Starting the Application

### Terminal 1: Start the Server
```bash
cd server
npm run dev
```
Server runs on `http://localhost:5000`

### Terminal 2: Start the Client
```bash
cd client
npm run dev
```
Client runs on `http://localhost:5173`

## Useful Commands

### Connect to Database
```bash
psql -h localhost -U postgres -d maintenance_reporting
```

### List Databases
```bash
psql -h localhost -U postgres -c "\l"
```

### List Tables
```bash
psql -h localhost -U postgres -d maintenance_reporting -c "\dt"
```

### Reset Database
```bash
# Drop and recreate the database
psql -h localhost -U postgres << EOF
DROP DATABASE IF EXISTS maintenance_reporting;
CREATE DATABASE maintenance_reporting;
EOF

# Reinitialize schema
cd server
npm run db:init
```

### Stop PostgreSQL
```bash
# Linux
sudo systemctl stop postgresql

# macOS
brew services stop postgresql

# Windows (Services panel or as Administrator)
net stop postgresql-x64-15
```

## Troubleshooting

### "role 'postgres' does not exist"
Create the postgres user:
```bash
sudo -u postgres createuser -s -P postgres
```

### "Connection refused"
- Check PostgreSQL service is running
- Verify host is `localhost` (not `127.0.0.1`)
- Check port is `5432`

### "Authentication failed"
- Verify password in `.env` matches PostgreSQL
- Use `PGPASSWORD=admin psql -h localhost -U postgres -d maintenance_reporting`

### Database already exists error
Drop it first:
```bash
sudo -u postgres dropdb maintenance_reporting
```

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js pg Module](https://node-postgres.com/)
- [Environment Variables Guide](../../.env.example)
