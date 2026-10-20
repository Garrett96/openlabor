// src/components/HourlyChart.tsx

import { useAppContext } from '../context/AppContext';
import { calculateHourlyDistribution } from '../utils/calculations';
import { formatTimeDisplay } from '../utils/time'; // Added

export default function HourlyChart() {
    const { entries, settings } = useAppContext(); // Added settings
    const completedEntries = entries.filter(e => e.clockOut);

    const hourlyTotals = new Array(24).fill(0);
    completedEntries.forEach(entry => {
        const distribution = calculateHourlyDistribution(entry.clockIn, entry.clockOut, entry.breakTime);
        for (let i = 0; i < 24; i++) {
            hourlyTotals[i] += distribution[i];
        }
    });

    const maxHours = Math.max(...hourlyTotals, 1);

    return (
        <section className="hourly-section">
        <h2>Labor Utilization by Hour</h2>
        <div className="hourly-container">
        <table className="hourly-table">
        <thead>
        <tr>
        <th>Time Period</th>
        <th>Total Hours</th>
        <th>Bar Chart</th>
        </tr>
        </thead>
        <tbody>
        {hourlyTotals.map((hours, i) => {
            const startHour = i;
            const endHour = (i + 1) % 24;

            // Use our formatter for clean, consistent time periods
            const startTime = `${startHour.toString().padStart(2, '0')}:00`;
            const endTime = `${endHour.toString().padStart(2, '0')}:00`;

            const formattedStart = formatTimeDisplay(startTime, settings.timeFormat);
            const formattedEnd = formatTimeDisplay(endTime, settings.timeFormat);

            const timePeriod = `${formattedStart} - ${formattedEnd}`;
            const barWidth = (hours / maxHours) * 100;

            return (
                <tr key={i}>
                <td>{timePeriod}</td>
                <td>{Math.round(hours * 100) / 100} hrs</td>
                <td>
                <div className="bar-container">
                <div className="bar" style={{ width: `${barWidth}%` }}></div>
                </div>
                </td>
                </tr>
            );
        })}
        </tbody>
        </table>
        </div>
        </section>
    );
}
