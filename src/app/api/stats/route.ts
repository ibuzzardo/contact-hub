import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { CrmDashboardStats } from '@/types';

export async function GET(): Promise<NextResponse> {
  try {
    // Get total contacts
    const { totalContacts } = db.prepare('SELECT COUNT(*) as totalContacts FROM contacts').get() as { totalContacts: number };

    // Get total companies
    const { totalCompanies } = db.prepare('SELECT COUNT(*) as totalCompanies FROM companies').get() as { totalCompanies: number };

    // Get open deals count
    const { openDeals } = db.prepare(`
      SELECT COUNT(*) as openDeals 
      FROM deals 
      WHERE stage NOT IN ('closed_won', 'closed_lost')
    `).get() as { openDeals: number };

    // Get pipeline value (sum of open deals)
    const { pipelineValue } = db.prepare(`
      SELECT COALESCE(SUM(value), 0) as pipelineValue 
      FROM deals 
      WHERE stage NOT IN ('closed_won', 'closed_lost')
    `).get() as { pipelineValue: number };

    // Get won deals this month
    const { wonThisMonth } = db.prepare(`
      SELECT COALESCE(SUM(value), 0) as wonThisMonth 
      FROM deals 
      WHERE stage = 'closed_won' 
      AND date(updated_at) >= date('now', 'start of month')
    `).get() as { wonThisMonth: number };

    // Get activities this week
    const { activitiesThisWeek } = db.prepare(`
      SELECT COUNT(*) as activitiesThisWeek 
      FROM activities 
      WHERE date(activity_date) >= date('now', '-7 days')
    `).get() as { activitiesThisWeek: number };

    // Get recent activities (last 10)
    const recentActivities = db.prepare(`
      SELECT 
        a.*,
        c.name as contact_name,
        d.name as deal_name,
        comp.name as company_name
      FROM activities a
      LEFT JOIN contacts c ON a.contact_id = c.id
      LEFT JOIN deals d ON a.deal_id = d.id
      LEFT JOIN companies comp ON a.company_id = comp.id
      ORDER BY a.activity_date DESC
      LIMIT 10
    `).all();

    // Get upcoming tasks (next 10 pending tasks)
    const upcomingTasks = db.prepare(`
      SELECT 
        t.*,
        c.name as contact_name,
        d.name as deal_name
      FROM tasks t
      LEFT JOIN contacts c ON t.contact_id = c.id
      LEFT JOIN deals d ON t.deal_id = d.id
      WHERE t.status = 'pending'
      ORDER BY 
        CASE 
          WHEN t.due_date IS NOT NULL AND t.due_date < date('now') THEN 0
          ELSE 1
        END,
        t.due_date ASC,
        t.created_at DESC
      LIMIT 10
    `).all();

    // Get deals by stage
    const dealsByStage = db.prepare(`
      SELECT 
        stage,
        COUNT(*) as count,
        COALESCE(SUM(value), 0) as value
      FROM deals
      GROUP BY stage
      ORDER BY 
        CASE stage
          WHEN 'lead' THEN 1
          WHEN 'qualified' THEN 2
          WHEN 'proposal' THEN 3
          WHEN 'negotiation' THEN 4
          WHEN 'closed_won' THEN 5
          WHEN 'closed_lost' THEN 6
          ELSE 7
        END
    `).all();

    const stats: CrmDashboardStats = {
      totalContacts,
      totalCompanies,
      openDeals,
      pipelineValue,
      wonThisMonth,
      activitiesThisWeek,
      recentActivities,
      upcomingTasks,
      dealsByStage
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching CRM dashboard stats:', error);
    return NextResponse.json(
      {
        totalContacts: 0,
        totalCompanies: 0,
        openDeals: 0,
        pipelineValue: 0,
        wonThisMonth: 0,
        activitiesThisWeek: 0,
        recentActivities: [],
        upcomingTasks: [],
        dealsByStage: []
      },
      { status: 500 }
    );
  }
}