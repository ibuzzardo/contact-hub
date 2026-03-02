import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { updateContactSchema } from '@/lib/schemas';
import { Contact, Group } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id } = await params;
    const contactId = parseInt(id);

    if (isNaN(contactId)) {
      return NextResponse.json(
        { error: 'Invalid contact ID' },
        { status: 400 }
      );
    }

    const contact = db.prepare(
      'SELECT id, name, email, phone, company, job_title, group_id, notes, favorite, created_at, updated_at FROM contacts WHERE id = ?'
    ).get(contactId) as Contact | undefined;

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    // Get group information if contact has a group
    let group: Group | undefined;
    if (contact.group_id) {
      group = db.prepare(
        'SELECT * FROM groups WHERE id = ?'
      ).get(contact.group_id) as Group | undefined;
    }

    return NextResponse.json({ contact, group });
  } catch (error) {
    console.error('Error fetching contact:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id } = await params;
    const contactId = parseInt(id);

    if (isNaN(contactId)) {
      return NextResponse.json(
        { error: 'Invalid contact ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateContactSchema.parse(body);

    // Check if contact exists
    const existingContact = db.prepare(
      'SELECT id FROM contacts WHERE id = ?'
    ).get(contactId);

    if (!existingContact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    
    for (const [key, value] of Object.entries(validatedData)) {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    updateValues.push(contactId);
    
    const updateQuery = `
      UPDATE contacts 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;

    db.prepare(updateQuery).run(...updateValues);

    // Return updated contact
    const updatedContact = db.prepare(
      'SELECT id, name, email, phone, company, job_title, group_id, notes, favorite, created_at, updated_at FROM contacts WHERE id = ?'
    ).get(contactId) as Contact;

    return NextResponse.json(updatedContact);
  } catch (error: any) {
    console.error('Error updating contact:', error);
    
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
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id } = await params;
    const contactId = parseInt(id);

    if (isNaN(contactId)) {
      return NextResponse.json(
        { error: 'Invalid contact ID' },
        { status: 400 }
      );
    }

    const result = db.prepare('DELETE FROM contacts WHERE id = ?').run(contactId);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}