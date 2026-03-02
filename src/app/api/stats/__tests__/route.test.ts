import { GET } from '../route';
import db from '@/lib/db';

jest.mock('@/lib/db');

const mockDb = {
  prepare: jest.fn().mockReturnValue({
    get: jest.fn(),
    all: jest.fn()
  })
};

(db as any) = mockDb;

describe('/api/stats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return dashboard statistics', async () => {
    const mockRecentContacts = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ];

    // Mock database calls
    mockDb.prepare.mockReturnValueOnce({
      get: jest.fn().mockReturnValue({ count: 100 })
    });
    mockDb.prepare.mockReturnValueOnce({
      get: jest.fn().mockReturnValue({ count: 5 })
    });
    mockDb.prepare.mockReturnValueOnce({
      get: jest.fn().mockReturnValue({ count: 15 })
    });
    mockDb.prepare.mockReturnValueOnce({
      get: jest.fn().mockReturnValue({ count: 8 })
    });
    mockDb.prepare.mockReturnValueOnce({
      all: jest.fn().mockReturnValue(mockRecentContacts)
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      totalContacts: 100,
      totalGroups: 5,
      recentContacts: mockRecentContacts,
      favoritesCount: 15,
      newThisWeek: 8
    });
  });

  it('should query for contacts created in the last 7 days', async () => {
    mockDb.prepare.mockReturnValue({
      get: jest.fn().mockReturnValue({ count: 0 }),
      all: jest.fn().mockReturnValue([])
    });

    await GET();

    // Check that the new this week query uses correct date
    const newThisWeekCall = mockDb.prepare.mock.calls[3];
    expect(newThisWeekCall[0]).toContain('created_at >= ?');
    
    // The date should be 7 days ago from the mocked current time
    const expectedDate = new Date('2023-01-08T12:00:00Z').toISOString();
    const actualCall = mockDb.prepare.mock.calls[3];
    const mockGet = mockDb.prepare.mock.results[3].value.get;
    expect(mockGet).toHaveBeenCalledWith(expectedDate);
  });

  it('should limit recent contacts to 5', async () => {
    mockDb.prepare.mockReturnValue({
      get: jest.fn().mockReturnValue({ count: 0 }),
      all: jest.fn().mockReturnValue([])
    });

    await GET();

    // Check that recent contacts query has LIMIT 5
    const recentContactsCall = mockDb.prepare.mock.calls[4];
    expect(recentContactsCall[0]).toContain('LIMIT 5');
    expect(recentContactsCall[0]).toContain('ORDER BY created_at DESC');
  });

  it('should handle database errors gracefully', async () => {
    mockDb.prepare.mockImplementation(() => {
      throw new Error('Database error');
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch dashboard stats');
  });

  it('should query for favorites count correctly', async () => {
    mockDb.prepare.mockReturnValue({
      get: jest.fn().mockReturnValue({ count: 0 }),
      all: jest.fn().mockReturnValue([])
    });

    await GET();

    // Check favorites query
    const favoritesCall = mockDb.prepare.mock.calls[2];
    expect(favoritesCall[0]).toContain('favorite = 1');
  });

  it('should return zero values when no data exists', async () => {
    mockDb.prepare.mockReturnValue({
      get: jest.fn().mockReturnValue({ count: 0 }),
      all: jest.fn().mockReturnValue([])
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      totalContacts: 0,
      totalGroups: 0,
      recentContacts: [],
      favoritesCount: 0,
      newThisWeek: 0
    });
  });
});