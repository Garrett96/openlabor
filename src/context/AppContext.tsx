// src/context/AppContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TimeEntry, AppSettings } from '../types';
import { dataStore } from '../data/store';
import { calculateHours } from '../utils/calculations';
import { generateRoleColors } from '../utils/colors';
import { RoleType } from '../types';

interface AppContextType {
    entries: TimeEntry[];
    settings: AppSettings;
    roleColors: Record<RoleType, { bg: string; border: string; text: string }>;
    addEntry: (employeeId: string, clockIn: string, clockOut: string | null, breakTime: number) => void;
    updateEntry: (id: string, updates: Partial<TimeEntry>) => void;
    deleteEntry: (id: string) => void;
    restoreEntry: (entry: TimeEntry) => void;
    bulkUpdateEntries: (updates: Partial<TimeEntry>) => void;
    updateSettings: (newSettings: AppSettings) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const [roleColors] = useState(() => generateRoleColors());

    useEffect(() => {
        Promise.all([
            dataStore.getEntries(),
                    dataStore.getSettings()
        ]).then(([loadedEntries, loadedSettings]) => {
            setEntries(loadedEntries);
            setSettings(loadedSettings);
            setIsLoaded(true);
        });
    }, []);

    useEffect(() => {
        if (isLoaded) dataStore.saveEntries(entries);
    }, [entries, isLoaded]);

        useEffect(() => {
            if (isLoaded && settings) dataStore.saveSettings(settings);
        }, [settings, isLoaded]);

            const addEntry = (employeeId: string, clockIn: string, clockOut: string | null, breakTime: number) => {
                const totalHours = calculateHours(clockIn, clockOut, breakTime);
                const newEntry: TimeEntry = {
                    id: crypto.randomUUID(),
                    employeeId,
                    clockIn,
                    clockOut,
                    breakTime,
                    totalHours,
                    isOvertime: false,
                };
                setEntries(prev => [...prev, newEntry]);
            };

            const updateEntry = (id: string, updates: Partial<TimeEntry>) => {
                setEntries(prev => prev.map(entry => {
                    if (entry.id !== id) return entry;
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

            const deleteEntry = (id: string) => setEntries(prev => prev.filter(e => e.id !== id));
            const restoreEntry = (entry: TimeEntry) => setEntries(prev => [...prev, entry]);

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

            const updateSettings = (newSettings: AppSettings) => setSettings(newSettings);

            if (!settings) return null;

            return (
                <AppContext.Provider value={{
                    entries, settings, roleColors,
                    addEntry, updateEntry, deleteEntry, restoreEntry, bulkUpdateEntries, updateSettings
                }}>
                {children}
                </AppContext.Provider>
            );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAppContext must be used within an AppProvider');
    return context;
}
