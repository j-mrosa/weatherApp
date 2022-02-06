document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    //event listeners
    document.querySelector(".currentLocBtn").addEventListener("click", getDeviceCoordinates);
    document.querySelector(".coordinatesBtn").addEventListener("click", getInputCoordinates);
    document.querySelector(".backBtn").addEventListener("click", togglePanels);
}

//function that gets the location using the device geolocation
function getDeviceCoordinates(){
    let options = {
        maximumAge: 3000,
        timeout: 6000,
        enableHighAccuracy: true
    }
    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
}

//callback function for geolocation
function onSuccess(position){
    let lat = position.coords.latitude;
    let long = position.coords.longitude;
    getLocation(lat,long);
}

//callback function for geolocation
function onError(error){
    alert(`code: ${error.code} \n\n message: ${error.message}`);
}

//function that get coordinates entered by user
function getInputCoordinates(){
    let lat = document.querySelector(".latInput").value;
    let long = document.querySelector(".longInput").value;
    getLocation(lat,long);
}


//function that alternate between screens
function togglePanels(){
    //toggle hide class
    document.querySelector(".coordinatesContainer").classList.toggle("hide");
    document.querySelector(".weatherContainer").classList.toggle("hide");

    //chages background depending if daytime/nighttime
    changeBackground();
}

//API call to get the location info
async function getLocation(lat, long){
    //use lat/long to make a call to the API
    let url = `https://secure.geonames.org/timezoneJSON?lat=${lat}&lng=${long}&username=j.mrosa`;

    try {
        let resp = await fetch(url); //resp is a promise
        let locationData = await resp.json();
        getWeather(lat, long, locationData);

    } catch (error) {
        console.log(`An error occurred: ${error}`);
        alert(`An error occurred: ${error}`);
    }
}

//API call to get the weather info
async function getWeather(lat, long, locationData){
    console.log(lat )
    console.log(long)
    //use lat/long to make a call to the API
    let url = `https://secure.geonames.org/findNearByWeatherJSON?lat=${lat}&lng=${long}&username=j.mrosa`;
    /* http://api.geonames.org/findNearByWeatherJSON?lat=45.285376&lng=-65.994752&username=j.mrosa */

    try {
        let resp = await fetch(url); //resp is a promise
        let weatherData = await resp.json();
        displayWeather(locationData, weatherData);
    } catch (error) {
        console.log(`An error occurred: ${error}`);
        alert(`An error occurred: ${error}`);
    }
}

//function that displays weather and location info
function displayWeather(locationData, weatherData){
    togglePanels(); 

    let timeNum = getTimeNum(locationData.time);
    let sunriseNum = getTimeNum(locationData.sunrise);
    let sunsetNum = getTimeNum(locationData.sunset);

    //change background
    changeBackground(timeNum, sunriseNum, sunsetNum);

    //display information
    document.querySelector(".locName").innerHTML = weatherData.weatherObservation.stationName + ", " + locationData.countryName;    
    document.querySelector(".time").innerHTML = convertToAmPm(timeNum);   
    document.querySelector(".temp").innerHTML = weatherData.weatherObservation.temperature + "&#8451";    
    document.querySelector(".clouds").innerHTML = weatherData.weatherObservation.clouds;    
    document.querySelector(".condition").innerHTML = weatherData.weatherObservation.weatherCondition;    
}

//function that changes background depending on the time in relation to sunrise/sunset
function changeBackground(time, sunrise, sunset){
    let html = document.querySelector("html");

    //check if time is between sunrise and sunset
    //time goes from 0 to 2359
    if (time>sunrise && time<=sunset) {
        //adds day background
        html.classList.add("day");
        html.classList.remove("night");
    } else if(time<=sunrise || time>sunset){
        //adds night background
        html.classList.add("night");
        html.classList.remove("day");
    } else{
        //if no parameters, remove day/night backgrounds - back to initial background
        html.classList.remove("night");
        html.classList.remove("day");
    }
}

//function that converts time to AM/PM format
//param: time in number format ( e.g. 08:24 --> 824)
//reurns a string in format "nn:nn PM" (e.g 10:32 AM)
function convertToAmPm(timeNum){
    //declare variable to store if time is AM or PM
    let amPm = "";

    //assign value to amPm variable, depending on the time of the day
    // 0 - 1159 = am
    if (timeNum <= 1159) {
        amPm = "AM";
    } else {//1200 - 2400 = pm
        amPm = "PM";
        //if PM && after 13:00, change hour - decrease 12
        if(timeNum > 1259){
            timeNum -= 1200;
        } 
    }

    //convert time in number format to string
    let timeStr = timeNum.toString();
    
    //add leading zeroes
    if (timeStr.length < 4) {
        timeStr = timeNum.toString().padStart(4, "0");
    }

    //returns a string in the correct format 
    return `${timeStr.substr(0,2)}:${timeStr.substr(2,2)} ${amPm}`;
}

//function that extracts the time portion of ttimestamp and converts to string
function getTimeNum(timestamp){
    return +timestamp.substr(11).replace(":", "");
}