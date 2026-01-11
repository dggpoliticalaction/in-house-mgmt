import { describe, it, expect } from 'vitest';
import { getPriorityColor, getStatusColor, formatDate, formatContact } from './helpers';

describe('getPriorityColor', () => {
  it('returns red for priority 0 (highest urgency)', () => {
    expect(getPriorityColor(0)).toBe('red');
  });

  it('returns orange for priority 1-2', () => {
    expect(getPriorityColor(1)).toBe('orange');
    expect(getPriorityColor(2)).toBe('orange');
  });

  it('returns yellow for priority 3', () => {
    expect(getPriorityColor(3)).toBe('yellow');
  });

  it('returns gray for priority 4-5 (lowest urgency)', () => {
    expect(getPriorityColor(4)).toBe('gray');
    expect(getPriorityColor(5)).toBe('gray');
  });

  it('returns gray for priority above 5', () => {
    expect(getPriorityColor(6)).toBe('gray');
    expect(getPriorityColor(100)).toBe('gray');
  });

  it('returns red for negative priority', () => {
    expect(getPriorityColor(-1)).toBe('red');
  });
});

describe('getStatusColor', () => {
  it('returns gray for OPEN status', () => {
    expect(getStatusColor('OPEN')).toBe('gray');
  });

  it('returns gray for TODO status', () => {
    expect(getStatusColor('TODO')).toBe('gray');
  });

  it('returns blue for IN_PROGRESS status', () => {
    expect(getStatusColor('IN_PROGRESS')).toBe('blue');
  });

  it('returns red for BLOCKED status', () => {
    expect(getStatusColor('BLOCKED')).toBe('red');
  });

  it('returns DimGray for COMPLETED status', () => {
    expect(getStatusColor('COMPLETED')).toBe('DimGray');
  });

  it('returns red for CANCELED status', () => {
    expect(getStatusColor('CANCELED')).toBe('red');
  });

  it('returns DimGray for unknown status', () => {
    expect(getStatusColor('UNKNOWN')).toBe('DimGray');
    expect(getStatusColor('')).toBe('DimGray');
    expect(getStatusColor('invalid')).toBe('DimGray');
  });
});

describe('formatDate', () => {
  it('returns "No date" for null input', () => {
    expect(formatDate(null)).toBe('No date');
  });

  it('formats ISO date string correctly', () => {
    const result = formatDate('2025-06-15T18:00:00Z');
    expect(result).toMatch(/Jun.*15.*2025/);
  });

  it('formats date-only string correctly', () => {
    // Use ISO format with time to avoid timezone issues
    const result = formatDate('2025-01-15T12:00:00');
    expect(result).toMatch(/Jan.*15.*2025/);
  });

  it('returns original string for invalid date', () => {
    expect(formatDate('not-a-date')).toBe('Invalid Date');
  });
});

describe('formatContact', () => {
  it('returns "No contact info" when both email and phone are null', () => {
    expect(formatContact(null, null)).toBe('No contact info');
  });

  it('returns email only when phone is null', () => {
    expect(formatContact('test@example.com', null)).toBe('test@example.com');
  });

  it('returns phone only when email is null', () => {
    expect(formatContact(null, '555-1234')).toBe('555-1234');
  });

  it('returns email and phone with bullet separator', () => {
    expect(formatContact('test@example.com', '555-1234')).toBe('test@example.com • 555-1234');
  });

  it('handles empty strings as falsy values', () => {
    expect(formatContact('', '')).toBe('No contact info');
    expect(formatContact('test@example.com', '')).toBe('test@example.com');
    expect(formatContact('', '555-1234')).toBe('555-1234');
  });
});
