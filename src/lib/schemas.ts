import { z } from 'zod';

export const createContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  email: z.string().email('Invalid email format'),
  phone: z.string().max(20, 'Phone must be 20 characters or less').optional(),
  company: z.string().max(100, 'Company must be 100 characters or less').optional(),
  job_title: z.string().max(100, 'Job title must be 100 characters or less').optional(),
  group_id: z.number().int().positive().optional(),
  company_id: z.number().int().positive().optional(),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
  favorite: z.number().int().min(0).max(1).optional().default(0),
});

export const updateContactSchema = createContactSchema.partial();

export const createGroupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
});

export const createCompanySchema = z.object({
  name: z.string().min(1).max(100),
  industry: z.string().max(50).optional(),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  address: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
});

export const createDealSchema = z.object({
  name: z.string().min(1).max(100),
  company_id: z.number().int().positive().optional(),
  contact_id: z.number().int().positive().optional(),
  value: z.number().min(0).default(0),
  stage: z.enum(['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).default('lead'),
  probability: z.number().min(0).max(100).default(10),
  expected_close: z.string().optional(),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
});

export const createActivitySchema = z.object({
  type: z.enum(['call', 'email', 'meeting', 'note']),
  subject: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  contact_id: z.number().int().positive().optional(),
  deal_id: z.number().int().positive().optional(),
  company_id: z.number().int().positive().optional(),
  duration_minutes: z.number().int().min(0).optional(),
  outcome: z.string().max(50).optional(),
  activity_date: z.string().optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(['call_back', 'send_email', 'meeting', 'follow_up', 'other']).default('follow_up'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  due_date: z.string().optional(),
  contact_id: z.number().int().positive().optional(),
  deal_id: z.number().int().positive().optional(),
  notes: z.string().max(500).optional(),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type CreateDealInput = z.infer<typeof createDealSchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;