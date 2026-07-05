// ============================================
// PROPERTYHOST - CONEXIÓN CON GOOGLE SHEETS
// ============================================
// Este archivo habla con un Google Apps Script publicado como "Web App"
// que lee tu Google Sheet y devuelve los datos en formato JSON.

const DEFAULT_SHEET_API_URL = "https://script.google.com/macros/s/TU_ID_DE_DESPLIEGUE/exec";
const CACHE_KEY = "ph_dashboard_cache";
const CACHE_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutos

// La URL real puede venir de Settings (guardada en localStorage) o de la de por defecto.
function getSheetApiUrl() {
    return localStorage.getItem("ph_sheet_url") || DEFAULT_SHEET_API_URL;
}

/**
 * Trae los datos del dashboard. Estrategia "cache primero":
 * - Si hay datos guardados en localStorage, los devuelve de inmediato (carga instantánea)
 *   y de paso actualiza el cache en segundo plano para la próxima vez.
 * - Si no hay cache, espera al fetch real.
 *
 * Se espera que el Apps Script devuelva:
 * {
 *   "summary": { "properties": 5, "revenue": 186450, "expenses": 22580, "profit": 163870 },
 *   "properties": [ { "id": "P001", "name": "Casa Mango", "location": "Popoyo", "revenue": 48250, "expenses": 5100, "image": "..." }, ... ],
 *   "expensesByCategory": { "Cleaning": 1234, ... },
 *   "maintenance": [ { "propertyId": "P001", "icon": "🏊", "text": "...", "status": "pending" }, ... ],
 *   "revenueTrend": [45, 60, 52, 70, 88, 82, 95]
 * }
 */
async function fetchDashboardData() {
    const cached = readCache();

    if (cached) {
        refreshCacheInBackground(); // no bloquea, actualiza para la próxima visita
        return cached;
    }

    return await fetchAndCache();
}

function readCache() {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        return parsed.data || null;
    } catch (error) {
        return null;
    }
}

function refreshCacheInBackground() {
    fetchAndCache().catch(() => {});
}

async function fetchAndCache() {
    try {
        const response = await fetch(getSheetApiUrl());

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
        } catch (storageError) {
            console.warn("No se pudo guardar el cache local:", storageError);
        }

        return data;

    } catch (error) {
        console.error("No se pudo cargar la información del Sheet:", error);
        return null; // cada página decide qué hacer si falla (dejar los datos de ejemplo)
    }
}

// Fuerza a ignorar el cache y traer datos frescos ahora mismo (usado por el botón "Actualizar")
async function forceRefreshDashboardData() {
    return await fetchAndCache();
}

// Formatea números como moneda (ej. 186450 -> $186,450)
function formatCurrency(amount) {
    return "$" + Number(amount).toLocaleString("en-US");
}
