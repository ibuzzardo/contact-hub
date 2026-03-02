import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Group } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id } = await params;
    const groupId = parseInt(id);
    
    if (isNaN(groupId)) {
      return NextResponse.json(
        { error: 'Invalid group ID' },
        { status: 400 }
      );
    }
    
    const db = getDb();
    
    // Check if group exists
    const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId) as Group | undefined;
    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }
    
    // Check if group has contacts
    const contactCount = db.prepare('SELECT COUNT(*) as count FROM contacts WHERE group_id = ?').get(groupId) as { count: number };
    if (contactCount.count > 0) {
      return NextResponse.json(
        { error: `Cannot delete group. It contains ${contactCount.count} contact${contactCount.count !== 1 ? 's' : ''}. Please move or delete the contacts first.` },
        { status: 409 }
      );
    }
    
    const stmt = db.prepare('DELETE FROM groups WHERE id = ?');
    stmt.run(groupId);
    
    return NextResponse.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    );
  }
}