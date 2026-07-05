// ============================================
// PROPERTYHOST - LÓGICA DE LA PÁGINA SETTINGS
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    // Precargar los campos con lo que ya esté guardado
    document.getElementById("sheet-url-input").value = localStorage.getItem("ph_sheet_url") || "";
    document.getElementById("owner-name-input").value = localStorage.getItem("ph_owner_name") || "";

    document.getElementById("save-url-btn").addEventListener("click", () => {
        const value = document.getElementById("sheet-url-input").value.trim();

        if (value) {
            localStorage.setItem("ph_sheet_url", value);
        } else {
            localStorage.removeItem("ph_sheet_url");
        }

        // Como cambió la fuente de datos, borramos el cache viejo
        localStorage.removeItem("ph_dashboard_cache");

        flashMessage("save-msg");
    });

    document.getElementById("save-name-btn").addEventListener("click", () => {
        const value = document.getElementById("owner-name-input").value.trim();

        if (value) {
            localStorage.setItem("ph_owner_name", value);
        } else {
            localStorage.removeItem("ph_owner_name");
        }

        flashMessage("save-name-msg");
    });

    document.getElementById("clear-cache-btn").addEventListener("click", () => {
        localStorage.removeItem("ph_dashboard_cache");
        flashMessage("clear-cache-msg");
    });
});

function flashMessage(elementId) {
    const el = document.getElementById(elementId);
    el.style.display = "inline";
    setTimeout(() => { el.style.display = "none"; }, 2500);
}
