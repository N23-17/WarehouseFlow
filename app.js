/**
 * NexusWMS — Engine Script for Offline Interactive Presentation Demonstrations
 */

document.addEventListener('DOMContentLoaded', () => {
    initializeThemeSwitcher();
    initializeSearchFilters();
    initializeInboundSystem();
    initializeMockDataGenerators();
});

/* ─────────────────────────────────────────────
   THEME SWITCHER
   Persists selection in localStorage so the
   chosen theme carries across all pages.
   ───────────────────────────────────────────── */
function initializeThemeSwitcher() {
    const themeStyle   = document.getElementById('theme-style');
    const themeSwitcher = document.getElementById('themeSwitcher');

    // If this page has no theme link tag, bail silently (e.g. login page)
    if (!themeStyle) return;

    const THEME_KEY     = 'nexuswms_theme';
    const DEFAULT_THEME = 'neo';

    // Restore saved theme on every page load
    const savedTheme = localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
    applyTheme(savedTheme);

    // Sync the <select> to the saved value if it exists on this page
    if (themeSwitcher) {
        themeSwitcher.value = savedTheme;

        themeSwitcher.addEventListener('change', () => {
            const selected = themeSwitcher.value;
            applyTheme(selected);
            localStorage.setItem(THEME_KEY, selected);
        });
    }

    function applyTheme(themeName) {
        themeStyle.href = `themes/${themeName}.css`;
    }
}

/* ─────────────────────────────────────────────
   GLOBAL NOTIFICATION HANDLER
   ───────────────────────────────────────────── */
function showToastNotification(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast${type === 'success' ? ' toast-success' : ''}`;

    const icon = type === 'success' ? '✅' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span><div>${message}</div>`;
    container.appendChild(toast);

    // Auto-remove after 4 s
    setTimeout(() => {
        toast.style.opacity    = '0';
        toast.style.transform  = 'translateX(110%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/* ─────────────────────────────────────────────
   INVENTORY SEARCH & ZONE FILTER
   ───────────────────────────────────────────── */
function initializeSearchFilters() {
    const searchInput = document.getElementById('inventorySearch');
    const zoneFilter  = document.getElementById('zoneFilter');
    const table       = document.getElementById('inventoryTable');

    // Silent return if not on the inventory page
    if (!table) return;

    function filterTable() {
        const query        = (searchInput ? searchInput.value : '').toLowerCase();
        const selectedZone = zoneFilter ? zoneFilter.value : 'all';
        const tbody        = table.getElementsByTagName('tbody')[0];
        const rows         = tbody ? tbody.getElementsByTagName('tr') : [];

        for (const row of rows) {
            const textMatch = row.textContent.toLowerCase().includes(query);
            const rowZone   = row.getAttribute('data-zone') || '';
            const zoneMatch = selectedZone === 'all' || rowZone === selectedZone;
            row.style.display = textMatch && zoneMatch ? '' : 'none';
        }
    }

    if (searchInput) searchInput.addEventListener('input',  filterTable);
    if (zoneFilter)  zoneFilter.addEventListener('change', filterTable);
}

/* ─────────────────────────────────────────────
   INBOUND MANIFEST FORM
   ───────────────────────────────────────────── */
function initializeInboundSystem() {
    const btnSubmit = document.getElementById('btnSubmitInbound');
    const queueBody = document.getElementById('inboundQueueTable');

    if (!btnSubmit || !queueBody) return;

    btnSubmit.addEventListener('click', () => {
        const po      = document.getElementById('poNumber').value.trim()
                        || `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const carrier = document.getElementById('carrierName').value.trim()
                        || 'Generic Carrier';
        const sku     = (document.getElementById('skuArrived').value.trim() || 'SKU-MOCK').toUpperCase();
        const qty     = document.getElementById('qtyReceived').value.trim() || '100';
        const dock    = document.getElementById('dockBay').value;

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><code>${po}</code></td>
            <td><code class="sku">${sku}</code></td>
            <td>${qty}</td>
            <td>${dock}</td>
            <td><span class="badge badge-warning">Staged / Awaiting Putaway</span></td>
        `;

        queueBody.insertBefore(newRow, queueBody.firstChild);
        showToastNotification(`Successfully Received Manifest: ${po} via ${carrier}!`, 'success');

        const form = document.getElementById('inboundForm');
        if (form) form.reset();
    });
}

/* ─────────────────────────────────────────────
   OUTBOUND ORDER ACTION SIMULATOR
   ───────────────────────────────────────────── */
function processOrder(orderId, actionType) {
    const statusLabel = document.getElementById(`status-${orderId}`);

    if (actionType === 'Shipment Cleared') {
        if (statusLabel) {
            statusLabel.className = 'badge badge-success';
            statusLabel.innerText = 'Dispatched / Shipped';
        }
        showToastNotification(
            `Order SO-${orderId} handed off to carrier truck. Manifest closed.`,
            'success'
        );
    } else {
        showToastNotification(
            `Action triggered: [${actionType}] for Document Reference ID: SO-${orderId}.`,
            'info'
        );
    }
}

/* ─────────────────────────────────────────────
   INVENTORY MOCK DATA GENERATOR
   ───────────────────────────────────────────── */
function initializeMockDataGenerators() {
    const btnNewItem = document.getElementById('btnNewItem');
    if (!btnNewItem) return;

    btnNewItem.addEventListener('click', () => {
        const tbody = document.querySelector('#inventoryTable tbody');
        if (!tbody) return;

        const randomId = Math.floor(1000 + Math.random() * 9000);
        const tr = document.createElement('tr');
        tr.setAttribute('data-zone', 'A');
        tr.innerHTML = `
            <td><code class="sku">GEN-${randomId}</code></td>
            <td>Sample Industrial Component Alpha-${randomId}</td>
            <td>A-01-${Math.floor(1 + Math.random() * 20)}</td>
            <td>500</td>
            <td>0</td>
            <td>500</td>
            <td>Units</td>
        `;
        tbody.insertBefore(tr, tbody.firstChild);
        showToastNotification(`Injected Demo Item: SKU GEN-${randomId}`, 'success');
    });
}
