// script.js - SharikNama
// Will implement all logic: table, tally, localStorage, PDF export
// ...implementation coming next...

// == SharikNama Eid-ul-Adha Meat Distribution App ==
// No external libraries used for PDF export or any other feature.

// --- DOM Elements ---
const totalSharesInput = document.getElementById('totalShares');
const partsTableBody = document.querySelector('#partsTable tbody');
const addRowBtn = document.getElementById('addRow');
const exportPDFBtn = document.getElementById('exportPDF');
const clearDataBtn = document.getElementById('clearData');

// Insert above totalSharesInput
const totalSharesField = totalSharesInput.closest('div') || totalSharesInput.parentElement;

// --- Local Storage Key ---
const STORAGE_KEY = 'shariknama_data_v1';

// --- State ---
let state = {
    totalShares: 7,
    parts: [], // {name, totalAmount, perShare, tally}
    groups: [] // {id, name, partSerials: [serials]}
};

// --- Utility Functions ---
function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function loadState() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        state = JSON.parse(data);
    }
}
function renderTable() {
    partsTableBody.innerHTML = '';
    state.parts.forEach((part, idx) => {
        const tr = document.createElement('tr');
        // Serial Number
        const serialTd = document.createElement('td');
        serialTd.textContent = (idx + 1).toString();
        serialTd.setAttribute('data-label', '#');
        tr.appendChild(serialTd);
        // Field refs object for this row
        const fieldRefs = {};
        // Part Name
        const nameTd = document.createElement('td');
        nameTd.setAttribute('data-label', 'Part Name');
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = part.name;
        nameInput.oninput = e => {
            part.name = nameInput.value;
            saveState();
            renderGroups();
        };
        nameTd.appendChild(nameInput);
        fieldRefs.nameInput = nameInput;
        tr.appendChild(nameTd);
        // Total Amount
        const totalTd = document.createElement('td');
        totalTd.setAttribute('data-label', 'Total Amount (kg)');
        const totalInput = document.createElement('input');
        totalInput.type = 'number';
        totalInput.min = '0';
        totalInput.step = '0.01';
        totalInput.value = part.totalAmount;
        totalInput.addEventListener('input', e => {
            part.totalAmount = parseFloat(totalInput.value) || 0;
            part.perShare = state.totalShares ? (part.totalAmount / state.totalShares).toFixed(2) : 0;
            if (fieldRefs.perShareInput) fieldRefs.perShareInput.value = part.perShare;
            saveState();
            updateTotalsRow();
        });
        totalTd.appendChild(totalInput);
        fieldRefs.totalInput = totalInput;
        tr.appendChild(totalTd);
        // Per Share
        const perShareTd = document.createElement('td');
        perShareTd.setAttribute('data-label', 'Amount per Share (kg)');
        const perShareInput = document.createElement('input');
        perShareInput.type = 'number';
        perShareInput.min = '0';
        perShareInput.step = '0.01';
        perShareInput.value = part.perShare;
        perShareInput.addEventListener('input', e => {
            part.perShare = parseFloat(perShareInput.value) || 0;
            saveState();
            updateTotalsRow();
        });
        perShareTd.appendChild(perShareInput);
        fieldRefs.perShareInput = perShareInput;
        tr.appendChild(perShareTd);
        // Tally
        const tallyTd = document.createElement('td');
        tallyTd.setAttribute('data-label', 'Distributed');
        tallyTd.style.display = 'flex';
        tallyTd.style.alignItems = 'center';
        tallyTd.style.justifyContent = 'space-between';
        tallyTd.style.gap = '0.3em';
        tallyTd.style.height = '2.6em';
        tallyTd.style.minHeight = '2.6em';
        tallyTd.style.verticalAlign = 'middle';
        // Add - button (left)
        const minusBtn = document.createElement('button');
        minusBtn.textContent = '-';
        minusBtn.className = 'tally-btn tally-btn-minus';
        minusBtn.title = 'Decrease tally';
        minusBtn.onclick = (e) => {
            e.stopPropagation();
            part.tally = Math.max(0, (part.tally || 0) - 1);
            saveState();
            updateTallyRow(tr, part);
        };
        tallyTd.appendChild(minusBtn);
        // Tally marks
        const tallyDiv = document.createElement('div');
        tallyDiv.className = 'tally';
        tallyDiv.style.minHeight = '1.8em';
        tallyDiv.style.display = 'flex';
        tallyDiv.style.alignItems = 'center';
        let tally = part.tally || 0;
        let groups = Math.floor(tally / 5);
        let remainder = tally % 5;
        for (let g = 0; g < groups; g++) {
            const groupSpan = document.createElement('span');
            groupSpan.className = 'tally-group tally-five';
            groupSpan.innerHTML = '<span class="tally-four">||||</span><span class="tally-slash">&#x0338;</span>';
            groupSpan.title = `Tally 5`;
            tallyDiv.appendChild(groupSpan);
        }
        if (remainder > 0) {
            const groupSpan = document.createElement('span');
            groupSpan.className = 'tally-group';
            groupSpan.textContent = '|'.repeat(remainder);
            groupSpan.title = `Tally ${groups * 5 + remainder}`;
            tallyDiv.appendChild(groupSpan);
        }
        tallyTd.appendChild(tallyDiv);
        // Add + button (right)
        const plusBtn = document.createElement('button');
        plusBtn.textContent = '+';
        plusBtn.className = 'tally-btn tally-btn-plus';
        plusBtn.title = 'Increase tally';
        plusBtn.onclick = (e) => {
            e.stopPropagation();
            part.tally = Math.min(state.totalShares, (part.tally || 0) + 1);
            saveState();
            updateTallyRow(tr, part);
        };
        tallyTd.appendChild(plusBtn);
        tr.appendChild(tallyTd);
        // Actions
        const actionsTd = document.createElement('td');
        actionsTd.setAttribute('data-label', 'Actions');
        const delBtn = document.createElement('button');
        delBtn.textContent = '🗑️';
        delBtn.title = 'Delete Part';
        delBtn.style.background = 'none';
        delBtn.style.border = 'none';
        delBtn.style.cursor = 'pointer';
        delBtn.onclick = () => {
            state.parts.splice(idx, 1);
            saveState();
            renderTable();
            updateTotalsRow();
            renderGroups();
        };
        actionsTd.appendChild(delBtn);
        tr.appendChild(actionsTd);
        partsTableBody.appendChild(tr);
    });
    updateTotalsRow();
}

