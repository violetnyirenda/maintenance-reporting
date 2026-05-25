# PostgreSQL setup (Linux / Ubuntu)

If you see:

- `role "violet-nyirenda" does not exist` — PostgreSQL has no user matching your Linux username.
- `Peer authentication failed for user "postgres"` — you cannot run `psql -U postgres` as yourself; use the `postgres` system user instead.

## Fix (recommended for this project)

Run these in your terminal (you will be asked for your Linux password for `sudo`).

### 1. Open PostgreSQL as the postgres system user

```bash
sudo -u postgres psql
```

You should see a `postgres=#` prompt.

### 2. Set a password and create the database

Inside `psql`, run:

```sql
ALTER USER postgres PASSWORD 'postgres';
CREATE DATABASE maintenance_reporting;
\q
```

### 3. Test the connection (TCP, not socket)

```bash
psql -h localhost -U postgres -d maintenance_reporting
```

When prompted, enter password: `postgres`

If that works, type `\q` to exit.

### 4. Configure the Express app

```bash
cd ~/Desktop/full-stack-final-project/server
cp .env.example .env
```

Ensure `.env` contains:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/maintenance_reporting
```

The `@localhost` part is important — it uses password auth instead of peer auth.

### 5. Initialize tables and start the app

```bash
npm install
npm run db:init
npm run dev
```

In a second terminal:

```bash
cd ~/Desktop/full-stack-final-project/client
npm install
npm run dev
```

Open http://localhost:5173

---

## Optional: use your Linux username as the DB user

If you prefer `createdb` without `sudo`:

```bash
sudo -u postgres psql
```

```sql
CREATE USER "violet-nyirenda" WITH LOGIN PASSWORD 'localdev' CREATEDB;
CREATE DATABASE maintenance_reporting OWNER "violet-nyirenda";
\q
```

Then set in `server/.env`:

```
DATABASE_URL=postgresql://violet-nyirenda:localdev@localhost:5432/maintenance_reporting
```

Test:

```bash
psql -h localhost -U violet-nyirenda -d maintenance_reporting
```

---

## If PostgreSQL is not installed

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Then repeat from step 1.
