document.addEventListener('DOMContentLoaded', function() {
    let entries = JSON.parse(localStorage.getItem('tempusEntries')) || [];

    const form = document.getElementById('timeEntryForm');
    const entriesBody = document.getElementById('entriesBody');
    const categoryTotals = document.getElementById('categoryTotals');
    const hourlyData = document.getElementById('hourlyData');
    const exportBtn = document.getElementById('exportBtn');

    const totalHoursEl = document.getElementById('totalHours');
    const headcountTallyEl = document.getElementById('headcountTally');

    renderEntries();
    updateCategoryTotals();
    updateHourlyData();
    updateOverallSummary();

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const category = document.getElementById('category').value;
        const clockIn = document.getElementById('clockIn').value;
        const clockOut = document.getElementById('clockOut').value;
        const breakTime = parseInt(document.getElementById('breakTime').value) || 0;

        const totalHours = clockOut ? calculateHours(clockIn, clockOut, breakTime) : 0;

        const entry = {
            id: Date.now(),
                          name,
                          category,
                          clockIn,
                          clockOut,
                          breakTime,
                          totalHours
        };

        entries.push(entry);
        saveEntries();

        renderEntries();
        updateCategoryTotals();
        updateHourlyData();
        updateOverallSummary();

        form.reset();
    });

    entriesBody.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-btn')) {
            const id = parseInt(e.target.getAttribute('data-id'));
            entries = entries.filter(entry => entry.id !== id);
            saveEntries();
            renderEntries();
            updateCategoryTotals();
            updateHourlyData();
            updateOverallSummary();
        }

        if (e.target.classList.contains('save-btn')) {
            const id = parseInt(e.target.getAttribute('data-id'));
            const row = e.target.closest('tr');
            const clockOutInput = row.querySelector('.edit-clockout');
            const breakInput = row.querySelector('.edit-break');

            const newClockOut = clockOutInput.value;
            const newBreak = parseInt(breakInput.value) || 0;

            if(!newClockOut) {
                alert("Please enter a clock out time.");
                return;
            }

            const entryIndex = entries.findIndex(entry => entry.id === id);
            if (entryIndex !== -1) {
                entries[entryIndex].clockOut = newClockOut;
                entries[entryIndex].breakTime = newBreak;
                entries[entryIndex].totalHours = calculateHours(entries[entryIndex].clockIn, newClockOut, newBreak);

                saveEntries();
                renderEntries();
                updateCategoryTotals();
                updateHourlyData();
                updateOverallSummary();
            }
        }
    });

    exportBtn.addEventListener('click', function() {
        exportToCSV();
    });

    function calculateHours(clockIn, clockOut, breakTimeMinutes) {
        if (!clockIn || !clockOut) return 0;

        const [inHours, inMinutes] = clockIn.split(':').map(Number);
        const [outHours, outMinutes] = clockOut.split(':').map(Number);

        const inDate = new Date(2000, 0, 1, inHours, inMinutes);
        let outDate = new Date(2000, 0, 1, outHours, outMinutes);

        if (outDate < inDate) {
            outDate = new Date(2000, 0, 2, outHours, outMinutes);
        }

        const diffMs = outDate - inDate;
        const totalHours = (diffMs / (1000 * 60 * 60)) - (breakTimeMinutes / 60);

        return Math.round(totalHours * 100) / 100;
    }

    function calculateHourlyDistribution(clockIn, clockOut, breakTimeMinutes) {
        if (!clockIn || !clockOut) return new Array(24).fill(0);

        const [inHours, inMinutes] = clockIn.split(':').map(Number);
        const [outHours, outMinutes] = clockOut.split(':').map(Number);

        const inDate = new Date(2000, 0, 1, inHours, inMinutes);
        let outDate = new Date(2000, 0, 1, outHours, outMinutes);

        if (outDate < inDate) {
            outDate = new Date(2000, 0, 2, outHours, outMinutes);
        }

        const totalWorkMinutes = (outDate - inDate) / (1000 * 60) - breakTimeMinutes;
        const hourlyDistribution = new Array(24).fill(0);

        if (totalWorkMinutes <= 0) return hourlyDistribution;

        let currentTime = new Date(inDate);
        let remainingMinutes = totalWorkMinutes;

        while (remainingMinutes > 0) {
            const hour = currentTime.getHours();
            const nextHour = new Date(currentTime);
            nextHour.setHours(hour + 1);
            nextHour.setMinutes(0, 0, 0);

            const minutesInThisHour = Math.min(
                (nextHour - currentTime) / (1000 * 60),
                                               remainingMinutes
            );

            hourlyDistribution[hour] += minutesInThisHour / 60;

            currentTime = nextHour;
            remainingMinutes -= minutesInThisHour;
        }

        return hourlyDistribution;
    }

    function renderEntries() {
        entriesBody.innerHTML = '';

        entries.forEach(entry => {
            const row = document.createElement('tr');

            const isActive = !entry.clockOut;
            if (isActive) {
                row.classList.add('active-shift');
            }

            let clockOutCellContent;
            if (isActive) {
                clockOutCellContent = `
                <input type="time" class="edit-clockout table-time-input" value="${entry.clockOut || ''}">
                `;
            } else {
                clockOutCellContent = entry.clockOut;
            }

            let breakCellContent;
            if (isActive) {
                breakCellContent = `
                <input type="number" class="edit-break table-time-input" value="${entry.breakTime}" min="0" step="15" style="width: 60px;">
                `;
            } else {
                breakCellContent = `${entry.breakTime} min`;
            }

            let hoursCellContent;
            if (isActive) {
                hoursCellContent = `<span style="font-style: italic; color: #666;">Active</span>`;
            } else {
                hoursCellContent = `${entry.totalHours} hrs`;
            }

            let actionsCellContent;
            if (isActive) {
                actionsCellContent = `
                <button class="save-btn" data-id="${entry.id}">Save</button>
                <button class="delete-btn" data-id="${entry.id}">Delete</button>
                `;
            } else {
                actionsCellContent = `
                <button class="delete-btn" data-id="${entry.id}">Delete</button>
                `;
            }

            row.innerHTML = `
            <td>${entry.name}</td>
            <td>${entry.category}</td>
            <td>${entry.clockIn}</td>
            <td>${clockOutCellContent}</td>
            <td>${breakCellContent}</td>
            <td>${hoursCellContent}</td>
            <td>${actionsCellContent}</td>
            `;
            entriesBody.appendChild(row);
        });
    }

    function updateCategoryTotals() {
        const totals = {};
        entries.forEach(entry => {
            if (entry.clockOut) {
                if (!totals[entry.category]) {
                    totals[entry.category] = 0;
                }
                totals[entry.category] += entry.totalHours;
            }
        });

        const grandTotalHours = Object.values(totals).reduce((sum, hours) => sum + hours, 0);

        categoryTotals.innerHTML = '';

        if (Object.keys(totals).length === 0) {
            categoryTotals.innerHTML = '<p style="color: #666;">No completed entries to calculate.</p>';
            return;
        }

        Object.keys(totals).forEach(category => {
            const card = document.createElement('div');
            card.className = 'category-card';

            const categoryHours = totals[category];
            const percentage = grandTotalHours > 0 ? ((categoryHours / grandTotalHours) * 100).toFixed(1) : 0;

            card.innerHTML = `
            <h3>${category.charAt(0).toUpperCase() + category.slice(1)}</h3>
            <div class="hours">${Math.round(categoryHours * 100) / 100} hrs</div>
            <div class="percentage">${percentage}% of total</div>
            `;
            categoryTotals.appendChild(card);
        });
    }

    function updateHourlyData() {
        const hourlyTotals = new Array(24).fill(0);

        const completedEntries = entries.filter(e => e.clockOut);

        completedEntries.forEach(entry => {
            const distribution = calculateHourlyDistribution(entry.clockIn, entry.clockOut, entry.breakTime);
            for (let i = 0; i < 24; i++) {
                hourlyTotals[i] += distribution[i];
            }
        });

        hourlyData.innerHTML = '';
        const table = document.createElement('table');
        table.className = 'hourly-table';

        const header = document.createElement('thead');
        header.innerHTML = `
        <tr>
        <th>Time Period</th>
        <th>Total Hours</th>
        <th>Bar Chart</th>
        </tr>
        `;
        table.appendChild(header);

        const body = document.createElement('tbody');
        const maxHours = Math.max(...hourlyTotals, 1);

        for (let i = 0; i < 24; i++) {
            const row = document.createElement('tr');
            const startHour = i;
            const endHour = (i + 1) % 24;

            const formattedStartHour = startHour === 0 ? 12 : (startHour > 12 ? startHour - 12 : startHour);
            const formattedEndHour = endHour === 0 ? 12 : (endHour > 12 ? endHour - 12 : endHour);

            const startPeriod = startHour < 12 ? 'AM' : 'PM';
            const endPeriod = endHour < 12 ? 'AM' : 'PM';

            const timePeriod = `${formattedStartHour}:00 ${startPeriod} - ${formattedEndHour}:00 ${endPeriod}`;
            const barWidth = (hourlyTotals[i] / maxHours) * 100;

            row.innerHTML = `
            <td>${timePeriod}</td>
            <td>${Math.round(hourlyTotals[i] * 100) / 100} hrs</td>
            <td>
            <div class="bar-container">
            <div class="bar" style="width: ${barWidth}%"></div>
            </div>
            </td>
            `;
            body.appendChild(row);
        }

        table.appendChild(body);
        hourlyData.appendChild(table);
    }

    function updateOverallSummary() {
        const completedEntries = entries.filter(e => e.clockOut);
        const totalHours = completedEntries.reduce((sum, entry) => sum + entry.totalHours, 0);
        totalHoursEl.textContent = `${Math.round(totalHours * 100) / 100} hrs`;

        const uniqueNames = new Set(entries.map(entry => entry.name));
        headcountTallyEl.textContent = uniqueNames.size;
    }

    function exportToCSV() {
        if (entries.length === 0) {
            alert('No data to export');
            return;
        }

        const headers = ['Name', 'Category', 'Clock In', 'Clock Out', 'Break (minutes)', 'Total Hours'];

        const rows = entries.map(entry => [
            entry.name,
            entry.category,
            entry.clockIn,
            entry.clockOut || 'ACTIVE', // Handle empty clock out in CSV
            entry.breakTime,
            entry.totalHours
        ]);

        const csvContent = [
            headers.join(','),
                          ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        const filename = `openlabor-export-${year}-${month}-${day}-${hours}-${minutes}.csv`;

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function saveEntries() {
        localStorage.setItem('tempusEntries', JSON.stringify(entries));
    }
});
