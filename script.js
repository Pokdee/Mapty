'use strict';

// prettier-ignore

//Functions

const popupClass = function (a,b) {
  if (inputCadence.closest('.form__row').classList.contains('form__row--hidden')) return a
  if (inputElevation.closest('.form__row').classList.contains('form__row--hidden')) return b
}

//////////////////
//Classsssssssssssssses

class Workout {
  date = new Date();
  id = (Date.now(this.date) + '').slice(-6);

  constructor(croods, distance, duration) {
    this.croods = croods;
    this.distance = distance;
    this.duration = duration;
  }
}

///////////////////

class Running extends Workout {
  type = 'running';

  constructor(croods, distance, duration, cadence) {
    super(croods, distance, duration);
    this.cadence = cadence;
    this.calcpace();
  }
  calcpace() {
    this.pace = (this.duration / this.distance).toFixed(1);
  }
}

//////////////////////////

class Cycling extends Workout {
  type = 'cycling';

  constructor(croods, distance, duration, elevation) {
    super(croods, distance, duration);
    this.elevation = elevation;
    this.calcspeed();
  }
  calcspeed() {
    this.speed = (this.distance / this.duration).toFixed(1);
  }
}

//////////////

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const allworkoutDelete = document.querySelector('.workall_delete');

class App {
  #map;
  #mapEvent;
  #workOUT = [];
  #workOutId;
  #zoom = 15;
  #key = false;

  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    this._idReader();
    this._deleteWorkout();
    containerWorkouts.addEventListener('click', e => this._editWorkout(e));

