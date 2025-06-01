const API_KEY = "f9f2e0111adde220cd19be24532a3e28"; // <-- Replace with your own key

document.getElementById('searchForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const city = document.getElementById('cityInput').value.trim();
  if (!city) return;
  document.getElementById('results').innerHTML = 'Loading...';

  try {
    // 1. Get coordinates for city
    const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`);
    const geoData = await geoRes.json();
    if (!geoData[0]) throw new Error('City not found');
    const { lat, lon } = geoData[0];

    // 2. Get air quality data
    const airRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
    const airData = await airRes.json();

    // 3. Get weather data
    const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    const weatherData = await weatherRes.json();

    // 4. Show results
    displayResults(city, airData, weatherData);
    setDynamicBackground(weatherData.weather[0].main.toLowerCase());
  } catch (err) {
    document.getElementById('results').innerHTML = `<div class="result-card">Error: ${err.message}</div>`;
    setDynamicBackground("error");
  }
});

function displayResults(city, airData, weatherData) {
  const aqiNum = airData.list[0].main.aqi;
  const aqiLabels = [
    { label: "Good", class: "good", tip: "Enjoy the fresh air!" },
    { label: "Fair", class: "fair", tip: "Air is okay for most." },
    { label: "Moderate", class: "moderate", tip: "Sensitive people take care." },
    { label: "Poor", class: "poor", tip: "Limit time outside." },
    { label: "Very Poor", class: "very-poor", tip: "Stay indoors!" }
  ];
  const aqi = aqiLabels[aqiNum - 1];

  const components = airData.list[0].components;
  const weatherIconUrl = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`;
  const weatherDesc = weatherData.weather[0].description.replace(/^\w/, c => c.toUpperCase());

  document.getElementById('results').innerHTML = `
    <div class="result-card">
      <img class="weather-icon" src="${weatherIconUrl}" alt="${weatherData.weather[0].main}">
      <h2>${city}</h2>
      <div>
        <strong>Air Quality Index (AQI):</strong>
        <span class="aqi ${aqi.class}">${aqiNum} (${aqi.label})</span>
      </div>
      <div style="font-size:.97em; margin-bottom:0.2em;">Tip: <em>${aqi.tip}</em></div>
      <strong>Pollutants:</strong>
      <ul class="pollutants">
        <li>PM2.5: ${components.pm2_5} μg/m³</li>
        <li>PM10: ${components.pm10} μg/m³</li>
        <li>CO: ${components.co} μg/m³</li>
        <li>NO₂: ${components.no2} μg/m³</li>
        <li>O₃: ${components.o3} μg/m³</li>
      </ul>
      <strong>Weather:</strong><br/>
      <span style="font-size:1.1em">${weatherDesc}</span><br/>
      <span>🌡️ ${weatherData.main.temp} °C &nbsp;&nbsp;💧${weatherData.main.humidity}%</span>
    </div>
  `;
}

function setDynamicBackground(weatherMain) {
  let overlay;
  switch (weatherMain) {
    case "clear":
      overlay = "linear-gradient(135deg, rgba(252, 234, 187, 0.7) 0%, rgba(248, 181, 0, 0.7) 100%)";
      break;
    case "clouds":
      overlay = "linear-gradient(135deg, rgba(207,217,223,0.7) 0%, rgba(226,235,240,0.7) 100%)";
      break;
    case "rain":
    case "drizzle":
      overlay = "linear-gradient(135deg, rgba(215,225,236,0.7) 0%, rgba(161,196,253,0.7) 100%)";
      break;
    case "thunderstorm":
      overlay = "linear-gradient(135deg, rgba(97,97,97,0.7) 0%, rgba(155,197,195,0.7) 100%)";
      break;
    case "snow":
      overlay = "linear-gradient(135deg, rgba(224,234,252,0.7) 0%, rgba(207,222,243,0.7) 100%)";
      break;
    case "error":
      overlay = "linear-gradient(135deg, rgba(255,221,225,0.7) 0%, rgba(238,156,167,0.7) 100%)";
      break;
    default:
      overlay = "linear-gradient(135deg, rgba(137, 247, 254, 0.7) 0%, rgba(102, 166, 255, 0.7) 100%)";
  }
  document.body.style.setProperty('--weather-overlay', overlay);
}
 
