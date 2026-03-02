import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'contacts.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initializeTables(): void {
  // Create groups table
  db.exec(`
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create contacts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      company TEXT,
      group_id INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE SET NULL
    )
  `);

  // Add new columns with try/catch to handle existing databases
  try {
    db.exec('ALTER TABLE contacts ADD COLUMN job_title TEXT');
  } catch (e) {
    // Column already exists
  }

  try {
    db.exec('ALTER TABLE contacts ADD COLUMN favorite INTEGER DEFAULT 0');
  } catch (e) {
    // Column already exists
  }

  // Create trigger to update updated_at timestamp
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_contacts_timestamp 
    AFTER UPDATE ON contacts
    BEGIN
      UPDATE contacts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_groups_timestamp 
    AFTER UPDATE ON groups
    BEGIN
      UPDATE groups SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `);
}

// Initialize tables on import
initializeTables();

export default db;