// src/types.ts

// 1. The Employee Entity (HRIS Style)
export type RoleType = 'Staff' | 'Temp' | 'Contractor' | 'Other';
export type EmployeeStatus = 'Active' | 'Inactive';

export interface Employee {
    id: string; // UUID
    firstName: string;
    lastName: string;
    role: RoleType;
    baseRate: number; // Hourly rate specific to this employee
    status: EmployeeStatus;
}

// 2. The Time Entry (Now references an Employee)
export interface TimeEntry {
    id: string; // UUID
    employeeId: string; // Foreign Key to Employee
    clockIn: string; // "HH:MM" 24h format
    clockOut: string | null;
    breakTime: number; // Minutes
    totalHours: number;
    isOvertime: boolean;
    notes?: string; // Added for future audit/compliance notes
}

// 3. App Settings (Simplified, as wages moved to Employee)
export interface AppSettings {
    overtimeMultiplier: number;
    webhookUrl: string;
    enablePush: boolean;
    timeFormat: '12h' | '24h';
    punchRoundingMinutes: 0 | 5 | 15 | 30; // Added for future Phase 2
}

// Helper for Roles
export const ROLES: { key: RoleType; label: string }[] = [
    { key: 'Staff', label: 'Staff' },
{ key: 'Temp', label: 'Temp' },
{ key: 'Contractor', label: 'Contractor' },
{ key: 'Other', label: 'Other' },
];
