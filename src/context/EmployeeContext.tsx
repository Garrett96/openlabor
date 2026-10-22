// src/context/EmployeeContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Employee, RoleType } from '../types';
import { dataStore } from '../data/store';

interface EmployeeContextType {
    employees: Employee[];
    addEmployee: (firstName: string, lastName: string, role: RoleType, baseRate: number, id?: string) => void;
    updateEmployee: (id: string, updates: Partial<Employee>) => void;
    deleteEmployee: (id: string) => void;
}
const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export function EmployeeProvider({ children }: { children: ReactNode }) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        dataStore.getEmployees().then((data) => {
            setEmployees(data);
            setIsLoaded(true);
        });
    }, []);

    useEffect(() => {
        if (isLoaded) {
            dataStore.saveEmployees(employees);
        }
    }, [employees, isLoaded]);

    const addEmployee = (firstName: string, lastName: string, role: RoleType, baseRate: number, id?: string) => {
        const newEmployee: Employee = {
            id: id || crypto.randomUUID(),
            firstName,
            lastName,
            role,
            baseRate,
            status: 'Active',
        };
        setEmployees(prev => [...prev, newEmployee]);
    };

    const updateEmployee = (id: string, updates: Partial<Employee>) => {
        setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...updates } : emp));
    };

    const deleteEmployee = (id: string) => {
        setEmployees(prev => prev.filter(emp => emp.id !== id));
    };

    return (
        <EmployeeContext.Provider value={{ employees, addEmployee, updateEmployee, deleteEmployee }}>
        {children}
        </EmployeeContext.Provider>
    );
}

export function useEmployees() {
    const context = useContext(EmployeeContext);
    if (!context) throw new Error('useEmployees must be used within an EmployeeProvider');
    return context;
}
