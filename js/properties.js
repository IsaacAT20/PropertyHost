// ============================================
// PROPERTYHOST - LÓGICA DE LA PÁGINA PROPERTIES
// ============================================

document.addEventListener("DOMContentLoaded", async () => {
    setupFilters();

    const data = await fetchDashboardData();
    if (data && data.properties) {
        renderPropertiesGrid(data.properties);
    }
});

function setupFilters() {
    const buttons = document.querySelectorAll(".filter-btn");
    const cards = document.querySelectorAll(".property-card");

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const filter = btn.dataset.filter;

            cards.forEach(card => {
                const match = filter === "all" || card.dataset.location === filter;
                card.style.display = match ? "block" : "none";
            });
        });
    });
}

function renderPropertiesGrid(properties) {
    const grid = document.getElementById("properties-grid");

    grid.innerHTML = properties.map(p => `
        <a class="property-card" data-location="${(p.location || "").toLowerCase()}" href="property.html?id=${p.id}">
            <img src="${p.image}" alt="${p.name}">
            <div class="property-info">
                <h3>${p.name}</h3>
                <p>${p.location}</p>
                <strong>${formatCurrency(p.revenue)} Revenue</strong>
            </div>
        </a>
    `).join("");

    setupFilters(); // reconectar los filtros a las tarjetas nuevas
}
