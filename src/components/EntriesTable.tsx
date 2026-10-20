// src/components/EntriesTable.tsx

import { TimeEntry } from '../types';
import { useState, useRef, useEffect } from 'react'; // Added useRef and useEffect
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import TableRow from './TableRow';
import SmartTimeInput from './SmartTimeInput';

export default function EntriesTable() {
    const { entries, bulkUpdateEntries, settings } = useAppContext();
    const { showToast } = useToast();
    const [editingId, setEditingId] = useState<number | null>(null);

    // Restored: Ref to track the table for outside clicks
    const tableRef = useRef<HTMLTableElement>(null);

    // Bulk Action State
    const [bulkClockIn, setBulkClockIn] = useState('');
    const [bulkClockOut, setBulkClockOut] = useState('');

    const toggleEdit = (id: number) => {
        setEditingId(prev => (prev === id ? null : id));
    };

    // Restored: Exit edit mode if clicking outside the table
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tableRef.current && !tableRef.current.contains(event.target as Node)) {
                setEditingId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBulkApply = () => {
        if (!bulkClockIn && !bulkClockOut) {
            showToast('Please enter a time to apply.', 'error');
            return;
        }

        const updates: Partial<TimeEntry> = {};

        if (bulkClockIn) {
            updates.clockIn = bulkClockIn;
        }
        if (bulkClockOut) {
            updates.clockOut = bulkClockOut;
        }

        bulkUpdateEntries(updates);

        setBulkClockIn('');
        setBulkClockOut('');
        showToast(`Updated ${entries.length} entries`, 'success');
    };

    return (
        <section className="entries-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ marginBottom: 0 }}>Time Entries</h2>

        {/* --- BULK ACTIONS TOOLBAR --- */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
        <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>Bulk Set:</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <label style={{ fontWeight: 'normal', marginBottom: 0, fontSize: '0.8rem' }}>In:</label>
        <SmartTimeInput
        value={bulkClockIn}
        onChange={setBulkClockIn}
        format={settings.timeFormat}
        className="table-time-input"
        placeholder="--:--"
        />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <label style={{ fontWeight: 'normal', marginBottom: 0, fontSize: '0.8rem' }}>Out:</label>
        <SmartTimeInput
        value={bulkClockOut}
        onChange={setBulkClockOut}
        format={settings.timeFormat}
        className="table-time-input"
        placeholder="--:--"
        />
        </div>

        <button
        className="btn btn-secondary"
        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
        onClick={handleBulkApply}
        disabled={!bulkClockIn && !bulkClockOut}
        >
        Apply to All
        </button>
        </div>
        </div>

        <div className="entries-container">
        {/* Restored: ref={tableRef} */}
        <table id="entriesTable" ref={tableRef}>
        <thead>
        <tr>
        <th>Name</th>
        <th>Category</th>
        <th>Clock In</th>
        <th>Clock Out</th>
        <th>Break</th>
        <th>Total Hours</th>
        <th>OT?</th>
        <th>Cost</th>
        <th>Actions</th>
        </tr>
        </thead>
        <tbody id="entriesBody">
        {entries.length === 0 ? (
            <tr>
            <td colSpan={9} style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
            No entries yet. Add one above!
            </td>
            </tr>
        ) : (
            entries.map(entry => (
                <TableRow
                key={entry.id}
                entry={entry}
                isEditing={editingId === entry.id}
                onToggleEdit={() => toggleEdit(entry.id)}
                />
            ))
        )}
        </tbody>
        </table>
        </div>
        </section>
    );
}
