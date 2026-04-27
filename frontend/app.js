/**
 * Daily Expense Tracker — Frontend Logic
 * Uses fetch API to communicate with Django backend.
 */

// API base URL — adjust for production
const API_BASE = window.location.origin + '/api';

// Category emoji mapping
const CATEGORY_EMOJI = {
    food: '🍔', travel: '✈️', bills: '🧾', salary: '💼',
    entertainment: '🎮', shopping: '🛒', health: '🏥', other: '📦',
};

// DOM references
const form = document.getElementById('transaction-form');
const formMessage = document.getElementById('form-message');
const filterCategory = document.getElementById('filter-category');
const transactionsBody = document.getElementById('transactions-body');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const netBalanceEl = document.getElementById('net-balance');

// Set default date to today
document.getElementById('date').valueAsDate = new Date();

// ──────────────────────────────────────
//  Fetch Balance
// ──────────────────────────────────────
async function fetchBalance() {
    try {
        const res = await fetch(`${API_BASE}/balance/`);
        const data = await res.json();

        totalIncomeEl.textContent = `₹${formatNumber(data.total_income)}`;
        totalExpenseEl.textContent = `₹${formatNumber(data.total_expense)}`;
        netBalanceEl.textContent = `₹${formatNumber(data.balance)}`;

        // Color the balance based on positive/negative
        netBalanceEl.style.color = data.balance >= 0
            ? 'var(--income)'
            : 'var(--expense)';
    } catch (err) {
        console.error('Failed to fetch balance:', err);
    }
}

// ──────────────────────────────────────
//  Fetch Transactions
// ──────────────────────────────────────
async function fetchTransactions(category = '') {
    try {
        let url = `${API_BASE}/transactions/`;
        if (category) url += `?category=${encodeURIComponent(category)}`;

        const res = await fetch(url);
        const data = await res.json();

        renderTransactions(data.transactions);
    } catch (err) {
        console.error('Failed to fetch transactions:', err);
    }
}

// ──────────────────────────────────────
//  Render Transactions Table
// ──────────────────────────────────────
function renderTransactions(transactions) {
    if (!transactions || transactions.length === 0) {
        transactionsBody.innerHTML = `
            <tr class="empty-row">
                <td colspan="5">No transactions yet. Add one above!</td>
            </tr>`;
        return;
    }

    transactionsBody.innerHTML = '';

    transactions.forEach((txn, i) => {
        const row = document.createElement('tr');
        row.className = 'row-animate';
        row.style.animationDelay = `${i * 0.05}s`;

        const emoji = CATEGORY_EMOJI[txn.category] || '📦';
        const typeClass = txn.transaction_type === 'income' ? 'income' : 'expense';
        const sign = txn.transaction_type === 'income' ? '+' : '-';

        row.innerHTML = `
            <td>${formatDate(txn.date)}</td>
            <td><span class="type-badge type-badge--${typeClass}">${txn.transaction_type}</span></td>
            <td><span class="category-badge">${emoji} ${txn.category}</span></td>
            <td>${txn.description || '—'}</td>
            <td class="amount-cell amount-cell--${typeClass}">${sign}₹${formatNumber(parseFloat(txn.amount))}</td>
        `;

        transactionsBody.appendChild(row);
    });
}

// ──────────────────────────────────────
//  Add Transaction
// ──────────────────────────────────────
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage();

    const payload = {
        amount: parseFloat(document.getElementById('amount').value),
        transaction_type: document.getElementById('transaction-type').value,
        category: document.getElementById('category').value,
        date: document.getElementById('date').value,
        description: document.getElementById('description').value || '',
    };

    // Basic client-side validation
    if (!payload.amount || payload.amount <= 0) {
        showMessage('Please enter a valid amount.', 'error');
        return;
    }
    if (!payload.date) {
        showMessage('Please select a date.', 'error');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/add-transaction/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok) {
            showMessage('Transaction added successfully! ✅', 'success');
            form.reset();
            document.getElementById('date').valueAsDate = new Date();
            // Refresh data
            fetchBalance();
            fetchTransactions(filterCategory.value);
        } else {
            showMessage(data.error || 'Failed to add transaction.', 'error');
        }
    } catch (err) {
        showMessage('Network error. Is the server running?', 'error');
        console.error('Add transaction error:', err);
    }
});

// ──────────────────────────────────────
//  Filter Change
// ──────────────────────────────────────
filterCategory.addEventListener('change', () => {
    fetchTransactions(filterCategory.value);
});

// ──────────────────────────────────────
//  Helpers
// ──────────────────────────────────────
function formatNumber(num) {
    return Number(num).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

function showMessage(text, type) {
    formMessage.textContent = text;
    formMessage.className = `form-message form-message--${type}`;
}

function hideMessage() {
    formMessage.textContent = '';
    formMessage.className = 'form-message';
}

// ──────────────────────────────────────
//  Initial Load
// ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    fetchBalance();
    fetchTransactions();
});
