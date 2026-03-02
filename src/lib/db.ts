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

  try {
    db.exec('ALTER TABLE contacts ADD COLUMN company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL');
  } catch (e) {
    // Column already exists
  }

  // Create companies table
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      industry TEXT,
      website TEXT,
      phone TEXT,
      address TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create deals table
  db.exec(`
    CREATE TABLE IF NOT EXISTS deals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company_id INTEGER,
      contact_id INTEGER,
      value REAL DEFAULT 0,
      stage TEXT NOT NULL DEFAULT 'lead',
      probability INTEGER DEFAULT 10,
      expected_close TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
    )
  `);

  // Create deal_tags table
  db.exec(`
    CREATE TABLE IF NOT EXISTS deal_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deal_id INTEGER NOT NULL,
      tag TEXT NOT NULL,
      FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
    )
  `);

  // Create activities table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT,
      contact_id INTEGER,
      deal_id INTEGER,
      company_id INTEGER,
      duration_minutes INTEGER,
      outcome TEXT,
      activity_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
      FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE SET NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
    )
  `);

  // Create tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT DEFAULT 'follow_up',
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'pending',
      due_date TEXT,
      contact_id INTEGER,
      deal_id INTEGER,
      notes TEXT,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
      FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE SET NULL
    )
  `);

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

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_companies_timestamp 
    AFTER UPDATE ON companies
    BEGIN
      UPDATE companies SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_deals_timestamp 
    AFTER UPDATE ON deals
    BEGIN
      UPDATE deals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_tasks_timestamp 
    AFTER UPDATE ON tasks
    BEGIN
      UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `);
}

// Initialize tables on import
initializeTables();

export default db;