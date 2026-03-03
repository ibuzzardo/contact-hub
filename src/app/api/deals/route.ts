// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { createDealSchema } from '@/lib/schemas';
import { Deal } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');
    const sort = searchParams.get('sort') || 'created_at';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        d.*,
        c.name as company_name,
        contacts.name as contact_name,
        GROUP_CONCAT(dt.tag) as tags
      FROM deals d
      LEFT JOIN companies c ON d.company_id = c.id
      LEFT JOIN contacts ON d.contact_id = contacts.id
      LEFT JOIN deal_tags dt ON d.id = dt.deal_id
    `;

    const params: any[] = [];
    
    if (stage) {
      query += ' WHERE d.stage = ?';
      params.push(stage);
    }

    query += ' GROUP BY d.id';

    // Add sorting
    switch (sort) {
      case 'name':
        query += ' ORDER BY d.name ASC';
        break;
      case 'value':
        query += ' ORDER BY d.value DESC';
        break;
      case 'stage':
        query += ' ORDER BY d.stage ASC';
        break;
      default:
        query += ' ORDER BY d.created_at DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const deals = db.prepare(query).all(...params).map((deal: any) => ({
      ...(deal as Record<string, any>),
      tags: (deal as any).tags ? (deal as any).tags.split(',') : []
    })) as Deal[];

    return NextResponse.json(deals);
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validatedData = createDealSchema.parse(body);

    const transaction = db.transaction(() => {
      // Insert deal
      const stmt = db.prepare(`
        INSERT INTO deals (name, company_id, contact_id, value, stage, probability, expected_close, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        validatedData.name,
        validatedData.company_id || null,
        validatedData.contact_id || null,
        validatedData.value,
        validatedData.stage,
        validatedData.probability,
        validatedData.expected_close || null,
        validatedData.notes || null
      );

      const dealId = result.lastInsertRowid;

      // Insert tags if provided
      if (validatedData.tags && validatedData.tags.length > 0) {
        const tagStmt = db.prepare('INSERT INTO deal_tags (deal_id, tag) VALUES (?, ?)');
        for (const tag of validatedData.tags) {
          tagStmt.run(dealId, tag);
        }
      }

      return dealId;
    });

    const dealId = transaction();

    // Fetch the created deal with joined data
    const deal = db.prepare(`
      SELECT 
        d.*,
        c.name as company_name,
        contacts.name as contact_name,
        GROUP_CONCAT(dt.tag) as tags
      FROM deals d
      LEFT JOIN companies c ON d.company_id = c.id
      LEFT JOIN contacts ON d.contact_id = contacts.id
      LEFT JOIN deal_tags dt ON d.id = dt.deal_id
      WHERE d.id = ?
      GROUP BY d.id
    `).get(dealId);

    const dealWithTags = {
      ...(deal as Record<string, any>),
      tags: (deal as any).tags ? (deal as any).tags.split(',') : []
    };

    return NextResponse.json(dealWithTags, { status: 201 });
  } catch (error: any) {
    console.error('Error creating deal:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create deal' },
      { status: 500 }
    );
  }
}