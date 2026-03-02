export interface Deal {
  id: number;
  name: string;
  company_id?: number;
  contact_id?: number;
  value: number;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  expected_close?: string;
  notes?: string;
  tags?: string;
  created_at: string;
  updated_at: string;
  company_name?: string;
  contact_name?: string;
}

export interface Activity {
  id: number;
  type: 'call' | 'email' | 'meeting' | 'note' | 'stage_change';
  subject: string;
  description?: string;
  contact_id?: number;
  deal_id?: number;
  company_id?: number;
  duration_minutes?: number;
  outcome?: 'positive' | 'neutral' | 'negative';
  activity_date: string;
  created_at: string;
  contact_name?: string;
  deal_name?: string;
  company_name?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  type: 'call' | 'email' | 'meeting' | 'follow_up' | 'demo' | 'proposal';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed';
  due_date?: string;
  deal_id?: number;
  contact_id?: number;
  created_at: string;
  updated_at: string;
  deal_name?: string;
  contact_name?: string;
}

export interface ReportResponse {
  pipeline: {
    totalValue: number;
    dealCount: number;
    avgDealSize: number;
    avgProbability: number;
  };
  winRate: {
    won: number;
    lost: number;
    rate: number;
  };
  revenueByMonth: Array<{
    month: string;
    value: number;
  }>;
  activitiesByType: Array<{
    type: string;
    count: number;
  }>;
  dealsByStage: Array<{
    stage: string;
    count: number;
    value: number;
  }>;
  topDeals: Deal[];
  contactGrowth: Array<{
    month: string;
    count: number;
  }>;
}