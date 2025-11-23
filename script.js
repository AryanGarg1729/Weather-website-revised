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



})












// ... inside your data fetch function ...
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
