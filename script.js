document.getElementById("check").addEventListener("click", getWeather);

async function getWeather() {
    const apiKey = 'a7f18020b55dd0b0ffc8a649d126a48e';
    const city = document.getElementById("city").value.trim();
    
    if (!city) {
        alert("Please enter a city name.");
        return;
    }

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (response.ok) {
            displayWeather(data);
        } else {
            alert("City not found. Please enter a valid city.");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to fetch weather. Check your internet connection.");
    }
}

function displayWeather(data) {
    document.getElementById("weatherCountry").textContent = data.name;
    document.getElementById("temperature").innerHTML = `${data.main.temp}°<strong>C</strong>`;
    document.getElementById("weatherDescription").textContent = data.weather[0].description;
    document.getElementById("feelsLike").textContent = `Feels Like: ${data.main.feels_like}°C`;
    document.getElementById("humidity").textContent = `Humidity: ${data.main.humidity}%`;
    document.getElementById("longitude").textContent = `Longitude: ${data.coord.lon}`;
    document.getElementById("latitude").textContent = `Latitude: ${data.coord.lat}`;
    
    // Update weather icon dynamically
    const iconCode = data.weather[0].icon;
    document.getElementById("tempIcon").src = `https://openweathermap.org/img/wn/${iconCode}.png`;
}
