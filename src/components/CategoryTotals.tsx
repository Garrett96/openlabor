// src/components/CategoryTotals.tsx

import { useAppContext } from '../context/AppContext';

export default function CategoryTotals() {
    const { entries, categoryColors } = useAppContext();
    const completedEntries = entries.filter(e => e.clockOut);

    const totals: Record<string, number> = {};

    // Group by category
    completedEntries.forEach(entry => {
        const cat = entry.category;
        if (!totals[cat]) {
            totals[cat] = 0;
        }
        totals[cat] += entry.totalHours;
    });

    const grandTotal = Object.values(totals).reduce((sum, h) => sum + h, 0);

    return (
        <section className="summary-section">
        <h2>Hours by Category</h2>
        <div className="category-totals">
        {Object.keys(totals).length === 0 ? (
            <p style={{ color: '#666', gridColumn: '1 / -1' }}>No completed entries to calculate.</p>
        ) : (
            Object.keys(totals).map(category => {
                const hours = totals[category];
                const percentage = grandTotal > 0 ? ((hours / grandTotal) * 100).toFixed(1) : 0;

                const color = categoryColors[category as keyof typeof categoryColors] || { border: '#ccc', bg: 'transparent' };

                return (
                    <div
                    key={category}
                    className="category-card"
                    style={{ borderTop: `4px solid ${color.border}`, backgroundColor: `${color.bg}40` }}
                    >
                    <h3>{category}</h3>
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
