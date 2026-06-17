// src/components/Config.tsx

import { useAppContext } from '../context/AppContext';

export default function Config() {
    const { settings, updateSettings } = useAppContext();

    const handleOtMultiplierChange = (value: string) => {
        const parsedValue = parseFloat(value) || 1.5;
        updateSettings({
            ...settings,
            overtimeMultiplier: parsedValue
        });
    };

    return (
        <section className="cost-config-section">
        <h2>Config</h2>
        <div style={{ display: 'flex', gap: '2rem', marginTop: '15px', flexWrap: 'wrap' }}>
        <div className="form-group">
        <label htmlFor="overtimeMultiplier">Overtime Multiplier</label>
        <input
        type="number"
        id="overtimeMultiplier"
        min="1"
        step="0.5"
        value={settings.overtimeMultiplier}
        onChange={(e) => handleOtMultiplierChange(e.target.value)}
        style={{ width: '80px' }}
        />
        <span style={{ fontSize: '0.9em', color: '#666', marginLeft: '10px' }}>
        (e.g., 1.5 = Time & a Half)
        </span>
        </div>

        <div className="form-group">
        <label>Time Display Format</label>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '5px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontWeight: 'normal' }}>
        <input
        type="radio"
        name="timeFormat"
        value="24h"
        checked={settings.timeFormat === '24h'}
        onChange={() => updateSettings({ ...settings, timeFormat: '24h' })}
        />
        24H
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontWeight: 'normal' }}>
        <input
        type="radio"
        name="timeFormat"
        value="12h"
        checked={settings.timeFormat === '12h'}
        onChange={() => updateSettings({ ...settings, timeFormat: '12h' })}
        />
        12H
        </label>
        </div>
        </div>
        </div>
        </section>
    );
}
