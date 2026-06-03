#!/bin/bash

# Local PostgreSQL Setup Script
# This script initializes PostgreSQL for local development

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}Local PostgreSQL Setup Script${NC}"
echo -e "${BLUE}=====================================${NC}\n"

# Configuration variables (from .env)
DB_USER="postgres"
DB_PASSWORD="admin"
DB_NAME="maintenance_reporting"
DB_HOST="localhost"
DB_PORT="5432"

echo -e "${YELLOW}Configuration:${NC}"
echo "  Database User: $DB_USER"
echo "  Database Name: $DB_NAME"
echo "  Database Host: $DB_HOST"
echo "  Database Port: $DB_PORT"
echo -e "  Password: ***\n"

# Check if PostgreSQL is installed
echo -e "${BLUE}Checking PostgreSQL installation...${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${RED}PostgreSQL is not installed.${NC}"
    echo -e "${YELLOW}Install it with:${NC}"
    echo "  Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    echo "  macOS: brew install postgresql"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL found${NC}\n"

# Check if PostgreSQL service is running
echo -e "${BLUE}Checking PostgreSQL service...${NC}"
if ! sudo -u postgres psql -c "SELECT 1" &> /dev/null; then
    echo -e "${YELLOW}PostgreSQL service may not be running. Starting it...${NC}"
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo systemctl start postgresql
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start postgresql
    fi
    sleep 2
fi
echo -e "${GREEN}✓ PostgreSQL service is running${NC}\n"

# Set postgres password and create database
echo -e "${BLUE}Setting up database...${NC}"
sudo -u postgres psql << EOF
ALTER USER postgres PASSWORD '$DB_PASSWORD';
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME;
EOF

echo -e "${GREEN}✓ Database created successfully${NC}\n"

# Test connection
echo -e "${BLUE}Testing connection...${NC}"
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" &> /dev/null; then
    echo -e "${GREEN}✓ Connection test successful${NC}\n"
else
    echo -e "${RED}✗ Connection test failed${NC}\n"
    exit 1
fi

# Initialize schema
echo -e "${BLUE}Initializing database schema...${NC}"
cd "$(dirname "$0")/../server"
npm run db:init

echo -e "\n${GREEN}=====================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}=====================================${NC}\n"

echo -e "${BLUE}Connection details:${NC}"
echo "  psql -h $DB_HOST -U $DB_USER -d $DB_NAME"
echo -e "\n${YELLOW}To start the server:${NC}"
echo "  cd server && npm run dev"
