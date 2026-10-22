// src/types.ts

export type RoleType = 'Staff' | 'Temp' | 'Contractor' | 'Other';
export type TeamStatus = 'Active' | 'Inactive';

export interface Team {
    id: string;
    firstName: string;
    lastName?: string;
    role: RoleType;
    baseRate: number;
    status: TeamStatus;
}

export interface TimeEntry {
    id: string;
    TeamId: string;
    clockIn: string;
    clockOut: string | null;
    breakTime: number;
    totalHours: number;
    isOvertime: boolean;
    notes?: string;
}

export interface AppSettings {
    overtimeMultiplier: number;
    webhookUrl: string;
    enablePush: boolean;
    timeFormat: '12h' | '24h';
    punchRoundingMinutes: 0 | 5 | 15 | 30;
    defaultBaseRate: number;
}

export const ROLES: { key: RoleType; label: string }[] = [
    { key: 'Staff', label: 'Staff' },
{ key: 'Temp', label: 'Temp' },
{ key: 'Contractor', label: 'Contractor' },
{ key: 'Other', label: 'Other' },
];
