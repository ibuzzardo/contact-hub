import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { Contact } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id } = await params;
    const contactId = parseInt(id);

    if (isNaN(contactId)) {
      return NextResponse.json(
        { error: 'Invalid contact ID' },
        { status: 400 }
      );
    }

    // Get current contact
    const contact = db.prepare(
      'SELECT id, favorite FROM contacts WHERE id = ?'
    ).get(contactId) as { id: number; favorite: number } | undefined;

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    // Toggle favorite status
    const newFavoriteStatus = contact.favorite === 1 ? 0 : 1;
    
    db.prepare(
      'UPDATE contacts SET favorite = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(newFavoriteStatus, contactId);

    // Return updated contact
    const updatedContact = db.prepare(
      'SELECT id, name, email, phone, company, job_title, group_id, notes, favorite, created_at, updated_at FROM contacts WHERE id = ?'
    ).get(contactId) as Contact;

    return NextResponse.json(updatedContact);
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json(
      { error: 'Failed to toggle favorite status' },
      { status: 500 }
    );
  }
}