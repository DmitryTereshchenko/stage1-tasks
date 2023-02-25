const time = document.querySelector('.time');
const date = document.querySelector('.date');
const greeting = document.querySelector('.greeting');
const name = document.querySelector('.name');
const prevSlide = document.querySelector('.slide-prev');
const nextSlide = document.querySelector('.slide-next');
const weatherIcon = document.querySelector('.weather-icon');
const temperature = document.querySelector('.temperature');
const weatherElement = document.querySelector('.weather');
const weatherDescription = document.querySelector('.weather-description');
const weatherCity = document.querySelector('.city');
const windElement = document.querySelector('.wind');
const humidityElement = document.querySelector('.humidity');
const weatherError = document.querySelector('.weather-error');
const changeQuoteButton = document.querySelector('.change-quote');
const player = document.querySelector('.player');
const playButton = document.querySelector('.play');

const imageUrl = "https://raw.githubusercontent.com/rolling-scopes-school/stage1-tasks/assets/images";
const songsPath = './assets/sounds/';
const songList = [
  { title: 'Aqua Caelestis', getPath: function() { return `${songsPath}${this.title}.mp3` }},
  { title: 'Ennio Morricone', getPath: function() { return `${songsPath}${this.title}.mp3` }},
  { title: 'River Flows In You', getPath: function() { return `${songsPath}${this.title}.mp3` }},
  { title: 'Summer Wind', getPath: function() { return `${songsPath}${this.title}.mp3` }}
];

let randomNum;
let audio;
let currentSongIndex = 0;

window.addEventListener('beforeunload', setLocalStorage);
window.addEventListener('load', function () {
  showTime();
  getLocalStorage();
  setBackgroundImage();
  getWeather();
  getQuote();
});

prevSlide.addEventListener('click', getSlidePrev);
nextSlide.addEventListener('click', getSlideNext);
weatherCity.addEventListener('change', getWeather);
changeQuoteButton.addEventListener('click', getQuote);
player.addEventListener('click', manageAudioState);

function showTime() {
  const date = new Date();
  const currentTime = date.toLocaleTimeString();
  time.textContent = currentTime;

  showDate(date);
  showGreeting();

  setTimeout(showTime, 1000);
};

function showDate(dateObj) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const currentDate = dateObj.toLocaleDateString('en-US', options);
  date.textContent = currentDate;
}

function showGreeting() {
  greeting.textContent = `Good ${getTimeOfDay()}`;
}

function getTimeOfDay() {
  const dateObj = new Date();
  const hours = dateObj.getHours();
  const dayParts = ['night', 'morning', 'afternoon', 'evening'];

  return dayParts[Math.floor(hours / 6)];
}

function setLocalStorage() {
  localStorage.setItem('name', name.value);
  localStorage.setItem('city', weatherCity.value);
}

function getLocalStorage() {
  name.value = localStorage.getItem('name') || 'Dzmitry';
  weatherCity.value = localStorage.getItem('city') || 'Minsk';
}

function setBackgroundImage(currentNumberOfImage) {
  const timeOfDay = getTimeOfDay();
  const image = new Image();

  if (!currentNumberOfImage) {
    getRandomNumber(1, 20);
  }

  image.src = `${imageUrl}/${timeOfDay}/${(currentNumberOfImage || randomNum).toString().padStart(2, 0)}.jpg`;

  image.onload = () => {
    document.body.style.backgroundImage = "url(" + image.src + ")";
  }
}

function getSlideNext() {
  if (randomNum === 20) {
    randomNum = 1;
  } else {
    randomNum++;
  }
  setBackgroundImage(randomNum);
}

function getSlidePrev() {
  if (randomNum === 1) {
    randomNum = 20;
  } else {
    randomNum--;
  }
  setBackgroundImage(randomNum);
}

function getRandomNumber(min, max) {
  randomNum = Math.floor(Math.random() * (max - min) + min);
}

async function getWeather(event) {
  const cityName = event ? event.target.value : weatherCity.value;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&lang=en&appid=7fb2f84104818ae607851d8711969c73&units=metric`
  const response = await fetch(url);

  if (!response.ok) {
    weatherError.textContent = 'Please type a valid city';
    weatherError.classList.add('show');
    showHideWeatherInfo(true);
    return;
  }

  showHideWeatherInfo(false);
  weatherError.classList.remove('show');
  const { weather, main, wind } = await response.json();

  weatherIcon.classList.add(`owf-${weather[0].id}`);
  temperature.textContent = `${Math.round(main.temp)}°C`;
  weatherDescription.textContent = weather[0].description;
  windElement.textContent = `Wind speed: ${Math.round(wind.speed)} m/s`;
  humidityElement.textContent = `Humidity: ${main.humidity} %`;
}

function showHideWeatherInfo(isHidden) {
  weatherIcon.style.display = isHidden ? 'none' : 'inline';
  weatherElement.style.justifyContent = isHidden ? 'flex-start' : 'space-between';
  if (isHidden) {
    weatherCity.classList.add('error');
  } else {
    weatherCity.classList.remove('error');
  };
  temperature.hidden = isHidden;
  weatherDescription.hidden = isHidden;
  windElement.hidden = isHidden;
  humidityElement.hidden = isHidden;
}

async function getQuote() {
  const quoteElement = document.querySelector('.quote');
  const authorElement = document.querySelector('.author');
  const url = 'https://api.quotable.io/random';
  const { content, author } = await (await fetch(url)).json();
  quoteElement.textContent = content;
  authorElement.textContent = author;
}

function manageAudioState({ target }) {
  if (!audio) {
    audio = new Audio();
    audio.src = songList[currentSongIndex].getPath();
    audio.onended = nextSong;
    setInterval(() => {
      document.getElementById('songProgress').value += 5;
    }, 1000);
  }
  switch (target) {
    case document.querySelector('.play'):
    case document.querySelector('.pause'):
      playPauseAudio();
      break;
    case document.querySelector('.play-next'):
      nextSong();
      break;
    case document.querySelector('.play-prev'):
      prevSong();
      break;
    default: return;
  }
}

function playPauseAudio() {
  if (!audio.paused) {
    audio.pause();
  } else {
    audio.play();
  }

  playButton.classList.toggle('pause');
  playButton.classList.toggle('play');
}

function nextSong() {
  if (currentSongIndex === songList.length - 1) {
    currentSongIndex = 0;
  } else {
    currentSongIndex++;
  }
  audio.src = songList[currentSongIndex].getPath();
  audio.play();
}

function prevSong() {
  if (currentSongIndex === 0) {
    currentSongIndex = songList.length - 1;
  } else {
    currentSongIndex--;
  }
  audio.src = songList[currentSongIndex].getPath();
  audio.play();
}



