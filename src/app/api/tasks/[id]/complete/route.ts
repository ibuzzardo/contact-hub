import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { Task } from '@/types';

export async function PATCH(
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

    // Get current task status
    const currentTask = db.prepare('SELECT status FROM tasks WHERE id = ?').get(taskId) as { status: string } | undefined;
    
    if (!currentTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Toggle completion status
    const newStatus = currentTask.status === 'completed' ? 'pending' : 'completed';
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;

    const stmt = db.prepare(`
      UPDATE tasks 
      SET status = ?, completed_at = ?
      WHERE id = ?
    `);

    stmt.run(newStatus, completedAt, taskId);

    // Fetch updated task
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
  } catch (error) {
    console.error('Error toggling task completion:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}