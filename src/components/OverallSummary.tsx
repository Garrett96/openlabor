// src/components/OverallSummary.tsx

import { useAppContext } from '../context/AppContext';
import { calculateEntryCost } from '../utils/calculations';

export default function OverallSummary() {
    const { entries, settings } = useAppContext();

    const completedEntries = entries.filter(e => e.clockOut);
    const totalHours = completedEntries.reduce((sum, e) => sum + e.totalHours, 0);

    // Count the total number of entries/rows
    const headcountTally = entries.length;

    const totalCost = completedEntries.reduce((sum, e) => sum + calculateEntryCost(e, settings), 0);

    return (
        <section className="overall-summary-section">
        <h2>Overall Summary</h2>
        <div className="summary-cards">
        <div className="summary-card">
        <h3>Total Hours</h3>
        <div className="summary-value">{Math.round(totalHours * 100) / 100} hrs</div>
        </div>
        <div className="summary-card">
        <h3>Headcount Tally</h3>
        <div className="summary-value">{headcountTally}</div>
        </div>
        <div className="summary-card highlight-card">
        <h3>Total Labor Cost*</h3>
        <div className="summary-value">${totalCost.toFixed(2)}</div>
        </div>
        </div>
        <p className="disclaimer">Disclaimer: Estimates are gross wages based on base rates provided. They do not include employer payroll taxes, benefits, insurance, or vendor service fees.</p>
        </section>
    );
}
