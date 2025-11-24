document.addEventListener("DOMContentLoaded", function() {
    const ctx = document.getElementById('weatherChart').getContext('2d');
    

    function initChart(hourlyData) {
        // Destroy existing chart if it exists
        if (weatherChart) weatherChart.destroy();

        // Extract next 8 hours of data
        const currentHour = new Date().getHours();
        const labels = [];
        const dataPoints = [];

        for (let i = 0; i < 8; i++) {
            const hourIndex = currentHour + i;
            if (hourIndex >= 24) break;
            labels.push(i === 0 ? 'Now' : `${hourIndex}:00`);
            dataPoints.push(hourlyData.temperature_2m[hourIndex]);
        }

        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(92, 156, 229, 0.5)');
        gradient.addColorStop(1, 'rgba(92, 156, 229, 0)');

        weatherChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Temperature',
                    data: dataPoints,
                    borderColor: '#5C9CE5',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#5C9CE5',
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    x: { display: false },
                    y: { display: false, min: Math.min(...dataPoints) - 5, max: Math.max(...dataPoints) + 5 }
                },
                layout: {
                    padding: { left: -10, right: -10, bottom: 0 }
                }
            }
        });
    }

    const temp = data.hourly.temperature_2m[currentHour];
const feelsLike = data.hourly.apparent_temperature[currentHour];

// Update Main Number
document.getElementById('feels-like-value').innerText = `${feelsLike}°`;

// Calculate Difference
const diff = feelsLike - temp;
const badge = document.getElementById('diff-badge');
const valSpan = document.getElementById('diff-val');
const iconSpan = document.getElementById('diff-icon');

// Reset classes
badge.className = 'diff-badge'; 

if (diff > 0.5) {
    // Warmer
    badge.classList.add('warmer');
    valSpan.innerText = `${Math.round(diff)}° Warmer`;
    iconSpan.innerText = '▲'; // Up arrow
} else if (diff < -0.5) {
    // Cooler
    badge.classList.add('cooler');
    valSpan.innerText = `${Math.round(Math.abs(diff))}° Cooler`;
    iconSpan.innerText = '▼'; // Down arrow
} else {
    // Same
    badge.classList.add('same');
    valSpan.innerText = `Feels accurate`;
    iconSpan.innerText = '=';
}


})












// // 1. Get UV Index (Ensure your API URL includes 'uv_index')
// const uvIndex = data.hourly.uv_index[currentHour];

// // 2. Update the number
// document.getElementById('uv-value').innerText = uvIndex;

// // 3. Update the Status Text
// const uvStatus = document.getElementById('uv-status');
// if (uvIndex <= 2) uvStatus.innerText = "Low";
// else if (uvIndex <= 5) uvStatus.innerText = "Moderate";
// else if (uvIndex <= 7) uvStatus.innerText = "High";
// else if (uvIndex <= 10) uvStatus.innerText = "Very High";
// else uvStatus.innerText = "Extreme";

// // 4. Update the Progress Bar
// // We map 0-11 to 0-100%. If it's higher than 11, we cap it at 100%.
// const uvPercentage = Math.min((uvIndex / 11) * 100, 100);
// document.getElementById('uv-bar').style.width = `${uvPercentage}%`;



// // --- PRECIPITATION ---
// const precipMm = hourly.precipitation[currentHour];

// // 1. Update Number
// document.getElementById('precipitation-value').innerText = precipMm;
// document.getElementById('precipitation-status').innerText = "mm"; // ensuring unit is correct

// // 2. Update Progress Bar
// // We set 10mm as the "max" for the bar (100% width).
// // Anything above 10mm is extremely heavy rain and stays at 100%.
// const precipPct = Math.min((precipMm / 10) * 100, 100);
// document.getElementById('precipitation-bar').style.width = `${precipPct}%`;