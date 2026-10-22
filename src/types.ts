// src/types.ts

export type RoleType = 'Staff' | 'Temp' | 'Contractor' | 'Other';
export type EmployeeStatus = 'Active' | 'Inactive';

export interface Employee {
    id: string;
    firstName: string;
    lastName?: string;
    role: RoleType;
    baseRate: number;
    status: EmployeeStatus;
}

export interface TimeEntry {
    id: string;
    employeeId: string;
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
