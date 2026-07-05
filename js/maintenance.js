// ============================================
// PROPERTYHOST - LÓGICA DE LA PÁGINA MAINTENANCE
// ============================================

let ALL_TASKS = [];
let CURRENT_PROPERTY_FILTER = "all";
let CURRENT_STATUS_FILTER = "all";

const STATUS_LABELS = {
    pending: "Pendiente",
    progress: "En progreso",
    done: "Completado"
};

// Los íconos por categoría viven en js/icons.js (getCategoryIcon)

document.addEventListener("DOMContentLoaded", async () => {
    const data = await fetchDashboardData();
    if (!data || !data.maintenance) return;

    ALL_TASKS = data.maintenance;

    populatePropertyDropdown(data.properties);
    setupFilters();
    applyPropertyFromUrl();
    renderMaintenanceSummary(ALL_TASKS);
    applyFiltersAndRender();
});

// Si venimos desde "maintenance.html?property=P001" (por ejemplo, desde el Dashboard),
// preseleccionamos esa propiedad en el dropdown.
function applyPropertyFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const propertyId = params.get("property");
    if (!propertyId) return;

    const select = document.getElementById("property-filter");
    const optionExists = Array.from(select.options).some(opt => opt.value === propertyId);

    if (optionExists) {
        select.value = propertyId;
        CURRENT_PROPERTY_FILTER = propertyId;
    }
}

function populatePropertyDropdown(properties) {
    if (!properties || !properties.length) return;

    const select = document.getElementById("property-filter");
    properties.forEach(p => {
        const option = document.createElement("option");
        option.value = p.id;
        option.textContent = p.name;
        select.appendChild(option);
    });

    select.addEventListener("change", () => {
        CURRENT_PROPERTY_FILTER = select.value;
        applyFiltersAndRender();
    });
}

function setupFilters() {
    const buttons = document.querySelectorAll(".filter-btn[data-status]");

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            CURRENT_STATUS_FILTER = btn.dataset.status;
            applyFiltersAndRender();
        });
    });
}

function applyFiltersAndRender() {
    let tasks = ALL_TASKS;

    if (CURRENT_PROPERTY_FILTER !== "all") {
        tasks = tasks.filter(t => t.propertyId === CURRENT_PROPERTY_FILTER);
    }

    if (CURRENT_STATUS_FILTER !== "all") {
        tasks = tasks.filter(t => t.status === CURRENT_STATUS_FILTER);
    }

    renderMaintenanceList(tasks);
}

function renderMaintenanceSummary(tasks) {
    const el = document.getElementById("maintenance-summary");
    if (!el) return;

    const total = tasks.length;
    const pending = tasks.filter(t => t.status === "pending").length;
    const progress = tasks.filter(t => t.status === "progress").length;
    const done = tasks.filter(t => t.status === "done").length;

    el.innerHTML = `
        <div class="mini-stat"><span>${total}</span><p>Total</p></div>
        <div class="mini-stat"><span>${pending}</span><p>Pendientes</p></div>
        <div class="mini-stat"><span>${progress}</span><p>En progreso</p></div>
        <div class="mini-stat"><span>${done}</span><p>Completadas</p></div>
    `;
}

function renderMaintenanceList(tasks) {
    const list = document.getElementById("maintenance-full-list");

    if (!tasks.length) {
        list.innerHTML = `<p class="empty-msg">No hay tareas de mantenimiento con estos filtros.</p>`;
        return;
    }

    list.innerHTML = tasks.map(item => {
        const status = item.status || "pending";
        const label = STATUS_LABELS[status] || "Pendiente";
        const icon = getCategoryIcon(item.category);
        const taskName = item.task || item.text;

        return `
            <div class="maintenance-item">
                <div class="task-main">
                    <div class="task-icon">${icon}</div>
                    <div class="task-info">
                        <strong>${taskName}</strong>
                        <span>${item.date || ""}${item.assignedTo ? " · " + item.assignedTo : ""}</span>
                    </div>
                </div>
                <span class="status-badge status-${status}">${label}</span>
            </div>
        `;
    }).join("");
}