function updateTotalsRow() {
    let totalAmountSum = 0;
    let perShareSum = 0;
    state.parts.forEach(part => {
        totalAmountSum += parseFloat(part.totalAmount) || 0;
        perShareSum += parseFloat(part.perShare) || 0;
    });
    // Update the static totals row in the tfoot
    const totalAmountCell = document.querySelector('.total-amount-cell');
    const totalPerShareCell = document.querySelector('.total-pershare-cell');
    if (totalAmountCell) totalAmountCell.textContent = totalAmountSum.toFixed(2);
    if (totalPerShareCell) totalPerShareCell.textContent = perShareSum.toFixed(2);
}

function updatePerShareAll() {
    state.parts.forEach(part => {
        part.perShare = state.totalShares ? (part.totalAmount / state.totalShares).toFixed(2) : 0;
    });
}

function updateSharesPrint() {
    const sharesPrint = document.getElementById('sharesPrint');
    sharesPrint.textContent = `Shares: ${state.totalShares}`;
}

// Add this helper function after renderTable
function updateTallyRow(tr, part) {
    const tallyTd = tr.querySelector('td:nth-child(5)');
    if (!tallyTd) return;
    // Remove all children except the - and + buttons
    while (tallyTd.childNodes.length > 0) {
        tallyTd.removeChild(tallyTd.firstChild);
    }
    // Add - button (left)
    const minusBtn = document.createElement('button');
    minusBtn.textContent = '-';
    minusBtn.className = 'tally-btn tally-btn-minus';
    minusBtn.title = 'Decrease tally';
    minusBtn.onclick = (e) => {
        e.stopPropagation();
        part.tally = Math.max(0, (part.tally || 0) - 1);
        saveState();
        updateTallyRow(tr, part);
    };
    tallyTd.appendChild(minusBtn);
    // Tally marks
    const tallyDiv = document.createElement('div');
    tallyDiv.className = 'tally';
    tallyDiv.style.minHeight = '1.8em'; // Ensures the div inside also stretches
    tallyDiv.style.display = 'flex';
    tallyDiv.style.alignItems = 'center';
    let tally = part.tally || 0;
    let groups = Math.floor(tally / 5);
    let remainder = tally % 5;
    for (let g = 0; g < groups; g++) {
        const groupSpan = document.createElement('span');
        groupSpan.className = 'tally-group tally-five';
        groupSpan.innerHTML = '<span class="tally-four">||||</span><span class="tally-slash">&#x0338;</span>';
        groupSpan.title = `Tally 5`;
        groupSpan.style.cursor = 'pointer';
        tallyDiv.appendChild(groupSpan);
    }
    if (remainder > 0) {
        const groupSpan = document.createElement('span');
        groupSpan.className = 'tally-group';
        groupSpan.textContent = '|'.repeat(remainder);
        groupSpan.title = `Tally ${groups * 5 + remainder}`;
        groupSpan.style.cursor = 'pointer';
        tallyDiv.appendChild(groupSpan);
    }
    tallyTd.appendChild(tallyDiv);
    // Add + button (right)
    const plusBtn = document.createElement('button');
    plusBtn.textContent = '+';
    plusBtn.className = 'tally-btn tally-btn-plus';
    plusBtn.title = 'Increase tally';
    plusBtn.onclick = (e) => {
        e.stopPropagation();
        part.tally = Math.min(state.totalShares, (part.tally || 0) + 1);
        saveState();
        updateTallyRow(tr, part);
    };
    tallyTd.appendChild(plusBtn);
}

