const search = document.getElementById("search");
const matchList = document.getElementById("match-list");
const weahterUI = document.getElementById("weather-ui");
const alertMsg = document.getElementById("alert-msg");
const loading = document.getElementById("loading");
const form = document.getElementById("form");

const cacheData = JSON.parse(localStorage.getItem('country')) || [];
// slideDown alert message
function slideDown(msg, type = 'warning') {
  alertMsg.innerHTML = `
    <div class="alert alert-${type}">
      <i class="fas fa-exclamation-circle"></i>
      ${msg}
      <button type="button" id="btn-close" class="btn-close position-absolute end-0"></button>
    </div>
  `;

  const closeBtn = document.getElementById('btn-close');
  closeBtn.addEventListener('click', () =>  alertMsg.classList.remove('show'));
  alertMsg.classList.add('show');
  setTimeout(() => {
    alertMsg.classList.remove('show');
  }, 3000)
}

// fetch own country data
async function searchStates(searchText) {
  const res = await fetch("https://gist.githubusercontent.com/tommm2/3bc8a64caf02941d6ee15a67ba3f1df0/raw/eb1eedb8c2d33b094331b7da78c3545eeb6c9dea/countries.json");
  const states = await res.json();

  // 取得目前輸入文字後篩選的國家
  let matches = states.filter((state) => {
    // 正規表達式，開頭以 "^" 做開始，"gi" 為不管是大寫或小寫
    const regex = new RegExp(`^${searchText}`, "gi");
    return state.name.match(regex) || state.code.match(regex);
  });
  
  if (search.value.length === 0) {
    matches = [];
    matchList.innerHTML = "";
  }

  if(matches.length === 0) {
    matchList.innerHTML = "";
  }

  updateMatchList(matches);
}
// fetch openweatherapi
async function getCountryWeahter(country) {
  const api_key = "c0c533d0d20d663add933b306f6b82e4";
  const api_url = `https://api.openweathermap.org/data/2.5/weather?q=${country}&appid=${api_key}`;
  const res = await fetch(api_url);
  
  if(res.status !== 200) {
    slideDown('City not found', 'warning');
  } else {
    const data = await res.json();
    loading.classList.add('show');
    localStorage.setItem('country', JSON.stringify(data));
    setTimeout(() => {
      updateWeatherUI(data);
      loading.classList.remove('show');
    }, 1000);
  }

  search.value = '';
  matchList.innerHTML = '';
}

// 開氏溫度轉攝氏溫度
function foramtTemp(k) {
  const c = Math.floor(k - 273.15);
  return c; 
}

// 轉換日出及日落時間
function convertTime(unixTime) {
  let dt = new Date(unixTime * 1000);
  let h = dt.getHours();
  let m = dt.getMinutes();
  h = h < 10 ? `0${h}` : h;
  m = m < 10 ? `0${m}` : m;

  return `${h}:${m}`;
}

// 更新 match-list DOM
function updateMatchList(matches) {
  if (matches.length > 0) {
    const list = matches.map((match, index) => `
      <div id="card" class="card card-body" data-country="${match.name}">
        <h4 class="inline">${match.name} (${match.code})</h4>
      </div>
    `).join("");
    matchList.innerHTML = list;
  }
}

// 更新 weahter-ui DOM
function updateWeatherUI(country) {
  const { weather, name, main, wind, sys } = country
  let str = `
    <div class="content d-flex flex-column justify-content-between text-light">
      <div class="d-flex justify-content-between align-items-center px-3">
        ${name}
        <span><strong class="fs-1">${foramtTemp(main.temp)}</strong>。c</span>
      </div>
      <div class="d-flex flex-column justify-content-center align-items-center px-3">
        <span class="fs-1 d-block">${weather[0].main}</span>
        <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="weather-icon">
      </div>
      <div class="d-flex justify-content-around align-items-center">
        <div>
          <i class="fas fa-sunrise fs-4"></i>
          ${convertTime(sys.sunrise)}
        </div>
        <div>
          <i class="fas fa-sunset fs-4"></i>
          ${convertTime(sys.sunset)}
        </div>
      </div>
      <div class="row g-0 text-center bg-dark rounded-bottom py-2">
        <div class="col-4 border-end border-secondary border-3 py-3">
        ${main.humidity}%
          <i class="fas fa-tint d-block mt-2"></i>
        </div>
        <div class="col-4 border-end border-secondary border-3 py-3">
          ${wind.speed}km/h
          <i class="fas fa-wind d-block mt-2"></i>
        </div>
        <div class="col-4 py-3">
          ${main.pressure / 1000}kPa
          <i class="fas fa-tachometer-alt d-block mt-2"></i>
        </div>
      </div>
    </div>
  `
  weahterUI.innerHTML = str;
}

if(cacheData.length !== 0) {
  updateWeatherUI(cacheData);
}


// Event Listener
search.addEventListener("input", () => searchStates(search.value));
form.addEventListener("submit", (e) => {
  e.preventDefault();
  getCountryWeahter(search.value);
})
matchList.addEventListener("click", (e) => {
  if(e.target.id === 'card') {
    const country = e.target.dataset.country;
    getCountryWeahter(country);
  }
});
