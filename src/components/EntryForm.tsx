// src/components/EntryForm.tsx

import { useState, FormEvent } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTeams } from '../context/TeamContext';
import { useToast } from '../context/ToastContext';
import SmartTimeInput from './SmartTimeInput';
import TeamSearch from './TeamSearch';

export default function EntryForm() {
    const { addEntry, settings } = useAppContext();
    const { Teams, addTeam } = useTeams();
    const { showToast } = useToast();

    const [TeamId, setTeamId] = useState('');
    const [searchText, setSearchText] = useState('');
    const [clockIn, setClockIn] = useState('');
    const [clockOut, setClockOut] = useState('');
    const [breakTime, setBreakTime] = useState(0);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        let finalTeamId = TeamId;

        if (!finalTeamId && searchText.trim()) {
            const parts = searchText.trim().split(/\s+/);
            const firstName = parts[0];
            const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';

            const newId = crypto.randomUUID();
            addTeam(firstName, lastName, 'Temp', settings.defaultBaseRate, newId);
            finalTeamId = newId;

            const fullName = lastName ? `${firstName} ${lastName}` : firstName;
            showToast(`Added ${fullName} to roster`, 'success');
        }

        if (!finalTeamId) {
            showToast('Please select or type a name', 'error');
            return;
        }
        if (!clockIn) {
            showToast('Clock In is required', 'error');
            return;
        }

        addEntry(finalTeamId, clockIn, clockOut || null, breakTime);

        setTeamId('');
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
        <TeamSearch
        Teams={Teams}
        value={TeamId}
        onChange={setTeamId}
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