function renderPrintTemplate() {
    // Set year in print title
    const printYear = document.getElementById('print-year');
    if (printYear) {
        printYear.textContent = new Date().getFullYear();
    }
    // Set shares in print meta
    const printShares = document.getElementById('print-shares');
    if (printShares) {
        printShares.textContent = state.totalShares;
    }
    // Update table body
    const printTableBody = document.querySelector('#print-table tbody');
    if (printTableBody) {
        let bodyHtml = '';
        state.parts.forEach((part, idx) => {
            bodyHtml += `<tr>`;
            bodyHtml += `<td>${idx + 1}</td>`;
            bodyHtml += `<td>${part.name || ''}</td>`;
            bodyHtml += `<td>${part.totalAmount || 0}</td>`;
            bodyHtml += `<td>${part.perShare || 0}</td>`;
            bodyHtml += `</tr>`;
        });
        printTableBody.innerHTML = bodyHtml;
    }
    // Update totals row in tfoot
    const printTotalAmount = document.getElementById('print-total-amount');
    const printTotalPerShare = document.getElementById('print-total-pershare');
    let totalAmountSum = 0;
    let perShareSum = 0;
    state.parts.forEach(part => {
        totalAmountSum += parseFloat(part.totalAmount) || 0;
        perShareSum += parseFloat(part.perShare) || 0;
    });
    if (printTotalAmount) printTotalAmount.textContent = totalAmountSum.toFixed(2);
    if (printTotalPerShare) printTotalPerShare.textContent = perShareSum.toFixed(2);
    // Remove any existing group cards before rendering
    const printTemplate = document.getElementById('print-template');
    let groupCardsDiv = printTemplate.querySelector('.group-print-cards');
    if (groupCardsDiv) groupCardsDiv.remove();
    // Render group cards after the table
    if (state.groups && state.groups.length > 0) {
        groupCardsDiv = document.createElement('div');
        groupCardsDiv.className = 'group-print-cards';
        state.groups.forEach(group => {
            if (!group.partSerials.length) return;
            // Gather parts in this group
            const groupParts = group.partSerials.map(s => state.parts[s-1]).filter(Boolean);
            if (!groupParts.length) return;
            let totalAmount = 0, totalPerShare = 0;
            groupParts.forEach(p => {
                totalAmount += parseFloat(p.totalAmount) || 0;
                totalPerShare += parseFloat(p.perShare) || 0;
            });
            const card = document.createElement('div');
            card.className = 'group-print-card';
            card.innerHTML = `<div class="group-print-title">${group.name}</div>`;
            groupParts.forEach((p, idx) => {
                card.innerHTML += `<div class="group-print-row">${p.name || 'Part'}: <b>${p.totalAmount || 0} kg</b> (${p.perShare || 0} per share)</div>`;
            });
            card.innerHTML += `<div class="group-print-total">Total: <b>${totalAmount.toFixed(2)} kg</b> (${totalPerShare.toFixed(2)} per share)</div>`;
            groupCardsDiv.appendChild(card);
        });
        // Insert after the table
        const printTable = printTemplate.querySelector('table');
        if (printTable && printTable.nextSibling) {
            printTemplate.insertBefore(groupCardsDiv, printTable.nextSibling);
        } else {
            printTemplate.appendChild(groupCardsDiv);
        }
    }
}

// --- Group Management ---
const groupSection = document.getElementById('groupSection');
const groupList = document.getElementById('groupList');
const addGroupBtn = document.getElementById('addGroupBtn');

