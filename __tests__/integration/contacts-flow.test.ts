import { getDb, closeDb } from '@/lib/db';
import { GET as getContacts, POST as createContact } from '@/app/api/contacts/route';
import { GET as getGroups, POST as createGroup } from '@/app/api/groups/route';
import { GET as getStats } from '@/app/api/stats/route';
import { NextRequest } from 'next/server';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Integration tests using real SQLite database
describe('Contacts Integration Flow', () => {
  let testDbPath: string;
  let originalDbPath: string;

  beforeAll(() => {
    // Create a temporary test database
    testDbPath = path.join(__dirname, 'test.db');
    originalDbPath = process.env.DATABASE_PATH;
    process.env.DATABASE_PATH = testDbPath;
  });

  afterAll(() => {
    // Cleanup
    closeDb();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    process.env.DATABASE_PATH = originalDbPath;
  });

  beforeEach(() => {
    // Clean up database before each test
    closeDb();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  it('should complete full contact management flow', async () => {
    // 1. Initially no contacts or groups
    let statsResponse = await getStats();
    let stats = await statsResponse.json();
    expect(stats.totalContacts).toBe(0);
    expect(stats.totalGroups).toBe(0);
    expect(stats.recentContacts).toHaveLength(0);

    // 2. Create a group
    const groupRequest = new NextRequest('http://localhost:3000/api/groups', {
      method: 'POST',
      body: JSON.stringify({ name: 'Work' })
    });
    const groupResponse = await createGroup(groupRequest);
    expect(groupResponse.status).toBe(201);
    const group = await groupResponse.json();
    expect(group.name).toBe('Work');
    expect(group.id).toBe(1);

    // 3. Verify group was created
    const groupsResponse = await getGroups();
    const groups = await groupsResponse.json();
    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe('Work');
    expect(groups[0].contact_count).toBe(0);

    // 4. Create contacts
    const contact1Data = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      company: 'Acme Corp',
      group_id: group.id,
      notes: 'Important client'
    };

    const contact1Request = new NextRequest('http://localhost:3000/api/contacts', {
      method: 'POST',
      body: JSON.stringify(contact1Data)
    });
    const contact1Response = await createContact(contact1Request);
    expect(contact1Response.status).toBe(201);
    const contact1 = await contact1Response.json();
    expect(contact1.name).toBe('John Doe');
    expect(contact1.group_id).toBe(group.id);

    const contact2Data = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      company: 'Tech Corp'
    };

    const contact2Request = new NextRequest('http://localhost:3000/api/contacts', {
      method: 'POST',
      body: JSON.stringify(contact2Data)
    });
    const contact2Response = await createContact(contact2Request);
    expect(contact2Response.status).toBe(201);
    const contact2 = await contact2Response.json();
    expect(contact2.name).toBe('Jane Smith');
    expect(contact2.group_id).toBeNull();

    // 5. Verify contacts were created
    const contactsRequest = new NextRequest('http://localhost:3000/api/contacts');
    const contactsResponse = await getContacts(contactsRequest);
    const contactsData = await contactsResponse.json();
    expect(contactsData.total).toBe(2);
    expect(contactsData.data).toHaveLength(2);

    // 6. Test search functionality
    const searchRequest = new NextRequest('http://localhost:3000/api/contacts?search=john');
    const searchResponse = await getContacts(searchRequest);
    const searchData = await searchResponse.json();
    expect(searchData.total).toBe(1);
    expect(searchData.data[0].name).toBe('John Doe');

    // 7. Test group filtering
    const groupFilterRequest = new NextRequest(`http://localhost:3000/api/contacts?group=${group.id}`);
    const groupFilterResponse = await getContacts(groupFilterRequest);
    const groupFilterData = await groupFilterResponse.json();
    expect(groupFilterData.total).toBe(1);
    expect(groupFilterData.data[0].name).toBe('John Doe');

    // 8. Verify updated stats
    statsResponse = await getStats();
    stats = await statsResponse.json();
    expect(stats.totalContacts).toBe(2);
    expect(stats.totalGroups).toBe(1);
    expect(stats.recentContacts).toHaveLength(2);
    expect(stats.recentContacts[0].name).toBe('Jane Smith'); // Most recent first
    expect(stats.recentContacts[1].name).toBe('John Doe');

    // 9. Verify group contact count updated
    const updatedGroupsResponse = await getGroups();
    const updatedGroups = await updatedGroupsResponse.json();
    expect(updatedGroups[0].contact_count).toBe(1);
  });

  it('should handle pagination correctly', async () => {
    // Create multiple contacts
    const contacts = [];
    for (let i = 1; i <= 25; i++) {
      const contactData = {
        name: `Contact ${i}`,
        email: `contact${i}@example.com`
      };
      
      const request = new NextRequest('http://localhost:3000/api/contacts', {
        method: 'POST',
        body: JSON.stringify(contactData)
      });
      
      const response = await createContact(request);
      expect(response.status).toBe(201);
      contacts.push(await response.json());
    }

    // Test first page
    const page1Request = new NextRequest('http://localhost:3000/api/contacts?page=1&limit=10');
    const page1Response = await getContacts(page1Request);
    const page1Data = await page1Response.json();
    
    expect(page1Data.total).toBe(25);
    expect(page1Data.page).toBe(1);
    expect(page1Data.limit).toBe(10);
    expect(page1Data.totalPages).toBe(3);
    expect(page1Data.data).toHaveLength(10);

    // Test second page
    const page2Request = new NextRequest('http://localhost:3000/api/contacts?page=2&limit=10');
    const page2Response = await getContacts(page2Request);
    const page2Data = await page2Response.json();
    
    expect(page2Data.page).toBe(2);
    expect(page2Data.data).toHaveLength(10);

    // Test last page
    const page3Request = new NextRequest('http://localhost:3000/api/contacts?page=3&limit=10');
    const page3Response = await getContacts(page3Request);
    const page3Data = await page3Response.json();
    
    expect(page3Data.page).toBe(3);
    expect(page3Data.data).toHaveLength(5); // Remaining contacts
  });

  it('should handle validation errors properly', async () => {
    // Test invalid contact data
    const invalidContactData = {
      name: '', // Empty name
      email: 'invalid-email', // Invalid email
      phone: 'a'.repeat(25), // Too long phone
      notes: 'a'.repeat(501) // Too long notes
    };

    const request = new NextRequest('http://localhost:3000/api/contacts', {
      method: 'POST',
      body: JSON.stringify(invalidContactData)
    });

    const response = await createContact(request);
    expect(response.status).toBe(400);
    
    const errorData = await response.json();
    expect(errorData.error).toBe('Validation failed');
    expect(errorData.details).toBeDefined();
    expect(Array.isArray(errorData.details)).toBe(true);
  });

  it('should handle database constraints', async () => {
    // Create a group
    const groupRequest = new NextRequest('http://localhost:3000/api/groups', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Group' })
    });
    await createGroup(groupRequest);

    // Try to create another group with the same name
    const duplicateGroupRequest = new NextRequest('http://localhost:3000/api/groups', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Group' })
    });
    
    const response = await createGroup(duplicateGroupRequest);
    expect(response.status).toBe(409);
    
    const errorData = await response.json();
    expect(errorData.error).toBe('A group with this name already exists');
  });

  it('should handle foreign key constraints', async () => {
    // Try to create contact with non-existent group
    const contactData = {
      name: 'John Doe',
      email: 'john@example.com',
      group_id: 999 // Non-existent group
    };

    const request = new NextRequest('http://localhost:3000/api/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData)
    });

    const response = await createContact(request);
    expect(response.status).toBe(400);
    
    const errorData = await response.json();
    expect(errorData.error).toBe('Group not found');
  });
});