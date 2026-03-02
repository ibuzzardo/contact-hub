import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Contact, DashboardStats } from '@/types';

export async function GET(): Promise<NextResponse> {
  try {
    const db = getDb();
    
    // Get total contacts
    const totalContactsResult = db.prepare('SELECT COUNT(*) as count FROM contacts').get() as { count: number };
    const totalContacts = totalContactsResult.count;
    
    // Get total groups
    const totalGroupsResult = db.prepare('SELECT COUNT(*) as count FROM groups').get() as { count: number };
    const totalGroups = totalGroupsResult.count;
    
    // Get recent contacts (last 5)
    const recentContacts = db.prepare(`
      SELECT * FROM contacts 
      ORDER BY created_at DESC 
      LIMIT 5
    `).all() as Contact[];
    
    const stats: DashboardStats = {
      totalContacts,
      totalGroups,
      recentContacts,
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}