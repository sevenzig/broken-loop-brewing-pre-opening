#!/bin/sh
set -e

echo "=== Broken Loop Brewing - Docker Entrypoint ==="

if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Waiting for database..."
  RETRIES=15
  until node -e "
    const sql = require('postgres')('$DATABASE_URL', { connect_timeout: 3 });
    sql\`SELECT 1\`.then(() => { sql.end(); process.exit(0); })
      .catch(() => { sql.end(); process.exit(1); });
  " 2>/dev/null; do
    RETRIES=$((RETRIES - 1))
    if [ "$RETRIES" -le 0 ]; then
      echo "ERROR: Could not connect to database after multiple attempts."
      exit 1
    fi
    echo "  Database not ready, retrying in 2s... ($RETRIES attempts left)"
    sleep 2
  done
  echo "Database is reachable."

  echo "Running database migrations and seed..."
  node api/dist/db/seed.js
  echo "Migrations and seed complete."
fi

echo "Starting application server..."
exec node api/dist/server.js
