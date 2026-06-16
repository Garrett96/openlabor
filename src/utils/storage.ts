import { TimeEntry, AppSettings, CATEGORIES } from '../types';

const ENTRIES_KEY = 'tempusEntries';
const SETTINGS_KEY = 'tempusSettings';

const getDefaultSettings = (): AppSettings => ({
    wages: CATEGORIES.reduce((acc, cat) => {
        acc[cat.key] = cat.defaultWage;
        return acc;
    }, {} as Record<string, number>) as AppSettings['wages'],
    overtimeMultiplier: 1.5,
});

export function loadEntries(): TimeEntry[] {
    try {
        const raw = localStorage.getItem(ENTRIES_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Failed to parse entries from localStorage', error);
        return [];
    }
}

export function saveEntries(entries: TimeEntry[]): void {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function loadSettings(): AppSettings {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return getDefaultSettings();

        const parsed = JSON.parse(raw);
        const defaults = getDefaultSettings();

        return {
            ...defaults,
            ...parsed,
            wages: { ...defaults.wages, ...(parsed.wages || {}) },
        };
    } catch (error) {
        console.error('Failed to parse settings from localStorage', error);
        return getDefaultSettings();
    }
}

export function saveSettings(settings: AppSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
