// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { createActivitySchema } from '@/lib/schemas';
import { Activity } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const contactId = searchParams.get('contact_id');
    const dealId = searchParams.get('deal_id');
    const companyId = searchParams.get('company_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = `
      SELECT 
        a.*,
        c.name as contact_name,
        d.name as deal_name,
        comp.name as company_name
      FROM activities a
      LEFT JOIN contacts c ON a.contact_id = c.id
      LEFT JOIN deals d ON a.deal_id = d.id
      LEFT JOIN companies comp ON a.company_id = comp.id
      WHERE 1=1
    `;

    const params: any[] = [];
    
    if (type) {
      query += ' AND a.type = ?';
      params.push(type);
    }

    if (contactId) {
      query += ' AND a.contact_id = ?';
      params.push(parseInt(contactId));
    }

    if (dealId) {
      query += ' AND a.deal_id = ?';
      params.push(parseInt(dealId));
    }

    if (companyId) {
      query += ' AND a.company_id = ?';
      params.push(parseInt(companyId));
    }

    query += ' ORDER BY a.activity_date DESC LIMIT ?';
    params.push(limit);

    const activities = db.prepare(query).all(...params) as Activity[];

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validatedData = createActivitySchema.parse(body);

    const stmt = db.prepare(`
      INSERT INTO activities (type, subject, description, contact_id, deal_id, company_id, duration_minutes, outcome, activity_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      validatedData.type,
      validatedData.subject,
      validatedData.description || null,
      validatedData.contact_id || null,
      validatedData.deal_id || null,
      validatedData.company_id || null,
      validatedData.duration_minutes || null,
      validatedData.outcome || null,
      validatedData.activity_date || new Date().toISOString()
    );

    const activity = db.prepare(`
      SELECT 
        a.*,
        c.name as contact_name,
        d.name as deal_name,
        comp.name as company_name
      FROM activities a
      LEFT JOIN contacts c ON a.contact_id = c.id
      LEFT JOIN deals d ON a.deal_id = d.id
      LEFT JOIN companies comp ON a.company_id = comp.id
      WHERE a.id = ?
    `).get(result.lastInsertRowid) as Activity;

    return NextResponse.json(activity, { status: 201 });
  } catch (error: any) {
    console.error('Error creating activity:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}