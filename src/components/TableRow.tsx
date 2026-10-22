// src/components/TableRow.tsx

import { useState, KeyboardEvent, useEffect, useRef } from 'react';
import { TimeEntry } from '../types';
import { useAppContext } from '../context/AppContext';
import { useTeams } from '../context/TeamContext';
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
    const { updateEntry, deleteEntry, restoreEntry, settings, roleColors } = useAppContext();
    const { Teams } = useTeams();
    const { showToast } = useToast();

    const Team = Teams.find(e => e.id === entry.TeamId);
    const isActive = !entry.clockOut;
    const color = Team ? roleColors[Team.role] : { border: '#ccc', bg: '#f8fafc' };

    // 1. Standard React State for UI rendering
    const [editClockIn, setEditClockInState] = useState(entry.clockIn);
    const [editClockOut, setEditClockOutState] = useState(entry.clockOut ?? '');
    const [editBreak, setEditBreakState] = useState(entry.breakTime);

    // 2. Synchronous Ref for Auto-Save (Prevents race conditions)
    const editData = useRef({
        clockIn: entry.clockIn,
        clockOut: entry.clockOut ?? '',
        breakTime: entry.breakTime
    });

    // 3. Wrapped Setters (Updates UI and Ref simultaneously)
    const setEditClockIn = (val: string) => { editData.current.clockIn = val; setEditClockInState(val); };
    const setEditClockOut = (val: string) => { editData.current.clockOut = val; setEditClockOutState(val); };
    const setEditBreak = (val: number) => { editData.current.breakTime = val; setEditBreakState(val); };

    // Sync ref when entering edit mode
    useEffect(() => {
        if (isEditing) {
            editData.current = {
                clockIn: entry.clockIn,
                clockOut: entry.clockOut ?? '',
                breakTime: entry.breakTime
            };
            setEditClockInState(entry.clockIn);
            setEditClockOutState(entry.clockOut ?? '');
            setEditBreakState(entry.breakTime);
        }
    }, [isEditing, entry.id]);

    // Auto-save on exit edit mode (Uses the synchronous ref, not stale state)
    useEffect(() => {
        if (isEditing) {
            return () => {
                if (editData.current.clockIn) {
                    updateEntry(entry.id, {
                        clockIn: editData.current.clockIn,
                        clockOut: editData.current.clockOut === '' ? null : editData.current.clockOut,
                        breakTime: editData.current.breakTime,
                    });
                }
            };
        }
    }, [isEditing, entry.id, updateEntry]);

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            if (!editData.current.clockIn) {
                showToast('Clock In is required', 'error');
                return;
            }
            updateEntry(entry.id, {
                clockIn: editData.current.clockIn,
                clockOut: editData.current.clockOut === '' ? null : editData.current.clockOut,
                breakTime: editData.current.breakTime,
            });
            onToggleEdit();
        }
    };

    // Explicit save for SmartTimeInput Enter key
    const saveWithFormattedTime = (field: 'clockIn' | 'clockOut', formattedVal: string) => {
        editData.current[field] = formattedVal; // Sync ref immediately

        updateEntry(entry.id, {
            clockIn: field === 'clockIn' ? formattedVal : editData.current.clockIn,
            clockOut: field === 'clockOut' ? (formattedVal === '' ? null : formattedVal) : (editData.current.clockOut === '' ? null : editData.current.clockOut),
                    breakTime: editData.current.breakTime,
        });
        onToggleEdit();
    };

    // --- EDIT MODE ---
    if (isEditing) {
        return (
            <tr
            className={isActive ? 'active-shift' : ''}
            onClick={onToggleEdit}
            style={{ cursor: 'pointer', borderLeft: `4px solid ${color.border}` }}
            >
            <td>{Team ? `${Team.firstName}${Team.lastName ? ' ' + Team.lastName : ''}` : 'Unknown Team'}</td>
            <td>{Team?.role || 'Unknown'}</td>

            <td style={{ minWidth: '120px' }}>
            <SmartTimeInput
            value={editClockIn}
            onChange={setEditClockIn}
            format={settings.timeFormat}
            className="table-time-input"
            onSaveWithFormat={(val) => saveWithFormattedTime('clockIn', val)}
            onClick={(e) => e.stopPropagation()}
            />
            </td>

            <td style={{ minWidth: '120px' }}>
            <SmartTimeInput
            value={editClockOut}
            onChange={setEditClockOut}
            format={settings.timeFormat}
            className="table-time-input"
            onSaveWithFormat={(val) => saveWithFormattedTime('clockOut', val)}
            onClick={(e) => e.stopPropagation()}
            />
            </td>

            <td>
            <input
            type="number"
            className="table-time-input"
            style={{ width: '60px' }}
            value={editBreak}
            min="0"
            onChange={e => setEditBreak(Number(e.target.value))}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            />
            </td>

            <td>{entry.totalHours} hrs</td>
            <td style={{ textAlign: 'center' }}>
            <input
            type="checkbox"
            checked={entry.isOvertime}
            onChange={(e) => updateEntry(entry.id, { isOvertime: e.target.checked })}
            onClick={(e) => e.stopPropagation()}
            />
            </td>
            <td>${calculateEntryCost(entry, Team?.baseRate || 0, settings).toFixed(2)}</td>
            <td>
            <button
            className="btn btn-secondary"
            style={{ padding: '4px 8px', fontSize: '0.8rem' }}
            onClick={(e) => {
                e.stopPropagation();
                if (!editData.current.clockIn) {
                    showToast('Clock In is required', 'error');
                    return;
                }
                updateEntry(entry.id, {
                    clockIn: editData.current.clockIn,
                    clockOut: editData.current.clockOut === '' ? null : editData.current.clockOut,
                    breakTime: editData.current.breakTime
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
    const cost = calculateEntryCost(entry, Team?.baseRate || 0, settings);

    return (
        <tr
        className={isActive ? 'active-shift' : ''}
        onClick={onToggleEdit}
        style={{ cursor: 'pointer', borderLeft: `4px solid ${color.border}` }}
        >
        <td>{Team ? `${Team.firstName}${Team.lastName ? ' ' + Team.lastName : ''}` : 'Unknown Team'}</td>
        <td>{Team?.role || 'Unknown'}</td>
        <td>{formatTimeDisplay(entry.clockIn, settings.timeFormat)}</td>
        <td>
        {isActive ? (
            <SmartTimeInput
            value=""
            onChange={(val) => updateEntry(entry.id, { clockOut: val === '' ? null : val })}
            format={settings.timeFormat}
            className="table-time-input"
            onClick={(e) => e.stopPropagation()}
            />
        ) : (
            formatTimeDisplay(entry.clockOut, settings.timeFormat)
        )}
        </td>
        <td>
        {isActive ? (
            <input
            type="number"
            className="table-time-input"
            style={{ width: '60px' }}
            value={entry.breakTime}
            min="0"
            step="15"
            onChange={(e) => updateEntry(entry.id, { breakTime: Number(e.target.value) })}
            onClick={(e) => e.stopPropagation()}
            />
        ) : (
            `${entry.breakTime} min`
        )}
        </td>
        <td>{isActive ? <em style={{color: '#666'}}>Active</em> : `${entry.totalHours} hrs`}</td>
        <td style={{ textAlign: 'center' }}>
        {isActive ? '-' : (
            <input
            type="checkbox"
            checked={entry.isOvertime}
            onChange={(e) => updateEntry(entry.id, { isOvertime: e.target.checked })}
            onClick={(e) => e.stopPropagation()}
            />
        )}
        </td>
        <td>{isActive ? '-' : `$${cost.toFixed(2)}`}</td>
        <td>
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
