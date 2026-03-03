// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { createTaskSchema } from '@/lib/schemas';
import { Task } from '@/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: 'Invalid task ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    const stmt = db.prepare(`
      UPDATE tasks 
      SET title = ?, type = ?, priority = ?, due_date = ?, contact_id = ?, deal_id = ?, notes = ?
      WHERE id = ?
    `);

    const result = stmt.run(
      validatedData.title,
      validatedData.type,
      validatedData.priority,
      validatedData.due_date || null,
      validatedData.contact_id || null,
      validatedData.deal_id || null,
      validatedData.notes || null,
      taskId
    );

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const task = db.prepare(`
      SELECT 
        t.*,
        c.name as contact_name,
        d.name as deal_name
      FROM tasks t
      LEFT JOIN contacts c ON t.contact_id = c.id
      LEFT JOIN deals d ON t.deal_id = d.id
      WHERE t.id = ?
    `).get(taskId) as Task;

    return NextResponse.json(task);
  } catch (error: any) {
    console.error('Error updating task:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: 'Invalid task ID' },
        { status: 400 }
      );
    }

    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(taskId);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}