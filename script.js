document.addEventListener("DOMContentLoaded", function() {
    const searchBtn = document.getElementById("search-btn");
    const cityInput = document.getElementById("city");
    let weatherChart; 

    // 1. DEFAULT LOAD
    fetchWeatherData(51.5074, -0.1278, "London");

    // 2. SEARCH LISTENERS
    searchBtn.addEventListener("click", () => getCityCoordinates());
    cityInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") getCityCoordinates();
    });

    function getCityCoordinates() {
        const cityName = cityInput.value.trim();
        if (!cityName) return;
        const GEO_URL = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`;

        fetch(GEO_URL)
            .then(response => response.json())
            .then(data => {
                if (!data.results) { alert("City not found!"); return; }
                const { latitude, longitude, name, country } = data.results[0];
                fetchWeatherData(latitude, longitude, `${name}, ${country}`);
            })
            .catch(() => alert("Error fetching coordinates."));
    }

    function fetchWeatherData(lat, lon, cityName) {
        const WEATHER_URL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,uv_index,weathercode,is_day&daily=sunrise,sunset&current_weather=true&timezone=auto`;

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

    function updateSidebar(data, cityName) {
        const current = data.current_weather;
        document.getElementById("city-name").innerText = cityName;
        document.getElementById("current-temp").innerText = `${Math.round(current.temperature)}°`;
        
        const now = new Date();
        document.getElementById("date-time").innerText = now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

        const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        document.getElementById("sunrise-time").innerText = formatTime(data.daily.sunrise[0]);
        document.getElementById("sunset-time").innerText = formatTime(data.daily.sunset[0]);

        const iconData = getIconInfo(current.weathercode, current.is_day);
        document.getElementById("condition-text").innerText = iconData.label;
        document.getElementById("weather-icon").src = iconData.imgUrl;
    }

    function updateCards(data) {
        const currentHour = new Date().getHours();
        const hourly = data.hourly;

        const setCard = (id, val, max, unit="") => {
            document.getElementById(`${id}-value`).innerText = `${val}${unit}`;
            const bar = document.getElementById(`${id}-value`).closest('.detail-card').querySelector('.progress-fill');
            if(bar) bar.style.width = `${Math.min((parseFloat(val)/max)*100, 100)}%`;
        };

        setCard("humidity", hourly.relative_humidity_2m[currentHour], 100, "%");
        document.getElementById("humidity-status").innerText = hourly.relative_humidity_2m[currentHour] > 60 ? "Humid" : "Good";

        setCard("uv", hourly.uv_index[currentHour], 11);
        
        document.getElementById("precipitation-value").innerText = hourly.precipitation[currentHour];
        const precipBar = document.getElementById("precipitation-value").closest('.detail-card').querySelector('.progress-fill');
        if(precipBar) precipBar.style.width = `${Math.min((hourly.precipitation[currentHour]/10)*100, 100)}%`;

        setCard("chance", hourly.precipitation_probability[currentHour], 100, "%");

        const temp = hourly.temperature_2m[currentHour];
        const feels = hourly.apparent_temperature[currentHour];
        document.getElementById("feels-value").innerText = `${feels}° C`;
        
        const diff = feels - temp;
        const badge = document.getElementById('diff-badge');
        const valSpan = document.getElementById('diff-val');
        badge.className = 'diff-badge'; 
        
        if (diff > 0.5) {
            badge.classList.add('warmer');
            valSpan.innerText = `${Math.round(diff)}° Warmer`;
        } else if (diff < -0.5) {
            badge.classList.add('cooler');
            valSpan.innerText = `${Math.round(Math.abs(diff))}° Cooler`;
        } else {
            badge.classList.add('same');
            valSpan.innerText = `Accurate`;
        }
    }

    function updateHourlyRow(data) {
        const container = document.getElementById("hourly");
        container.innerHTML = "";
        const currentHour = new Date().getHours();

        for(let i=0; i<7; i++) {
            const index = currentHour + i;
            if(index >= 24) break;
            const temp = Math.round(data.hourly.temperature_2m[index]);
            const code = data.hourly.weathercode[index];
            const isDay = data.hourly.is_day[index];
            
            let icon = "ph-sun";
            if(code > 3) icon = "ph-cloud";
            if(code > 50) icon = "ph-cloud-rain";
            if(!isDay && code <= 3) icon = "ph-moon";

            container.innerHTML += `
                <div class="weather-item">
                    <span class="time">${i===0 ? "Now" : index+":00"}</span>
                    <i class="ph ${icon}"></i>
                    <span class="temp">${temp}°</span>
                </div>`;
        }
    }

    // --- FIXED CHART FUNCTION ---
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
            },
            layout: {
                padding: 10 
            }
        }
        });
    }

    function getIconInfo(code, isDay) {
        const baseUrl = "https://cdn.jsdelivr.net/npm/@bybas/weather-icons@latest/production/fill/all/";
        let name = "clear-day"; 
        let label = "Clear";
        if (code === 0) { name = isDay ? "clear-day" : "clear-night"; label = "Clear Sky"; }
        else if (code <= 3) { name = isDay ? "partly-cloudy-day" : "partly-cloudy-night"; label = "Partly Cloudy"; }
        else if (code <= 48) { name = "fog"; label = "Foggy"; }
        else if (code <= 67) { name = "rain"; label = "Rain"; }
        else if (code <= 77) { name = "snow"; label = "Snow"; }
        else if (code >= 95) { name = "thunderstorms"; label = "Storm"; }
        return { imgUrl: `${baseUrl}${name}.svg`, label: label };
    }
});