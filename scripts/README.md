# Setup Scripts

This directory contains automated setup scripts for the project.

## PostgreSQL Local Setup

### Quick Start

**Linux/macOS:**
```bash
chmod +x setup-postgres-local.sh
./setup-postgres-local.sh
```

**Windows:**
```bash
setup-postgres-local.bat
```

### What This Script Does

1. ✓ Checks PostgreSQL installation
2. ✓ Verifies PostgreSQL service is running
3. ✓ Sets admin password: `admin`
4. ✓ Creates database: `maintenance_reporting`
5. ✓ Tests database connection
6. ✓ Initializes database schema
7. ✓ Provides connection details

### Credentials Created

- **Username**: `postgres`
- **Password**: `admin`
- **Database**: `maintenance_reporting`
- **Host**: `localhost`
- **Port**: `5432`

### Next Steps

After running the setup script:

```bash
# Terminal 1: Start server
cd server
npm run dev

# Terminal 2: Start client
cd client
npm run dev
```

Then open http://localhost:5173

### Troubleshooting

If the script fails:
1. Ensure PostgreSQL is installed: `which psql` or `where psql`
2. Ensure PostgreSQL service is running
3. Follow manual setup in [LOCAL_POSTGRES_SETUP.md](../docs/LOCAL_POSTGRES_SETUP.md)

### Manual Setup Reference

See [LOCAL_POSTGRES_SETUP.md](../docs/LOCAL_POSTGRES_SETUP.md) for:
- Step-by-step manual setup
- Custom credential configuration
- Troubleshooting guide
- Useful PostgreSQL commands
