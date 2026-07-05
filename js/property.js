// ============================================
// PROPERTYHOST - LÓGICA DE LA PÁGINA PROPERTY (individual)
// ============================================

document.addEventListener("DOMContentLoaded", async () => {
    const propertyId = getPropertyIdFromUrl();

    if (!propertyId) {
        showError("No se especificó ninguna propiedad. Vuelve a Properties y elige una.");
        return;
    }

    const data = await fetchDashboardData();

    if (!data) {
        showError("No se pudo cargar la información. Revisa tu conexión con Google Sheets.");
        return;
    }

    const property = data.properties.find(p => p.id === propertyId);

    if (!property) {
        showError(`No se encontró la propiedad con id "${propertyId}".`);
        return;
    }

    renderPropertyHeader(property);
    renderPropertyStats(property);
    renderRevenueForecastChart("property-revenue-chart", property.revenueTrend, 3);
    renderExpenseDonut("property-expense-donut", property.expensesByCategory);
    renderPropertyComparisonChart("property-finance-chart", [property]);

    const tasks = (data.maintenance || []).filter(m => m.propertyId === propertyId);
    renderPropertyMaintenance(tasks);
});

// Lee ?id=P001 de la URL actual
function getPropertyIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

function renderPropertyHeader(property) {
    document.getElementById("property-name").textContent = property.name;
    document.getElementById("property-location").textContent = property.location;

    const statusBadge = document.getElementById("property-status");
    statusBadge.textContent = property.status || "Active";
    statusBadge.className = "status-badge " + (property.status === "Active" ? "status-done" : "status-pending");

    document.title = `PropertyHost - ${property.name}`;
}

function renderPropertyStats(property) {
    const profit = property.revenue - property.expenses;

    document.getElementById("property-revenue").textContent = formatCurrency(property.revenue);
    document.getElementById("property-expenses").textContent = formatCurrency(property.expenses);
    document.getElementById("property-profit").textContent = formatCurrency(profit);
    document.getElementById("property-budget").textContent = property.monthlyBudget
        ? formatCurrency(property.monthlyBudget)
        : "—";
}

const STATUS_LABELS = {
    pending: "Pendiente",
    progress: "En progreso",
    done: "Completado"
};

function renderPropertyMaintenance(tasks) {
    const list = document.getElementById("property-maintenance-list");
    const emptyMsg = document.getElementById("no-maintenance-msg");

    if (!tasks.length) {
        list.innerHTML = "";
        emptyMsg.style.display = "block";
        return;
    }

    emptyMsg.style.display = "none";

    list.innerHTML = tasks.map(t => {
        const status = t.status || "pending";
        const label = STATUS_LABELS[status] || "Pendiente";

        return `
            <div class="maintenance-item">
                <div class="task-main">
                    <div class="task-icon">${getCategoryIcon(t.category)}</div>
                    <div class="task-info">
                        <strong>${t.task || t.text}</strong>
                        <span>${t.date || ""} ${t.assignedTo ? "· Asignado a " + t.assignedTo : ""}</span>
                    </div>
                </div>
                <span class="status-badge status-${status}">${label}</span>
            </div>
        `;
    }).join("");
}

function showError(message) {
    const main = document.querySelector("main");
    main.innerHTML = `<p class="empty-msg">${message}</p>`;
}
