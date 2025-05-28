"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

let map, mapEvent;

navigator.geolocation?.getCurrentPosition(
  function (position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];

    map = L.map("map").setView(coords, 14);

    L.tileLayer("https://tile.openstreetmap.de/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    map.on(`click`, function (mapE) {
      mapEvent = mapE;
      form.classList.remove(`hidden`);
    });
  },
  function () {
    alert(`Couldn't get your location! Allow me!`);
  }
);

form.addEventListener(`submit`, function (e) {
  e.preventDefault();
  const { lat, lng } = mapEvent.latlng;
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnEscapeKey: false,
        closeButton: false,
        closeOnClick: false,
        className: `running-popup`,
      })
    )
    .setPopupContent(`Running workout on May 28!`)
    .openPopup();
  form.classList.add(`hidden`);
});
