import { 
  createContactSchema, 
  updateContactSchema, 
  createGroupSchema, 
  createCompanySchema, 
  createDealSchema, 
  createActivitySchema, 
  createTaskSchema 
} from '../schemas';
import { ZodError } from 'zod';

describe('Schema validation', () => {
  describe('createContactSchema', () => {
    it('should validate valid contact data', () => {
      const validContact = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        company: 'Acme Corp',
        job_title: 'Developer',
        group_id: 1,
        company_id: 1,
        notes: 'Test notes',
        favorite: 1
      };
      
      expect(() => createContactSchema.parse(validContact)).not.toThrow();
    });

    it('should require name and email', () => {
      expect(() => createContactSchema.parse({})).toThrow(ZodError);
      expect(() => createContactSchema.parse({ name: 'John' })).toThrow(ZodError);
      expect(() => createContactSchema.parse({ email: 'john@example.com' })).toThrow(ZodError);
    });

    it('should validate email format', () => {
      const invalidEmail = { name: 'John', email: 'invalid-email' };
      expect(() => createContactSchema.parse(invalidEmail)).toThrow(ZodError);
    });

    it('should enforce string length limits', () => {
      const longName = 'a'.repeat(101);
      const longPhone = '1'.repeat(21);
      const longNotes = 'a'.repeat(501);
      
      expect(() => createContactSchema.parse({ name: longName, email: 'test@example.com' })).toThrow();
      expect(() => createContactSchema.parse({ name: 'John', email: 'test@example.com', phone: longPhone })).toThrow();
      expect(() => createContactSchema.parse({ name: 'John', email: 'test@example.com', notes: longNotes })).toThrow();
    });

    it('should validate favorite as 0 or 1', () => {
      expect(() => createContactSchema.parse({ name: 'John', email: 'test@example.com', favorite: 2 })).toThrow();
      expect(() => createContactSchema.parse({ name: 'John', email: 'test@example.com', favorite: -1 })).toThrow();
    });

    it('should default favorite to 0', () => {
      const result = createContactSchema.parse({ name: 'John', email: 'test@example.com' });
      expect(result.favorite).toBe(0);
    });
  });

  describe('createGroupSchema', () => {
    it('should validate valid group data', () => {
      const validGroup = { name: 'Test Group' };
      expect(() => createGroupSchema.parse(validGroup)).not.toThrow();
    });

    it('should require name', () => {
      expect(() => createGroupSchema.parse({})).toThrow(ZodError);
      expect(() => createGroupSchema.parse({ name: '' })).toThrow(ZodError);
    });

    it('should enforce name length limit', () => {
      const longName = 'a'.repeat(51);
      expect(() => createGroupSchema.parse({ name: longName })).toThrow();
    });
  });

  describe('createCompanySchema', () => {
    it('should validate valid company data', () => {
      const validCompany = {
        name: 'Acme Corp',
        industry: 'Technology',
        website: 'https://acme.com',
        phone: '+1234567890',
        address: '123 Main St',
        notes: 'Test notes'
      };
      
      expect(() => createCompanySchema.parse(validCompany)).not.toThrow();
    });

    it('should require name', () => {
      expect(() => createCompanySchema.parse({})).toThrow(ZodError);
    });

    it('should validate website URL format', () => {
      expect(() => createCompanySchema.parse({ name: 'Test', website: 'invalid-url' })).toThrow();
      expect(() => createCompanySchema.parse({ name: 'Test', website: '' })).not.toThrow();
    });

    it('should enforce field length limits', () => {
      const longName = 'a'.repeat(101);
      const longIndustry = 'a'.repeat(51);
      const longAddress = 'a'.repeat(201);
      const longNotes = 'a'.repeat(1001);
      
      expect(() => createCompanySchema.parse({ name: longName })).toThrow();
      expect(() => createCompanySchema.parse({ name: 'Test', industry: longIndustry })).toThrow();
      expect(() => createCompanySchema.parse({ name: 'Test', address: longAddress })).toThrow();
      expect(() => createCompanySchema.parse({ name: 'Test', notes: longNotes })).toThrow();
    });
  });

  describe('createDealSchema', () => {
    it('should validate valid deal data', () => {
      const validDeal = {
        name: 'Test Deal',
        company_id: 1,
        contact_id: 1,
        value: 10000,
        stage: 'qualified' as const,
        probability: 50,
        expected_close: '2024-12-31',
        notes: 'Test notes',
        tags: ['urgent', 'enterprise']
      };
      
      expect(() => createDealSchema.parse(validDeal)).not.toThrow();
    });

    it('should require name', () => {
      expect(() => createDealSchema.parse({})).toThrow(ZodError);
    });

    it('should validate stage enum', () => {
      expect(() => createDealSchema.parse({ name: 'Test', stage: 'invalid' })).toThrow();
    });

    it('should validate probability range', () => {
      expect(() => createDealSchema.parse({ name: 'Test', probability: -1 })).toThrow();
      expect(() => createDealSchema.parse({ name: 'Test', probability: 101 })).toThrow();
    });

    it('should validate value is non-negative', () => {
      expect(() => createDealSchema.parse({ name: 'Test', value: -100 })).toThrow();
    });

    it('should validate tags array limits', () => {
      const tooManyTags = Array(11).fill('tag');
      const longTag = 'a'.repeat(31);
      
      expect(() => createDealSchema.parse({ name: 'Test', tags: tooManyTags })).toThrow();
      expect(() => createDealSchema.parse({ name: 'Test', tags: [longTag] })).toThrow();
    });

    it('should set default values', () => {
      const result = createDealSchema.parse({ name: 'Test Deal' });
      expect(result.value).toBe(0);
      expect(result.stage).toBe('lead');
      expect(result.probability).toBe(10);
    });
  });

  describe('createActivitySchema', () => {
    it('should validate valid activity data', () => {
      const validActivity = {
        type: 'call' as const,
        subject: 'Follow up call',
        description: 'Discussed project requirements',
        contact_id: 1,
        deal_id: 1,
        company_id: 1,
        duration_minutes: 30,
        outcome: 'positive',
        activity_date: '2024-01-01T10:00:00Z'
      };
      
      expect(() => createActivitySchema.parse(validActivity)).not.toThrow();
    });

    it('should require type and subject', () => {
      expect(() => createActivitySchema.parse({})).toThrow(ZodError);
      expect(() => createActivitySchema.parse({ type: 'call' })).toThrow(ZodError);
      expect(() => createActivitySchema.parse({ subject: 'Test' })).toThrow(ZodError);
    });

    it('should validate type enum', () => {
      expect(() => createActivitySchema.parse({ type: 'invalid', subject: 'Test' })).toThrow();
    });

    it('should enforce field length limits', () => {
      const longSubject = 'a'.repeat(201);
      const longDescription = 'a'.repeat(1001);
      const longOutcome = 'a'.repeat(51);
      
      expect(() => createActivitySchema.parse({ type: 'call', subject: longSubject })).toThrow();
      expect(() => createActivitySchema.parse({ type: 'call', subject: 'Test', description: longDescription })).toThrow();
      expect(() => createActivitySchema.parse({ type: 'call', subject: 'Test', outcome: longOutcome })).toThrow();
    });

    it('should validate duration is non-negative', () => {
      expect(() => createActivitySchema.parse({ type: 'call', subject: 'Test', duration_minutes: -1 })).toThrow();
    });
  });

  describe('createTaskSchema', () => {
    it('should validate valid task data', () => {
      const validTask = {
        title: 'Follow up with client',
        type: 'call_back' as const,
        priority: 'high' as const,
        due_date: '2024-12-31',
        contact_id: 1,
        deal_id: 1,
        notes: 'Important client'
      };
      
      expect(() => createTaskSchema.parse(validTask)).not.toThrow();
    });

    it('should require title', () => {
      expect(() => createTaskSchema.parse({})).toThrow(ZodError);
    });

    it('should validate type and priority enums', () => {
      expect(() => createTaskSchema.parse({ title: 'Test', type: 'invalid' })).toThrow();
      expect(() => createTaskSchema.parse({ title: 'Test', priority: 'invalid' })).toThrow();
    });

    it('should set default values', () => {
      const result = createTaskSchema.parse({ title: 'Test Task' });
      expect(result.type).toBe('follow_up');
      expect(result.priority).toBe('medium');
    });

    it('should enforce field length limits', () => {
      const longTitle = 'a'.repeat(201);
      expect(() => createTaskSchema.parse({ title: longTitle })).toThrow();
    });
  });

  describe('updateContactSchema', () => {
    it('should make all fields optional', () => {
      expect(() => updateContactSchema.parse({})).not.toThrow();
      expect(() => updateContactSchema.parse({ name: 'John' })).not.toThrow();
      expect(() => updateContactSchema.parse({ email: 'john@example.com' })).not.toThrow();
    });

    it('should still validate provided fields', () => {
      expect(() => updateContactSchema.parse({ email: 'invalid-email' })).toThrow();
      expect(() => updateContactSchema.parse({ favorite: 2 })).toThrow();
    });
  });
});