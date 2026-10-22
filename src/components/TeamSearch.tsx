// src/components/TeamSearch.tsx

import { useState, useRef, useEffect } from 'react';
import { Team } from '../types';

interface TeamSearchProps {
    Teams: Team[];
    value: string;
    onChange: (id: string) => void;
    placeholder?: string;
    onTextChange?: (text: string) => void;
}

export default function TeamSearch({ Teams, value, onChange, placeholder, onTextChange }: TeamSearchProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value) {
            const emp = Teams.find(e => e.id === value);
            if (emp) {
                setQuery(`${emp.firstName}${emp.lastName ? ' ' + emp.lastName : ''}`);
            }
        } else {
            setQuery('');
            if (onTextChange) onTextChange('');
        }
    }, [value, Teams, onTextChange]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setQuery(newValue);

        if (newValue.trim().length > 0) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }

        onChange('');
        if (onTextChange) onTextChange(newValue);
    };

        const handleSelect = (emp: Team) => {
            const fullName = `${emp.firstName}${emp.lastName ? ' ' + emp.lastName : ''}`;
            setQuery(fullName);
            onChange(emp.id);
            setIsOpen(false);
            if (onTextChange) onTextChange(fullName);
        };

            const filteredTeams = query.trim().length > 0
            ? Teams.filter(emp => {
                const fullName = `${emp.firstName} ${emp.lastName || ''}`.toLowerCase();
                return fullName.includes(query.toLowerCase());
            })
            : [];

            return (
                <div style={{ position: 'relative' }} ref={wrapperRef}>
                <input
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={() => {
                    if (query.trim().length > 0) setIsOpen(true);
                }}
                placeholder={placeholder || "Type name to search or add new..."}
                style={{ width: '100%' }}
                className="table-time-input"
                />

                {isOpen && query.trim().length > 0 && filteredTeams.length > 0 && (
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
                        marginTop: '4px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        zIndex: 50,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                    {filteredTeams.map(emp => (
                        <li
                        key={emp.id}
                        onClick={() => handleSelect(emp)}
                        style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f0f0f0',
                            fontSize: '0.9rem'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                        >
                        <strong>{emp.firstName}{emp.lastName ? ` ${emp.lastName}` : ''}</strong>
                        <span style={{ color: '#666', fontSize: '0.8rem', marginLeft: '8px' }}>
                        ({emp.role})
                        </span>
                        </li>
                    ))}
                    </ul>
                )}
                </div>
            );
}
