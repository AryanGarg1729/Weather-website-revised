// document.addEventListener("DOMContentLoaded", function() {
//     const ctx = document.getElementById('weatherChart').getContext('2d');
    

//     function initChart(hourlyData) {
//         // Destroy existing chart if it exists
//         if (weatherChart) weatherChart.destroy();

//         // Extract next 8 hours of data
//         const currentHour = new Date().getHours();
//         const labels = [];
//         const dataPoints = [];

//         for (let i = 0; i < 8; i++) {
//             const hourIndex = currentHour + i;
//             if (hourIndex >= 24) break;
//             labels.push(i === 0 ? 'Now' : `${hourIndex}:00`);
//             dataPoints.push(hourlyData.temperature_2m[hourIndex]);
//         }

//         const gradient = ctx.createLinearGradient(0, 0, 0, 200);
//         gradient.addColorStop(0, 'rgba(92, 156, 229, 0.5)');
//         gradient.addColorStop(1, 'rgba(92, 156, 229, 0)');

//         weatherChart = new Chart(ctx, {
//             type: 'line',
//             data: {
//                 labels: labels,
//                 datasets: [{
//                     label: 'Temperature',
//                     data: dataPoints,
//                     borderColor: '#5C9CE5',
//                     backgroundColor: gradient,
//                     borderWidth: 2,
//                     pointBackgroundColor: '#fff',
//                     pointBorderColor: '#5C9CE5',
//                     pointRadius: 0,
//                     pointHoverRadius: 4,
//                     fill: true,
//                     tension: 0.4
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 plugins: {
//                     legend: { display: false },
//                     tooltip: {
//                         enabled: true,
//                         mode: 'index',
//                         intersect: false,
//                     }
//                 },
//                 scales: {
//                     x: { display: false },
//                     y: { display: false, min: Math.min(...dataPoints) - 5, max: Math.max(...dataPoints) + 5 }
//                 },
//                 layout: {
//                     padding: { left: -10, right: -10, bottom: 0 }
//                 }
//             }
//         });
//     }

//     const temp = data.hourly.temperature_2m[currentHour];
// const feelsLike = data.hourly.apparent_temperature[currentHour];

// // Update Main Number
// document.getElementById('feels-like-value').innerText = `${feelsLike}°`;

// // Calculate Difference
// const diff = feelsLike - temp;
// const badge = document.getElementById('diff-badge');
// const valSpan = document.getElementById('diff-val');
// const iconSpan = document.getElementById('diff-icon');

// // Reset classes
// badge.className = 'diff-badge'; 

// if (diff > 0.5) {
//     // Warmer
//     badge.classList.add('warmer');
//     valSpan.innerText = `${Math.round(diff)}° Warmer`;
//     iconSpan.innerText = '▲'; // Up arrow
// } else if (diff < -0.5) {
//     // Cooler
//     badge.classList.add('cooler');
//     valSpan.innerText = `${Math.round(Math.abs(diff))}° Cooler`;
//     iconSpan.innerText = '▼'; // Down arrow
// } else {
//     // Same
//     badge.classList.add('same');
//     valSpan.innerText = `Feels accurate`;
//     iconSpan.innerText = '=';
// }


// })












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








document.addEventListener("DOMContentLoaded", function() {
    const apiKey = ""; // Open-Meteo is free and needs no key!
    const searchBtn = document.getElementById("search-btn");
    const cityInput = document.getElementById("city");
    let weatherChart; // Store chart instance to destroy it later

    // 1. DEFAULT LOAD (Loads London on startup)
    fetchWeatherData(51.5074, -0.1278, "London");

    // 2. SEARCH EVENT LISTENERS
    searchBtn.addEventListener("click", () => getCityCoordinates());
    cityInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") getCityCoordinates();
    });

    // 3. GET COORDINATES FROM CITY NAME (Geocoding)
    function getCityCoordinates() {
        const cityName = cityInput.value.trim();
        if (!cityName) return;

        const GEO_URL = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`;

        fetch(GEO_URL)
            .then(response => response.json())
            .then(data => {
                if (!data.results) {
                    alert(`City "${cityName}" not found!`);
                    return;
                }
                const { latitude, longitude, name, country } = data.results[0];
                fetchWeatherData(latitude, longitude, `${name}, ${country}`);
            })
            .catch(() => alert("An error occurred while fetching coordinates."));
    }

    // 4. FETCH WEATHER DATA
    function fetchWeatherData(lat, lon, cityName) {
        // We fetch: Temp, Humidity, Feels Like, Rain Chance, UV, Weather Code, Wind, Sunrise/set
        const WEATHER_URL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,uv_index,weathercode,is_day&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto`;

        fetch(WEATHER_URL)
            .then(response => response.json())
            .then(data => {
                updateSidebar(data, cityName);
                updateCards(data);
                updateHourlyRow(data);
                initChart(data.hourly);
            })
            .catch(error => console.error("Error fetching weather:", error));
    }

    // 5. UPDATE SIDEBAR (Big Icon, Date, Temp)
    function updateSidebar(data, cityName) {
        const current = data.current_weather;
        const daily = data.daily;
        
        // Basic Info
        document.getElementById("city-name").innerText = cityName;
        document.getElementById("current-temp").innerText = `${Math.round(current.temperature)}°`;
        
        // Date
        const now = new Date();
        const options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
        document.getElementById("date-time").innerText = now.toLocaleDateString('en-US', options);

        // Sun Times (Format: 2023-10-20T06:30 -> 06:30 AM)
        const formatTime = (isoString) => {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };
        document.getElementById("sunrise-time").innerText = formatTime(daily.sunrise[0]);
        document.getElementById("sunset-time").innerText = formatTime(daily.sunset[0]);

        // Big Icon & Condition Text
        const code = current.weathercode;
        const isDay = current.is_day; // 1 = Day, 0 = Night
        const iconData = getIconInfo(code, isDay);
        
        document.getElementById("condition-text").innerText = iconData.label;
        document.getElementById("weather-icon").src = iconData.imgUrl;
    }

    // 6. UPDATE CARDS (Humidity, UV, etc.)
    function updateCards(data) {
        const currentHour = new Date().getHours();
        const hourly = data.hourly;

        // Helper to update value + progress bar width
        const updateCard = (valId, barId, value, maxVal, unit = "") => {
            document.getElementById(valId).innerText = `${value}${unit}`;
            // Find the progress fill div relative to the value span
            const card = document.getElementById(valId).closest('.detail-card');
            const bar = card.querySelector('.progress-fill');
            if(bar) bar.style.width = `${Math.min((value / maxVal) * 100, 100)}%`;
        };

        // Humidity
        const hum = hourly.relative_humidity_2m[currentHour];
        updateCard("humidity-value", null, hum, 100, "%");
        document.getElementById("humidity-status").innerText = hum > 60 ? "Humid" : "Good";

        // UV Index
        const uv = hourly.uv_index[currentHour];
        updateCard("uv-value", null, uv, 11, "");
        const uvStatus = document.getElementById("uv-status");
        if(uv <= 2) uvStatus.innerText = "Low";
        else if(uv <= 5) uvStatus.innerText = "Moderate";
        else if(uv <= 7) uvStatus.innerText = "High";
        else uvStatus.innerText = "Extreme";

        // Precipitation
        const precip = hourly.precipitation[currentHour];
        updateCard("precipitation-value", null, precip, 10); // Max 10mm
        
        // Chance of Rain
        const rainChance = hourly.precipitation_probability[currentHour];
        updateCard("chance-value", null, rainChance, 100, "%");

        // Feels Like (Logic for badge)
        const temp = hourly.temperature_2m[currentHour];
        const feels = hourly.apparent_temperature[currentHour];
        document.getElementById("feels-value").innerText = `${feels}° C`;
        
        const diff = feels - temp;
        const badge = document.getElementById('diff-badge');
        const valSpan = document.getElementById('diff-val');
        const iconSpan = document.getElementById('diff-icon');
        
        badge.className = 'diff-badge'; // Reset
        if (diff > 0.5) {
            badge.classList.add('warmer');
            valSpan.innerText = `${Math.round(diff)}° Warmer`;
            iconSpan.innerText = '▲';
        } else if (diff < -0.5) {
            badge.classList.add('cooler');
            valSpan.innerText = `${Math.round(Math.abs(diff))}° Cooler`;
            iconSpan.innerText = '▼';
        } else {
            badge.classList.add('same');
            valSpan.innerText = `Feels accurate`;
            iconSpan.innerText = '=';
        }
    }

    // 7. UPDATE HOURLY ROW (Small Icons)
    function updateHourlyRow(data) {
        const hourlyContainer = document.getElementById("hourly");
        hourlyContainer.innerHTML = ""; // Clear existing static items
        
        const currentHour = new Date().getHours();
        
        for (let i = 0; i < 7; i++) {
            const index = currentHour + i;
            const temp = Math.round(data.hourly.temperature_2m[index]);
            const code = data.hourly.weathercode[index];
            const isDay = data.hourly.is_day[index];
            const time = i === 0 ? "Now" : `${index}:00`;
            
            // Get Phosphor Icon Class (simple version)
            let iconClass = "ph-sun";
            if(code > 3) iconClass = "ph-cloud";
            if(code > 45) iconClass = "ph-cloud-fog";
            if(code > 50) iconClass = "ph-cloud-rain";
            if(code > 70) iconClass = "ph-snowflake";
            if(!isDay && code <= 3) iconClass = "ph-moon";

            const itemHTML = `
                <div class="weather-item">
                    <span class="time">${time}</span>
                    <i class="ph ${iconClass}"></i>
                    <span class="temp">${temp}°</span>
                </div>
            `;
            hourlyContainer.innerHTML += itemHTML;
        }
    }

    // 8. CHART FUNCTION
    function initChart(hourlyData) {
        const ctx = document.getElementById('weatherChart').getContext('2d');
        if (weatherChart) weatherChart.destroy();

        const currentHour = new Date().getHours();
        const labels = [];
        const dataPoints = [];

        for (let i = 0; i < 8; i++) {
            const index = currentHour + i;
            labels.push(i === 0 ? 'Now' : `${index}:00`);
            dataPoints.push(hourlyData.temperature_2m[index]);
        }

        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(92, 156, 229, 0.5)');
        gradient.addColorStop(1, 'rgba(92, 156, 229, 0)');

        weatherChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    data: dataPoints,
                    borderColor: '#5C9CE5',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#5C9CE5',
                    pointRadius: 4,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: false },
                    y: { display: false, min: Math.min(...dataPoints) - 5, max: Math.max(...dataPoints) + 5 }
                }
            }
        });
    }

    // 9. HELPER: WMO Code to Animated Icon URL
    function getIconInfo(code, isDay) {
        const baseUrl = "https://cdn.jsdelivr.net/npm/@bybas/weather-icons@latest/production/fill/all/";
        let name = "clear-day";
        let label = "Clear";

        if (code === 0) {
            name = isDay ? "clear-day" : "clear-night";
            label = "Clear Sky";
        } else if (code <= 3) {
            name = isDay ? "partly-cloudy-day" : "partly-cloudy-night";
            label = "Partly Cloudy";
        } else if (code <= 48) {
            name = "fog";
            label = "Foggy";
        } else if (code <= 67) {
            name = "rain";
            label = "Rain";
        } else if (code <= 77) {
            name = "snow";
            label = "Snow";
        } else if (code >= 95) {
            name = "thunderstorms";
            label = "Thunderstorm";
        }

        return { imgUrl: `${baseUrl}${name}.svg`, label: label };
    }
});