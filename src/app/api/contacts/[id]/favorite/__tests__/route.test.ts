import { NextRequest } from 'next/server';
import { PATCH } from '../route';
import db from '@/lib/db';

jest.mock('@/lib/db');

const mockDb = {
  prepare: jest.fn().mockReturnValue({
    get: jest.fn(),
    run: jest.fn()
  })
};

(db as any) = mockDb;

describe('/api/contacts/[id]/favorite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PATCH', () => {
    it('should toggle favorite from 0 to 1', async () => {
      const mockContact = { id: 1, favorite: 0 };
      const updatedContact = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        favorite: 1
      };

      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(mockContact)
      });
      mockDb.prepare.mockReturnValueOnce({
        run: jest.fn().mockReturnValue({ changes: 1 })
      });
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(updatedContact)
      });

      const response = await PATCH(
        new NextRequest('http://localhost:3000/api/contacts/1/favorite'),
        { params: Promise.resolve({ id: '1' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.favorite).toBe(1);
      expect(mockDb.prepare).toHaveBeenCalledWith(
        'UPDATE contacts SET favorite = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      );
    });

    it('should toggle favorite from 1 to 0', async () => {
      const mockContact = { id: 1, favorite: 1 };
      const updatedContact = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        favorite: 0
      };

      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(mockContact)
      });
      mockDb.prepare.mockReturnValueOnce({
        run: jest.fn().mockReturnValue({ changes: 1 })
      });
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(updatedContact)
      });

      const response = await PATCH(
        new NextRequest('http://localhost:3000/api/contacts/1/favorite'),
        { params: Promise.resolve({ id: '1' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.favorite).toBe(0);
    });

    it('should return 404 for non-existent contact', async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(undefined)
      });

      const response = await PATCH(
        new NextRequest('http://localhost:3000/api/contacts/999/favorite'),
        { params: Promise.resolve({ id: '999' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Contact not found');
    });

    it('should return 400 for invalid ID', async () => {
      const response = await PATCH(
        new NextRequest('http://localhost:3000/api/contacts/invalid/favorite'),
        { params: Promise.resolve({ id: 'invalid' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid contact ID');
    });

    it('should handle database errors', async () => {
      mockDb.prepare.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await PATCH(
        new NextRequest('http://localhost:3000/api/contacts/1/favorite'),
        { params: Promise.resolve({ id: '1' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to toggle favorite status');
    });

    it('should update timestamp when toggling favorite', async () => {
      const mockContact = { id: 1, favorite: 0 };
      const updatedContact = { id: 1, favorite: 1 };

      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(mockContact)
      });
      const mockRun = jest.fn().mockReturnValue({ changes: 1 });
      mockDb.prepare.mockReturnValueOnce({
        run: mockRun
      });
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(updatedContact)
      });

      await PATCH(
        new NextRequest('http://localhost:3000/api/contacts/1/favorite'),
        { params: Promise.resolve({ id: '1' }) }
      );

      expect(mockRun).toHaveBeenCalledWith(1, 1);
    });
  });
});