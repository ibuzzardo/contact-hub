import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { createTaskSchema } from '@/lib/schemas';
import { Task } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = `
      SELECT 
        t.*,
        c.name as contact_name,
        d.name as deal_name
      FROM tasks t
      LEFT JOIN contacts c ON t.contact_id = c.id
      LEFT JOIN deals d ON t.deal_id = d.id
      WHERE 1=1
    `;

    const params: any[] = [];
    
    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }

    // Order by overdue first, then by due date
    query += `
      ORDER BY 
        CASE 
          WHEN t.due_date IS NOT NULL AND t.due_date < date('now') AND t.status = 'pending' THEN 0
          ELSE 1
        END,
        t.due_date ASC,
        t.created_at DESC
      LIMIT ?
    `;
    params.push(limit);

    const tasks = db.prepare(query).all(...params) as Task[];

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    const stmt = db.prepare(`
      INSERT INTO tasks (title, type, priority, due_date, contact_id, deal_id, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      validatedData.title,
      validatedData.type,
      validatedData.priority,
      validatedData.due_date || null,
      validatedData.contact_id || null,
      validatedData.deal_id || null,
      validatedData.notes || null
    );

    const task = db.prepare(`
      SELECT 
        t.*,
        c.name as contact_name,
        d.name as deal_name
      FROM tasks t
      LEFT JOIN contacts c ON t.contact_id = c.id
      LEFT JOIN deals d ON t.deal_id = d.id
      WHERE t.id = ?
    `).get(result.lastInsertRowid) as Task;

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    console.error('Error creating task:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}