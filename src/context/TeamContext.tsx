// src/context/TeamContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Team, RoleType } from '../types';
import { dataStore } from '../data/store';

interface TeamContextType {
    Teams: Team[];
    addTeam: (firstName: string, lastName: string, role: RoleType, baseRate: number, id?: string) => void;
    updateTeam: (id: string, updates: Partial<Team>) => void;
    deleteTeam: (id: string) => void;
}
const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
    const [Teams, setTeams] = useState<Team[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        dataStore.getTeams().then((data) => {
            setTeams(data);
            setIsLoaded(true);
        });
    }, []);

    useEffect(() => {
        if (isLoaded) {
            dataStore.saveTeams(Teams);
        }
    }, [Teams, isLoaded]);

    const addTeam = (firstName: string, lastName: string, role: RoleType, baseRate: number, id?: string) => {
        const newTeam: Team = {
            id: id || crypto.randomUUID(),
            firstName,
            lastName,
            role,
            baseRate,
            status: 'Active',
        };
        setTeams(prev => [...prev, newTeam]);
    };

    const updateTeam = (id: string, updates: Partial<Team>) => {
        setTeams(prev => prev.map(emp => emp.id === id ? { ...emp, ...updates } : emp));
    };

    const deleteTeam = (id: string) => {
        setTeams(prev => prev.filter(emp => emp.id !== id));
    };

    return (
        <TeamContext.Provider value={{ Teams, addTeam, updateTeam, deleteTeam }}>
        {children}
        </TeamContext.Provider>
    );
}

export function useTeams() {
    const context = useContext(TeamContext);
    if (!context) throw new Error('useTeams must be used within an TeamProvider');
    return context;
}
