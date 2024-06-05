const h1 = document.getElementById("weather-condition")
const h2 = document.getElementById("temperature")
const icon = document.querySelectorAll(".weather-icon")
const forecastDay = document.querySelectorAll(".day")
const forecastTemp = document.querySelectorAll(".temp")
const loc = document.getElementById("city-country")
const time = document.getElementById("time")
const date = document.getElementById('date');
const searchBar = document.getElementById('search-bar');
const suggestionsContainer = document.getElementById('suggestions');
const main = document.querySelector("main")
const header = document.querySelector("header")
let defaultQuery = "Quezon City"
let tempCorF = "C°"
let epoch;
let timezone;
let clockUpdater;

const weekday = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

API_KEY = "f3afea27ad3346fbb0980935240306" //weather app

document.getElementById('toggle-unit').addEventListener('click', async (e) => {
    e.preventDefault();
    let query = searchBar.value;
    if (query === "") query = defaultQuery
    suggestionsContainer.innerHTML = '';
    if (e.target.textContent === "C°") tempCorF = "F°"
    else if (e.target.textContent === "F°" ) tempCorF = "C°"
    e.target.textContent = tempCorF

    await updateWeather(query);
})


document.getElementById('search-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    let query = searchBar.value;
    suggestionsContainer.innerHTML = '';
    await updateWeather(query);
});


async function updateWeather(query) {
    //API Call + have loading screen when API isn't called yet
    showLoading();
    let data = await APIForecastCall(query)
    hideLoading();

    h1.textContent = capitalizeFirstLetter(data.current.condition.text)
    if (tempCorF === "F°") h2.textContent = data.current.temp_f + "F°"
    else if (tempCorF === "C°" ) h2.textContent = data.current.temp_c + "C°"
    
    icon[0].src = data.current.condition.icon
    loc.textContent = data.location.name + ", " + data.location.country

    epoch = data.location.localtime_epoch*1000;
    timezone = data.location.tz_id;
    updateClock();
    if (clockUpdater !== undefined) clearInterval(clockUpdater)
    clockUpdater = setInterval(updateClock, 1000);


    for(let i = 1; i < data.forecast.forecastday.length; i++) {
        let tempDate = new Date(new Date(epoch).toLocaleString("en-US", {timeZone: timezone})).getDay()-1
        icon[i].src = data.forecast.forecastday[i].day.condition.icon
        if (tempDate + i > 6) {
            tempDate = 0
        }
        forecastDay[i-1].textContent = weekday[tempDate + i]
        forecastTemp[i-1].textContent = data.forecast.forecastday[i].day.avgtemp_c + "C°"
        if (tempCorF === "F°") forecastTemp[i-1].textContent = data.forecast.forecastday[i].day.avgtemp_f + "F°"
        else if (tempCorF === "C°" ) forecastTemp[i-1].textContent = data.forecast.forecastday[i].day.avgtemp_c + "C°"
    }

    if (searchBar.value !== "") searchBar.value = loc.textContent
}

//API Calls
async function fetchSuggestions(query) {
    try {
        const response = await fetch(`http://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${query}`);
        const data = await response.json();
        return data;
    } catch (err) {
        console.log("Error: ", err);
    }
}

async function APIForecastCall(query) {
    try {
        const response = await fetch(`http://api.weatherapi.com/v1/forecast.json?q=${query}&key=${API_KEY}&days=4`)
        const data = await response.json()
        return data
    } catch (err) {
        console.log("Error: ", err)
    }
}

//Display for auto-complete in search bar
searchBar.addEventListener('input', async function() {
    let query = searchBar.value;
    if (query.length > 2) { // Fetch suggestions only if input length is more than 2
        let suggestions = await fetchSuggestions(query);
        displaySuggestions(suggestions);
    } else {
        suggestionsContainer.innerHTML = '';
    }
});


function displaySuggestions(suggestions) {
    suggestionsContainer.innerHTML = '';
    suggestions.forEach(suggestion => {
        let suggestionItem = document.createElement('div');
        suggestionItem.classList.add('suggestion-item');
        suggestionItem.textContent = suggestion.name + ", " + suggestion.country;
        suggestionItem.addEventListener('click', async () => {
            searchBar.value = suggestion.name + ", " + suggestion.country;
            suggestionsContainer.innerHTML = '';
            await updateWeather(suggestion.name + ", " + suggestion.country);
        });
        suggestionsContainer.appendChild(suggestionItem);
    });
}

//Real-time clock
function updateClock() {
    localTime = new Date(new Date(epoch+=1000).toLocaleString("en-US", {timeZone: timezone}))

    const hours = localTime.getHours();
    const minutes = String(localTime.getMinutes()).padStart(2, '0');
    const seconds = String(localTime.getSeconds()).padStart(2, '0');

    hours > 12 ? time.textContent = `${String(hours-12).padStart(2, '0')}:${minutes}:${seconds} PM` : time.textContent = `${String(hours).padStart(2, '0')}:${minutes}:${seconds} AM`

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    date.textContent = weekday[localTime.getDay()-1] + ", " + localTime.toLocaleDateString(undefined, options);
}

function capitalizeFirstLetter(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    return splitStr.join(' ');
}

function showLoading() {
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('loading-container').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('loading-container').style.display = 'none';
}

updateWeather(defaultQuery)