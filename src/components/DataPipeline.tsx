// src/components/DataPipeline.tsx

import { useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { calculateEntryCost } from '../utils/calculations';

export default function DataPipeline() {
    const { entries, settings, updateSettings, importData } = useAppContext();
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- EXPORT CSV ---
    const handleExportCSV = () => {
        if (entries.length === 0) {
            showToast('No data to export', 'error');
            return;
        }

        const headers = ['Name', 'Category', 'Clock In', 'Clock Out', 'Break (min)', 'Total Hours', 'Overtime', 'Cost'];
        const rows = entries.map(entry => [
            `"${entry.name}"`, // Wrap in quotes to handle commas in names
            entry.category,
            entry.clockIn,
            entry.clockOut || 'ACTIVE',
            entry.breakTime,
            entry.totalHours,
            entry.isOvertime ? 'Yes' : 'No',
            calculateEntryCost(entry, settings).toFixed(2)
        ]);

        const totalHours = entries.filter(e => e.clockOut).reduce((sum, e) => sum + e.totalHours, 0);
        const totalCost = entries.filter(e => e.clockOut).reduce((sum, e) => sum + calculateEntryCost(e, settings), 0);

        rows.push(['', '', '', '', '', '', '', '']);
        rows.push(['"TOTALS"', '', '', '', '', totalHours, '', totalCost.toFixed(2)]);

        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `openlabor-export-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        showToast('CSV Downloaded', 'success');
    };

    // --- EXPORT JSON ---
    const handleExportJSON = () => {
        const backup = { settings, entries };
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `openlabor-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Backup Created', 'success');
    };

    // --- IMPORT JSON ---
    const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target?.result as string);

                if (importedData.entries && importedData.settings) {
                    if (window.confirm(`Import backup? This will restore ${importedData.entries.length} entries and wage settings.`)) {
                        importData(importedData.entries, importedData.settings);
                        showToast('Backup restored successfully.', 'success');
                    }
                } else if (Array.isArray(importedData)) {
                    if (window.confirm(`Import ${importedData.length} entries? This will replace current data.`)) {
                        importData(importedData, settings); // Keep current settings
                        showToast('Data imported successfully.', 'success');
                    }
                } else {
                    showToast('Invalid JSON format.', 'error');
                }
            } catch {
                showToast('Error parsing JSON file.', 'error');
            }
        };
        reader.readAsText(file);
        if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
    };

        // --- WEBHOOK TEST ---
        const handleTestPush = async () => {
            if (!settings.webhookUrl) {
                showToast('Please enter an endpoint URL first.', 'error');
                return;
            }

            showToast('Sending test payload...', 'info');
            try {
                const response = await fetch(settings.webhookUrl, {
                    method: 'POST',
                    mode: 'cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        test: true,
                        message: 'OpenLabor connection test',
                        timestamp: new Date().toISOString()
                    })
                });

                if (response.ok) {
                    showToast('Test sent successfully!', 'success');
                } else {
                    showToast(`Error: ${response.status} ${response.statusText}`, 'error');
                }
            } catch (err) {
                showToast('Connection Failed. Check URL and CORS settings.', 'error');
            }
        };

        return (
            <section className="pipeline-section">
            <h2>Data Panel</h2>
            <div className="pipeline-controls">
            <div className="pipeline-group">
            <h3>File Export</h3>
            <div className="button-group">
            <button className="btn btn-secondary" onClick={handleExportCSV}>Download .csv</button>
            <button className="btn btn-secondary" onClick={handleExportJSON}>Export .json</button>
            <label className="btn btn-secondary" style={{ marginBottom: 0, cursor: 'pointer' }}>
            Import .json
            <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImportJSON}
            />
            </label>
            </div>
            <p className="helper-text" style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px' }}>
            Download records or restore from backup.
            </p>
            </div>

            <div className="pipeline-group">
            <h3>Endpoint URL</h3>
            <div className="form-group" style={{ marginBottom: '5px' }}>
            <input
            type="text"
            placeholder="http://localhost:3000/api/ingest"
            value={settings.webhookUrl}
            onChange={(e) => updateSettings({ ...settings, webhookUrl: e.target.value })}
            />
            </div>
            <div className="checkbox-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <input
            type="checkbox"
            id="enablePush"
            checked={settings.enablePush}
            onChange={(e) => updateSettings({ ...settings, enablePush: e.target.checked })}
            />
            <label htmlFor="enablePush" style={{ fontWeight: 'normal', marginBottom: 0, cursor: 'pointer' }}>
            Enable Auto-Push on Save
            </label>
            </div>
            <button className="btn btn-secondary" onClick={handleTestPush}>Test Connection</button>
            </div>
            </div>
            </section>
        );
}