function renderGroups() {
    groupList.innerHTML = '';
    state.groups.forEach((group, gIdx) => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'group-card';
        // Group name (editable)
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = group.name;
        nameInput.className = 'group-name-input';
        nameInput.addEventListener('input', (e) => {
            group.name = e.target.value;
            saveState();
        });
        groupDiv.appendChild(nameInput);
        // Dropdown for selecting parts
        const selectDiv = document.createElement('div');
        selectDiv.className = 'group-select-parts';
        selectDiv.innerHTML = '<span style="font-size:0.95em;color:#805ad5;">Select Part:</span>';
        // Build available options (not already selected in this group)
        const availableParts = state.parts
            .map((part, idx) => ({ serial: idx + 1, name: part.name || `Part ${idx + 1}` }))
            .filter(p => !group.partSerials.includes(p.serial));
        if (availableParts.length > 0) {
            const select = document.createElement('select');
            select.style.marginLeft = '0.7em';
            select.style.fontSize = '1em';
            select.innerHTML = '<option value="">-- Select --</option>' +
                availableParts.map(p => `<option value="${p.serial}">${p.serial} - ${p.name}</option>`).join('');
            select.onchange = () => {
                const val = parseInt(select.value);
                if (val && !group.partSerials.includes(val)) {
                    group.partSerials.push(val);
                    saveState();
                    renderGroups();
                }
            };
            selectDiv.appendChild(select);
        } else {
            const noParts = document.createElement('span');
            noParts.textContent = ' (All parts selected)';
            noParts.style.color = '#aaa';
            selectDiv.appendChild(noParts);
        }
        // Selected parts list with cross button
        const selectedList = document.createElement('div');
        selectedList.style.display = 'inline-block';
        selectedList.style.marginLeft = '1em';
        selectedList.style.verticalAlign = 'middle';
        group.partSerials.forEach(serial => {
            const part = state.parts[serial - 1];
            if (!part) return;
            const tag = document.createElement('span');
            tag.style.display = 'inline-flex';
            tag.style.alignItems = 'center';
            tag.style.background = '#e9d8fd';
            tag.style.color = '#553c9a';
            tag.style.borderRadius = '1em';
            tag.style.padding = '0.15em 0.7em 0.15em 0.7em';
            tag.style.marginRight = '0.5em';
            tag.style.marginBottom = '0.2em';
            tag.style.fontSize = '0.98em';
            tag.style.fontWeight = 'bold';
            tag.textContent = `${serial} - ${part.name || `Part ${serial}`}`;
            // Cross button
            const cross = document.createElement('button');
            cross.textContent = '×';
            cross.title = 'Remove from group';
            cross.style.background = 'none';
            cross.style.border = 'none';
            cross.style.color = '#c53030';
            cross.style.fontWeight = 'bold';
            cross.style.fontSize = '1.1em';
            cross.style.marginLeft = '0.3em';
            cross.style.cursor = 'pointer';
            cross.onclick = () => {
                group.partSerials = group.partSerials.filter(s => s !== serial);
                saveState();
                renderGroups();
            };
            tag.appendChild(cross);
            selectedList.appendChild(tag);
        });
        selectDiv.appendChild(selectedList);
        groupDiv.appendChild(selectDiv);
        // Delete button
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.className = 'group-del-btn';
        delBtn.onclick = () => {
            state.groups.splice(gIdx, 1);
            saveState();
            renderGroups();
        };
        groupDiv.appendChild(delBtn);
        groupList.appendChild(groupDiv);
    });
}
addGroupBtn.onclick = () => {
    state.groups.push({ id: Date.now(), name: 'New Group', partSerials: [] });
    saveState();
    renderGroups();
};

// --- Event Listeners ---
totalSharesInput.oninput = () => {
    state.totalShares = parseInt(totalSharesInput.value) || 1;
    // Only update perShare fields in the DOM and state, not the whole table
    state.parts.forEach((part, idx) => {
        part.perShare = state.totalShares ? (part.totalAmount / state.totalShares).toFixed(2) : 0;
        // Update the perShare input in the DOM if it exists
        const tr = partsTableBody.querySelectorAll('tr')[idx];
        if (tr) {
            const perShareInput = tr.querySelector('td:nth-child(4) input');
            if (perShareInput) perShareInput.value = part.perShare;
        }
    });
    // Update the total row's per share sum
    updateTotalsRow();
    saveState();
    updateSharesPrint();
};
addRowBtn.onclick = () => {
    state.parts.push({ name: '', totalAmount: 0, perShare: 0, tally: 0 });
    renderTable();
    saveState();
    renderGroups();
};
clearDataBtn.onclick = () => {
    if (confirm('Are you sure you want to clear all saved data?')) {
        localStorage.removeItem(STORAGE_KEY);
        state = { totalShares: 7, parts: [] };
        totalSharesInput.value = 7;
        renderTable();
    }
};

