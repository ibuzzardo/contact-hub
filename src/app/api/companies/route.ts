// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { createCompanySchema } from '@/lib/schemas';
import { Company } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'name';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        c.*,
        COUNT(DISTINCT contacts.id) as contact_count,
        COALESCE(SUM(CASE WHEN deals.stage NOT IN ('closed_won', 'closed_lost') THEN deals.value ELSE 0 END), 0) as total_deal_value,
        COUNT(CASE WHEN deals.stage NOT IN ('closed_won', 'closed_lost') THEN deals.id END) as open_deal_count
      FROM companies c
      LEFT JOIN contacts ON contacts.company_id = c.id
      LEFT JOIN deals ON deals.company_id = c.id
    `;

    const params: any[] = [];
    
    if (search) {
      query += ' WHERE c.name LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' GROUP BY c.id';

    // Add sorting
    switch (sort) {
      case 'name':
        query += ' ORDER BY c.name ASC';
        break;
      case 'industry':
        query += ' ORDER BY c.industry ASC';
        break;
      case 'deal_value':
        query += ' ORDER BY total_deal_value DESC';
        break;
      default:
        query += ' ORDER BY c.created_at DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const companies = db.prepare(query).all(...params) as Company[];

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM companies';
    const countParams: any[] = [];
    
    if (search) {
      countQuery += ' WHERE name LIKE ?';
      countParams.push(`%${search}%`);
    }

    const { total } = db.prepare(countQuery).get(...countParams) as { total: number };

    return NextResponse.json({
      companies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validatedData = createCompanySchema.parse(body);

    const stmt = db.prepare(`
      INSERT INTO companies (name, industry, website, phone, address, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      validatedData.name,
      validatedData.industry || null,
      validatedData.website || null,
      validatedData.phone || null,
      validatedData.address || null,
      validatedData.notes || null
    );

    const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(result.lastInsertRowid) as Company;

    return NextResponse.json(company, { status: 201 });
  } catch (error: any) {
    console.error('Error creating company:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json(
        { error: 'Company name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
}