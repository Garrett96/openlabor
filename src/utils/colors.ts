// src/utils/colors.ts

import { CategoryType, CATEGORIES } from '../types';

export interface CategoryColor {
    bg: string;
    border: string;
    text: string;
}

export const COLOR_PALETTE: CategoryColor[] = [
    { bg: '#e0e7ff', border: '#4f46e5', text: '#1e3a8a' }, // Indigo
{ bg: '#d1fae5', border: '#059669', text: '#064e3b' }, // Emerald
{ bg: '#fef3c7', border: '#d97706', text: '#78350f' }, // Amber
{ bg: '#fce7f3', border: '#db2777', text: '#831843' }, // Pink/Rose
{ bg: '#e0f2fe', border: '#0284c7', text: '#075985' }, // Sky
{ bg: '#f3e8ff', border: '#9333ea', text: '#581c87' }, // Purple
];

export function generateCategoryColors(): Record<CategoryType, CategoryColor> {
    const shuffled = [...COLOR_PALETTE].sort(() => Math.random() - 0.5).slice(0, CATEGORIES.length);

    return CATEGORIES.reduce((acc, cat, idx) => {
        acc[cat.key] = shuffled[idx];
        return acc;
    }, {} as Record<CategoryType, CategoryColor>);
}
