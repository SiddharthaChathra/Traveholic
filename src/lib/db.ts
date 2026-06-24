import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = path.join(process.cwd(), 'travora.db');

  // Open the database file
  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Enable foreign key constraints in SQLite
  await dbInstance.exec('PRAGMA foreign_keys = ON;');

  // Read and run the schema initialization
  const schemaPath = path.join(process.cwd(), 'src', 'lib', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await dbInstance.exec(schemaSql);
  } else {
    console.error('Schema SQL file not found at:', schemaPath);
  }

  return dbInstance;
}
