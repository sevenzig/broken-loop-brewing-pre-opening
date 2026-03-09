#!/bin/sh
set -e

echo "=== Broken Loop Brewing - Docker Entrypoint ==="

if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations and seed..."
  node api/dist/db/seed.js
  echo "Migrations and seed complete."
fi

echo "Starting application server..."
exec node api/dist/server.js
