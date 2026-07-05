// ============================================
// PROPERTYHOST - LÓGICA DEL DASHBOARD
// ============================================

document.addEventListener("DOMContentLoaded", async () => {
    setTodayPill();
    applyOwnerName();

    const data = await fetchDashboardData();

    // Si el fetch falla (por ejemplo, mientras configuras el Apps Script),
    // se quedan los valores de ejemplo que ya están escritos en el HTML.
    if (!data) return;

    renderSummary(data.summary);
    updateRevenueTrendLabel(data.revenueTrend);
    renderProperties(data.properties);
    renderMaintenance(data.maintenance);
    renderRevenueForecastChart("revenue-chart", data.revenueTrend, 3);
});

// Reemplaza "Isaac" por el nombre guardado en Settings, si existe
function applyOwnerName() {
    const name = localStorage.getItem("ph_owner_name");
    if (!name) return;

    const heading = document.querySelector("header h2");
    if (heading) {
        heading.innerHTML = heading.innerHTML.replace("Isaac", name);
    }
}

function setTodayPill() {
    const pill = document.getElementById("today-pill");
    if (!pill) return;

    const today = new Date();
    pill.textContent = today.toLocaleDateString("es-ES", {
        weekday: "long", day: "numeric", month: "long"
    });
}

function renderSummary(summary) {
    if (!summary) return;

    document.getElementById("stat-properties").textContent = summary.properties;
    document.getElementById("stat-revenue").textContent = formatCurrency(summary.revenue);
    document.getElementById("stat-expenses").textContent = formatCurrency(summary.expenses);
    document.getElementById("stat-profit").textContent = formatCurrency(summary.profit);
}

// Muestra el % de cambio del último mes vs el anterior en la tarjeta de Revenue

function updateRevenueTrendLabel(trend) {
    const el = document.getElementById("trend-revenue");
    if (!el || !trend || trend.length < 2) return;

    const last = trend[trend.length - 1];
    const prev = trend[trend.length - 2];
    if (!prev) return;

    const change = ((last - prev) / prev) * 100;
    const isUp = change >= 0;

    el.classList.toggle("up", isUp);
    el.classList.toggle("down", !isUp);
    el.textContent = `${isUp ? "↑" : "↓"} ${Math.abs(change).toFixed(1)}% vs mes anterior`;
}

function renderProperties(properties) {
    if (!properties || !properties.length) return;

    const grid = document.getElementById("properties-grid");
    grid.innerHTML = properties.map(p => `
        <a class="property-card" href="property.html?id=${p.id}">
            <img src="${p.image}" alt="${p.name}">
            <div class="property-info">
                <h3>${p.name}</h3>
                <p>${p.location}</p>
                <strong>${formatCurrency(p.revenue)} Revenue</strong>
            </div>
        </a>
    `).join("");
}

function renderMaintenance(items) {
    if (!items || !items.length) return;

    const list = document.getElementById("maintenance-list");
    // Muestra solo las próximas 4 tareas pendientes/en progreso
    const upcoming = items
        .filter(i => i.status !== "done")
        .slice(0, 4);

    list.innerHTML = upcoming.map(item => `
        <li>
            <span>${item.icon} ${item.text}</span>
            <span class="status-badge status-${item.status}">${item.date || ""}</span>
        </li>
    `).join("");
}
