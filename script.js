document.addEventListener('DOMContentLoaded', function() {
    // Initialize entries from localStorage
    let entries = JSON.parse(localStorage.getItem('tempusEntries')) || [];

    // DOM elements
    const form = document.getElementById('timeEntryForm');
    const entriesBody = document.getElementById('entriesBody');
    const categoryTotals = document.getElementById('categoryTotals');
    const hourlyData = document.getElementById('hourlyData');

    // Render initial data
    renderEntries();
    updateCategoryTotals();
    updateHourlyData();

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form values
        const name = document.getElementById('name').value;
        const category = document.getElementById('category').value;
        const clockIn = document.getElementById('clockIn').value;
        const clockOut = document.getElementById('clockOut').value;
        const breakTime = parseInt(document.getElementById('breakTime').value) || 0;

        // Calculate total hours
        const totalHours = calculateHours(clockIn, clockOut, breakTime);

        // Create entry object
        const entry = {
            id: Date.now(),
            name,
            category,
            clockIn,
            clockOut,
            breakTime,
            totalHours
        };

        // Add to entries array
        entries.push(entry);

        // Save to localStorage
        saveEntries();

        // Update UI
        renderEntries();
        updateCategoryTotals();
        updateHourlyData();

        // Reset form
        form.reset();
    });

    // Calculate hours function
    function calculateHours(clockIn, clockOut, breakTimeMinutes) {
        // Parse times
        const [inHours, inMinutes] = clockIn.split(':').map(Number);
        const [outHours, outMinutes] = clockOut.split(':').map(Number);

        // Create date objects (using a dummy date)
        const inDate = new Date(2000, 0, 1, inHours, inMinutes);
        let outDate = new Date(2000, 0, 1, outHours, outMinutes);

        // Handle overnight shifts
        if (outDate < inDate) {
            outDate = new Date(2000, 0, 2, outHours, outMinutes);
        }

        // Calculate difference in milliseconds
        const diffMs = outDate - inDate;

        // Convert to hours and subtract break time
        const totalHours = (diffMs / (1000 * 60 * 60)) - (breakTimeMinutes / 60);

        // Round to 2 decimal places
        return Math.round(totalHours * 100) / 100;
    }

    // Calculate hourly distribution
    function calculateHourlyDistribution(clockIn, clockOut, breakTimeMinutes) {
        // Parse times
        const [inHours, inMinutes] = clockIn.split(':').map(Number);
        const [outHours, outMinutes] = clockOut.split(':').map(Number);

        // Create date objects (using a dummy date)
        const inDate = new Date(2000, 0, 1, inHours, inMinutes);
        let outDate = new Date(2000, 0, 1, outHours, outMinutes);

        // Handle overnight shifts
        if (outDate < inDate) {
            outDate = new Date(2000, 0, 2, outHours, outMinutes);
        }

        // Calculate total work time in minutes
        const totalWorkMinutes = (outDate - inDate) / (1000 * 60) - breakTimeMinutes;

        // Initialize hourly distribution (24 hours)
        const hourlyDistribution = new Array(24).fill(0);

        // If no work time, return empty distribution
        if (totalWorkMinutes <= 0) return hourlyDistribution;

        // Calculate the distribution
        let currentTime = new Date(inDate);
        let remainingMinutes = totalWorkMinutes;

        while (remainingMinutes > 0) {
            const hour = currentTime.getHours();
            const nextHour = new Date(currentTime);
            nextHour.setHours(hour + 1);
            nextHour.setMinutes(0, 0, 0);

            // Calculate minutes in this hour
            const minutesInThisHour = Math.min(
                (nextHour - currentTime) / (1000 * 60),
                remainingMinutes
            );

            // Add to distribution
            hourlyDistribution[hour] += minutesInThisHour / 60; // Convert to hours

            // Update current time and remaining minutes
            currentTime = nextHour;
            remainingMinutes -= minutesInThisHour;

            // Handle day wrap-around
            if (currentTime.getHours() === 0 && currentTime.getDate() > inDate.getDate()) {
                // We've moved to the next day, continue until we run out of minutes
            }
        }

        return hourlyDistribution;
    }

    // Render entries table
    function renderEntries() {
        entriesBody.innerHTML = '';

        entries.forEach(entry => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${entry.name}</td>
                <td>${entry.category}</td>
                <td>${entry.clockIn}</td>
                <td>${entry.clockOut}</td>
                <td>${entry.breakTime} min</td>
                <td>${entry.totalHours} hrs</td>
                <td><button class="delete-btn" data-id="${entry.id}">Delete</button></td>
            `;

            entriesBody.appendChild(row);
        });

        // Add delete event listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                entries = entries.filter(entry => entry.id !== id);
                saveEntries();
                renderEntries();
                updateCategoryTotals();
                updateHourlyData();
            });
        });
    }

    // Update category totals
    function updateCategoryTotals() {
        // Calculate totals by category
        const totals = {};

        entries.forEach(entry => {
            if (!totals[entry.category]) {
                totals[entry.category] = 0;
            }
            totals[entry.category] += entry.totalHours;
        });

        // Clear previous totals
        categoryTotals.innerHTML = '';

        // Display totals
        Object.keys(totals).forEach(category => {
            const card = document.createElement('div');
            card.className = 'category-card';

            card.innerHTML = `
                <h3>${category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                <div class="hours">${Math.round(totals[category] * 100) / 100} hrs</div>
            `;

            categoryTotals.appendChild(card);
        });
    }

    // Update hourly data
    function updateHourlyData() {
        // Initialize hourly totals (24 hours)
        const hourlyTotals = new Array(24).fill(0);

        // Calculate hourly distribution for each entry and add to totals
        entries.forEach(entry => {
            const distribution = calculateHourlyDistribution(entry.clockIn, entry.clockOut, entry.breakTime);

            for (let i = 0; i < 24; i++) {
                hourlyTotals[i] += distribution[i];
            }
        });

        // Clear previous data
        hourlyData.innerHTML = '';

        // Create a table for hourly data
        const table = document.createElement('table');
        table.className = 'hourly-table';

        // Create table header
        const header = document.createElement('thead');
        header.innerHTML = `
            <tr>
                <th>Time Period</th>
                <th>Total Hours</th>
                <th>Bar Chart</th>
            </tr>
        `;
        table.appendChild(header);

        // Create table body
        const body = document.createElement('tbody');

        // Find the maximum value for scaling the bar chart
        const maxHours = Math.max(...hourlyTotals, 1);

        for (let i = 0; i < 24; i++) {
            const row = document.createElement('tr');

            // Format the time period (e.g., "12:00 PM - 1:00 PM")
            const startHour = i;
            const endHour = (i + 1) % 24;

            const formattedStartHour = startHour === 0 ? 12 : (startHour > 12 ? startHour - 12 : startHour);
            const formattedEndHour = endHour === 0 ? 12 : (endHour > 12 ? endHour - 12 : endHour);

            const startPeriod = startHour < 12 ? 'AM' : 'PM';
            const endPeriod = endHour < 12 ? 'AM' : 'PM';

            const timePeriod = `${formattedStartHour}:00 ${startPeriod} - ${formattedEndHour}:00 ${endPeriod}`;

            // Calculate bar width as percentage of max
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

    // Save entries to localStorage
    function saveEntries() {
        localStorage.setItem('tempusEntries', JSON.stringify(entries));
    }
});
