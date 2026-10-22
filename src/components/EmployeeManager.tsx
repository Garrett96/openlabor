// src/components/EmployeeManager.tsx

import { useState, useEffect } from 'react';
import { useEmployees } from '../context/EmployeeContext';
import { useToast } from '../context/ToastContext';
import { useAppContext } from '../context/AppContext';
import { ROLES, RoleType } from '../types';

export default function EmployeeManager() {
    const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployees();
    const { showToast } = useToast();
    const { settings, updateSettings } = useAppContext();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState<RoleType>('Staff');

    const [baseRate, setBaseRate] = useState(settings.defaultBaseRate);

    const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

    useEffect(() => {
        setBaseRate(settings.defaultBaseRate);
    }, [settings.defaultBaseRate]);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!firstName.trim() || !lastName.trim()) return;

        addEmployee(firstName, lastName, role, baseRate);
        showToast(`${firstName} ${lastName} added to roster`, 'success');

        if (baseRate !== settings.defaultBaseRate) {
            updateSettings({ ...settings, defaultBaseRate: baseRate });
        }

        setFirstName('');
        setLastName('');
    };

    return (
        <section className="cost-config-section">
        <h2>Employee Registry</h2>

        {/* Add Employee Form */}
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem', alignItems: 'end' }}>
        <div className="form-group">
        <label>First Name</label>
        <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required />
        </div>
        <div className="form-group">
        <label>Last Name</label>
        <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} />
        </div>
        <div className="form-group">
        <label>Role</label>
        <select value={role} onChange={e => setRole(e.target.value as RoleType)}>
        {ROLES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
        </select>
        </div>
        <div className="form-group">
        <label>Base Rate ($/hr)</label>
        <input type="number" min="0" step="0.50" value={baseRate} onChange={e => setBaseRate(Number(e.target.value))} />
        </div>
        <button type="submit" className="btn">Add Employee</button>
        </form>

        {/* Employee List with Quick Role Swap */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {employees.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No employees added yet.</p>
        ) : (
            employees.map(emp => (
                <div key={emp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                <strong>{emp.firstName}{emp.lastName ? ` ${emp.lastName}` : ''}</strong>

                {/* INLINE ROLE EDITOR */}
                {editingRoleId === emp.id ? (
                    <select
                    autoFocus
                    value={emp.role}
                    onChange={(e) => {
                        updateEmployee(emp.id, { role: e.target.value as RoleType });
                        setEditingRoleId(null);
                    }}
                    onBlur={() => setEditingRoleId(null)}
                    style={{ marginLeft: '10px', fontSize: '0.85rem', padding: '2px 4px', borderRadius: '4px', border: '1px solid var(--primary)' }}
                    >
                    {ROLES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
                    </select>
                ) : (
                    <span
                    onClick={() => setEditingRoleId(emp.id)}
                    style={{ marginLeft: '10px', fontSize: '0.85rem', color: '#666', cursor: 'pointer', textDecoration: 'underline dotted', textDecorationColor: '#aaa' }}
                    title="Click to change role"
                    >
                    {emp.role}
                    </span>
                )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '0.85rem', color: '#666' }}>$</span>
                <input
                type="number"
                style={{ width: '70px', padding: '4px 8px' }}
                value={emp.baseRate}
                onChange={e => updateEmployee(emp.id, { baseRate: Number(e.target.value) })}
                />
                <span style={{ fontSize: '0.85rem', color: '#666' }}>/hr</span>
                </div>
                <button
                className="delete-btn"
                style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                onClick={() => {
                    deleteEmployee(emp.id);
                    showToast(`${emp.firstName} ${emp.lastName} removed`, 'success');
                }}
                >
                Remove
                </button>
                </div>
                </div>
            ))
        )}
        </div>
        </section>
    );
}
