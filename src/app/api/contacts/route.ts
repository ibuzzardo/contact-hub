// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { createContactSchema } from '@/lib/schemas';
import { Contact, Group } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const groupFilter = searchParams.get('group') || '';
    const sort = searchParams.get('sort') || 'name-asc';
    const favoriteFilter = searchParams.get('favorite') === 'true';
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ? OR company LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (groupFilter) {
      whereClause += ' AND group_id = ?';
      params.push(parseInt(groupFilter));
    }

    if (favoriteFilter) {
      whereClause += ' AND favorite = 1';
    }

    // Build ORDER BY clause
    let orderClause = 'ORDER BY ';
    switch (sort) {
      case 'name-desc':
        orderClause += 'name DESC';
        break;
      case 'newest':
        orderClause += 'created_at DESC';
        break;
      case 'oldest':
        orderClause += 'created_at ASC';
        break;
      case 'company':
        orderClause += 'company ASC, name ASC';
        break;
      default: // name-asc
        orderClause += 'name ASC';
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM contacts ${whereClause}`;
    const countResult = db.prepare(countQuery).get(...params) as { total: number };
    const total = countResult.total;

    // Get contacts
    const contactsQuery = `
      SELECT id, name, email, phone, company, job_title, group_id, notes, favorite, created_at, updated_at 
      FROM contacts 
      ${whereClause} 
      ${orderClause} 
      LIMIT ? OFFSET ?
    `;
    const contacts = db.prepare(contactsQuery).all(...params, limit, offset) as Contact[];

    // Get all groups for the response
    const groups = db.prepare('SELECT * FROM groups ORDER BY name').all() as Group[];

    return NextResponse.json({
      contacts,
      groups,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
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

    const stmt = db.prepare(`
      INSERT INTO contacts (name, email, phone, company, job_title, group_id, notes, favorite)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      validatedData.name,
      validatedData.email,
      validatedData.phone || null,
      validatedData.company || null,
      validatedData.job_title || null,
      validatedData.group_id || null,
      validatedData.notes || null,
      validatedData.favorite || 0
    );

    const contact = db.prepare(
      'SELECT id, name, email, phone, company, job_title, group_id, notes, favorite, created_at, updated_at FROM contacts WHERE id = ?'
    ).get(result.lastInsertRowid) as Contact;

    return NextResponse.json(contact, { status: 201 });
  } catch (error: any) {
    console.error('Error creating contact:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json(
        { error: 'A contact with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}