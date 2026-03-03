// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { ReportResponse } from '@/types/crm';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Pipeline stats
    const pipelineResult = db.prepare(`
      SELECT 
        COUNT(*) as dealCount,
        COALESCE(SUM(value), 0) as totalValue,
        COALESCE(AVG(value), 0) as avgDealSize,
        COALESCE(AVG(probability), 0) as avgProbability
      FROM deals 
      WHERE stage NOT IN ('closed_won', 'closed_lost')
    `).get() as any;

    // Win rate stats
    const winRateResult = db.prepare(`
      SELECT 
        COUNT(CASE WHEN stage = 'closed_won' THEN 1 END) as won,
        COUNT(CASE WHEN stage = 'closed_lost' THEN 1 END) as lost
      FROM deals 
      WHERE stage IN ('closed_won', 'closed_lost')
    `).get() as any;

    const winRate = {
      won: winRateResult.won || 0,
      lost: winRateResult.lost || 0,
      rate: (winRateResult.won + winRateResult.lost) > 0 
        ? Math.round((winRateResult.won / (winRateResult.won + winRateResult.lost)) * 100)
        : 0
    };

    // Revenue by month (last 6 months)
    const revenueByMonth = db.prepare(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COALESCE(SUM(value), 0) as value
      FROM deals 
      WHERE stage = 'closed_won' 
        AND created_at >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month DESC
      LIMIT 6
    `).all() as any[];

    // Activities by type
    const activitiesByType = db.prepare(`
      SELECT 
        type,
        COUNT(*) as count
      FROM activities 
      GROUP BY type
      ORDER BY count DESC
    `).all() as any[];

    // Deals by stage
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
    `).all() as any[];

    // Top 5 deals by value
    const topDeals = db.prepare(`
      SELECT 
        d.*,
        c.name as company_name,
        cont.name as contact_name
      FROM deals d
      LEFT JOIN companies c ON d.company_id = c.id
      LEFT JOIN contacts cont ON d.contact_id = cont.id
      WHERE d.stage NOT IN ('closed_won', 'closed_lost')
      ORDER BY d.value DESC
      LIMIT 5
    `).all() as any[];

    // Contact growth (last 6 months)
    const contactGrowth = db.prepare(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as count
      FROM contacts 
      WHERE created_at >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month DESC
      LIMIT 6
    `).all() as any[];

    const response: ReportResponse = {
      pipeline: {
        totalValue: pipelineResult.totalValue || 0,
        dealCount: pipelineResult.dealCount || 0,
        avgDealSize: pipelineResult.avgDealSize || 0,
        avgProbability: pipelineResult.avgProbability || 0
      },
      winRate,
      revenueByMonth: revenueByMonth.reverse(),
      activitiesByType,
      dealsByStage,
      topDeals,
      contactGrowth: contactGrowth.reverse()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}