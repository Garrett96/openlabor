// src/components/EntryForm.tsx

import { useState, FormEvent } from 'react';
import { useAppContext } from '../context/AppContext';
import { useEmployees } from '../context/EmployeeContext';
import { useToast } from '../context/ToastContext';
import SmartTimeInput from './SmartTimeInput';
import EmployeeSearch from './EmployeeSearch'; // Added

export default function EntryForm() {
    const { addEntry, settings } = useAppContext();
    const { employees } = useEmployees();
    const { showToast } = useToast();

    const [employeeId, setEmployeeId] = useState('');
    const [clockIn, setClockIn] = useState('');
    const [clockOut, setClockOut] = useState('');
    const [breakTime, setBreakTime] = useState(0);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!employeeId) { showToast('Please select an employee', 'error'); return; }
        if (!clockIn) { showToast('Clock In is required', 'error'); return; }

        addEntry(employeeId, clockIn, clockOut || null, breakTime);

        setEmployeeId('');
        setClockIn('');
        setClockOut('');
        setBreakTime(0);
    };

    return (
        <section className="input-section">
        <h2>Add Time Entry</h2>
        <form id="timeEntryForm" onSubmit={handleSubmit}>
        <div className="form-group">
        <label>Employee</label>
        {/* Replaced <select> with EmployeeSearch */}
        <EmployeeSearch
        employees={employees}
        value={employeeId}
        onChange={setEmployeeId}
        placeholder="Type to search employees..."
        />
        </div>

        <div className="form-group">
        <label>Clock In</label>
        <SmartTimeInput value={clockIn} onChange={setClockIn} format={settings.timeFormat} className="table-time-input" />
        </div>

        <div className="form-group">
        <label>Clock Out</label>
        <SmartTimeInput value={clockOut} onChange={setClockOut} format={settings.timeFormat} className="table-time-input" />
        </div>

        <div className="form-group">
        <label htmlFor="breakTime">Total Break Period [minutes]</label>
        <input
        type="number"
        id="breakTime"
        min="0"
        step="15"
        value={breakTime}
        onChange={(e) => setBreakTime(Number(e.target.value))}
        className="table-time-input"
        />
        </div>

        <button type="submit" className="btn">Add Entry</button>
        </form>
        </section>
    );
}
