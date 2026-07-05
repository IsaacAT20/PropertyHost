// ============================================
// PROPERTYHOST - LÓGICA DE LA PÁGINA FINANCE
// ============================================
// Espera que cada propiedad en data.properties tenga también
// un campo "expenses" (agrega esa columna en tu pestaña "Properties" del Sheet).

document.addEventListener("DOMContentLoaded", async () => {
    const data = await fetchDashboardData();
    if (!data) return;

    renderFinanceSummary(data.summary);
    renderFinanceTable(data.properties);
    renderPropertyComparisonChart("property-comparison-chart", data.properties);
    renderExpenseDonut("expense-donut-chart", data.expensesByCategory);
});

function renderFinanceSummary(summary) {
    if (!summary) return;

    document.getElementById("finance-revenue").textContent = formatCurrency(summary.revenue);
    document.getElementById("finance-expenses").textContent = formatCurrency(summary.expenses);
    document.getElementById("finance-profit").textContent = formatCurrency(summary.profit);
}

function renderFinanceTable(properties) {
    if (!properties || !properties.length) return;

    const tbody = document.getElementById("finance-table-body");

    tbody.innerHTML = properties.map(p => {
        const expenses = p.expenses || 0;
        const profit = p.revenue - expenses;

        return `
            <tr>
                <td>${p.name}</td>
                <td class="amount-positive">${formatCurrency(p.revenue)}</td>
                <td class="amount-negative">${formatCurrency(expenses)}</td>
                <td class="amount-positive">${formatCurrency(profit)}</td>
            </tr>
        `;
    }).join("");
}
