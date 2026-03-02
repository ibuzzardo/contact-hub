import { GET } from '@/app/api/stats/route';
import { getDb } from '@/lib/db';

// Mock the database
jest.mock('@/lib/db');
const mockGetDb = getDb as jest.MockedFunction<typeof getDb>;

describe('/api/stats', () => {
  let mockDb: any;
  let mockPrepare: jest.Mock;
  let mockGet: jest.Mock;
  let mockAll: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockGet = jest.fn();
    mockAll = jest.fn();
    mockPrepare = jest.fn().mockReturnValue({
      get: mockGet,
      all: mockAll,
    });
    
    mockDb = {
      prepare: mockPrepare,
    };
    
    mockGetDb.mockReturnValue(mockDb);
  });

  it('should return dashboard statistics', async () => {
    const mockRecentContacts = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        created_at: '2023-01-03T00:00:00.000Z',
        updated_at: '2023-01-03T00:00:00.000Z'
      },
      {
        id: 2,
        name: 'Jane Doe',
        email: 'jane@example.com',
        created_at: '2023-01-02T00:00:00.000Z',
        updated_at: '2023-01-02T00:00:00.000Z'
      }
    ];
    
    mockGet
      .mockReturnValueOnce({ count: 10 }) // total contacts
      .mockReturnValueOnce({ count: 3 }); // total groups
    mockAll.mockReturnValue(mockRecentContacts);
    
    const response = await GET();
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toEqual({
      totalContacts: 10,
      totalGroups: 3,
      recentContacts: mockRecentContacts
    });
  });

  it('should query for total contacts count', async () => {
    mockGet
      .mockReturnValueOnce({ count: 5 })
      .mockReturnValueOnce({ count: 2 });
    mockAll.mockReturnValue([]);
    
    await GET();
    
    expect(mockPrepare).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM contacts');
  });

  it('should query for total groups count', async () => {
    mockGet
      .mockReturnValueOnce({ count: 5 })
      .mockReturnValueOnce({ count: 2 });
    mockAll.mockReturnValue([]);
    
    await GET();
    
    expect(mockPrepare).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM groups');
  });

  it('should query for recent contacts with limit and order', async () => {
    mockGet
      .mockReturnValueOnce({ count: 5 })
      .mockReturnValueOnce({ count: 2 });
    mockAll.mockReturnValue([]);
    
    await GET();
    
    expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('ORDER BY created_at DESC'));
    expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('LIMIT 5'));
  });

  it('should handle zero counts', async () => {
    mockGet
      .mockReturnValueOnce({ count: 0 })
      .mockReturnValueOnce({ count: 0 });
    mockAll.mockReturnValue([]);
    
    const response = await GET();
    const data = await response.json();
    
    expect(data).toEqual({
      totalContacts: 0,
      totalGroups: 0,
      recentContacts: []
    });
  });

  it('should handle database errors', async () => {
    mockGetDb.mockImplementation(() => {
      throw new Error('Database error');
    });
    
    const response = await GET();
    
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to fetch stats');
  });

  it('should handle partial database errors', async () => {
    mockGet
      .mockReturnValueOnce({ count: 5 })
      .mockImplementationOnce(() => {
        throw new Error('Groups query failed');
      });
    
    const response = await GET();
    
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to fetch stats');
  });

  it('should return recent contacts in descending order by creation date', async () => {
    const mockRecentContacts = [
      {
        id: 3,
        name: 'Latest Contact',
        email: 'latest@example.com',
        created_at: '2023-01-05T00:00:00.000Z',
        updated_at: '2023-01-05T00:00:00.000Z'
      },
      {
        id: 2,
        name: 'Middle Contact',
        email: 'middle@example.com',
        created_at: '2023-01-03T00:00:00.000Z',
        updated_at: '2023-01-03T00:00:00.000Z'
      },
      {
        id: 1,
        name: 'Oldest Contact',
        email: 'oldest@example.com',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z'
      }
    ];
    
    mockGet
      .mockReturnValueOnce({ count: 10 })
      .mockReturnValueOnce({ count: 3 });
    mockAll.mockReturnValue(mockRecentContacts);
    
    const response = await GET();
    const data = await response.json();
    
    expect(data.recentContacts).toEqual(mockRecentContacts);
    expect(data.recentContacts[0].name).toBe('Latest Contact');
    expect(data.recentContacts[2].name).toBe('Oldest Contact');
  });

  it('should limit recent contacts to 5', async () => {
    mockGet
      .mockReturnValueOnce({ count: 100 })
      .mockReturnValueOnce({ count: 5 });
    mockAll.mockReturnValue(new Array(5).fill({
      id: 1,
      name: 'Contact',
      email: 'contact@example.com',
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z'
    }));
    
    const response = await GET();
    const data = await response.json();
    
    expect(data.recentContacts).toHaveLength(5);
    expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('LIMIT 5'));
  });
});