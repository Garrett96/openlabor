// src/data/store.ts

import { TimeEntry, Employee, AppSettings } from '../types';

// 1. The Contract (Interface)
export interface IDataStore {
    // Entries
    getEntries(): Promise<TimeEntry[]>;
    saveEntries(entries: TimeEntry[]): Promise<void>;

    // Employees
    getEmployees(): Promise<Employee[]>;
    saveEmployees(employees: Employee[]): Promise<void>;

    // Settings
    getSettings(): Promise<AppSettings>;
    saveSettings(settings: AppSettings): Promise<void>;
}

// 2. The Implementation (LocalStorage)
export class LocalStorageStore implements IDataStore {
    private get<T>(key: string, defaultValue: T): Promise<T> {
        return new Promise((resolve) => {
            try {
                const raw = localStorage.getItem(key);
                if (!raw) return resolve(defaultValue);
                resolve(JSON.parse(raw));
            } catch (error) {
                console.error(`DataStore: Error reading ${key}`, error);
                resolve(defaultValue);
            }
        });
    }

    private set<T>(key: string, value: T): Promise<void> {
        return new Promise((resolve) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                resolve();
            } catch (error) {
                console.error(`DataStore: Error writing ${key}`, error);
            }
        });
    }

    // Entries
    async getEntries(): Promise<TimeEntry[]> {
        return this.get<TimeEntry[]>('tempus_entries', []);
    }
    async saveEntries(entries: TimeEntry[]): Promise<void> {
        await this.set('tempus_entries', entries);
    }

    // Employees
    async getEmployees(): Promise<Employee[]> {
        return this.get<Employee[]>('tempus_employees', []);
    }
    async saveEmployees(employees: Employee[]): Promise<void> {
        await this.set('tempus_employees', employees);
    }

    // Settings
    async getSettings(): Promise<AppSettings> {
        const defaults: AppSettings = {
            overtimeMultiplier: 1.5,
            webhookUrl: '',
            enablePush: false,
            timeFormat: '24h',
            punchRoundingMinutes: 0,
        };
        const loaded = await this.get<Partial<AppSettings>>('tempus_settings', {});
        return { ...defaults, ...loaded };
    }
    async saveSettings(settings: AppSettings): Promise<void> {
        await this.set('tempus_settings', settings);
    }
}

// 3. The Singleton Instance
export const dataStore = new LocalStorageStore();
