document.addEventListener("DOMContentLoaded", function() {
    const searchBtn = document.getElementById("search-btn");
    const cityInput = document.getElementById("city");
    let weatherChart;

    fetchWeatherData(30.33625, 76.3922, "Patiāla");

    searchBtn.addEventListener("click", () => getCityCoordinates());
    
    cityInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") getCityCoordinates();
    });

// getting lat and long of city
    function getCityCoordinates() {
        const cityName = cityInput.value.trim();
        if (!cityName) return;

        const GEO_URL = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`;

        fetch(GEO_URL)
            .then(response => response.json())
            .then(data =>{
                if (!data.results) {
                    alert("City not found!");
                    return;
                }

                const firstResult = data.results[0]; 
                const latitude = firstResult.latitude;
                const longitude = firstResult.longitude;
                const name = firstResult.name;
                const country = firstResult.country;
                fetchWeatherData(latitude, longitude, `${name}, ${country}`);
            })
            .catch(() => {
                alert("Error fetching coordinates.");
            });
    }

    async function fetchWeatherData(lat, lon, cityName) {
        const WEATHER_URL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset,uv_index_max,weather_code&hourly=temperature_2m,weather_code,is_day,uv_index,precipitation_probability&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,rain,apparent_temperature,is_day,showers,snowfall&timezone=auto&forecast_days=3`;

        const AQI_URL = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`;

        try {
            const [weatherRes, aqiRes] = await Promise.all([
                fetch(WEATHER_URL),
                fetch(AQI_URL)
            ]);

            const weatherData = await weatherRes.json();
            const aqiData = await aqiRes.json();

            // updateTheme(weatherData.current.is_day);
            updateSidebar(weatherData, cityName);
            updateCards(weatherData, aqiData);
            updateHourlyRow(weatherData);
            initChart(weatherData);

        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Failed to load weather data.");
        }
    }


    function updateSidebar(data, cityName) {
        const current = data.current;
        document.getElementById("city-name").innerText = cityName;
        document.getElementById("current-temp").innerText = `${Math.round(current.temperature_2m)}°`;

        const localTime = new Date(current.time); 
        const options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
        document.getElementById("date-time").innerText = localTime.toLocaleDateString('en-US', options);

        // Sunrise and sunset
        const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        document.getElementById("sunrise-time").innerText = formatTime(data.daily.sunrise[0]);
        document.getElementById("sunset-time").innerText = formatTime(data.daily.sunset[0]);

        const iconData = getIconInfo(current.weather_code, current.is_day); 
        document.getElementById("condition-text").innerText = iconData.label;
        document.getElementById("weather-icon").src = iconData.imgUrl;

        document.getElementById("condition-icon").className = `ph ${getPhosphorIcon(current.weather_code, current.is_day)}`;

    }

    function updateCards(weatherData, aqiData) {

        const current = weatherData.current;
        const hourly = weatherData.hourly;
        const currentHour = new Date(current.time).getHours();

        const setCard = (id, val, max, unit="") => {
            const element = document.getElementById(`${id}-value`);
            if (element) {
                element.innerText = `${val}${unit}`;
                const bar = element.closest('.detail-card').querySelector('.progress-fill');
                if(bar) 
                bar.style.width = `${Math.min((parseFloat(val)/max)*100, 100)}%`;
            }
        };

        setCard("humidity", current.relative_humidity_2m, 100, "%");
        document.getElementById("humidity-status").innerText = current.relative_humidity_2m > 60 ? "Humid" : "Good";

        setCard("uv", hourly.uv_index[currentHour], 11);

        document.getElementById("precipitation-value").innerText = current.precipitation;
        const precipBar = document.getElementById("precipitation-bar");
        if(precipBar) precipBar.style.width = `${Math.min((current.precipitation/10)*100, 100)}%`;

        if(aqiData && aqiData.current) {
            const aqi = aqiData.current.us_aqi;
            setCard("aqi", aqi, 300); 
            
            let status = "Good";
            if(aqi > 50) status = "Moderate";
            if(aqi > 100) status = "Unhealthy";
            if(aqi > 200) status = "Severe";
            if(aqi > 300) status = "Hazardous";
            document.getElementById("aqi-status").innerText = status;
        }
        
        const temp = current.temperature_2m;
        const feels = current.apparent_temperature;

        document.getElementById("feels-value").innerText = `${feels}° C`;
        const diff = feels - temp;
        const badge = document.getElementById('diff-badge');
        const valSpan = document.getElementById('diff-val');
        const diff_icon = document.getElementById('diff-icon');
        badge.className = 'diff-badge';
        if (diff > 0.5) {
            badge.classList.add('warmer');
            diff_icon.innerText = "▲";
            valSpan.innerText = `${Math.round(diff)}° Warmer`;
        } else if (diff < -0.5) {
            badge.classList.add('cooler');
            diff_icon.innerText = "▼";
            valSpan.innerText = `${Math.round(Math.abs(diff))}° Cooler`;
        } else {
            badge.classList.add('same');
            diff_icon.innerText = "=";
            valSpan.innerText = `Accurate`;
        }

        const chance = hourly.precipitation_probability ? hourly.precipitation_probability[currentHour] : 0;
        setCard("chance", chance, 100, "%");

    }

    function updateHourlyRow(data) {
        const container = document.getElementById("hourly");
        container.innerHTML = "";

        const currentHour = new Date(data.current.time).getHours();
        for(let i=0; i<7; i++) {
            const index = currentHour + i;
            if(index >= data.hourly.time.length) 
                break;
            const temp = Math.round(data.hourly.temperature_2m[index]);
            const code = data.hourly.weather_code[index];
            const isDay = data.hourly.is_day[index];
            

            const iconClass = getPhosphorIcon(code, isDay);

            container.innerHTML += `
                <div class="weather-item">
                    <span class="time">${i===0 ? "Now" : (index % 24) + ":00"}</span>
                    <i class="ph ${iconClass}"></i>
                    <span class="temp">${temp}°</span>
                </div>`;
        }

    }

    function initChart(data) {
        const ctx = document.getElementById('weatherChart').getContext('2d');
        if (weatherChart) weatherChart.destroy();

        const currentHour = new Date(data.current.time).getHours();

        const labels = [];
        const dataPoints = [];

        for (let i = 0; i < 8; i++) {
            const index = currentHour + i;
            if(index >= data.hourly.time.length) break;
            
            // Add label (e.g., "Now", "14:00") and data point
            labels.push(i === 0 ? 'Now' : `${index % 24}:00`);
            dataPoints.push(data.hourly.temperature_2m[index]);
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
                    y: { 
                        display: false,
                        min: Math.min(...dataPoints) - 2, 
                        max: Math.max(...dataPoints) + 2 
                    }
                },
                layout: { padding: 10 }
            }
        });
    }

    function getIconInfo(code, isDay) {
        const baseUrl = "https://cdn.jsdelivr.net/npm/@bybas/weather-icons@latest/production/fill/all/";
        let name = "clear-day"; 
        let label = "Clear";
        
        if (code === 0) { 
            name = isDay ? "clear-day" : "clear-night"; 
            label = "Clear Sky"; 
        } else if (code < 3) { 
            name = isDay ? "partly-cloudy-day" : "partly-cloudy-night"; 
            label = "Partly Cloudy"; 

        }else if (code == 3){
            name = isDay ? "overcast-day" : "overcast";
            label = "Overcast"
        }
         else if (code <= 48) { 
            name = isDay ? "partly-cloudy-day-fog":"partly-cloudy-night-fog"; 
            label = "Foggy"; 
        } else if (code <= 67) { 
            name = "rain"; 
            label = "Rain"; 
        } else if (code <= 77) { 
            name = "snow"; 
            label = "Snow"; 
        } else if (code >= 95) { 
            name = "thunderstorms"; 
            label = "Storm"; 
        }
        
        return { imgUrl: `${baseUrl}${name}.svg`, label: label };
    }

    function getPhosphorIcon(code, isDay) { 

        let icon = isDay ? "ph-sun" : "ph-moon";
        if (code <= 1) icon = isDay ? "ph-sun":"ph-moon";
        else if (code === 2) icon = isDay ? "ph-cloud-sun" : "ph-cloud-moon";
        else if (code === 3) icon = "ph-cloud";
        else if (code <= 48) icon = "ph-cloud-fog";
        else if (code <= 67) icon = "ph-cloud-rain";
        else if (code <= 77) icon = "ph-cloud-snow";
        else if (code >= 96) icon = "ph-cloud-lightning";
        return icon;
    }


});