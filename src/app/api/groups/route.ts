import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { createGroupSchema } from '@/lib/schemas';
import { Group } from '@/types';

export async function GET(): Promise<NextResponse> {
  try {
    const db = getDb();
    
    const groups = db.prepare(`
      SELECT 
        g.*,
        COUNT(c.id) as contact_count
      FROM groups g
      LEFT JOIN contacts c ON g.id = c.group_id
      GROUP BY g.id
      ORDER BY g.name
    `).all() as Group[];
    
    return NextResponse.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validatedData = createGroupSchema.parse(body);
    
    const db = getDb();
    
    try {
      const stmt = db.prepare('INSERT INTO groups (name) VALUES (?)');
      const result = stmt.run(validatedData.name);
      
      const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(result.lastInsertRowid) as Group;
      
      return NextResponse.json(group, { status: 201 });
    } catch (dbError: any) {
      if (dbError.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return NextResponse.json(
          { error: 'A group with this name already exists' },
          { status: 409 }
        );
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error('Error creating group:', error);
    
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
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}