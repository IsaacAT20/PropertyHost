// ============================================
// PROPERTYHOST - LÓGICA DE LA PÁGINA REPORTS
// ============================================

document.addEventListener("DOMContentLoaded", async () => {
    const data = await fetchDashboardData();
    if (!data) return;

    renderReportSummary(data.summary);
    renderRevenueForecastChart("report-revenue-chart", data.revenueTrend, 3);
    renderExpenseDonut("report-expense-donut", data.expensesByCategory);
    renderPropertyComparisonChart("report-property-chart", data.properties);

    document.getElementById("export-btn").addEventListener("click", () => {
        window.print();
    });
});

function renderReportSummary(summary) {
    if (!summary) return;

    document.getElementById("report-revenue").textContent = formatCurrency(summary.revenue);
    document.getElementById("report-expenses").textContent = formatCurrency(summary.expenses);
    document.getElementById("report-profit").textContent = formatCurrency(summary.profit);
}
