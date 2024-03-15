import React, { useState, useEffect } from "react";
import apiKeys from "./ApiKeys.js";
import Clock from "react-live-clock";
import Forcast from "./Forcast";
import loader from "../images/WeatherIcons.gif";
import ReactAnimatedWeather from "react-animated-weather";

const dateBuilder = (d) => {
  let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  let day = days[d.getDay()];
  let date = d.getDate();
  let month = months[d.getMonth()];
  let year = d.getFullYear();

  return `${day}, ${date} ${month} ${year}`;
};

const defaults = {
  color: "white",
  size: 112,
  animate: true,
};

const CurrentLocation = () => {
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    const getPosition = (options) => {
      return new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });
    };

    const getWeather = async (lat, lon) => {
      try {
        const api_call = await fetch(
          `${apiKeys.base}weather?lat=${lat}&lon=${lon}&units=metric&APPID=${apiKeys.key}`
        );
        const data = await api_call.json();
        const icon = getWeatherIcon(data.weather[0].main);
        setWeatherData({
          city: data.name,
          country: data.sys.country,
          temperatureC: Math.round(data.main.temp),
          main: data.weather[0].main,
          humidity: data.main.humidity,
          icon: icon,
        });
      } catch (error) {
        console.error("Error fetching weather data: ", error);
      }
    };

    const getWeatherIcon = (weatherMain) => {
      switch (weatherMain) {
        case "Haze":
          return "CLEAR_DAY";
        case "Clouds":
          return "CLOUDY";
        case "Rain":
          return "RAIN";
        case "Snow":
          return "SNOW";
        case "Dust":
          return "WIND";
        case "Drizzle":
          return "SLEET";
        case "Fog":
        case "Smoke":
          return "FOG";
        case "Tornado":
          return "WIND";
        default:
          return "CLEAR_DAY";
      }
    };

    if (navigator.geolocation) {
      getPosition()
        .then((position) => {
          getWeather(position.coords.latitude, position.coords.longitude);
        })
        .catch((err) => {
          getWeather(28.67, 77.22); // Default coordinates for New Delhi, India
          alert(
            "You have disabled location service. Allow 'This APP' to access your location. Your current location will be used for calculating Real-time weather."
          );
        });
    } else {
      alert("Geolocation not available");
    }

    const timerID = setInterval(() => {
      getWeather(weatherData.lat, weatherData.lon);
    }, 6000);

    return () => clearInterval(timerID);
  }, [weatherData]);

  return (
    <>
      {weatherData ? (
        <>
          <div className="city">
            <div className="current-loc">
              <div className="title">
                <h2>{weatherData.city}</h2>
                <h3>{weatherData.country}</h3>
              </div>
              <div className="current-location">
                <h5><span class="material-symbols-outlined">
                location_on
                </span>Current Location</h5>
              </div>
            </div>
            <div className="mb-icon">
              <ReactAnimatedWeather
                icon={weatherData.icon}
                color={defaults.color}
                size={defaults.size}
                animate={defaults.animate}
              />
              <p>{weatherData.main}</p>
            </div>
            <div className="date-time">
              <div className="dmy">
                <div id="txt"></div>
                <div className="current-time">
                  <Clock format="HH:mm:ss" interval={1000} ticking={true} />
                </div>
                <div className="current-date">{dateBuilder(new Date())}</div>
              </div>
              <div className="temperature">
                <p>
                  {weatherData.temperatureC}°<span>C</span>
                </p>
              </div>
            </div>
          </div>
          <Forcast icon={weatherData.icon} weather={weatherData.main} />
        </>
      ) : (
        <div className="loading-container">
          <img
            src={loader}
            style={{ width: "50%", WebkitUserDrag: "none" }}
            alt="Loading..."
          />
          <h3 className="loading-text">Detecting your location</h3>
          <h3 className="loading-text">
            Your current location will be displayed on the App and used for
            calculating Real-time weather.
          </h3>
        </div>
      )}
    </>
  );
};

export default CurrentLocation;
