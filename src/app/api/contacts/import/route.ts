import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { createContactSchema } from '@/lib/schemas';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'File must be a CSV' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    const csvText = await file.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV must contain at least a header and one data row' },
        { status: 400 }
      );
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const requiredHeaders = ['name', 'email'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      return NextResponse.json(
        { error: `Missing required headers: ${missingHeaders.join(', ')}` },
        { status: 400 }
      );
    }

    // Get all groups for lookup
    const groups = db.prepare('SELECT id, name FROM groups').all() as Array<{ id: number; name: string }>;
    const groupMap = new Map(groups.map(g => [g.name.toLowerCase(), g.id]));

    let imported = 0;
    const errors: string[] = [];

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const rowData: any = {};
        
        headers.forEach((header, index) => {
          if (values[index]) {
            rowData[header] = values[index];
          }
        });

        // Map group name to group_id
        if (rowData.group) {
          const groupId = groupMap.get(rowData.group.toLowerCase());
          if (groupId) {
            rowData.group_id = groupId;
          }
          delete rowData.group;
        }

        // Validate the data
        const validatedData = createContactSchema.parse({
          name: rowData.name,
          email: rowData.email,
          phone: rowData.phone || undefined,
          company: rowData.company || undefined,
          job_title: rowData.job_title || undefined,
          group_id: rowData.group_id || undefined,
          notes: rowData.notes || undefined,
          favorite: 0,
        });

        // Insert contact
        const stmt = db.prepare(`
          INSERT INTO contacts (name, email, phone, company, job_title, group_id, notes, favorite)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          validatedData.name,
          validatedData.email,
          validatedData.phone || null,
          validatedData.company || null,
          validatedData.job_title || null,
          validatedData.group_id || null,
          validatedData.notes || null,
          0
        );

        imported++;
      } catch (error: any) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          errors.push(`Row ${i + 1}: Email already exists`);
        } else if (error.name === 'ZodError') {
          const fieldErrors = error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
          errors.push(`Row ${i + 1}: ${fieldErrors}`);
        } else {
          errors.push(`Row ${i + 1}: ${error.message}`);
        }
      }
    }

    return NextResponse.json({
      imported,
      errors,
    });
  } catch (error) {
    console.error('Error importing contacts:', error);
    return NextResponse.json(
      { error: 'Failed to import contacts' },
      { status: 500 }
    );
  }
}