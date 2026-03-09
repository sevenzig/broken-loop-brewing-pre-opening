#!/bin/sh
set -e

echo "=== Broken Loop Brewing - Docker Entrypoint ==="

if [ "$RUN_MIGRATIONS" = "true" ]; then
  DB_HOST=$(echo "$DATABASE_URL" | sed 's|.*@\([^:]*\):.*|\1|')
  DB_PORT=$(echo "$DATABASE_URL" | sed 's|.*:\([0-9]*\)/.*|\1|')
  echo "Waiting for database at ${DB_HOST}:${DB_PORT}..."

  RETRIES=20
  until node -e "
    const net = require('net');
    const s = net.connect(${DB_PORT}, '${DB_HOST}');
    s.on('connect', () => { s.end(); process.exit(0); });
    s.on('error', () => process.exit(1));
    setTimeout(() => process.exit(1), 2000);
  "; do
    RETRIES=$((RETRIES - 1))
    if [ "$RETRIES" -le 0 ]; then
      echo "ERROR: Could not reach database after multiple attempts."
      exit 1
    fi
    echo "  Not ready, retrying in 2s... ($RETRIES attempts left)"
    sleep 2
  done
  echo "Database is reachable."

  echo "Running migrations and seed..."
  node api/dist/db/seed.js
  echo "Migrations and seed complete."
fi

echo "Starting application server..."
exec node api/dist/server.js
