import { getAvatarColor, getInitials, getRelativeTime, getGreeting, getGroupBadgeColor } from '../utils';

describe('Utility Functions', () => {
  describe('getAvatarColor', () => {
    it('should return blue for names starting with A-D', () => {
      expect(getAvatarColor('Alice')).toEqual({ bg: 'bg-blue-100', text: 'text-blue-600' });
      expect(getAvatarColor('Bob')).toEqual({ bg: 'bg-blue-100', text: 'text-blue-600' });
      expect(getAvatarColor('Charlie')).toEqual({ bg: 'bg-blue-100', text: 'text-blue-600' });
      expect(getAvatarColor('David')).toEqual({ bg: 'bg-blue-100', text: 'text-blue-600' });
    });

    it('should return purple for names starting with E-H', () => {
      expect(getAvatarColor('Emma')).toEqual({ bg: 'bg-purple-100', text: 'text-purple-600' });
      expect(getAvatarColor('Frank')).toEqual({ bg: 'bg-purple-100', text: 'text-purple-600' });
      expect(getAvatarColor('Grace')).toEqual({ bg: 'bg-purple-100', text: 'text-purple-600' });
      expect(getAvatarColor('Henry')).toEqual({ bg: 'bg-purple-100', text: 'text-purple-600' });
    });

    it('should return teal for names starting with I-L', () => {
      expect(getAvatarColor('Ian')).toEqual({ bg: 'bg-teal-100', text: 'text-teal-600' });
      expect(getAvatarColor('Jack')).toEqual({ bg: 'bg-teal-100', text: 'text-teal-600' });
      expect(getAvatarColor('Kate')).toEqual({ bg: 'bg-teal-100', text: 'text-teal-600' });
      expect(getAvatarColor('Liam')).toEqual({ bg: 'bg-teal-100', text: 'text-teal-600' });
    });

    it('should return rose for names starting with M-P', () => {
      expect(getAvatarColor('Mike')).toEqual({ bg: 'bg-rose-100', text: 'text-rose-600' });
      expect(getAvatarColor('Nancy')).toEqual({ bg: 'bg-rose-100', text: 'text-rose-600' });
      expect(getAvatarColor('Oliver')).toEqual({ bg: 'bg-rose-100', text: 'text-rose-600' });
      expect(getAvatarColor('Paul')).toEqual({ bg: 'bg-rose-100', text: 'text-rose-600' });
    });

    it('should return indigo for names starting with Q-T', () => {
      expect(getAvatarColor('Quinn')).toEqual({ bg: 'bg-indigo-100', text: 'text-indigo-600' });
      expect(getAvatarColor('Rachel')).toEqual({ bg: 'bg-indigo-100', text: 'text-indigo-600' });
      expect(getAvatarColor('Sam')).toEqual({ bg: 'bg-indigo-100', text: 'text-indigo-600' });
      expect(getAvatarColor('Tom')).toEqual({ bg: 'bg-indigo-100', text: 'text-indigo-600' });
    });

    it('should return orange for names starting with U-Z', () => {
      expect(getAvatarColor('Uma')).toEqual({ bg: 'bg-orange-100', text: 'text-orange-600' });
      expect(getAvatarColor('Victor')).toEqual({ bg: 'bg-orange-100', text: 'text-orange-600' });
      expect(getAvatarColor('Wendy')).toEqual({ bg: 'bg-orange-100', text: 'text-orange-600' });
      expect(getAvatarColor('Zoe')).toEqual({ bg: 'bg-orange-100', text: 'text-orange-600' });
    });

    it('should handle lowercase names', () => {
      expect(getAvatarColor('alice')).toEqual({ bg: 'bg-blue-100', text: 'text-blue-600' });
    });

    it('should handle empty string', () => {
      expect(getAvatarColor('')).toEqual({ bg: 'bg-orange-100', text: 'text-orange-600' });
    });
  });

  describe('getInitials', () => {
    it('should return single initial for single word', () => {
      expect(getInitials('John')).toBe('J');
    });

    it('should return first and last initials for multiple words', () => {
      expect(getInitials('John Doe')).toBe('JD');
      expect(getInitials('John Michael Doe')).toBe('JD');
    });

    it('should handle extra spaces', () => {
      expect(getInitials('  John   Doe  ')).toBe('JD');
    });

    it('should return uppercase initials', () => {
      expect(getInitials('john doe')).toBe('JD');
    });

    it('should handle empty string', () => {
      expect(getInitials('')).toBe('');
    });

    it('should handle single character names', () => {
      expect(getInitials('A')).toBe('A');
      expect(getInitials('A B')).toBe('AB');
    });
  });

  describe('getRelativeTime', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-01-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return "just now" for recent times', () => {
      const recent = new Date('2023-01-15T11:59:30Z').toISOString();
      expect(getRelativeTime(recent)).toBe('just now');
    });

    it('should return minutes for times within an hour', () => {
      const fiveMinutesAgo = new Date('2023-01-15T11:55:00Z').toISOString();
      expect(getRelativeTime(fiveMinutesAgo)).toBe('5 mins ago');
      
      const oneMinuteAgo = new Date('2023-01-15T11:59:00Z').toISOString();
      expect(getRelativeTime(oneMinuteAgo)).toBe('1 min ago');
    });

    it('should return hours for times within a day', () => {
      const twoHoursAgo = new Date('2023-01-15T10:00:00Z').toISOString();
      expect(getRelativeTime(twoHoursAgo)).toBe('2 hours ago');
      
      const oneHourAgo = new Date('2023-01-15T11:00:00Z').toISOString();
      expect(getRelativeTime(oneHourAgo)).toBe('1 hour ago');
    });

    it('should return "Yesterday" for previous day', () => {
      const yesterday = new Date('2023-01-14T12:00:00Z').toISOString();
      expect(getRelativeTime(yesterday)).toBe('Yesterday');
    });

    it('should return days for times within a week', () => {
      const threeDaysAgo = new Date('2023-01-12T12:00:00Z').toISOString();
      expect(getRelativeTime(threeDaysAgo)).toBe('3 days ago');
    });

    it('should return formatted date for older times', () => {
      const twoWeeksAgo = new Date('2023-01-01T12:00:00Z').toISOString();
      const result = getRelativeTime(twoWeeksAgo);
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });
  });

  describe('getGreeting', () => {
    it('should return "Good morning" for morning hours', () => {
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(8);
      expect(getGreeting()).toBe('Good morning');
      
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(11);
      expect(getGreeting()).toBe('Good morning');
    });

    it('should return "Good afternoon" for afternoon hours', () => {
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(12);
      expect(getGreeting()).toBe('Good afternoon');
      
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(17);
      expect(getGreeting()).toBe('Good afternoon');
    });

    it('should return "Good evening" for evening hours', () => {
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(18);
      expect(getGreeting()).toBe('Good evening');
      
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(23);
      expect(getGreeting()).toBe('Good evening');
    });

    it('should return "Good evening" for midnight hours', () => {
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(0);
      expect(getGreeting()).toBe('Good evening');
    });
  });

  describe('getGroupBadgeColor', () => {
    it('should return green for customer group', () => {
      expect(getGroupBadgeColor('Customer')).toEqual({
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200'
      });
      expect(getGroupBadgeColor('CUSTOMER')).toEqual({
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200'
      });
    });

    it('should return purple for partner group', () => {
      expect(getGroupBadgeColor('Partner')).toEqual({
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        border: 'border-purple-200'
      });
    });

    it('should return orange for lead group', () => {
      expect(getGroupBadgeColor('Lead')).toEqual({
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        border: 'border-orange-200'
      });
    });

    it('should return default colors for unknown groups', () => {
      expect(getGroupBadgeColor('Unknown')).toEqual({
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200'
      });
    });
  });
});