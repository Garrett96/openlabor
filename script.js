document.addEventListener('DOMContentLoaded', function() {

    const CATEGORIES = [
        { key: 'Staff🔶', label: 'Staff🔶', defaultWage: 15 },
        { key: 'Temp🔷', label: 'Temp🔷', defaultWage: 12 },
        { key: 'Contractor🔺', label: 'Contractor🔺', defaultWage: 20 },
        { key: 'Other', label: 'Other', defaultWage: 15 }
    ];

    let rawEntries = localStorage.getItem('tempusEntries');
    let entries = [];

    if (rawEntries) {
        try {
            entries = JSON.parse(rawEntries);
        } catch (e) {
            console.error("Failed to parse entries", e);
            entries = [];
        }
    }

    let rawSettings = localStorage.getItem('tempusSettings');
    let settings;

    const defaultSettings = {
        wages: CATEGORIES.reduce((acc, cat) => { acc[cat.key] = cat.defaultWage; return acc; }, {}),
                          overtimeMultiplier: 1.5
    };

    if (rawSettings) {
        try {
            settings = JSON.parse(rawSettings);
            CATEGORIES.forEach(cat => {
                if (settings.wages[cat.key] === undefined) settings.wages[cat.key] = cat.defaultWage;
            });
        } catch (e) {
            settings = defaultSettings;
        }
    } else {
        settings = defaultSettings;
    }

    let editingEntryId = null;
    let lastDeletedEntry = null;

    const form = document.getElementById('timeEntryForm');
    const entriesBody = document.getElementById('entriesBody');
    const categoryTotals = document.getElementById('categoryTotals');
    const hourlyData = document.getElementById('hourlyData');
    const exportBtn = document.getElementById('exportBtn');

    const totalHoursEl = document.getElementById('totalHours');
    const headcountTallyEl = document.getElementById('headcountTally');
    const totalCostEl = document.getElementById('totalCost');

    const exportJsonBtn = document.getElementById('exportJsonBtn');
    const importJsonInput = document.getElementById('importJsonInput');
    const webhookUrlInput = document.getElementById('webhookUrl');
    const enablePushCheckbox = document.getElementById('enablePush');
    const testPushBtn = document.getElementById('testPushBtn');

    const wageInputs = {};
    CATEGORIES.forEach(cat => {
        if(cat.key === 'Staff🔶') wageInputs[cat.key] = document.getElementById('wageStaff');
        if(cat.key === 'Temp🔷') wageInputs[cat.key] = document.getElementById('wageTemp');
        if(cat.key === 'Contractor🔺') wageInputs[cat.key] = document.getElementById('wageContractor');
        if(cat.key === 'Other') wageInputs[cat.key] = document.getElementById('wageOther');
    });

        const otMultiplierInput = document.getElementById('overtimeMultiplier');

        loadSettingsToUI();
        renderEntries();
        updateCategoryTotals();
        updateHourlyData();
        updateOverallSummary();

        Object.keys(wageInputs).forEach(key => {
            if(wageInputs[key]) wageInputs[key].addEventListener('change', saveSettingsFromUI);
        });
            otMultiplierInput.addEventListener('change', saveSettingsFromUI);

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
                                  totalHours,
                                  isOvertime: false
                };

                entries.push(entry);
                saveEntries();

                if (clockOut && enablePushCheckbox.checked && webhookUrlInput.value) {
                    pushEntryToPipeline(entry);
                }

                renderEntries();
                updateCategoryTotals();
                updateHourlyData();
                updateOverallSummary();
                form.reset();
                                  showToast("Entry added successfully", "success");
            });

            entriesBody.addEventListener('click', function(e) {
                const row = e.target.closest('tr');
                if (!row) return;
                const id = parseInt(row.dataset.id);
                const entryIndex = entries.findIndex(entry => entry.id === id);

                if (e.target.classList.contains('ot-toggle')) {
                    if (entryIndex !== -1) {
                        entries[entryIndex].isOvertime = e.target.checked;
                        saveEntries();
                        renderEntries();
                        updateOverallSummary();
                    }
                    return;
                }

                if (e.target.classList.contains('delete-btn')) {
                    deleteEntry(id);
                    return;
                }

                if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

                if (editingEntryId === id) {
                    editingEntryId = null;
                    renderEntries();
                } else {
                    editingEntryId = id;
                    renderEntries();
                }
            });

            entriesBody.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    const row = e.target.closest('tr');
                    if (!row) return;
                    const id = parseInt(row.dataset.id);

                    e.preventDefault();

                    if (editingEntryId === id) {
                        performFullUpdate(id, row);
                    } else {
                        const entry = entries.find(e => e.id === id);
                        if (entry && !entry.clockOut) {
                            performQuickSave(id, row);
                        }
                    }
                }
            });


            function performFullUpdate(id, row) {
                const entryIndex = entries.findIndex(e => e.id === id);
                if (entryIndex === -1) return;

                const newName = row.querySelector('.edit-name').value;
                const newCat = row.querySelector('.edit-category').value;
                const newClockIn = row.querySelector('.edit-clockin').value;
                const newClockOut = row.querySelector('.edit-clockout').value;
                const newBreak = parseInt(row.querySelector('.edit-break').value) || 0;

                if(!newClockIn) {
                    showToast("Clock In time is required.", "error");
                    return;
                }

                entries[entryIndex].name = newName;
                entries[entryIndex].category = newCat;
                entries[entryIndex].clockIn = newClockIn;
                entries[entryIndex].clockOut = newClockOut;
                entries[entryIndex].breakTime = newBreak;
                entries[entryIndex].totalHours = calculateHours(newClockIn, newClockOut, newBreak);

                saveEntries();

                if (newClockOut && enablePushCheckbox.checked && webhookUrlInput.value) {
                    pushEntryToPipeline(entries[entryIndex]);
                }

                editingEntryId = null;
                renderEntries();
                updateCategoryTotals();
                updateHourlyData();
                updateOverallSummary();
                showToast("Entry updated", "success");
            }

            function performQuickSave(id, row) {
                const entryIndex = entries.findIndex(e => e.id === id);
                if (entryIndex === -1) return;

                const clockOutInput = row.querySelector('.edit-clockout');
                const breakInput = row.querySelector('.edit-break');
                const newClockOut = clockOutInput.value;
                const newBreak = parseInt(breakInput.value) || 0;

                entries[entryIndex].clockOut = newClockOut;
                entries[entryIndex].breakTime = newBreak;
                entries[entryIndex].totalHours = calculateHours(entries[entryIndex].clockIn, newClockOut, newBreak);

                saveEntries();
                if (newClockOut && enablePushCheckbox.checked && webhookUrlInput.value) {
                    pushEntryToPipeline(entries[entryIndex]);
                }

                renderEntries();
                updateCategoryTotals();
                updateHourlyData();
                updateOverallSummary();
                showToast("Shift saved", "success");
            }

            function deleteEntry(id) {
                const entryIndex = entries.findIndex(e => e.id === id);
                if (entryIndex === -1) return;

                lastDeletedEntry = entries[entryIndex];
                entries.splice(entryIndex, 1);

                saveEntries();
                editingEntryId = null;
                renderEntries();
                updateCategoryTotals();
                updateHourlyData();
                updateOverallSummary();

                showToast("Entry deleted", "error", true, () => {
                    if (lastDeletedEntry) {
                        entries.push(lastDeletedEntry);
                        saveEntries();
                        renderEntries();
                        updateCategoryTotals();
                        updateHourlyData();
                        updateOverallSummary();
                        showToast("Entry restored", "success");
                        lastDeletedEntry = null;
                    }
                });
            }

            function loadSettingsToUI() {
                Object.keys(wageInputs).forEach(key => {
                    if (wageInputs[key] && settings.wages[key] !== undefined) {
                        wageInputs[key].value = settings.wages[key];
                    }
                });
                otMultiplierInput.value = settings.overtimeMultiplier;
            }

            function saveSettingsFromUI() {
                Object.keys(wageInputs).forEach(key => {
                    if (wageInputs[key]) {
                        settings.wages[key] = parseFloat(wageInputs[key].value) || 0;
                    }
                });
                settings.overtimeMultiplier = parseFloat(otMultiplierInput.value) || 1.5;
                localStorage.setItem('tempusSettings', JSON.stringify(settings));
                renderEntries();
                updateOverallSummary();
            }

            function calculateEntryCost(entry) {
                if (!entry.clockOut) return 0;
                let rate = settings.wages[entry.category];
                if (rate === undefined) {
                    const catLower = entry.category.toLowerCase();
                    if (catLower.includes('staff')) rate = settings.wages["Staff🔶"];
                    else if (catLower.includes('temp')) rate = settings.wages["Temp🔷"];
                    else if (catLower.includes('contractor')) rate = settings.wages["Contractor🔺"];
                    else rate = settings.wages["Other"];
                }
                if (rate === undefined) rate = 0;
                const multiplier = entry.isOvertime ? settings.overtimeMultiplier : 1;
                return entry.totalHours * rate * multiplier;
            }

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
                    row.dataset.id = entry.id;

                    const isActive = !entry.clockOut;
                    const isEditing = entry.id === editingEntryId;

                    if (isActive && !isEditing) row.classList.add('active-shift');

                    let nameCell, catCell, ciCell, coCell, breakCell, hoursCell, otCell, costCell, actionsCell;

                    if (isEditing) {
                        nameCell = `<input type="text" class="edit-name table-time-input" value="${entry.name}">`;
                        catCell = `
                        <select class="edit-category table-time-input">
                        ${CATEGORIES.map(c => `<option value="${c.key}" ${entry.category === c.key ? 'selected' : ''}>${c.label}</option>`).join('')}
                        </select>`;
                        ciCell = `<input type="time" class="edit-clockin table-time-input" value="${entry.clockIn}">`;
                        coCell = `<input type="time" class="edit-clockout table-time-input" value="${entry.clockOut || ''}" placeholder="--:--">`;
                        breakCell = `<input type="number" class="edit-break table-time-input" value="${entry.breakTime}" min="0" style="width: 60px;">`;

                        if (isActive) {
                            hoursCell = `<span style="font-style: italic; color: #666;">Active</span>`;
                            costCell = '-';
                        } else {
                            const cost = calculateEntryCost(entry);
                            hoursCell = `${entry.totalHours} hrs`;
                            costCell = `$${cost.toFixed(2)}`;
                        }

                        otCell = `<input type="checkbox" class="ot-toggle" data-id="${entry.id}" ${entry.isOvertime ? 'checked' : ''}>`;

                        actionsCell = `<button class="delete-btn" data-id="${entry.id}">Delete</button>`;
                    }
                    else if (isActive) {
                        nameCell = entry.name;
                        catCell = entry.category;
                        ciCell = entry.clockIn;
                        coCell = `<input type="time" class="edit-clockout table-time-input" value="${entry.clockOut || ''}">`;
                        breakCell = `<input type="number" class="edit-break table-time-input" value="${entry.breakTime}" min="0" step="15" style="width: 60px;">`;
                        hoursCell = `<span style="font-style: italic; color: #666;">Active</span>`;
                        costCell = '-';
                        otCell = '-';

                        actionsCell = `<button class="delete-btn" data-id="${entry.id}">Delete</button>`;
                    }
                    else {
                        const cost = calculateEntryCost(entry);
                        nameCell = entry.name;
                        catCell = entry.category;
                        ciCell = entry.clockIn;
                        coCell = entry.clockOut;
                        breakCell = `${entry.breakTime} min`;
                        hoursCell = `${entry.totalHours} hrs`;
                        costCell = `$${cost.toFixed(2)}`;
                        otCell = `<input type="checkbox" class="ot-toggle" data-id="${entry.id}" ${entry.isOvertime ? 'checked' : ''}>`;

                        actionsCell = `<button class="delete-btn" data-id="${entry.id}">Delete</button>`;
                    }

                    row.innerHTML = `
                    <td>${nameCell}</td>
                    <td>${catCell}</td>
                    <td>${ciCell}</td>
                    <td>${coCell}</td>
                    <td>${breakCell}</td>
                    <td>${hoursCell}</td>
                    <td style="text-align: center;">${otCell}</td>
                    <td>${costCell}</td>
                    <td>${actionsCell}</td>
                    `;
                    entriesBody.appendChild(row);
                });
            }

            function updateCategoryTotals() {
                const totals = {};
                const completedEntries = entries.filter(e => e.clockOut);

                completedEntries.forEach(entry => {
                    if (!totals[entry.category]) totals[entry.category] = 0;
                    totals[entry.category] += entry.totalHours;
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
                    <h3>${category}</h3>
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
                    for (let i = 0; i < 24; i++) hourlyTotals[i] += distribution[i];
                });

                    hourlyData.innerHTML = '';
                    const table = document.createElement('table');
                    table.className = 'hourly-table';

                    const header = document.createElement('thead');
                    header.innerHTML = `<tr><th>Time Period</th><th>Total Hours</th><th>Bar Chart</th></tr>`;
                    table.appendChild(header);

                    const body = document.createElement('tbody');
                    const maxHours = Math.max(...hourlyTotals, 1);

                    for (let i = 0; i < 24; i++) {
                        const row = document.createElement('tr');
                        const startHour = i;
                        const endHour = (i + 1) % 24;
                        const startPeriod = startHour < 12 ? 'AM' : 'PM';
                        const endPeriod = endHour < 12 ? 'AM' : 'PM';
                        const formattedStartHour = startHour === 0 ? 12 : (startHour > 12 ? startHour - 12 : startHour);
                        const formattedEndHour = endHour === 0 ? 12 : (endHour > 12 ? endHour - 12 : endHour);

                        const timePeriod = `${formattedStartHour}:00 ${startPeriod} - ${formattedEndHour}:00 ${endPeriod}`;
                        const barWidth = (hourlyTotals[i] / maxHours) * 100;

                        row.innerHTML = `
                        <td>${timePeriod}</td>
                        <td>${Math.round(hourlyTotals[i] * 100) / 100} hrs</td>
                        <td><div class="bar-container"><div class="bar" style="width: ${barWidth}%"></div></div></td>
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

                const totalCost = completedEntries.reduce((sum, entry) => sum + calculateEntryCost(entry), 0);
                totalCostEl.textContent = `$${totalCost.toFixed(2)}`;
            }

            function exportToCSV() {
                if (entries.length === 0) {
                    showToast('No data to export', 'error');
                    return;
                }

                const headers = ['Name', 'Category', 'Clock In', 'Clock Out', 'Break (minutes)', 'Total Hours', 'Overtime', 'Cost'];

                const rows = entries.map(entry => [
                    entry.name,
                    entry.category,
                    entry.clockIn,
                    entry.clockOut || 'ACTIVE',
                    entry.breakTime,
                    entry.totalHours,
                    entry.isOvertime ? 'Yes' : 'No',
                    calculateEntryCost(entry).toFixed(2)
                ]);

                const totalHours = entries.filter(e => e.clockOut).reduce((sum, e) => sum + e.totalHours, 0);
                const totalCost = entries.filter(e => e.clockOut).reduce((sum, e) => sum + calculateEntryCost(e), 0);

                rows.push(['', '', '', '', '', '', '', '']);
                rows.push(['TOTALS', '', '', '', '', totalHours, '', totalCost.toFixed(2)]);

                const csvContent = '\uFEFF' + [
                    headers.join(','),
                          ...rows.map(row => row.join(','))
                ].join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `openlabor-export-${new Date().toISOString().slice(0,10)}.csv`;
                link.click();
                showToast("CSV Downloaded", "success");
            }

            function exportToJSON() {
                const backup = {
                    settings: settings,
                    entries: entries
                };
                const dataStr = JSON.stringify(backup, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = `openlabor-backup-${new Date().toISOString().slice(0,10)}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                showToast("Backup Created", "success");
            }

            function importFromJSON(e) {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = function(event) {
                    try {
                        const importedData = JSON.parse(event.target.result);

                        if (importedData.entries && importedData.settings) {
                            if (confirm(`Import backup? This will restore ${importedData.entries.length} entries and wage settings.`)) {
                                entries = importedData.entries;
                                settings = importedData.settings;
                                saveEntries();
                                localStorage.setItem('tempusSettings', JSON.stringify(settings));
                                loadSettingsToUI();

                                renderEntries();
                                updateCategoryTotals();
                                updateHourlyData();
                                updateOverallSummary();
                                showToast("Backup restored successfully.", "success");
                            }
                        } else if (Array.isArray(importedData)) {
                            if (confirm(`Import ${importedData.length} entries? This will replace current data.`)) {
                                entries = importedData;
                                saveEntries();
                                renderEntries();
                                updateCategoryTotals();
                                updateHourlyData();
                                updateOverallSummary();
                                showToast("Data imported successfully.", "success");
                            }
                        } else {
                            showToast("Invalid JSON format.", "error");
                        }
                    } catch (err) {
                        showToast("Error parsing JSON file.", "error");
                    }
                };
                reader.readAsText(file);
                e.target.value = '';
            }


            function pushEntryToPipeline(entry) {
                const url = webhookUrlInput.value;
                if (!url) return;

                const payload = {
                    ...entry,
                    calculatedCost: calculateEntryCost(entry),
                          wageRate: settings.wages[entry.category] || 0
                };

                fetch(url, {
                    method: 'POST',
                    mode: 'cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
                .then(response => {
                    if (response.ok) {
                        showToast('Sent!', 'success');
                    } else {
                        showToast(`Error ${response.status}`, 'error');
                    }
                })
                .catch(err => {
                    console.error('Pipeline push error', err);
                    showToast('Connection Failed', 'error');
                });
            }

            function testPipeline() {
                if (!webhookUrlInput.value) {
                    showToast("Please enter an endpoint URL first.", "error");
                    return;
                }
                pushEntryToPipeline({
                    test: true,
                    message: "OpenLabor connection test",
                    timestamp: new Date().toISOString()
                });
            }


            function saveEntries() {
                localStorage.setItem('tempusEntries', JSON.stringify(entries));
            }

            function showToast(msg, type = 'success', hasUndo = false, undoCallback = null) {
                const container = document.getElementById('toast-container') || createToastContainer();

                const toast = document.createElement('div');
                toast.className = `toast ${type}`;

                let html = `<span>${msg}</span>`;
                if (hasUndo) {
                    html += `<button class="toast-btn" id="undoBtn">Undo</button>`;
                }
                toast.innerHTML = html;

                container.appendChild(toast);

                const timeoutId = setTimeout(() => {
                    toast.remove();
                }, 4000);

                if (hasUndo && undoCallback) {
                    toast.querySelector('#undoBtn').addEventListener('click', () => {
                        clearTimeout(timeoutId);
                        toast.remove();
                        undoCallback();
                    });
                }
            }

            function createToastContainer() {
                const c = document.createElement('div');
                c.id = 'toast-container';
                document.body.appendChild(c);
                return c;
            }
});
