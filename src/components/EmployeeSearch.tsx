// src/components/EmployeeSearch.tsx

import { useState, useRef, useEffect } from 'react';
import { Employee } from '../types';

interface EmployeeSearchProps {
    employees: Employee[];
    value: string;
    onChange: (id: string) => void;
    placeholder?: string;
    onTextChange?: (text: string) => void;
}

export default function EmployeeSearch({ employees, value, onChange, placeholder, onTextChange }: EmployeeSearchProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync the text input with the selected employee's name
    useEffect(() => {
        if (value) {
            const emp = employees.find(e => e.id === value);
            if (emp) setQuery(`${emp.firstName} ${emp.lastName}`);
        } else {
            setQuery('');
        }
    }, [value, employees]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter logic
    const filteredEmployees = employees
    .filter(e => e.status === 'Active')
    .filter(e => {
        const searchStr = `${e.firstName} ${e.lastName} ${e.role}`.toLowerCase();
        return searchStr.includes(query.toLowerCase());
    });

    const handleSelect = (emp: Employee) => {
        onChange(emp.id);
        setQuery(`${emp.firstName} ${emp.lastName}`);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setIsOpen(true);
        if (e.target.value === '') onChange('');
        if (onTextChange) onTextChange(e.target.value);
    };

        return (
            <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
            <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder || "Search employees..."}
            className="table-time-input" // Reuses your existing input styling
            autoComplete="off"
            />

            {isOpen && filteredEmployees.length > 0 && (
                <ul style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    margin: 0,
                    padding: 0,
                    listStyle: 'none',
                    backgroundColor: 'white',
                    border: '1px solid var(--border)',
                                                        borderRadius: '6px',
                                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                        maxHeight: '200px',
                                                        overflowY: 'auto',
                                                        zIndex: 50,
                                                        marginTop: '4px'
                }}>
                {filteredEmployees.map(emp => (
                    <li
                    key={emp.id}
                    onClick={() => handleSelect(emp)}
                    style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f0f0f0',
                        fontSize: '0.9rem',
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                    <span>{emp.firstName} {emp.lastName}</span>
                    <span style={{ color: '#666', fontSize: '0.8rem' }}>{emp.role}</span>
                    </li>
                ))}
                </ul>
            )}

            {isOpen && query && filteredEmployees.length === 0 && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    padding: '8px 12px', backgroundColor: 'white', border: '1px solid var(--border)',
                                                                   borderRadius: '6px', fontSize: '0.85rem', color: '#666', marginTop: '4px', zIndex: 50
                }}>
                No employees found. Add them in the Roster tab.
                </div>
            )}
            </div>
        );
}
