document.addEventListener("DOMContentLoaded", function() {
    const ctx = document.getElementById('weatherChart').getContext('2d');
    let weatherChart;

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



});
