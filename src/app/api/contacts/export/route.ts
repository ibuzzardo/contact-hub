// @ts-nocheck
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { Contact, Group } from '@/types';

export async function GET(): Promise<NextResponse> {
  try {
    // Get all contacts with group names
    const contacts = db.prepare(`
      SELECT 
        c.name,
        c.email,
        c.phone,
        c.company,
        c.job_title,
        g.name as group_name,
        c.notes
      FROM contacts c
      LEFT JOIN groups g ON c.group_id = g.id
      ORDER BY c.name
    `).all() as Array<{
      name: string;
      email: string;
      phone: string | null;
      company: string | null;
      job_title: string | null;
      group_name: string | null;
      notes: string | null;
    }>;

    // Create CSV content
    const headers = ['name', 'email', 'phone', 'company', 'job_title', 'group', 'notes'];
    const csvRows = [headers.join(',')];

    contacts.forEach(contact => {
      const row = [
        `"${(contact.name || '').replace(/"/g, '""')}",`,
        `"${(contact.email || '').replace(/"/g, '""')}",`,
        `"${(contact.phone || '').replace(/"/g, '""')}",`,
        `"${(contact.company || '').replace(/"/g, '""')}",`,
        `"${(contact.job_title || '').replace(/"/g, '""')}",`,
        `"${(contact.group_name || '').replace(/"/g, '""')}",`,
        `"${(contact.notes || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(''));
    });

    const csvContent = csvRows.join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=contacts.csv',
      },
    });
  } catch (error) {
    console.error('Error exporting contacts:', error);
    return NextResponse.json(
      { error: 'Failed to export contacts' },
      { status: 500 }
    );
  }
}