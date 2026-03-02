import { z } from 'zod';

export const createContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  email: z.string().email('Invalid email format'),
  phone: z.string().max(20, 'Phone must be 20 characters or less').optional(),
  company: z.string().max(100, 'Company must be 100 characters or less').optional(),
  group_id: z.number().int().positive().optional(),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
});

export const updateContactSchema = createContactSchema.partial();

export const createGroupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;