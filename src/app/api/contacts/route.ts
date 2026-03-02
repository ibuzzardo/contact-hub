import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { createContactSchema } from '@/lib/schemas';
import { Contact, PaginatedResponse } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const group = searchParams.get('group') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const db = getDb();
    
    let whereClause = '';
    const params: any[] = [];
    
    if (search) {
      whereClause += ' WHERE (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (group) {
      whereClause += search ? ' AND group_id = ?' : ' WHERE group_id = ?';
      params.push(parseInt(group));
    }
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM contacts${whereClause}`;
    const countResult = db.prepare(countQuery).get(...params) as { total: number };
    const total = countResult.total;
    
    // Get contacts
    const contactsQuery = `
      SELECT * FROM contacts
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const contacts = db.prepare(contactsQuery).all(...params, limit, offset) as Contact[];
    
    const response: PaginatedResponse<Contact> = {
      data: contacts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validatedData = createContactSchema.parse(body);
    
    const db = getDb();
    
    // Check if group exists if group_id is provided
    if (validatedData.group_id) {
      const group = db.prepare('SELECT id FROM groups WHERE id = ?').get(validatedData.group_id);
      if (!group) {
        return NextResponse.json(
          { error: 'Group not found' },
          { status: 400 }
        );
      }
    }
    
    const stmt = db.prepare(`
      INSERT INTO contacts (name, email, phone, company, group_id, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      validatedData.name,
      validatedData.email,
      validatedData.phone || null,
      validatedData.company || null,
      validatedData.group_id || null,
      validatedData.notes || null
    );
    
    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(result.lastInsertRowid) as Contact;
    
    return NextResponse.json(contact, { status: 201 });
  } catch (error: any) {
    console.error('Error creating contact:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}