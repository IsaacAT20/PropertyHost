// ============================================
// PROPERTYHOST - GRÁFICAS (Chart.js)
// ============================================

Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.color = "#5B7A8C";

const MONTH_NAMES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

/**
 * Dibuja la tendencia de ingresos (línea sólida) + una proyección a futuro
 * (línea punteada) calculada con una regresión lineal simple sobre los
 * últimos meses reales.
 *
 * @param {string} canvasId
 * @param {number[]} monthlyTotals - ingresos reales por mes, en orden cronológico
 * @param {number} monthsToForecast - cuántos meses proyectar hacia adelante
 */
function renderRevenueForecastChart(canvasId, monthlyTotals, monthsToForecast = 3) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !monthlyTotals || !monthlyTotals.length) return;

    const forecast = linearForecast(monthlyTotals, monthsToForecast);

    // Etiquetas: usamos los últimos N meses reales + los proyectados, como M1, M2...
    // (no tenemos el mes calendario exacto de cada punto, así que numeramos)
    const totalPoints = monthlyTotals.length + monthsToForecast;
    const labels = Array.from({ length: totalPoints }, (_, i) => `Mes ${i + 1}`);

    // Dataset "actual": solo tiene valores en los meses reales, resto null
    const actualData = monthlyTotals.concat(Array(monthsToForecast).fill(null));

    // Dataset "proyectado": null en los meses reales (excepto el último punto,
    // para que la línea conecte visualmente), luego los valores proyectados
    const forecastData = Array(monthlyTotals.length - 1).fill(null)
        .concat([monthlyTotals[monthlyTotals.length - 1]])
        .concat(forecast);

    new Chart(canvas, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Ingresos reales",
                    data: actualData,
                    borderColor: "#0284C7",
                    backgroundColor: (ctx) => {
                        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 260);
                        gradient.addColorStop(0, "rgba(56,189,248,.35)");
                        gradient.addColorStop(1, "rgba(56,189,248,0)");
                        return gradient;
                    },
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: "#0284C7",
                    borderWidth: 3
                },
                {
                    label: "Proyección",
                    data: forecastData,
                    borderColor: "#22D3EE",
                    borderDash: [6, 6],
                    fill: false,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: "#22D3EE",
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }, // usamos nuestra propia leyenda en el HTML
                tooltip: {
                    callbacks: {
                        label: (item) => item.formattedValue !== null
                            ? " $" + Number(item.raw).toLocaleString("en-US")
                            : ""
                    }
                }
            },
            scales: {
                y: {
                    grid: { color: "#EFF8FF" },
                    ticks: {
                        callback: (value) => "$" + (value / 1000) + "k"
                    }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

/**
 * Proyecta N valores futuros usando una regresión lineal simple
 * sobre los datos reales (mínimos cuadrados).
 */
function linearForecast(values, monthsToForecast) {
    const n = values.length;
    const xs = values.map((_, i) => i);
    const meanX = xs.reduce((a, b) => a + b, 0) / n;
    const meanY = values.reduce((a, b) => a + b, 0) / n;

    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
        num += (xs[i] - meanX) * (values[i] - meanY);
        den += (xs[i] - meanX) ** 2;
    }

    const slope = den === 0 ? 0 : num / den;
    const intercept = meanY - slope * meanX;

    const forecast = [];
    for (let i = 1; i <= monthsToForecast; i++) {
        const x = n - 1 + i;
        forecast.push(Math.max(0, Math.round(slope * x + intercept)));
    }
    return forecast;
}

/**
 * Dona de gastos por categoría.
 * @param {string} canvasId
 * @param {Object} categoryTotals - { "Cleaning": 1234, "Electrical": 456, ... }
 */
function renderExpenseDonut(canvasId, categoryTotals) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !categoryTotals) return;

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    const palette = ["#0284C7", "#38BDF8", "#22D3EE", "#7DD3FC", "#0C4A6E", "#A5F3FC"];

    new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: palette,
                borderWidth: 3,
                borderColor: "#fff"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "68%",
            plugins: {
                legend: {
                    position: "bottom",
                    labels: { boxWidth: 10, padding: 14 }
                },
                tooltip: {
                    callbacks: {
                        label: (item) => ` ${item.label}: $${Number(item.raw).toLocaleString("en-US")}`
                    }
                }
            }
        }
    });
}

/**
 * Barras comparando ingresos vs gastos por propiedad.
 * @param {string} canvasId
 * @param {Array} properties - [{ name, revenue, expenses }, ...]
 */
function renderPropertyComparisonChart(canvasId, properties) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !properties || !properties.length) return;

    new Chart(canvas, {
        type: "bar",
        data: {
            labels: properties.map(p => p.name),
            datasets: [
                {
                    label: "Revenue",
                    data: properties.map(p => p.revenue),
                    backgroundColor: "#38BDF8",
                    borderRadius: 8
                },
                {
                    label: "Expenses",
                    data: properties.map(p => p.expenses),
                    backgroundColor: "#F43F5E",
                    borderRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "bottom", labels: { boxWidth: 10, padding: 14 } }
            },
            scales: {
                y: {
                    grid: { color: "#EFF8FF" },
                    ticks: { callback: (value) => "$" + (value / 1000) + "k" }
                },
                x: { grid: { display: false } }
            }
        }
    });
}
