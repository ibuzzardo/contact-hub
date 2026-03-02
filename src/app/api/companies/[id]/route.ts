import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { createCompanySchema } from '@/lib/schemas';
import { Company } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const companyId = parseInt(id);

    if (isNaN(companyId)) {
      return NextResponse.json(
        { error: 'Invalid company ID' },
        { status: 400 }
      );
    }

    const company = db.prepare(`
      SELECT 
        c.*,
        COUNT(DISTINCT contacts.id) as contact_count,
        COALESCE(SUM(CASE WHEN deals.stage NOT IN ('closed_won', 'closed_lost') THEN deals.value ELSE 0 END), 0) as total_deal_value,
        COUNT(CASE WHEN deals.stage NOT IN ('closed_won', 'closed_lost') THEN deals.id END) as open_deal_count
      FROM companies c
      LEFT JOIN contacts ON contacts.company_id = c.id
      LEFT JOIN deals ON deals.company_id = c.id
      WHERE c.id = ?
      GROUP BY c.id
    `).get(companyId) as Company;

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company' },
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
    const companyId = parseInt(id);

    if (isNaN(companyId)) {
      return NextResponse.json(
        { error: 'Invalid company ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = createCompanySchema.parse(body);

    const stmt = db.prepare(`
      UPDATE companies 
      SET name = ?, industry = ?, website = ?, phone = ?, address = ?, notes = ?
      WHERE id = ?
    `);

    const result = stmt.run(
      validatedData.name,
      validatedData.industry || null,
      validatedData.website || null,
      validatedData.phone || null,
      validatedData.address || null,
      validatedData.notes || null,
      companyId
    );

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(companyId) as Company;

    return NextResponse.json(company);
  } catch (error: any) {
    console.error('Error updating company:', error);
    
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
      { error: 'Failed to update company' },
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
    const companyId = parseInt(id);

    if (isNaN(companyId)) {
      return NextResponse.json(
        { error: 'Invalid company ID' },
        { status: 400 }
      );
    }

    const stmt = db.prepare('DELETE FROM companies WHERE id = ?');
    const result = stmt.run(companyId);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    );
  }
}