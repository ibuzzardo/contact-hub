import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';

const updateStageSchema = z.object({
  stage: z.enum(['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'])
});

export async function PATCH(
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
    const { stage } = updateStageSchema.parse(body);

    const transaction = db.transaction(() => {
      // Get current deal info
      const currentDeal = db.prepare('SELECT * FROM deals WHERE id = ?').get(dealId);
      
      if (!currentDeal) {
        throw new Error('Deal not found');
      }

      // Update deal stage
      const updateStmt = db.prepare('UPDATE deals SET stage = ? WHERE id = ?');
      updateStmt.run(stage, dealId);

      // Create activity record for stage change
      const activityStmt = db.prepare(`
        INSERT INTO activities (type, subject, deal_id, activity_date)
        VALUES ('stage_change', ?, ?, CURRENT_TIMESTAMP)
      `);
      
      const subject = `Deal moved to ${stage.replace('_', ' ').toUpperCase()}`;
      activityStmt.run(subject, dealId);
    });

    transaction();

    // Fetch updated deal
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
    console.error('Error updating deal stage:', error);
    
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
      { error: 'Failed to update deal stage' },
      { status: 500 }
    );
  }
}