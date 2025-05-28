"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
let inputDistance = document.querySelector(".form__input--distance");
let inputDuration = document.querySelector(".form__input--duration");
let inputCadence = document.querySelector(".form__input--cadence");
let inputElevation = document.querySelector(".form__input--elevation");



class App {
    #map;
    #mapEvent;
  constructor() {
    this._getPosition();
    this._showForm();
    this._toggleElevationField();
  }
  _getPosition() {
    navigator.geolocation?.getCurrentPosition(this._loadMap.bind(this), function () {
      alert(`Couldn't get your location! Allow me!`);
    });
  }
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];

    this.#map = L.map("map").setView(coords, 14);

    L.tileLayer("https://tile.openstreetmap.de/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on(`click`, function (mapE) {
      this.#mapEvent = mapE;
      form.classList.remove(`hidden`);
    }.bind(this));
  }
  _showForm() {
    form.addEventListener(`submit`, function (e) {
      e.preventDefault();
      inputDistance.value =
        inputCadence.value =
        inputDuration.value =
        inputElevation.value =
          ``;
      const { lat, lng } = this.#mapEvent.latlng;
      L.marker([lat, lng])
        .addTo(this.#map)
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
    }.bind(this));
  }
  _toggleElevationField() {
    inputType.addEventListener(`change`, function (e) {
      inputCadence.closest(".form__row").classList.toggle(`form__row--hidden`);
      inputElevation
        .closest(".form__row")
        .classList.toggle(`form__row--hidden`);
    });
  }
  _newWorkout() {}
}

const app = new App();

class WorkOutCl {
  constructor(id, workOutName, coords, distance, time, date) {
    this.id = id;
    this.workOutName = workOutName;
    this.coords = coords;
    this.distance = distance;
    this.time = time;
    this.date = date;
  }
}

class WorkOutCyc extends WorkOutCl {
  constructor(coords, distance, time, elevGain) {
    super(workOutName, coords, distance, time);
    this.elevGain = elevGain;
  }
}
class WorkOutRun extends WorkOutCl {
  constructor(coords, distance, time, cadence, pace) {
    super(workOutName, coords, distance, time);
    this.cadence = cadence;
    this.pace = pace;
  }
}
