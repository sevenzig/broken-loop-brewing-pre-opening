import { getDb } from './client';
import * as fs from 'fs';
import * as path from 'path';

export async function runMigrations(): Promise<void> {
  const sql = getDb();

  console.log('Running database migrations...');

  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    try {
      await sql.unsafe(statement);
    } catch (err) {
      console.error('Migration statement failed:', statement.substring(0, 80));
      throw err;
    }
  }

  console.log('Database migrations completed successfully.');
}

if (require.main === module) {
  import('dotenv').then(dotenv => {
    dotenv.config({ path: path.join(__dirname, '..', '.env') });
    dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
    runMigrations()
      .then(() => {
        console.log('Done.');
        process.exit(0);
      })
      .catch(err => {
        console.error('Migration failed:', err);
        process.exit(1);
      });
  });
}
