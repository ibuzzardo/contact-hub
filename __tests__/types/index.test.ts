// Type tests to ensure our TypeScript interfaces are working correctly
import { Contact, Company, Deal, Activity, Task, Group, CrmDashboardStats } from '@/types';

describe('Type Definitions', () => {
  it('should define Contact interface correctly', () => {
    const contact: Contact = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      company: 'Acme Corp',
      job_title: 'Software Engineer',
      group_id: 1,
      notes: 'Test notes',
      favorite: 0,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    };
    
    expect(contact.id).toBe(1);
    expect(contact.name).toBe('John Doe');
    expect(contact.favorite).toBe(0);
  });
  
  it('should define Company interface correctly', () => {
    const company: Company = {
      id: 1,
      name: 'Acme Corp',
      website: 'https://acme.com',
      industry: 'Technology',
      size: '100-500',
      location: 'San Francisco, CA',
      notes: 'Great company',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    };
    
    expect(company.name).toBe('Acme Corp');
    expect(company.industry).toBe('Technology');
  });
  
  it('should define Deal interface correctly', () => {
    const deal: Deal = {
      id: 1,
      name: 'Big Deal',
      company_id: 1,
      contact_id: 1,
      value: 50000,
      stage: 'proposal',
      probability: 75,
      expected_close: '2023-12-31T00:00:00Z',
      notes: 'Promising deal',
      tags: 'enterprise,priority',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    };
    
    expect(deal.stage).toBe('proposal');
    expect(deal.value).toBe(50000);
    expect(deal.probability).toBe(75);
  });
  
  it('should define Activity interface correctly', () => {
    const activity: Activity = {
      id: 1,
      type: 'call',
      subject: 'Follow-up call',
      contact_id: 1,
      deal_id: 1,
      activity_date: '2023-01-01T10:00:00Z',
      duration_minutes: 30,
      outcome: 'positive',
      description: 'Great conversation',
      created_at: '2023-01-01T10:00:00Z'
    };
    
    expect(activity.type).toBe('call');
    expect(activity.outcome).toBe('positive');
    expect(activity.duration_minutes).toBe(30);
  });
  
  it('should define Task interface correctly', () => {
    const task: Task = {
      id: 1,
      title: 'Follow up with client',
      description: 'Send proposal',
      contact_id: 1,
      due_date: '2023-01-02T00:00:00Z',
      priority: 'high',
      status: 'pending',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    };
    
    expect(task.priority).toBe('high');
    expect(task.status).toBe('pending');
  });
  
  it('should define Group interface correctly', () => {
    const group: Group = {
      id: 1,
      name: 'VIP Clients',
      color: '#ff0000',
      created_at: '2023-01-01T00:00:00Z'
    };
    
    expect(group.name).toBe('VIP Clients');
    expect(group.color).toBe('#ff0000');
  });
  
  it('should define CrmDashboardStats interface correctly', () => {
    const stats: CrmDashboardStats = {
      totalContacts: 150,
      totalCompanies: 45,
      openDeals: 23,
      pipelineValue: 125000,
      wonThisMonth: 85000,
      activitiesThisWeek: 12,
      recentActivities: [],
      upcomingTasks: [],
      dealsByStage: [
        { stage: 'lead', count: 10, value: 50000 }
      ]
    };
    
    expect(stats.totalContacts).toBe(150);
    expect(stats.pipelineValue).toBe(125000);
    expect(stats.dealsByStage).toHaveLength(1);
    expect(stats.dealsByStage[0].stage).toBe('lead');
  });
  
  it('should handle optional fields correctly', () => {
    const minimalContact: Contact = {
      id: 1,
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '',
      company: '',
      job_title: '',
      group_id: null,
      notes: '',
      favorite: 0,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    };
    
    expect(minimalContact.group_id).toBeNull();
    expect(minimalContact.phone).toBe('');
  });
});