// src/context/AppContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TimeEntry, AppSettings, CategoryType } from '../types';
import { loadEntries, saveEntries, loadSettings, saveSettings } from '../utils/storage';
import { calculateHours } from '../utils/calculations';
import { generateCategoryColors } from '../utils/colors';

interface AppContextType {
    entries: TimeEntry[];
    settings: AppSettings;
    categoryColors: Record<CategoryType, { bg: string; border: string; text: string }>;
    addEntry: (name: string, category: CategoryType, clockIn: string, clockOut: string | null, breakTime: number) => void;
    updateEntry: (id: number, updates: Partial<TimeEntry>) => void;
    deleteEntry: (id: number) => void;
    restoreEntry: (entry: TimeEntry) => void;
    bulkUpdateEntries: (updates: Partial<TimeEntry>) => void;
    updateSettings: (newSettings: AppSettings) => void;
    importData: (newEntries: TimeEntry[], newSettings: AppSettings) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    // 1. Load entries from storage
    const [entries, setEntries] = useState<TimeEntry[]>(() => loadEntries());

    // 2. Load settings with safe defaults for new fields
    const [settings, setSettings] = useState<AppSettings>(() => {
        const loaded = loadSettings();
        return {
            ...loaded,
            webhookUrl: loaded.webhookUrl || '',
            enablePush: loaded.enablePush || false,
            timeFormat: loaded.timeFormat || '24h',
        };
    });

    // 3. Generate random category colors on mount
    const [categoryColors, setCategoryColors] = useState<Record<CategoryType, { bg: string; border: string; text: string }>>(() => generateCategoryColors());

    // 4. Auto-save to localStorage whenever state changes
    useEffect(() => { saveEntries(entries); }, [entries]);
    useEffect(() => { saveSettings(settings); }, [settings]);

    // --- ACTIONS ---

    const addEntry = (name: string, category: CategoryType, clockIn: string, clockOut: string | null, breakTime: number) => {
        const totalHours = calculateHours(clockIn, clockOut, breakTime);
        const newEntry: TimeEntry = {
            id: Date.now(),
            name,
            category,
            clockIn,
            clockOut,
            breakTime,
            totalHours,
            isOvertime: false,
        };
        setEntries(prev => [...prev, newEntry]);
    };

    const updateEntry = (id: number, updates: Partial<TimeEntry>) => {
        setEntries(prev => prev.map(entry => {
            if (entry.id !== id) return entry;

            const newClockIn = updates.clockIn ?? entry.clockIn;
            const newClockOut = updates.clockOut !== undefined ? updates.clockOut : entry.clockOut;
            const newBreak = updates.breakTime ?? entry.breakTime;

            const updatedEntry = {
                ...entry,
                ...updates,
                totalHours: calculateHours(newClockIn, newClockOut, newBreak)
            };
            return updatedEntry;
        }));
    };

    const deleteEntry = (id: number) => {
        setEntries(prev => prev.filter(entry => entry.id !== id));
    };

    const restoreEntry = (entry: TimeEntry) => {
        setEntries(prev => [...prev, entry]);
    };

    const bulkUpdateEntries = (updates: Partial<TimeEntry>) => {
        setEntries(prev => prev.map(entry => {
            const newClockIn = updates.clockIn ?? entry.clockIn;
            const newClockOut = updates.clockOut !== undefined ? updates.clockOut : entry.clockOut;
            const newBreak = updates.breakTime ?? entry.breakTime;

            return {
                ...entry,
                ...updates,
                totalHours: calculateHours(newClockIn, newClockOut, newBreak)
            };
        }));
    };

    const updateSettings = (newSettings: AppSettings) => {
        setSettings(newSettings);
    };

    const importData = (newEntries: TimeEntry[], newSettings: AppSettings) => {
        setEntries(newEntries);
        setSettings({
            ...newSettings,
            webhookUrl: newSettings.webhookUrl || '',
            enablePush: newSettings.enablePush || false,
            timeFormat: newSettings.timeFormat || '24h',
        });
    };

    // --- PROVIDER ---

    return (
        <AppContext.Provider value={{
            entries,
            settings,
            categoryColors,
            addEntry,
            updateEntry,
            deleteEntry,
            restoreEntry,
            bulkUpdateEntries,
            updateSettings,
            importData
        }}>
        {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}
