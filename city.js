// require the node fetch module
const fetch = require("node-fetch");
// save the headers for the geodb-cities api and weather api
// these headers will be sent with each api request and it connects the api to the project
const cityOptions = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': 'c2707099acmshd0b067686c0f807p1658e3jsn542d51185262',
        'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
    }
};

const weatherOptions = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': 'c2707099acmshd0b067686c0f807p1658e3jsn542d51185262',
    'X-RapidAPI-Host': 'weatherbit-v1-mashape.p.rapidapi.com'
  }
};
// ask user to input a city in South Africa, this input can be change from Cape Town
let userInput = "Cape Town";

// take the user input remove any spaces from the end and beginning of the string and split into an array
let userInputArray = userInput.trim().split("");
// if the input array contains a value of " ", get the index of that value, 
// replace it with %20, finally join the array back to a string
if(userInputArray.includes(" ")) {
    let index = userInputArray.indexOf(" ");
    userInputArray[index] = "%20";
    userInput = userInputArray.join("");
    // else leave the array unchanged and join it back to a string
} else {
    userInput = userInputArray.join("");
}

// use that user input to build the url
let cityUrl = "https://wft-geo-db.p.rapidapi.com/v1/geo/cities?countryIds=ZA&namePrefix=" + userInput + "&types=CITY";

// Note: GeoDb API only allows for one request per second. The way I solved the task is by requesting data 
// based on the city name. Once that data was collected it contains the id of that specific city.
// That id is used to request data about that city´s population, elevation and coordinates. The Geodb Cities and Geodb 
// City Details endpoints are used. Thus there is the possibility the two requests are made at the same time, while 
// the free subscription plan only allows for one request at a time. To solve this issue I added a delay of 2 seconds 
// between the two requests.

// create an async function to get the details about the city
async function getCityDetails() {
    // fetch data from cities endpoint geodb, wait for the response and save it in city variable
    let city = await fetch(cityUrl, cityOptions);
    // convert the response to JS Object
    let dataCity = await city.json();
    // get hold of the city id and save it in a variable
    let cityId = dataCity.data[0].id; 
    // Output the city id to the console
    console.log(`City ID: ${cityId}`);
   
    // build the url for the city details endpoint using the previously received id
    const cityDetailsUrl = "https://wft-geo-db.p.rapidapi.com/v1/geo/cities/" + cityId;
    // create a 2 second delay before fetching data from city details
    // this delay was only created for the purpose of this task, and is said is generally not advised 
    // create a function called delay that takes the miliseconds to delay as parameter, and call the function
    const delay = ms => new Promise(res => setTimeout(res, ms));
    await delay(2000);
    // fetch data from the city details endpoint geodb, wait for the response and save it in a variable
    let cityDetails = await fetch(cityDetailsUrl, cityOptions);
    // convert the response to JS Object
    let cityMetrics = await cityDetails.json();
    // in case the response failed and we get an object with an error message, wait further 4 seconds before trying
    // to fetch the data from city details again. Process is same as above
    if (cityMetrics.message){
        await delay(4000);
        cityDetails = await fetch(cityDetailsUrl, cityOptions);
        cityMetrics = await cityDetails.json();
    }
    // get hold of population, elevation metrics and location coordinates, and save them in variables
    let cityPopulation = cityMetrics.data.population;
    let cityElevation = cityMetrics.data.elevationMeters;
    let latitude = cityMetrics.data.latitude;
    let longitude = cityMetrics.data.longitude;
    // output the population and elevation to the console
    console.log(`City Population: ${cityPopulation}`);
    console.log(`City Elevation: ${cityElevation}`);

    // build the url for the weather api, using the location coordinates previously received
    const weatherUrl = "https://weatherbit-v1-mashape.p.rapidapi.com/forecast/3hourly?lat=" + latitude + "&lon=" + longitude;

    // fetch data from the weather api, wait for response and save it in a variable
    let weather = await fetch(weatherUrl, weatherOptions);
    // convert the response to JS Object
    let cityWeather = await weather.json();
    // get hold of the temperature value
    let temperature = cityWeather.data[0].temp;
    // output the temperature to the console
    console.log(`Current temperature: ${temperature}`);
}

// create an async function called run
// try running the getCityDetails function, and wait until it executed
// if there are any errors while running the function output that error to the console
async function run() {
    try {
        await getCityDetails();
    } catch (e) {
        console.log(e);
    }
}

// call the function run, this function will then call the getCityDetails function
run();
