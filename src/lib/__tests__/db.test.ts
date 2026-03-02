import Database from 'better-sqlite3';
import { initializeTables } from '../db';
import path from 'path';
import fs from 'fs';

// Mock better-sqlite3
jest.mock('better-sqlite3');

const mockDb = {
  pragma: jest.fn(),
  exec: jest.fn(),
  prepare: jest.fn().mockReturnValue({
    run: jest.fn(),
    get: jest.fn(),
    all: jest.fn()
  })
};

(Database as jest.MockedClass<typeof Database>).mockImplementation(() => mockDb as any);

describe('Database Initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should enable foreign keys', () => {
    require('../db');
    expect(mockDb.pragma).toHaveBeenCalledWith('foreign_keys = ON');
  });

  it('should create groups table', () => {
    initializeTables();
    expect(mockDb.exec).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS groups'));
  });

  it('should create contacts table', () => {
    initializeTables();
    expect(mockDb.exec).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS contacts'));
  });

  it('should create update triggers', () => {
    initializeTables();
    expect(mockDb.exec).toHaveBeenCalledWith(expect.stringContaining('CREATE TRIGGER IF NOT EXISTS update_contacts_timestamp'));
    expect(mockDb.exec).toHaveBeenCalledWith(expect.stringContaining('CREATE TRIGGER IF NOT EXISTS update_groups_timestamp'));
  });

  it('should handle existing columns gracefully', () => {
    mockDb.exec.mockImplementationOnce(() => {
      throw new Error('Column already exists');
    });
    
    expect(() => initializeTables()).not.toThrow();
  });

  it('should use correct database path', () => {
    const expectedPath = path.join(process.cwd(), 'contacts.db');
    expect(Database).toHaveBeenCalledWith(expectedPath);
  });
});