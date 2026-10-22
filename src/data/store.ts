// src/data/store.ts

import { TimeEntry, Team, AppSettings } from '../types';

export interface IDataStore {
    getEntries(): Promise<TimeEntry[]>;
    saveEntries(entries: TimeEntry[]): Promise<void>;

    getTeams(): Promise<Team[]>;
    saveTeams(Teams: Team[]): Promise<void>;

    getSettings(): Promise<AppSettings>;
    saveSettings(settings: AppSettings): Promise<void>;
}

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

    async getEntries(): Promise<TimeEntry[]> {
        return this.get<TimeEntry[]>('tempus_entries', []);
    }
    async saveEntries(entries: TimeEntry[]): Promise<void> {
        await this.set('tempus_entries', entries);
    }

    async getTeams(): Promise<Team[]> {
        return this.get<Team[]>('tempus_Teams', []);
    }
    async saveTeams(Teams: Team[]): Promise<void> {
        await this.set('tempus_Teams', Teams);
    }

    async getSettings(): Promise<AppSettings> {
        const defaults: AppSettings = {
            overtimeMultiplier: 1.5,
            webhookUrl: '',
            enablePush: false,
            timeFormat: '24h',
            punchRoundingMinutes: 0,
            defaultBaseRate: 20,
        };
        const loaded = await this.get<Partial<AppSettings>>('tempus_settings', {});
        return { ...defaults, ...loaded };
    }
    async saveSettings(settings: AppSettings): Promise<void> {
        await this.set('tempus_settings', settings);
    }
}

export const dataStore = new LocalStorageStore();