    // allworkoutDelete.addEventListener(
    //   'click' , () => this._mapreload()
    // )
  }

  _getPosition() {
    navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () => {
      alert('Access denine');
    });
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const longitude = position.coords.longitude;
    const cood = [latitude, longitude];
    this.#map = L.map('map').setView(cood, this.#zoom);

    this._LoadStorePosition();
    // this._allWorkdelete() ;

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', mapE => {
      this._showForm(mapE);
    });
    this._toggleElevationField();
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputType.addEventListener('change', () => {
      inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
      inputElevation
        .closest('.form__row')
        .classList.toggle('form__row--hidden');
    });
  }

  validInput(...input) {
    return input.every(int => Number.isFinite(int));
  }

  allPositive(...input) {
    return input.every(int => int > 0);
  }

  _validNposi(d, t, c, boo = true) {
    if (boo) {
      if (this.validInput(d, t, c) && this.allPositive(d, t, c)) {
        //return false
        return true;
        return;
      }
    }
    if (!boo) {
      if (this.validInput(d, t, c)) {
        return true;
        return;
      }
    }
  }

  _newWorkout(e) {
    e.preventDefault();

    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const type = inputType.value;
    const mark = [this.#mapEvent.latlng.lat, this.#mapEvent.latlng.lng];

    let workout;

    //check type for running

    if (type === 'running') {
      const cadence = +inputCadence.value;

      // validate input
      if (
        !this.validInput(distance, duration, cadence) ||
        !this.allPositive(distance, duration, cadence)
      ) {
        alert('please input valid number');

        return;
      }

      workout = new Running(mark, distance, duration, cadence);
      this.#workOUT.push(workout);
    }

    //check type for cycling
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      // validate input
      if (!this.validInput(distance, duration, elevation)) {
        alert('please input valid number');

        return;
      }

      workout = new Cycling(mark, distance, duration, elevation);
      this.#workOUT.push(workout);

      localStorage.setItem('workout', this.#workOUT);
    }

    this._addMapMarker(workout);
    // this._allWorkdelete();
    this._setStorage();

    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    form.classList.add('hidden');
  }

  _addMapMarker(workout) {
    const monthNum = workout.date.getMonth();
    const date = workout.date.getDate();
    L.marker(workout.croods)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: '200',
          minWidth: '100',
          maxHeight: '80',
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(`${workout.type} on ${months[monthNum]} ${date}`)
      .openPopup();

    form.insertAdjacentHTML('afterend', this._insertHtml(workout));

    //workoutdelete select after it exist
  } ////mapmarker

  _insertHtml(workout) {
    const monthNum = workout.date.getMonth();
    const date = workout.date.getDate();

    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
    <button class="edit">Edit</button>
    <button class="done hidden">Done</button>
    <button class="removework">Remove</button>
    <h2 class="workout__title">${workout.type} on ${
      months[monthNum]
    } ${date}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === 'running' ? '🏃‍♂️' : '🚴‍♂️'
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>
    `;

    if (workout.type === 'running') {
      html += `

       <div class="workout__details">
       <span class="workout__icon">⚡️</span>
       <span class="workout__value">${workout.cadence}</span>
       <span class="workout__unit">min/km</span>
     </div>
     <div class="workout__details">
       <span class="workout__icon">🦶🏼</span>
       <span class="workout__value">${workout.pace}</span>
       <span class="workout__unit">spm</span>
     </div>
     </li>
       
       `;
    }

    if (workout.type === 'cycling') {
      html += `
     
     <div class="workout__details">
     <span class="workout__icon">⚡️</span>
     <span class="workout__value">${workout.elevation}</span>
     <span class="workout__unit">km/h</span>
   </div>
   <div class="workout__details">
     <span class="workout__icon">⛰</span>
     <span class="workout__value">${workout.speed}</span>
     <span class="workout__unit">m</span>
   </div>
   </li>
     
     `;
    }
    return html;
  } //inserthtml

  _idReader() {
    containerWorkouts.addEventListener('click', e => {
      let workOutcrd;

      if (e.target.closest('.workout')) {
        this.#workOutId = e.target.closest('.workout').dataset.id;

        const wId = this.#workOutId;

        workOutcrd = this.#workOUT.find(w => w.id === wId);

        this.#map.setView(workOutcrd.croods, this.#zoom, {
          Animate: true,
          pan: {
            duration: 0.5,
          },
        });
      }
    });
  } //idreader

  _setStorage() {
    localStorage.setItem('workout', JSON.stringify(this.#workOUT));
  }

  _LoadStorePosition() {
    if (!localStorage.getItem('workout')) return;

    const workouts = JSON.parse(localStorage.getItem('workout'));
    workouts.forEach(obj => {
      obj.date = new Date(obj.date);
      this._addMapMarker(obj);
      this._insertHtml(obj);
      this.#workOUT.push(obj);
    });
  }

  _mapreload = function () {
    localStorage.removeItem('workout');
    location.reload();
  };

  // _allWorkdelete(){
  //   if (this.#workOUT.length > 1 ) {
  //     allworkoutDelete.classList.remove('hidden')
  //     allworkoutDelete.classList.add('workall_delete_trans')
  //   }
  //   else{
  //     allworkoutDelete.classList.add('hidden')
  //   }
  // }

  _deleteWorkout() {
    containerWorkouts.addEventListener('click', e => {
      if (e.target.classList.contains('removework')) {
        const clickWorkid = e.target.closest('.workout').dataset.id;
        const workIndex = this.#workOUT.indexOf(
          this.#workOUT.find(w => w.id === clickWorkid)
        );

        this.#workOUT.splice(workIndex, 1);

        this._setStorage();
        this._LoadStorePosition();
        location.reload();
      }
    });
  }

  _WorkEditHtml(workout, boo) {
    const monthNum = workout.date.getMonth();
    const date = workout.date.getDate();

    let html = `
    ${
      boo === true
        ? `
    <button class="edit hidden">Edit</button>
    `
        : `
    <button class="edit">Edit</button>
    `
    }

    <button class="removework" >Remove</button>
    <h2 class="workout__title">${workout.type} on ${
      months[monthNum]
    } ${date}</h2>

    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === 'running' ? '🏃' : '🚴‍♂️'
      }</span>

      ${
        boo === true
          ? '<input class="workout__valuein edit_distance"/>'
          : `<span class="workout__value">${workout.distance}</span>`
      }
      <span class="workout__unit">km</span>

    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>

      ${
        boo === true
          ? '<input class="workout__valuein edit_duration"/>'
          : `<span class="workout__value">${workout.duration}</span>`
      }

      <span class="workout__unit">min</span>
    </div>
    `;
    if (workout.type === 'running') {
      html += `
      <div class="workout__details">
      <span class="workout__icon">⚡️</span>

      ${
        boo === true
          ? '<input class="workout__valuein edit_candence"/>'
          : `<span class="workout__value">${workout.cadence}</span>`
      }

      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.pace}</span>
      <span class="workout__unit">spm</span>
    </div>
      `;
    }

    if (workout.type === 'cycling') {
      html += `
      <div class="workout__details">
      <span class="workout__icon">⚡️</span>

      ${
        boo === true
          ? '<input class="workout__valuein edit_elevation"/>'
          : `<span class="workout__value">${workout.elevation}</span>`
      }


      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.speed}<span/>
      <span class="workout__unit">m</span>
    </div>
      `;
    }
    return html;
  }

  _htmlInsertFun(work, workobj, boo) {
    work.innerHTML = '';

    work.insertAdjacentHTML('afterbegin', this._WorkEditHtml(workobj, boo));
  }

  _editWorkout(e) {
    if (e.target.classList.contains('edit')) {
      if (this.#key) {
        alert('please finish the selected one');
        return;
      }

      const work = e.target.closest('.workout');
      const workid = work.dataset.id;
      const workobj = this.#workOUT.find(w => w.id === workid);

      this._htmlInsertFun(work, workobj, true);

      ///turning the key off to prevent the user editing 2 workout at the same time
      this.#key = true;
      this._doneEdit();
    }
  }

  _doneEdit(work, workid, workobj) {
    containerWorkouts.addEventListener('keypress', e => {
      if (!(e.key === 'Enter' && this.#key)) return;

      const work = e.target.closest('.workout');
      const workid = work.dataset.id;
      const workobj = this.#workOUT.find(w => w.id === workid);

      const inputEditDis = document.querySelector('.edit_distance');
      const inputEditDur = document.querySelector('.edit_duration');
      let inputEditCan, inputEditEle;
      const distance = +inputEditDis.value;
      const duration = +inputEditDur.value;
      //////Running//////
      if (workobj.type === 'running') {
        inputEditCan = document.querySelector('.edit_candence');
        const cadence = +inputEditCan.value;
        inputEditDis.value = inputEditDur.value = inputEditCan.value = '';

        if (!this._validNposi(distance, duration, cadence)) {
          alert('Please put valid value');
          return;
        }

        this.#workOUT.map(w => {
          if (w.id === workid) {
            w.distance = distance;
            w.duration = duration;
            w.cadence = cadence;
            w.pace = (duration / distance).toFixed(1);
          }
        });
        this._htmlInsertFun(work, workobj, false);
      }
      if (workobj.type === 'running') {
        inputEditDis.value = inputEditDur.value = inputEditCan.value = '';
      }

      ////cycling/////////
      if (workobj.type === 'cycling') {
        inputEditEle = document.querySelector('.edit_elevation');
        const elevation = +inputEditEle.value;

        if (!this._validNposi(distance, duration, elevation, false)) {
          alert('Please put valid number');
          return;
        }
        this.#workOUT.map(w => {
          if (w.id === workid) {
            w.distance = distance;
            w.duration = duration;
            w.elevation = elevation;
            w.speed = (distance / duration).toFixed(1);
          }
        });
        this._htmlInsertFun(work, workobj, false);
      }
      if (workobj.type === 'cycling') {
        inputEditDis.value = inputEditDur.value = inputEditEle.value = '';
      }

      ///turning the key on for other workout to edit
      this.#key = false;
      return;
    });
  }
}

////////////////////////////////////

const app = new App();
