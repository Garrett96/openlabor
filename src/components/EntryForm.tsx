// src/components/EntryForm.tsx

import { useState, FormEvent } from 'react';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext'; // Added
import { CATEGORIES, CategoryType } from '../types';
import SmartTimeInput from './SmartTimeInput';

export default function EntryForm() {
    const { addEntry, settings } = useAppContext();
    const { showToast } = useToast(); // Added

    const [name, setName] = useState('');
    const [category, setCategory] = useState<CategoryType>('Staff');
    const [clockIn, setClockIn] = useState('');
    const [clockOut, setClockOut] = useState('');
    const [breakTime, setBreakTime] = useState(0);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        // Validation with Toasts
        if (!name.trim()) {
            showToast('Name is required', 'error');
            return;
        }
        if (!clockIn) {
            showToast('Clock In is required', 'error');
            return;
        }

        addEntry(name, category, clockIn, clockOut || null, breakTime);

        // Reset form
        setName('');
        setClockIn('');
        setClockOut('');
        setBreakTime(0);
    };

    return (
        <section className="input-section">
        <h2>Add Time Entry</h2>
        <form id="timeEntryForm" onSubmit={handleSubmit}>
        <div className="form-group">
        <label htmlFor="name">Name</label>
        <input type="text" id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="form-group">
        <label htmlFor="category">Category</label>
        <select id="category" required value={category} onChange={(e) => setCategory(e.target.value as CategoryType)}>
        {CATEGORIES.map(cat => (
            <option key={cat.key} value={cat.key}>{cat.label}</option>
        ))}
        </select>
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
        <input type="number" id="breakTime" min="0" step="15" value={breakTime} onChange={(e) => setBreakTime(Number(e.target.value))} />
        </div>

        <button type="submit" className="btn">Add Entry</button>
        </form>
        </section>
    );
}
