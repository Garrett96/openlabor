// src/components/EntryForm.tsx

import { useState, FormEvent } from 'react';
import { useAppContext } from '../context/AppContext';
import { useEmployees } from '../context/EmployeeContext';
import { useToast } from '../context/ToastContext';
import SmartTimeInput from './SmartTimeInput';
import EmployeeSearch from './EmployeeSearch';

export default function EntryForm() {
    const { addEntry, settings } = useAppContext();
    const { employees, addEmployee } = useEmployees();
    const { showToast } = useToast();

    const [employeeId, setEmployeeId] = useState('');
    const [searchText, setSearchText] = useState('');
    const [clockIn, setClockIn] = useState('');
    const [clockOut, setClockOut] = useState('');
    const [breakTime, setBreakTime] = useState(0);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        let finalEmployeeId = employeeId;

        if (!finalEmployeeId && searchText.trim()) {
            const parts = searchText.trim().split(/\s+/);
            const firstName = parts[0];
            const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';

            const newId = crypto.randomUUID();
            addEmployee(firstName, lastName, 'Temp', settings.defaultBaseRate, newId);
            finalEmployeeId = newId;

            const fullName = lastName ? `${firstName} ${lastName}` : firstName;
            showToast(`Added ${fullName} to roster`, 'success');
        }

        if (!finalEmployeeId) {
            showToast('Please select or type an employee name', 'error');
            return;
        }
        if (!clockIn) {
            showToast('Clock In is required', 'error');
            return;
        }

        addEntry(finalEmployeeId, clockIn, clockOut || null, breakTime);

        setEmployeeId('');
        setSearchText('');
        setClockIn('');
        setClockOut('');
        setBreakTime(0);
    };

    return (
        <section className="input-section">
        <h2>Add Time Entry</h2>
        <form id="timeEntryForm" onSubmit={handleSubmit}>
        <div className="form-group">
        <label>Name</label>
        <EmployeeSearch
        employees={employees}
        value={employeeId}
        onChange={setEmployeeId}
        onTextChange={setSearchText}
        placeholder="Type name to search or add new..."
        />
        </div>

        <div className="form-group">
        <label>Clock In</label>
        <SmartTimeInput value={clockIn} onChange={setClockIn} format={settings.timeFormat} className="table-time-input" />
        </div>

        <div className="form-group">
        <label>Clock Out [Optional]</label>
        <SmartTimeInput value={clockOut} onChange={setClockOut} format={settings.timeFormat} className="table-time-input" />
        </div>

        <div className="form-group">
        <label htmlFor="breakTime">Total Break Period [minutes]</label>
        <input type="number" id="breakTime" min="0" step="15" value={breakTime} onChange={(e) => setBreakTime(Number(e.target.value))} className="table-time-input" />
        </div>

        <button type="submit" className="btn">Add Entry</button>
        </form>
        </section>
    );
}
