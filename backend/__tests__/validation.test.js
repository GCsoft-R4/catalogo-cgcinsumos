import { describe, it, expect } from 'vitest';
import { productoRules, loginRules, validate } from '../middlewares/validation';

describe('validation rules', () => {
  it('productoRules is an array of validation chains', () => {
    expect(Array.isArray(productoRules)).toBe(true);
    expect(productoRules.length).toBeGreaterThan(0);
  });

  it('loginRules is an array of validation chains', () => {
    expect(Array.isArray(loginRules)).toBe(true);
    expect(loginRules.length).toBeGreaterThan(0);
  });

  it('validate is a function', () => {
    expect(typeof validate).toBe('function');
  });
});
