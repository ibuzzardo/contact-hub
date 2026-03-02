export interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  group_id?: number;
  company_id?: number;
  notes?: string;
  favorite: number;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalContacts: number;
  totalGroups: number;
  recentContacts: Contact[];
  favoritesCount: number;
  newThisWeek: number;
}

export interface Company {
  id: number;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Computed fields for list view
  contact_count?: number;
  total_deal_value?: number;
  open_deal_count?: number;
}

export type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface Deal {
  id: number;
  name: string;
  company_id?: number;
  contact_id?: number;
  value: number;
  stage: DealStage;
  probability: number;
  expected_close?: string;
  notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  // Joined fields
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
  outcome?: string;
  activity_date: string;
  created_at: string;
  // Joined fields
  contact_name?: string;
  deal_name?: string;
  company_name?: string;
}

export interface Task {
  id: number;
  title: string;
  type: 'call_back' | 'send_email' | 'meeting' | 'follow_up' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  due_date?: string;
  contact_id?: number;
  deal_id?: number;
  notes?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  contact_name?: string;
  deal_name?: string;
}

export interface CrmDashboardStats {
  totalContacts: number;
  totalCompanies: number;
  openDeals: number;
  pipelineValue: number;
  wonThisMonth: number;
  activitiesThisWeek: number;
  recentActivities: Activity[];
  upcomingTasks: Task[];
  dealsByStage: { stage: string; count: number; value: number }[];
}