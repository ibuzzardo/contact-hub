import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { Contact, DashboardStats } from '@/types';

export async function GET(): Promise<NextResponse> {
  try {
    // Get total contacts
    const totalContactsResult = db.prepare('SELECT COUNT(*) as count FROM contacts').get() as { count: number };
    const totalContacts = totalContactsResult.count;

    // Get total groups
    const totalGroupsResult = db.prepare('SELECT COUNT(*) as count FROM groups').get() as { count: number };
    const totalGroups = totalGroupsResult.count;

    // Get favorites count
    const favoritesResult = db.prepare('SELECT COUNT(*) as count FROM contacts WHERE favorite = 1').get() as { count: number };
    const favoritesCount = favoritesResult.count;

    // Get new contacts this week (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoISO = oneWeekAgo.toISOString();
    
    const newThisWeekResult = db.prepare(
      'SELECT COUNT(*) as count FROM contacts WHERE created_at >= ?'
    ).get(oneWeekAgoISO) as { count: number };
    const newThisWeek = newThisWeekResult.count;

    // Get recent contacts (last 5)
    const recentContacts = db.prepare(`
      SELECT id, name, email, phone, company, job_title, group_id, notes, favorite, created_at, updated_at 
      FROM contacts 
      ORDER BY created_at DESC 
      LIMIT 5
    `).all() as Contact[];

    const stats: DashboardStats = {
      totalContacts,
      totalGroups,
      recentContacts,
      favoritesCount,
      newThisWeek,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}