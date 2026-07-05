// ============================================
// PROPERTYHOST - LÓGICA DE LA PÁGINA MAINTENANCE
// ============================================
// Espera que cada tarea en data.maintenance tenga:
// icon, text, date, status ("pending" | "progress" | "done")

document.addEventListener("DOMContentLoaded", async () => {
    const data = await fetchDashboardData();
    if (data && data.maintenance) {
        renderMaintenanceList(data.maintenance);
    }
});

const STATUS_LABELS = {
    pending: "Pendiente",
    progress: "En progreso",
    done: "Completado"
};

function renderMaintenanceList(items) {
    const list = document.getElementById("maintenance-full-list");

    list.innerHTML = items.map(item => {
        const status = item.status || "pending";
        const label = STATUS_LABELS[status] || "Pendiente";

        return `
            <div class="maintenance-item">
                <div class="task-info">
                    <strong>${item.icon} ${item.text}</strong>
                    <span>${item.date || ""}</span>
                </div>
                <span class="status-badge status-${status}">${label}</span>
            </div>
        `;
    }).join("");
}
