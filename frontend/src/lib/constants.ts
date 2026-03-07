// src/lib/constants.ts
import type { Category } from '../types';

export const CAT_META: Record<Category, { icon: string; color: string; bg: string }> = {
  Food:    { icon: '🍽️', color: '#E8752A', bg: '#FEF1E8' },
  Medical: { icon: '💊', color: '#2A7FE8', bg: '#EBF3FE' },
  'Café':  { icon: '☕', color: '#8B5E3C', bg: '#F3EDE8' },
};

export const SUBCATS: Record<Category, string[]> = {
  Food:    ['Restaurant', 'Fast Food', 'Street Food', 'Bakery', 'Sweets'],
  Medical: ['Pharmacy', 'Clinic', 'Diagnostics', 'Ayurvedic'],
  'Café':  ['Coffee', 'Tea House', 'Juice Bar', 'Dessert Café'],
};

export const CATEGORIES: Category[] = ['Food', 'Medical', 'Café'];
