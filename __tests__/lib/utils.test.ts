import { getGreeting, getRelativeTime, getAvatarColor, getInitials } from '@/lib/utils';

// Mock Date for consistent testing
const mockDate = (dateString: string) => {
  const RealDate = Date;
  global.Date = class extends RealDate {
    constructor(...args: any[]) {
      if (args.length === 0) {
        return new RealDate(dateString);
      }
      return new RealDate(...args);
    }
    static now() {
      return new RealDate(dateString).getTime();
    }
  } as any;
};

const restoreDate = () => {
  global.Date = Date;
};

describe('utils', () => {
  describe('getGreeting', () => {
    afterEach(() => {
      restoreDate();
    });

    it('returns Good morning for morning hours', () => {
      mockDate('2023-01-01T08:00:00Z');
      expect(getGreeting()).toBe('Good morning');
    });

    it('returns Good afternoon for afternoon hours', () => {
      mockDate('2023-01-01T14:00:00Z');
      expect(getGreeting()).toBe('Good afternoon');
    });

    it('returns Good evening for evening hours', () => {
      mockDate('2023-01-01T19:00:00Z');
      expect(getGreeting()).toBe('Good evening');
    });

    it('handles edge cases correctly', () => {
      mockDate('2023-01-01T12:00:00Z');
      expect(getGreeting()).toBe('Good afternoon');
      
      mockDate('2023-01-01T18:00:00Z');
      expect(getGreeting()).toBe('Good evening');
    });
  });

  describe('getRelativeTime', () => {
    beforeEach(() => {
      mockDate('2023-01-01T12:00:00Z');
    });

    afterEach(() => {
      restoreDate();
    });

    it('returns "just now" for very recent times', () => {
      const oneMinuteAgo = '2023-01-01T11:59:00Z';
      expect(getRelativeTime(oneMinuteAgo)).toBe('just now');
    });

    it('returns minutes ago for recent times', () => {
      const fiveMinutesAgo = '2023-01-01T11:55:00Z';
      expect(getRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
    });

    it('returns hours ago for times within the day', () => {
      const twoHoursAgo = '2023-01-01T10:00:00Z';
      expect(getRelativeTime(twoHoursAgo)).toBe('2 hours ago');
    });

    it('returns days ago for older times', () => {
      const twoDaysAgo = '2022-12-30T12:00:00Z';
      expect(getRelativeTime(twoDaysAgo)).toBe('2 days ago');
    });

    it('handles singular forms correctly', () => {
      const oneHourAgo = '2023-01-01T11:00:00Z';
      expect(getRelativeTime(oneHourAgo)).toBe('1 hour ago');
      
      const oneDayAgo = '2022-12-31T12:00:00Z';
      expect(getRelativeTime(oneDayAgo)).toBe('1 day ago');
    });

    it('handles future dates', () => {
      const futureDate = '2023-01-01T13:00:00Z';
      expect(getRelativeTime(futureDate)).toBe('just now');
    });
  });

  describe('getAvatarColor', () => {
    it('returns consistent colors for the same name', () => {
      const color1 = getAvatarColor('John Doe');
      const color2 = getAvatarColor('John Doe');
      expect(color1).toEqual(color2);
    });

    it('returns different colors for different names', () => {
      const color1 = getAvatarColor('John Doe');
      const color2 = getAvatarColor('Jane Smith');
      expect(color1).not.toEqual(color2);
    });

    it('returns valid Tailwind color classes', () => {
      const { bg, text } = getAvatarColor('Test User');
      expect(bg).toMatch(/^bg-\w+-\d+$/);
      expect(text).toBe('text-white');
    });

    it('handles empty string', () => {
      const { bg, text } = getAvatarColor('');
      expect(bg).toMatch(/^bg-\w+-\d+$/);
      expect(text).toBe('text-white');
    });

    it('handles special characters', () => {
      const { bg, text } = getAvatarColor('John O\'Connor');
      expect(bg).toMatch(/^bg-\w+-\d+$/);
      expect(text).toBe('text-white');
    });
  });

  describe('getInitials', () => {
    it('returns initials for full name', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });

    it('returns initials for single name', () => {
      expect(getInitials('John')).toBe('J');
    });

    it('returns initials for multiple names', () => {
      expect(getInitials('John Michael Doe')).toBe('JD');
    });

    it('handles empty string', () => {
      expect(getInitials('')).toBe('');
    });

    it('handles whitespace-only string', () => {
      expect(getInitials('   ')).toBe('');
    });

    it('handles names with extra spaces', () => {
      expect(getInitials('  John   Doe  ')).toBe('JD');
    });

    it('handles special characters', () => {
      expect(getInitials('John O\'Connor')).toBe('JO');
    });

    it('handles lowercase names', () => {
      expect(getInitials('john doe')).toBe('JD');
    });

    it('handles mixed case names', () => {
      expect(getInitials('jOhN dOe')).toBe('JD');
    });

    it('returns only first and last initials for long names', () => {
      expect(getInitials('John Michael Robert Doe')).toBe('JD');
    });
  });
});