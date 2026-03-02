import { createContactSchema, updateContactSchema, createGroupSchema } from '@/lib/schemas';
import { z } from 'zod';

describe('Schema Validation', () => {
  describe('createContactSchema', () => {
    const validContact = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      company: 'Acme Corp',
      group_id: 1,
      notes: 'Test notes'
    };

    it('should validate valid contact data', () => {
      const result = createContactSchema.parse(validContact);
      expect(result).toEqual(validContact);
    });

    it('should validate minimal contact data', () => {
      const minimalContact = {
        name: 'Jane Doe',
        email: 'jane@example.com'
      };
      const result = createContactSchema.parse(minimalContact);
      expect(result).toEqual(minimalContact);
    });

    describe('name validation', () => {
      it('should reject empty name', () => {
        expect(() => createContactSchema.parse({ ...validContact, name: '' }))
          .toThrow('Name is required');
      });

      it('should reject name longer than 100 characters', () => {
        const longName = 'a'.repeat(101);
        expect(() => createContactSchema.parse({ ...validContact, name: longName }))
          .toThrow('Name must be 100 characters or less');
      });

      it('should accept name with exactly 100 characters', () => {
        const maxName = 'a'.repeat(100);
        const result = createContactSchema.parse({ ...validContact, name: maxName });
        expect(result.name).toBe(maxName);
      });
    });

    describe('email validation', () => {
      it('should reject invalid email format', () => {
        expect(() => createContactSchema.parse({ ...validContact, email: 'invalid-email' }))
          .toThrow('Invalid email format');
      });

      it('should accept valid email formats', () => {
        const validEmails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'user+tag@example.org'
        ];
        
        validEmails.forEach(email => {
          const result = createContactSchema.parse({ ...validContact, email });
          expect(result.email).toBe(email);
        });
      });
    });

    describe('phone validation', () => {
      it('should accept valid phone numbers', () => {
        const validPhones = ['+1234567890', '(555) 123-4567', '555.123.4567'];
        
        validPhones.forEach(phone => {
          const result = createContactSchema.parse({ ...validContact, phone });
          expect(result.phone).toBe(phone);
        });
      });

      it('should reject phone longer than 20 characters', () => {
        const longPhone = '1'.repeat(21);
        expect(() => createContactSchema.parse({ ...validContact, phone: longPhone }))
          .toThrow('Phone must be 20 characters or less');
      });

      it('should accept undefined phone', () => {
        const { phone, ...contactWithoutPhone } = validContact;
        const result = createContactSchema.parse(contactWithoutPhone);
        expect(result.phone).toBeUndefined();
      });
    });

    describe('company validation', () => {
      it('should reject company longer than 100 characters', () => {
        const longCompany = 'a'.repeat(101);
        expect(() => createContactSchema.parse({ ...validContact, company: longCompany }))
          .toThrow('Company must be 100 characters or less');
      });

      it('should accept undefined company', () => {
        const { company, ...contactWithoutCompany } = validContact;
        const result = createContactSchema.parse(contactWithoutCompany);
        expect(result.company).toBeUndefined();
      });
    });

    describe('group_id validation', () => {
      it('should reject negative group_id', () => {
        expect(() => createContactSchema.parse({ ...validContact, group_id: -1 }))
          .toThrow();
      });

      it('should reject zero group_id', () => {
        expect(() => createContactSchema.parse({ ...validContact, group_id: 0 }))
          .toThrow();
      });

      it('should reject non-integer group_id', () => {
        expect(() => createContactSchema.parse({ ...validContact, group_id: 1.5 }))
          .toThrow();
      });

      it('should accept positive integer group_id', () => {
        const result = createContactSchema.parse({ ...validContact, group_id: 5 });
        expect(result.group_id).toBe(5);
      });
    });

    describe('notes validation', () => {
      it('should reject notes longer than 500 characters', () => {
        const longNotes = 'a'.repeat(501);
        expect(() => createContactSchema.parse({ ...validContact, notes: longNotes }))
          .toThrow('Notes must be 500 characters or less');
      });

      it('should accept notes with exactly 500 characters', () => {
        const maxNotes = 'a'.repeat(500);
        const result = createContactSchema.parse({ ...validContact, notes: maxNotes });
        expect(result.notes).toBe(maxNotes);
      });
    });
  });

  describe('updateContactSchema', () => {
    it('should allow partial updates', () => {
      const partialUpdate = { name: 'Updated Name' };
      const result = updateContactSchema.parse(partialUpdate);
      expect(result).toEqual(partialUpdate);
    });

    it('should allow empty updates', () => {
      const result = updateContactSchema.parse({});
      expect(result).toEqual({});
    });

    it('should validate fields when provided', () => {
      expect(() => updateContactSchema.parse({ email: 'invalid-email' }))
        .toThrow('Invalid email format');
    });
  });

  describe('createGroupSchema', () => {
    it('should validate valid group data', () => {
      const validGroup = { name: 'Test Group' };
      const result = createGroupSchema.parse(validGroup);
      expect(result).toEqual(validGroup);
    });

    it('should reject empty name', () => {
      expect(() => createGroupSchema.parse({ name: '' }))
        .toThrow('Name is required');
    });

    it('should reject name longer than 50 characters', () => {
      const longName = 'a'.repeat(51);
      expect(() => createGroupSchema.parse({ name: longName }))
        .toThrow('Name must be 50 characters or less');
    });

    it('should accept name with exactly 50 characters', () => {
      const maxName = 'a'.repeat(50);
      const result = createGroupSchema.parse({ name: maxName });
      expect(result.name).toBe(maxName);
    });
  });
});