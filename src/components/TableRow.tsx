// src/components/TableRow.tsx

import { useState, KeyboardEvent, useEffect } from 'react';
import { TimeEntry } from '../types';
import { useAppContext } from '../context/AppContext';
import { useEmployees } from '../context/EmployeeContext';
import { useToast } from '../context/ToastContext';
import { calculateEntryCost } from '../utils/calculations';
import { formatTimeDisplay } from '../utils/time';
import SmartTimeInput from './SmartTimeInput';
// EmployeeSearch import removed since we no longer edit the employee here

interface TableRowProps {
    entry: TimeEntry;
    isEditing: boolean;
    onToggleEdit: () => void;
}

export default function TableRow({ entry, isEditing, onToggleEdit }: TableRowProps) {
    const { updateEntry, deleteEntry, restoreEntry, settings, roleColors } = useAppContext();
    const { employees } = useEmployees();
    const { showToast } = useToast();

    const employee = employees.find(e => e.id === entry.employeeId);
    const isActive = !entry.clockOut;
    const color = employee ? roleColors[employee.role] : { border: '#ccc', bg: '#f8fafc' };

    // REMOVED: editEmployeeId state. We only edit times and breaks now.
    const [editClockIn, setEditClockIn] = useState(entry.clockIn);
    const [editClockOut, setEditClockOut] = useState(entry.clockOut ?? '');
    const [editBreak, setEditBreak] = useState(entry.breakTime);

    // Sync state when entering edit mode
    useEffect(() => {
        if (isEditing) {
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
                        clockIn: editClockIn,
                        clockOut: editClockOut === '' ? null : editClockOut,
                        breakTime: editBreak,
                    });
                }
            };
        }
    }, [isEditing, editClockIn, editClockOut, editBreak, entry.id, updateEntry]);

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            if (!editClockIn) {
                showToast('Clock In is required', 'error');
                return;
            }
            updateEntry(entry.id, {
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
            onClick={onToggleEdit} // Clicking ANYWHERE on the row now cleanly exits edit mode and auto-saves
            style={{ cursor: 'pointer', borderLeft: `4px solid ${color.border}` }}
            >
            {/* Employee - Read Only, but clicking it exits edit mode */}
            <td>{employee ? `${employee.firstName}${employee.lastName ? ' ' + employee.lastName : ''}` : 'Unknown Employee'}</td>
            <td>{employee?.role || 'Unknown'}</td>

            {/* Clock In - Clicking the input focuses it. Clicking the cell background exits edit mode. */}
            <td style={{ minWidth: '120px' }}>
            <SmartTimeInput
            value={editClockIn}
            onChange={setEditClockIn}
            format={settings.timeFormat}
            className="table-time-input"
            onKeyDown={handleKeyDown} // Hitting Enter now saves and exits!
            onClick={(e) => e.stopPropagation()} // Clicking the input doesn't exit edit mode
            />
            </td>

            {/* Clock Out */}
            <td style={{ minWidth: '120px' }}>
            <SmartTimeInput
            value={editClockOut}
            onChange={setEditClockOut}
            format={settings.timeFormat}
            className="table-time-input"
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            />
            </td>

            {/* Break Time */}
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

            {/* Total Hours - Read Only */}
            <td>{entry.totalHours} hrs</td>

            {/* Overtime Checkbox */}
            <td style={{ textAlign: 'center' }}>
            <input
            type="checkbox"
            checked={entry.isOvertime}
            onChange={(e) => updateEntry(entry.id, { isOvertime: e.target.checked })}
            onClick={(e) => e.stopPropagation()}
            />
            </td>

            {/* Cost - Read Only */}
            <td>${calculateEntryCost(entry, employee?.baseRate || 0, settings).toFixed(2)}</td>

            {/* Save Button */}
            <td>
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
                    clockIn: editClockIn,
                    clockOut: editClockOut === '' ? null : editClockOut,
                    breakTime: editBreak
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
    const cost = calculateEntryCost(entry, employee?.baseRate || 0, settings);

    return (
        <tr
        className={isActive ? 'active-shift' : ''}
        onClick={onToggleEdit} // Clicking ANYWHERE on the row enters edit mode
        style={{ cursor: 'pointer', borderLeft: `4px solid ${color.border}` }}
        >
        {/* Employee - Read Only */}
        <td>{employee ? `${employee.firstName}${employee.lastName ? ' ' + employee.lastName : ''}` : 'Unknown Employee'}</td>
        <td>{employee?.role || 'Unknown'}</td>

        {/* Clock In - Read Only */}
        <td>{formatTimeDisplay(entry.clockIn, settings.timeFormat)}</td>

        {/* Clock Out - Interactive if active */}
        <td>
        {isActive ? (
            <SmartTimeInput
            value=""
            onChange={(val) => updateEntry(entry.id, { clockOut: val === '' ? null : val })}
            format={settings.timeFormat}
            className="table-time-input"
            onClick={(e) => e.stopPropagation()} // Stop click from exiting edit mode
            />
        ) : (
            formatTimeDisplay(entry.clockOut, settings.timeFormat)
        )}
        </td>

        {/* Break Time - Interactive if active */}
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
            onClick={(e) => e.stopPropagation()} // Stop click from exiting edit mode
            />
        ) : (
            `${entry.breakTime} min`
        )}
        </td>

        {/* Total Hours - Read Only */}
        <td>{isActive ? <em style={{color: '#666'}}>Active</em> : `${entry.totalHours} hrs`}</td>

        {/* Overtime Checkbox - Interactive */}
        <td style={{ textAlign: 'center' }}>
        {isActive ? '-' : (
            <input
            type="checkbox"
            checked={entry.isOvertime}
            onChange={(e) => updateEntry(entry.id, { isOvertime: e.target.checked })}
            onClick={(e) => e.stopPropagation()} // Stop click from exiting edit mode
            />
        )}
        </td>

        {/* Cost - Read Only */}
        <td>{isActive ? '-' : `$${cost.toFixed(2)}`}</td>

        {/* Delete Button - Interactive */}
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
