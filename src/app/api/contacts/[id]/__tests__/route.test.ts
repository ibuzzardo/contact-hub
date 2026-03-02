import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '../route';
import db from '@/lib/db';

jest.mock('@/lib/db');

const mockDb = {
  prepare: jest.fn().mockReturnValue({
    get: jest.fn(),
    run: jest.fn()
  })
};

(db as any) = mockDb;

describe('/api/contacts/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return contact with group', async () => {
      const mockContact = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        group_id: 1
      };
      const mockGroup = { id: 1, name: 'Customer' };

      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(mockContact)
      });
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(mockGroup)
      });

      const response = await GET(
        new NextRequest('http://localhost:3000/api/contacts/1'),
        { params: Promise.resolve({ id: '1' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.contact).toEqual(mockContact);
      expect(data.group).toEqual(mockGroup);
    });

    it('should return contact without group', async () => {
      const mockContact = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        group_id: null
      };

      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(mockContact)
      });

      const response = await GET(
        new NextRequest('http://localhost:3000/api/contacts/1'),
        { params: Promise.resolve({ id: '1' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.contact).toEqual(mockContact);
      expect(data.group).toBeUndefined();
    });

    it('should return 404 for non-existent contact', async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(undefined)
      });

      const response = await GET(
        new NextRequest('http://localhost:3000/api/contacts/999'),
        { params: Promise.resolve({ id: '999' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Contact not found');
    });

    it('should return 400 for invalid ID', async () => {
      const response = await GET(
        new NextRequest('http://localhost:3000/api/contacts/invalid'),
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

      const response = await GET(
        new NextRequest('http://localhost:3000/api/contacts/1'),
        { params: Promise.resolve({ id: '1' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch contact');
    });
  });

  describe('PUT', () => {
    it('should update contact successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };
      const updatedContact = { id: 1, ...updateData };

      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({ id: 1 })
      });
      mockDb.prepare.mockReturnValueOnce({
        run: jest.fn().mockReturnValue({ changes: 1 })
      });
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(updatedContact)
      });

      const response = await PUT(
        new NextRequest('http://localhost:3000/api/contacts/1', {
          method: 'PUT',
          body: JSON.stringify(updateData)
        }),
        { params: Promise.resolve({ id: '1' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedContact);
    });

    it('should return 404 for non-existent contact', async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue(undefined)
      });

      const response = await PUT(
        new NextRequest('http://localhost:3000/api/contacts/999', {
          method: 'PUT',
          body: JSON.stringify({ name: 'Updated' })
        }),
        { params: Promise.resolve({ id: '999' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Contact not found');
    });

    it('should return 400 for no fields to update', async () => {
      mockDb.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({ id: 1 })
      });

      const response = await PUT(
        new NextRequest('http://localhost:3000/api/contacts/1', {
          method: 'PUT',
          body: JSON.stringify({})
        }),
        { params: Promise.resolve({ id: '1' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No fields to update');
    });

    it('should validate update data', async () => {
      const invalidData = {
        email: 'invalid-email'
      };

      const response = await PUT(
        new NextRequest('http://localhost:3000/api/contacts/1', {
          method: 'PUT',
          body: JSON.stringify(invalidData)
        }),
        { params: Promise.resolve({ id: '1' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should return 400 for invalid ID', async () => {
      const response = await PUT(
        new NextRequest('http://localhost:3000/api/contacts/invalid', {
          method: 'PUT',
          body: JSON.stringify({ name: 'Updated' })
        }),
        { params: Promise.resolve({ id: 'invalid' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid contact ID');
    });
  });

  describe('DELETE', () => {
    it('should delete contact successfully', async () => {
      mockDb.prepare.mockReturnValueOnce({
        run: jest.fn().mockReturnValue({ changes: 1 })
      });

      const response = await DELETE(
        new NextRequest('http://localhost:3000/api/contacts/1'),
        { params: Promise.resolve({ id: '1' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Contact deleted successfully');
    });

    it('should return 404 for non-existent contact', async () => {
      mockDb.prepare.mockReturnValueOnce({
        run: jest.fn().mockReturnValue({ changes: 0 })
      });

      const response = await DELETE(
        new NextRequest('http://localhost:3000/api/contacts/999'),
        { params: Promise.resolve({ id: '999' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Contact not found');
    });

    it('should return 400 for invalid ID', async () => {
      const response = await DELETE(
        new NextRequest('http://localhost:3000/api/contacts/invalid'),
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

      const response = await DELETE(
        new NextRequest('http://localhost:3000/api/contacts/1'),
        { params: Promise.resolve({ id: '1' }) }
      );
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete contact');
    });
  });
});