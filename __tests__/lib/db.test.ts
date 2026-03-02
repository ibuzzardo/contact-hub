import { getDb, closeDb } from '@/lib/db';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Mock better-sqlite3
jest.mock('better-sqlite3');
const MockDatabase = Database as jest.MockedClass<typeof Database>;

// Mock fs
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('Database Module', () => {
  let mockDbInstance: jest.Mocked<Database.Database>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDbInstance = {
      exec: jest.fn(),
      close: jest.fn(),
      prepare: jest.fn(),
    } as any;
    MockDatabase.mockReturnValue(mockDbInstance);
    mockFs.existsSync.mockReturnValue(true);
    mockFs.mkdirSync.mockImplementation();
  });

  afterEach(() => {
    closeDb();
  });

  describe('getDb', () => {
    it('should create database instance and initialize tables', () => {
      const db = getDb();
      
      expect(MockDatabase).toHaveBeenCalledWith('./data/contacts.db');
      expect(mockDbInstance.exec).toHaveBeenCalledTimes(2);
      expect(mockDbInstance.exec).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS groups'));
      expect(mockDbInstance.exec).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS contacts'));
      expect(db).toBe(mockDbInstance);
    });

    it('should return existing database instance on subsequent calls', () => {
      const db1 = getDb();
      const db2 = getDb();
      
      expect(db1).toBe(db2);
      expect(MockDatabase).toHaveBeenCalledTimes(1);
    });

    it('should create data directory if it does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);
      
      getDb();
      
      expect(mockFs.mkdirSync).toHaveBeenCalledWith('./data', { recursive: true });
    });

    it('should use custom database path from environment', () => {
      const originalEnv = process.env.DATABASE_PATH;
      process.env.DATABASE_PATH = '/custom/path/test.db';
      
      getDb();
      
      expect(MockDatabase).toHaveBeenCalledWith('/custom/path/test.db');
      
      process.env.DATABASE_PATH = originalEnv;
    });
  });

  describe('closeDb', () => {
    it('should close database connection', () => {
      getDb();
      closeDb();
      
      expect(mockDbInstance.close).toHaveBeenCalled();
    });

    it('should handle closing when no database exists', () => {
      expect(() => closeDb()).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle database creation errors', () => {
      MockDatabase.mockImplementation(() => {
        throw new Error('Database creation failed');
      });
      
      expect(() => getDb()).toThrow('Database creation failed');
    });

    it('should handle table initialization errors', () => {
      mockDbInstance.exec.mockImplementation(() => {
        throw new Error('Table creation failed');
      });
      
      expect(() => getDb()).toThrow('Table creation failed');
    });
  });
});