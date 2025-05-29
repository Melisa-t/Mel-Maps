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

class WorkOutCl {
  date = new Date();
  id = (Date.now() + ``).slice(-10);
  constructor(coords, distance, time) {
    this.coords = coords;
    this.distance = distance;
    this.time = time;
  }
}

class WorkOutCyc extends WorkOutCl {
  type = `cycling`;
  constructor(coords, distance, time, elevGain) {
    super(coords, distance, time);
    this.elevGain = elevGain;
    this.speed = this.distance / (this.time / 60);
  }
}
class WorkOutRun extends WorkOutCl {
  type = `running`;
  constructor(coords, distance, time, cadence) {
    super(coords, distance, time);
    this.cadence = cadence;
    this.pace = this.time / this.distance;
  }
}

class App {
  #map;
  #mapEvent;
  workouts = [];
  constructor() {
    this._getPosition();
    form.addEventListener(`submit`, this._newWorkout.bind(this));
    inputType.addEventListener(`change`, this._toggleElevationField); // doesn't use this keyword, no need to bind.
  }
  _getPosition() {
    navigator.geolocation?.getCurrentPosition(
      this._loadMap.bind(this),
      function () {
        alert(`Couldn't get your location! Allow me!`);
      }
    );
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

    this.#map.on(`click`, this._showForm.bind(this));
  }
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove(`hidden`);
  }
  _toggleElevationField() {
    inputCadence.closest(".form__row").classList.toggle(`form__row--hidden`);
    inputElevation.closest(".form__row").classList.toggle(`form__row--hidden`);
  }
  _newWorkout(e) {
    e.preventDefault();

    const inputValidation = (...input) =>
      input.every((i) => Number.isFinite(i));
    const inputPositives = (...input) => input.every((i) => i > 0);
    let workout;
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    /// for running
    if (type === `running`) {
      const cadence = +inputCadence.value;

      if (
        !inputValidation(distance, duration, cadence) ||
        !inputPositives(distance, duration, cadence)
      ) {
        return alert(`bbb Check the inputs! They have to be positive numbers.`);
      }
      workout = new WorkOutRun([lat, lng], distance, duration, cadence);
    }

    ///for cycling
    if (type === `cycling`) {
      const elevGain = +inputElevation.value;

      if (
        !inputValidation(distance, duration, elevGain) ||
        !inputPositives(distance, duration)
      ) {
        return alert(
          ` aaaa Check the inputs! They have to be positive numbers.`
        );
      }
      workout = new WorkOutCyc([lat, lng], distance, duration, elevGain);
    }

    this.workouts.push(workout);
    this.renderWorkOutMarket(workout);

    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        ``;

    form.classList.add(`hidden`);
  }

  renderWorkOutMarket(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnEscapeKey: false,
          closeButton: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type.replace(
          `${workout.type[0]}`,
          `${workout.type[0].toUpperCase()}`
        )} workout on ${
          months[workout.date.getMonth()]
        } ${workout.date.getDate()}!`
      )
      .openPopup();
  }
}

const app = new App();
