// src/components/RoleTotals.tsx

import { useAppContext } from '../context/AppContext';
import { useEmployees } from '../context/EmployeeContext';

export default function RoleTotals() {
    const { entries, roleColors } = useAppContext();
    const { employees } = useEmployees();
    const completedEntries = entries.filter(e => e.clockOut);

    const totals: Record<string, number> = {};

    // Group by employee role
    completedEntries.forEach(entry => {
        const employee = employees.find(emp => emp.id === entry.employeeId);
        if (employee) {
            totals[employee.role] = (totals[employee.role] || 0) + entry.totalHours;
        }
    });

    const grandTotal = Object.values(totals).reduce((sum, h) => sum + h, 0);

    return (
        <section className="summary-section">
        <h2>Hours by Role</h2>
        <div className="category-totals">
        {Object.keys(totals).length === 0 ? (
            <p style={{ color: '#666', gridColumn: '1 / -1' }}>No completed entries to calculate.</p>
        ) : (
            Object.keys(totals).map(role => {
                const hours = totals[role];
                const percentage = grandTotal > 0 ? ((hours / grandTotal) * 100).toFixed(1) : 0;

                const color = roleColors[role as keyof typeof roleColors] || { border: '#ccc', bg: 'transparent' };

                return (
                    <div
                    key={role}
                    className="category-card"
                    style={{ borderTop: `4px solid ${color.border}`, backgroundColor: `${color.bg}40` }}
                    >
                    <h3>{role}</h3>
                    <div className="hours">{Math.round(hours * 100) / 100} hrs</div>
                    <div className="percentage">{percentage}% of total</div>
                    </div>
                );
            })
        )}
        </div>
        </section>
    );
}
