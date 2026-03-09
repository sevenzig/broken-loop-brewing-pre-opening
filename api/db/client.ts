import postgres from 'postgres';

let _sql: postgres.Sql | null = null;

export function getDb(): postgres.Sql {
  if (_sql) return _sql;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Set it to a PostgreSQL connection string (e.g. postgresql://user:pass@host/db).'
    );
  }

  _sql = postgres(databaseUrl, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return _sql;
}

export type DbRow = Record<string, unknown>;
