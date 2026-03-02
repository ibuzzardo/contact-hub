import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { createDealSchema } from '@/lib/schemas';
import { Deal } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const dealId = parseInt(id);

    if (isNaN(dealId)) {
      return NextResponse.json(
        { error: 'Invalid deal ID' },
        { status: 400 }
      );
    }

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

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    const dealWithTags = {
      ...deal,
      tags: deal.tags ? deal.tags.split(',') : []
    };

    return NextResponse.json(dealWithTags);
  } catch (error) {
    console.error('Error fetching deal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deal' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const dealId = parseInt(id);

    if (isNaN(dealId)) {
      return NextResponse.json(
        { error: 'Invalid deal ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = createDealSchema.parse(body);

    const transaction = db.transaction(() => {
      // Update deal
      const stmt = db.prepare(`
        UPDATE deals 
        SET name = ?, company_id = ?, contact_id = ?, value = ?, stage = ?, probability = ?, expected_close = ?, notes = ?
        WHERE id = ?
      `);

      const result = stmt.run(
        validatedData.name,
        validatedData.company_id || null,
        validatedData.contact_id || null,
        validatedData.value,
        validatedData.stage,
        validatedData.probability,
        validatedData.expected_close || null,
        validatedData.notes || null,
        dealId
      );

      if (result.changes === 0) {
        throw new Error('Deal not found');
      }

      // Update tags - delete existing and insert new ones
      db.prepare('DELETE FROM deal_tags WHERE deal_id = ?').run(dealId);
      
      if (validatedData.tags && validatedData.tags.length > 0) {
        const tagStmt = db.prepare('INSERT INTO deal_tags (deal_id, tag) VALUES (?, ?)');
        for (const tag of validatedData.tags) {
          tagStmt.run(dealId, tag);
        }
      }
    });

    transaction();

    // Fetch the updated deal with joined data
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
      ...deal,
      tags: deal.tags ? deal.tags.split(',') : []
    };

    return NextResponse.json(dealWithTags);
  } catch (error: any) {
    console.error('Error updating deal:', error);
    
    if (error.message === 'Deal not found') {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update deal' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const dealId = parseInt(id);

    if (isNaN(dealId)) {
      return NextResponse.json(
        { error: 'Invalid deal ID' },
        { status: 400 }
      );
    }

    const stmt = db.prepare('DELETE FROM deals WHERE id = ?');
    const result = stmt.run(dealId);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting deal:', error);
    return NextResponse.json(
      { error: 'Failed to delete deal' },
      { status: 500 }
    );
  }
}