// --- PDF Export ---
exportPDFBtn.onclick = () => {
    renderPrintTemplate();
    document.getElementById('print-template').style.display = 'block';
    document.getElementById('ui-template').style.display = 'none';
    window.print();
    document.getElementById('print-template').style.display = 'none';
    document.getElementById('ui-template').style.display = 'block';
};

// --- Offline/Online Sliding Toggle Functionality ---
const offlineSlider = document.getElementById('offlineSlider');
if (offlineSlider) {
    // Set initial state
    if (localStorage.getItem('shariknama_offline') === '1') {
        offlineSlider.checked = true;
    } else {
        offlineSlider.checked = false;
    }
    offlineSlider.onchange = function() {
        if (this.checked) {
            // Offline mode
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('sw.js').then(() => {
                    localStorage.setItem('shariknama_offline', '1');
                });
            }
        } else {
            // Online mode
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(regs => {
                    regs.forEach(reg => reg.unregister());
                });
            }
            localStorage.removeItem('shariknama_offline');
            // Remove all local storage except app state
            Object.keys(localStorage).forEach(key => {
                if (key !== 'shariknama_data_v1') {
                    localStorage.removeItem(key);
                }
            });
            location.reload();
        }
    };
}

// --- Info Button Tooltip for Mode Toggle ---
const modeInfoBtn = document.getElementById('modeInfoBtn');
const modeInfoTooltip = document.getElementById('modeInfoTooltip');

function getModeTooltipText() {
    const isOffline = offlineSlider && offlineSlider.checked;
    return (
        '<div style="margin-bottom:0.5em;">Current Status: <b style="color:' + (isOffline ? '#22c55e' : '#b7791f') + '">' +
            (isOffline ? 'Offline Mode (local, no internet needed)' : 'Online Mode (internet required)') +
            '</b></div>' +
        '<div style="margin-bottom:0.3em;">'+
        'This button toggles between <b>Offline</b> and <b>Online</b> modes.'+
        '</div>'+
        '<ul style="margin:0 0 0 1.1em;padding:0 0 0 0.2em;list-style:disc;font-size:0.97em;">'+
        '<li><b>Offline:</b> The app works without internet (data is saved locally).</li>'+
        '<li><b>Online:</b> The app requires internet and disables offline storage.</li>'+
        '</ul>'
    );
}

function showModeTooltip() {
    if (!modeInfoTooltip) return;
    modeInfoTooltip.innerHTML = getModeTooltipText();
    modeInfoTooltip.style.display = 'block';
    modeInfoTooltip.classList.add('active');
}
function hideModeTooltip() {
    if (!modeInfoTooltip) return;
    modeInfoTooltip.style.display = 'none';
    modeInfoTooltip.classList.remove('active');
}
if (modeInfoBtn && modeInfoTooltip) {
    modeInfoBtn.addEventListener('mouseenter', showModeTooltip);
    modeInfoBtn.addEventListener('focus', showModeTooltip);
    modeInfoBtn.addEventListener('mouseleave', hideModeTooltip);
    modeInfoBtn.addEventListener('blur', hideModeTooltip);
    // Also update tooltip on toggle
    if (offlineSlider) {
        offlineSlider.addEventListener('change', function() {
            if (modeInfoTooltip.classList.contains('active')) {
                showModeTooltip();
            }
        });
    }
}

// --- Init ---
function init() {
    // Add current year beside SharikNama in the logo/main heading
    const logoMain = document.querySelector('.logo-main');
    if (logoMain) {
        const yearSpan = document.createElement('span');
        yearSpan.textContent = ' - ' + new Date().getFullYear();
        yearSpan.style.fontSize = '0.8em';
        yearSpan.style.fontWeight = 'bold';
        yearSpan.style.color = '#b7791f';
        logoMain.appendChild(yearSpan);
    }
    loadState();
    totalSharesInput.value = state.totalShares;
    updatePerShareAll();
    renderTable();
    updateSharesPrint();
    renderGroups();
}
init();
