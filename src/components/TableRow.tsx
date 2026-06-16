// src/components/TableRow.tsx

import { useState, KeyboardEvent, useEffect } from 'react';
import { TimeEntry, CATEGORIES, CategoryType } from '../types';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { calculateEntryCost } from '../utils/calculations';
import { formatTimeDisplay } from '../utils/time';
import SmartTimeInput from './SmartTimeInput';

interface TableRowProps {
    entry: TimeEntry;
    isEditing: boolean;
    onToggleEdit: () => void;
}

export default function TableRow({ entry, isEditing, onToggleEdit }: TableRowProps) {
    const { updateEntry, deleteEntry, restoreEntry, settings, categoryColors } = useAppContext();
    const { showToast } = useToast();

    const isActive = !entry.clockOut;
    const color = categoryColors[entry.category] || { border: '#ccc', bg: '#f8fafc' };

    const [editName, setEditName] = useState(entry.name);
    const [editCategory, setEditCategory] = useState<CategoryType>(entry.category);
    const [editClockIn, setEditClockIn] = useState(entry.clockIn);
    const [editClockOut, setEditClockOut] = useState(entry.clockOut ?? '');
    const [editBreak, setEditBreak] = useState(entry.breakTime);

    // Sync state when entering edit mode or when entry changes
    useEffect(() => {
        if (isEditing) {
            setEditName(entry.name);
            setEditCategory(entry.category);
            setEditClockIn(entry.clockIn);
            setEditClockOut(entry.clockOut ?? '');
            setEditBreak(entry.breakTime);
        }
    }, [isEditing, entry.id]);

    // Auto-save on exit edit mode
    useEffect(() => {
        if (isEditing) {
            return () => {
                if (editClockIn) {
                    updateEntry(entry.id, {
                        name: editName,
                        category: editCategory,
                        clockIn: editClockIn,
                        clockOut: editClockOut === '' ? null : editClockOut,
                        breakTime: editBreak,
                    });
                }
            };
        }
    }, [isEditing, editName, editCategory, editClockIn, editClockOut, editBreak, entry.id, entry.clockIn, updateEntry]);

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            if (!editClockIn) {
                showToast('Clock In is required', 'error');
                return;
            }
            updateEntry(entry.id, {
                name: editName,
                category: editCategory,
                clockIn: editClockIn,
                clockOut: editClockOut === '' ? null : editClockOut,
                breakTime: editBreak,
            });
            onToggleEdit();
        }
    };

    // --- EDIT MODE ---
    if (isEditing) {
        return (
            <tr
            className={isActive ? 'active-shift' : ''}
            onClick={onToggleEdit}
            style={{ cursor: 'pointer', borderLeft: `4px solid ${color.border}` }}
            >
            <td onClick={(e) => e.stopPropagation()}>
            <input
            type="text"
            className="table-time-input"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            onKeyDown={handleKeyDown}
            />
            </td>
            <td onClick={(e) => e.stopPropagation()}>
            <select
            className="table-time-input"
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value as CategoryType)}
            >
            {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
            </td>
            <td onClick={(e) => e.stopPropagation()}>
            <SmartTimeInput
            value={editClockIn}
            onChange={setEditClockIn}
            format={settings.timeFormat}
            className="table-time-input"
            />
            </td>
            <td onClick={(e) => e.stopPropagation()}>
            <SmartTimeInput
            value={editClockOut}
            onChange={setEditClockOut}
            format={settings.timeFormat}
            className="table-time-input"
            />
            </td>
            <td onClick={(e) => e.stopPropagation()}>
            <input
            type="number"
            className="table-time-input"
            style={{ width: '60px' }}
            value={editBreak}
            min="0"
            onChange={e => setEditBreak(Number(e.target.value))}
            onKeyDown={handleKeyDown}
            />
            </td>
            <td onClick={(e) => e.stopPropagation()}>{entry.totalHours} hrs</td>
            <td onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <input
            type="checkbox"
            checked={entry.isOvertime}
            onChange={(e) => updateEntry(entry.id, { isOvertime: e.target.checked })}
            />
            </td>
            <td onClick={(e) => e.stopPropagation()}>${calculateEntryCost(entry, settings).toFixed(2)}</td>
            <td onClick={(e) => e.stopPropagation()}>
            <button
            className="btn btn-secondary"
            style={{ padding: '4px 8px', fontSize: '0.8rem' }}
            onClick={(e) => {
                e.stopPropagation();
                if (!editClockIn) {
                    showToast('Clock In is required', 'error');
                    return;
                }
                updateEntry(entry.id, {
                    name: editName,
                    category: editCategory,
                    clockIn: editClockIn,
                    clockOut: editClockOut === '' ? null : editClockOut,
                    breakTime: editBreak,
                });
                onToggleEdit();
            }}
            >
            Save
            </button>
            </td>
            </tr>
        );
    }

    // --- DISPLAY MODE ---
    const cost = calculateEntryCost(entry, settings);

    return (
        <tr
        className={isActive ? 'active-shift' : ''}
        onClick={onToggleEdit}
        style={{ cursor: 'pointer', borderLeft: `4px solid ${color.border}` }}
        >
        <td>{entry.name}</td>
        <td>{entry.category}</td>
        <td>{formatTimeDisplay(entry.clockIn, settings.timeFormat)}</td>
        <td onClick={(e) => e.stopPropagation()}>
        {isActive ? (
            <SmartTimeInput
            value=""
            onChange={(val) => updateEntry(entry.id, { clockOut: val === '' ? null : val })}
            format={settings.timeFormat}
            className="table-time-input"
            />
        ) : (
            formatTimeDisplay(entry.clockOut, settings.timeFormat)
        )}
        </td>
        <td onClick={(e) => e.stopPropagation()}>
        {isActive ? (
            <input
            type="number"
            className="table-time-input"
            style={{ width: '60px' }}
            value={entry.breakTime}
            min="0"
            step="15"
            onChange={(e) => updateEntry(entry.id, { breakTime: Number(e.target.value) })}
            />
        ) : (
            `${entry.breakTime} min`
        )}
        </td>
        <td>{isActive ? <em style={{color: '#666'}}>Active</em> : `${entry.totalHours} hrs`}</td>
        <td onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
        {isActive ? '-' : (
            <input
            type="checkbox"
            checked={entry.isOvertime}
            onChange={(e) => updateEntry(entry.id, { isOvertime: e.target.checked })}
            />
        )}
        </td>
        <td>{isActive ? '-' : `$${cost.toFixed(2)}`}</td>
        <td onClick={(e) => e.stopPropagation()}>
        <button
        className="delete-btn"
        onClick={(e) => {
            e.stopPropagation();
            deleteEntry(entry.id);
            showToast("Entry deleted", "error", true, () => {
                restoreEntry(entry);
                showToast("Entry restored", "success");
            });
        }}
        >
        Delete
        </button>
        </td>
        </tr>
    );
}
