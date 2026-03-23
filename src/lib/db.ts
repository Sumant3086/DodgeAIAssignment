import Database from 'better-sqlite3';
import path from 'path';

let db: any = null;

export function getDb() {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'sap-o2c.db');
    db = new Database(dbPath, { readonly: true });
  }
  return db;
}
