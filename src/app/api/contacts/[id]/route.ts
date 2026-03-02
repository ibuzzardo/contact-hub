import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { updateContactSchema } from '@/lib/schemas';
import { Contact } from '@/types';

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
    
    const db = getDb();
    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(contactId) as Contact | undefined;
    
    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(contact);
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
    
    const db = getDb();
    
    // Check if contact exists
    const existingContact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(contactId) as Contact | undefined;
    if (!existingContact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }
    
    // Check if group exists if group_id is provided
    if (validatedData.group_id) {
      const group = db.prepare('SELECT id FROM groups WHERE id = ?').get(validatedData.group_id);
      if (!group) {
        return NextResponse.json(
          { error: 'Group not found' },
          { status: 400 }
        );
      }
    }
    
    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    
    if (validatedData.name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(validatedData.name);
    }
    if (validatedData.email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(validatedData.email);
    }
    if (validatedData.phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(validatedData.phone || null);
    }
    if (validatedData.company !== undefined) {
      updateFields.push('company = ?');
      updateValues.push(validatedData.company || null);
    }
    if (validatedData.group_id !== undefined) {
      updateFields.push('group_id = ?');
      updateValues.push(validatedData.group_id || null);
    }
    if (validatedData.notes !== undefined) {
      updateFields.push('notes = ?');
      updateValues.push(validatedData.notes || null);
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(contactId);
    
    const stmt = db.prepare(`
      UPDATE contacts 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `);
    
    stmt.run(...updateValues);
    
    const updatedContact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(contactId) as Contact;
    
    return NextResponse.json(updatedContact);
  } catch (error: any) {
    console.error('Error updating contact:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
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
    
    const db = getDb();
    
    // Check if contact exists
    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(contactId) as Contact | undefined;
    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }
    
    const stmt = db.prepare('DELETE FROM contacts WHERE id = ?');
    stmt.run(contactId);
    
    return NextResponse.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}