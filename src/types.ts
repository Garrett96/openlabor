// src/types.ts

export type CategoryType = 'Staff' | 'Temp' | 'Contractor' | 'Other';

export interface TimeEntry {
    id: number;
    name: string;
    category: CategoryType;
    clockIn: string;
    clockOut: string | null;
    breakTime: number;
    totalHours: number;
    isOvertime: boolean;
}

export interface AppSettings {
    wages: Record<CategoryType, number>;
    overtimeMultiplier: number;
    webhookUrl: string;
    enablePush: boolean;
    timeFormat: '12h' | '24h';
}

export const CATEGORIES: { key: CategoryType; label: string; defaultWage: number }[] = [
    { key: 'Staff', label: 'Staff', defaultWage: 15 },
{ key: 'Temp', label: 'Temp', defaultWage: 12 },
{ key: 'Contractor', label: 'Contractor', defaultWage: 20 },
{ key: 'Other', label: 'Other', defaultWage: 15 },
];
