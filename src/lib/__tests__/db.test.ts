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
  }),
  transaction: jest.fn().mockImplementation((fn) => fn),
  close: jest.fn()
};

(Database as jest.MockedClass<typeof Database>).mockImplementation(() => mockDb as any);

describe('Database initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create database with correct path', () => {
    const expectedPath = path.join(process.cwd(), 'contacts.db');
    expect(Database).toHaveBeenCalledWith(expectedPath);
  });

  it('should enable foreign keys', () => {
    expect(mockDb.pragma).toHaveBeenCalledWith('foreign_keys = ON');
  });

  it('should initialize all required tables', () => {
    initializeTables();
    
    expect(mockDb.exec).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS groups'));
    expect(mockDb.exec).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS contacts'));
    expect(mockDb.exec).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS companies'));
    expect(mockDb.exec).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS deals'));
  });

  it('should handle existing columns gracefully', () => {
    mockDb.exec.mockImplementationOnce(() => {
      throw new Error('column already exists');
    });
    
    expect(() => initializeTables()).not.toThrow();
  });

  it('should create proper foreign key relationships', () => {
    initializeTables();
    
    const contactsTableCall = mockDb.exec.mock.calls.find(call => 
      call[0].includes('CREATE TABLE IF NOT EXISTS contacts')
    );
    expect(contactsTableCall[0]).toContain('FOREIGN KEY (group_id) REFERENCES groups (id)');
    
    const dealsTableCall = mockDb.exec.mock.calls.find(call => 
      call[0].includes('CREATE TABLE IF NOT EXISTS deals')
    );
    expect(dealsTableCall[0]).toContain('FOREIGN KEY (company_id) REFERENCES companies(id)');
    expect(dealsTableCall[0]).toContain('FOREIGN KEY (contact_id) REFERENCES contacts(id)');
  });
});