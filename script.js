"use strict";

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
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
  _createDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)}
         workout on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }
}

class WorkOutCyc extends WorkOutCl {
  type = `cycling`;
  constructor(coords, distance, duration, elevGain) {
    super(coords, distance, duration);
    this.elevGain = elevGain;
    this.speed = this.distance / (this.duration / 60);
    this._createDescription();
  }
}
class WorkOutRun extends WorkOutCl {
  type = `running`;
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.pace = this.duration / this.distance;
    this._createDescription();
  }
}

class App {
  #map;
  #mapEvent;
  workouts = [];
  constructor() {
    this._getPosition();
    this._getLocalStorage();
    form.addEventListener(`submit`, this._newWorkout.bind(this));
    inputType.addEventListener(`change`, this._toggleElevationField); // doesn't use this keyword, no need to bind.
    containerWorkouts.addEventListener(`click`, this._moveMapTo.bind(this));
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

    this.#map = L.map("map").setView(coords, 13);

    L.tileLayer("https://tile.openstreetmap.de/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on(`click`, this._showForm.bind(this));
    this.workouts.forEach((d) => {
      this._renderWorkOutMarker(d);
    });
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
        return alert(`Check the inputs! They have to be positive numbers.`);
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
        return alert(`Check the inputs! They have to be positive numbers.`);
      }
      workout = new WorkOutCyc([lat, lng], distance, duration, elevGain);
    }

    this.workouts.push(workout);
    this._renderWorkOutMarker(workout);
    this._renderWorkOut(workout);
    this._hideForm();
    this._setLocalStorage();
  }
  _hideForm() {
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        ``;
    form.style.display = `none `;
    form.classList.add(`hidden`);
    setTimeout(() => (form.style.display = `grid`), 1000);
  }
  _renderWorkOutMarker(workout) {
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
        `${workout.type === `running` ? `🏃‍♂️` : `🚴‍♀️`} ${workout.description}`
      )
      .openPopup();
  }
  _renderWorkOut(workout) {
    const commonHTML = `<li class="workout workout--${workout.type}" data-id=${
      workout.id
    }>
              <div class="header">
          <h2 class="workout__title">${workout.description}</h2>
                    <span class="close-btn">X</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === `running` ? `🏃‍♂️` : `🚴‍♀️`
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>`;

    if (workout.type === `running`) {
      const runHTML = `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.pace.toFixed(2)}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;
      const totalRun = `${commonHTML + runHTML}`;
      form.insertAdjacentHTML(`afterend`, totalRun);
    }
    if (workout.type === `cycling`) {
      const cycHTML = ` <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(2)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevGain.toFixed(2)}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`;

      const totalCyc = `${commonHTML + cycHTML}`;

      form.insertAdjacentHTML(`afterend`, totalCyc);
    }
  }
  _moveMapTo(e) {
    const workOutEl = e.target.closest(`.workout`);

    if (!workOutEl) return;
    const workOutData = this.workouts.find(
      (w) => w.id === workOutEl.dataset.id
    );
    this.#map.setView(workOutData.coords, 13, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
  _setLocalStorage() {
    localStorage.setItem(`workouts`, JSON.stringify(this.workouts));
  }
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem(`workouts`));
    if (!data) return;

    this.workouts = data;
    this.workouts.forEach((w) => {
      this._renderWorkOut(w);
    });
  }
}

const app = new App();
