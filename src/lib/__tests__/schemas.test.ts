import { createContactSchema, updateContactSchema, createGroupSchema } from '../schemas';

describe('Contact Schema Validation', () => {
  describe('createContactSchema', () => {
    it('should validate valid contact data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        company: 'Acme Corp',
        job_title: 'Developer',
        group_id: 1,
        notes: 'Test notes',
        favorite: 1
      };

      const result = createContactSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should require name', () => {
      const invalidData = {
        email: 'john@example.com'
      };

      expect(() => createContactSchema.parse(invalidData)).toThrow('Name is required');
    });

    it('should require valid email', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email'
      };

      expect(() => createContactSchema.parse(invalidData)).toThrow('Invalid email format');
    });

    it('should validate name length', () => {
      const longName = 'a'.repeat(101);
      const invalidData = {
        name: longName,
        email: 'john@example.com'
      };

      expect(() => createContactSchema.parse(invalidData)).toThrow('Name must be 100 characters or less');
    });

    it('should validate phone length', () => {
      const longPhone = '1'.repeat(21);
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: longPhone
      };

      expect(() => createContactSchema.parse(invalidData)).toThrow('Phone must be 20 characters or less');
    });

    it('should validate company length', () => {
      const longCompany = 'a'.repeat(101);
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        company: longCompany
      };

      expect(() => createContactSchema.parse(invalidData)).toThrow('Company must be 100 characters or less');
    });

    it('should validate job_title length', () => {
      const longJobTitle = 'a'.repeat(101);
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        job_title: longJobTitle
      };

      expect(() => createContactSchema.parse(invalidData)).toThrow('Job title must be 100 characters or less');
    });

    it('should validate notes length', () => {
      const longNotes = 'a'.repeat(501);
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        notes: longNotes
      };

      expect(() => createContactSchema.parse(invalidData)).toThrow('Notes must be 500 characters or less');
    });

    it('should validate group_id as positive integer', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        group_id: -1
      };

      expect(() => createContactSchema.parse(invalidData)).toThrow();
    });

    it('should validate favorite as 0 or 1', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        favorite: 2
      };

      expect(() => createContactSchema.parse(invalidData)).toThrow();
    });

    it('should default favorite to 0', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      const result = createContactSchema.parse(data);
      expect(result.favorite).toBe(0);
    });

    it('should allow optional fields to be undefined', () => {
      const minimalData = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      const result = createContactSchema.parse(minimalData);
      expect(result.phone).toBeUndefined();
      expect(result.company).toBeUndefined();
      expect(result.job_title).toBeUndefined();
      expect(result.group_id).toBeUndefined();
      expect(result.notes).toBeUndefined();
    });
  });

  describe('updateContactSchema', () => {
    it('should allow partial updates', () => {
      const partialData = {
        name: 'Updated Name'
      };

      const result = updateContactSchema.parse(partialData);
      expect(result.name).toBe('Updated Name');
    });

    it('should allow empty object', () => {
      const result = updateContactSchema.parse({});
      expect(result).toEqual({});
    });

    it('should validate provided fields', () => {
      const invalidData = {
        email: 'invalid-email'
      };

      expect(() => updateContactSchema.parse(invalidData)).toThrow('Invalid email format');
    });
  });

  describe('createGroupSchema', () => {
    it('should validate valid group data', () => {
      const validData = {
        name: 'Test Group'
      };

      const result = createGroupSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should require name', () => {
      const invalidData = {};

      expect(() => createGroupSchema.parse(invalidData)).toThrow('Name is required');
    });

    it('should validate name length', () => {
      const longName = 'a'.repeat(51);
      const invalidData = {
        name: longName
      };

      expect(() => createGroupSchema.parse(invalidData)).toThrow('Name must be 50 characters or less');
    });

    it('should not allow empty string', () => {
      const invalidData = {
        name: ''
      };

      expect(() => createGroupSchema.parse(invalidData)).toThrow('Name is required');
    });
  });
});