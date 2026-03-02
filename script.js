const API_KEY = 'a7f18020b55dd0b0ffc8a649d126a48e';
const BASE    = 'https://api.openweathermap.org/data/2.5/weather';
const FC_URL  = 'https://api.openweathermap.org/data/2.5/forecast';

let unit = 'metric';
let map, mapMarker;
let fxAnimId, lightTimer;
let fxP = [], fxW = 0, fxH = 0;
let fxCanvas, fxCtx;
let currentCity = '';

/* BACKGROUND PHOTO POOL — 6+ per condition */
const BG = {
  clear_day: [
    'https://images.unsplash.com/photo-1504608524841-42584120d94b?w=1920&q=85',
    'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1920&q=85',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=85',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=85',
    'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=1920&q=85',
    'https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=1920&q=85',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1920&q=85',
    'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=1920&q=85',
  ],
  clear_night: [
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=85',
    'https://images.unsplash.com/photo-1475274047050-1d0c0975864c?w=1920&q=85',
    'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920&q=85',
    'https://images.unsplash.com/photo-1538370965046-79c0d6907d47?w=1920&q=85',
    'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1920&q=85',
    'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=1920&q=85',
    'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=1920&q=85',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=85',
  ],
  clouds: [
    'https://images.unsplash.com/photo-1495571758719-6ec1e876d6ae?w=1920&q=85',
    'https://images.unsplash.com/photo-1463947628408-f8581a2f4aca?w=1920&q=85',
    'https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?w=1920&q=85',
    'https://images.unsplash.com/photo-1530908295418-a12e326966ba?w=1920&q=85',
    'https://images.unsplash.com/photo-1536514072410-5019a3c69182?w=1920&q=85',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=85',
    'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?w=1920&q=85',
    'https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?w=1920&q=85',
  ],
  rain: [
    'https://images.unsplash.com/photo-1438449805896-28a666819a20?w=1920&q=85',
    'https://images.unsplash.com/photo-1501999635878-71cb5379c2d8?w=1920&q=85',
    'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=1920&q=85',
    'https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=1920&q=85',
    'https://images.unsplash.com/photo-1428592953211-077101b2021b?w=1920&q=85',
    'https://images.unsplash.com/photo-1541919329513-35f7af297129?w=1920&q=85',
    'https://images.unsplash.com/photo-1433863448220-78aaa064ff47?w=1920&q=85',
    'https://images.unsplash.com/photo-1475923813993-e0eb40da3a3f?w=1920&q=85',
  ],
  storm: [
    'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=1920&q=85',
    'https://images.unsplash.com/photo-1594760467013-64ac2b8c878f?w=1920&q=85',
    'https://images.unsplash.com/photo-1492011221367-f47e3ccd77a0?w=1920&q=85',
    'https://images.unsplash.com/photo-1504700610630-ac6aba3536d3?w=1920&q=85',
    'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=1920&q=85',
    'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1920&q=85',
    'https://images.unsplash.com/photo-1429552077091-836152271555?w=1920&q=85',
    'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=1920&q=85',
  ],
  snow: [
    'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1920&q=85',
    'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1920&q=85',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1920&q=85',
    'https://images.unsplash.com/photo-1547754980-3df97fed72a8?w=1920&q=85',
    'https://images.unsplash.com/photo-1455156218388-5e61b526818b?w=1920&q=85',
    'https://images.unsplash.com/photo-1477601263568-180e2c6d046e?w=1920&q=85',
    'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=1920&q=85',
    'https://images.unsplash.com/photo-1511131341194-24e2eeeebb09?w=1920&q=85',
  ],
  mist: [
    'https://images.unsplash.com/photo-1482192505345-5852fa62f9ef?w=1920&q=85',
    'https://images.unsplash.com/photo-1543968996-ee822b8176ba?w=1920&q=85',
    'https://images.unsplash.com/photo-1487621167305-5d248087c724?w=1920&q=85',
    'https://images.unsplash.com/photo-1561553873-e8491a564fd0?w=1920&q=85',
    'https://images.unsplash.com/photo-1501621667575-af81f1f0bafd?w=1920&q=85',
    'https://images.unsplash.com/photo-1504700610630-ac6aba3536d3?w=1920&q=85',
    'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=1920&q=85',
    'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=1920&q=85',
  ],
  drizzle: [
    'https://images.unsplash.com/photo-1433863448220-78aaa064ff47?w=1920&q=85',
    'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=1920&q=85',
    'https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=1920&q=85',
    'https://images.unsplash.com/photo-1428592953211-077101b2021b?w=1920&q=85',
    'https://images.unsplash.com/photo-1501999635878-71cb5379c2d8?w=1920&q=85',
    'https://images.unsplash.com/photo-1438449805896-28a666819a20?w=1920&q=85',
  ],
};

/* LUCIDE ICONS */
function mkIcon(d, color, glowColor) {
  const glow = glowColor
    ? `filter:drop-shadow(0 0 8px ${glowColor})`
    : `filter:drop-shadow(0 1px 4px rgba(0,0,0,0.4))`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
    fill="none" stroke="${color}" stroke-width="1.65"
    stroke-linecap="round" stroke-linejoin="round"
    style="${glow}">${d}</svg>`;
}

const ICONS = {
  // lucide: sun
  clear_day: mkIcon(
    `<circle cx="12" cy="12" r="4"/>
     <path d="M12 2v2"/><path d="M12 20v2"/>
     <path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/>
     <path d="M2 12h2"/><path d="M20 12h2"/>
     <path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>`,
    'rgba(255,226,76,0.97)', 'rgba(255,210,40,0.75)'
  ),
  // lucide: moon
  clear_night: mkIcon(
    `<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>`,
    'rgba(196,214,255,0.95)', 'rgba(160,190,255,0.55)'
  ),
  // lucide: cloud-sun
  partly_cloudy_day: mkIcon(
    `<path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/>
     <path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/>
     <path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/>
     <path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/>`,
    'rgba(255,255,255,0.93)', ''
  ),
  // lucide: cloud-moon
  partly_cloudy_night: mkIcon(
    `<path d="M13 16a3 3 0 1 1 0 6H7a5 5 0 1 1 4.9-6Z"/>
     <path d="M10.1 8.1a6 6 0 0 1 8.9 2.9"/>
     <path d="M8.5 2.5A6.5 6.5 0 0 0 3 9"/>`,
    'rgba(196,214,255,0.93)', 'rgba(160,190,255,0.35)'
  ),
  // lucide: cloud
  clouds: mkIcon(
    `<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>`,
    'rgba(255,255,255,0.9)', ''
  ),
  // lucide: cloud-rain
  rain: mkIcon(
    `<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
     <path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>`,
    'rgba(148,206,255,0.95)', 'rgba(80,160,240,0.45)'
  ),
  // lucide: cloud-drizzle
  drizzle: mkIcon(
    `<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
     <path d="M8 19v1"/><path d="M8 14v1"/>
     <path d="M12 21v1"/><path d="M12 16v1"/>
     <path d="M16 19v1"/><path d="M16 14v1"/>`,
    'rgba(148,206,255,0.9)', 'rgba(80,150,220,0.35)'
  ),
  // lucide: cloud-lightning
  storm: mkIcon(
    `<path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/>
     <path d="m13 12-3 5h4l-3 5"/>`,
    'rgba(255,255,255,0.95)', 'rgba(255,226,76,0.55)'
  ),
  // lucide: cloud-snow
  snow: mkIcon(
    `<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
     <path d="M8 15h.01"/><path d="M8 19h.01"/>
     <path d="M12 17h.01"/><path d="M12 21h.01"/>
     <path d="M16 15h.01"/><path d="M16 19h.01"/>`,
    'rgba(205,230,255,0.95)', 'rgba(150,200,255,0.45)'
  ),
  // lucide: wind (for mist/fog)
  mist: mkIcon(
    `<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/>
     <path d="M9.6 4.6A2 2 0 1 1 11 8H2"/>
     <path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>`,
    'rgba(210,222,232,0.85)', ''
  ),
};

function iconSvg(id, isNight) {
  if (id >= 200 && id < 300) return ICONS.storm;
  if (id >= 300 && id < 400) return ICONS.drizzle;
  if (id >= 500 && id < 600) return ICONS.rain;
  if (id >= 600 && id < 700) return ICONS.snow;
  if (id >= 700 && id < 800) return ICONS.mist;
  if (id === 800) return isNight ? ICONS.clear_night : ICONS.clear_day;
  if (id === 801) return isNight ? ICONS.partly_cloudy_night : ICONS.partly_cloudy_day;
  return ICONS.clouds;
}

/*BOOT — random city so it's never empty */
const BOOT = [
  'Tokyo','London','New York','Sydney','Paris','Dubai','Mumbai',
  'Cape Town','Seoul','Istanbul','Singapore','Mexico City',
  'Cairo','Buenos Aires','Bangkok','Lagos','Kathmandu',
];

window.addEventListener('load', () => {
  initFx();
  initMap();
  updateClock(); setInterval(updateClock, 1000);
  setupSheet();
  fetchAll(BOOT[Math.floor(Math.random() * BOOT.length)]);
});

/* DOM */
const searchInput  = document.getElementById('search-input');
const searchBtn    = document.getElementById('search-btn');
const unitBtn      = document.getElementById('unit-btn');
const mobOpenBtn   = document.getElementById('mob-open-btn');
const mobSheet     = document.getElementById('mob-sheet');
const mobHandle    = document.getElementById('mob-handle');
const mobBackdrop  = document.getElementById('mob-backdrop');
const mobSearch    = document.getElementById('mob-search');
const mobSearchBtn = document.getElementById('mob-search-btn');
const mobUnitBtn   = document.getElementById('mob-unit-btn');
const navLocate    = document.getElementById('nav-locate');
const mobLocate    = document.getElementById('mob-locate');

searchBtn.addEventListener('click',  () => go(searchInput.value));
searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') go(searchInput.value); });
mobSearchBtn.addEventListener('click',  () => go(mobSearch.value));
mobSearch.addEventListener('keydown',   e => { if (e.key === 'Enter') go(mobSearch.value); });
unitBtn.addEventListener('click',    toggleUnit);
mobUnitBtn.addEventListener('click', toggleUnit);
navLocate.addEventListener('click',  geoLocate);
mobLocate.addEventListener('click',  geoLocate);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

function go(q) {
  q = q?.trim(); if (!q) return;
  fetchAll(q);
  searchInput.value = '';
  mobSearch.value   = '';
  closeSheet();
}

function toggleUnit() {
  unit = unit === 'metric' ? 'imperial' : 'metric';
  const lbl = unit === 'metric' ? '°C' : '°F';
  unitBtn.textContent    = lbl;
  mobUnitBtn.textContent = lbl;
  if (currentCity) fetchAll(currentCity);
}

function geoLocate() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    pos => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
    ()  => alert('Location access denied.')
  );
  closeSheet();
}

/* FETCH */
async function fetchAll(city) {
  try {
    const [r1, r2] = await Promise.all([
      fetch(`${BASE}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${unit}`),
      fetch(`${FC_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${unit}&cnt=40`),
    ]);
    if (!r1.ok) { alert(`"${city}" not found.`); return; }
    const cur = await r1.json(), fc = await r2.json();
    currentCity = cur.name;
    render(cur, fc);
  } catch (e) { console.error(e); alert('Connection error.'); }
}

async function fetchByCoords(lat, lon) {
  try {
    const [r1, r2] = await Promise.all([
      fetch(`${BASE}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`),
      fetch(`${FC_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}&cnt=40`),
    ]);
    const cur = await r1.json(), fc = await r2.json();
    currentCity = cur.name;
    render(cur, fc);
  } catch { alert('Connection error.'); }
}

/* RENDER */
function render(cur, fc) {
  const u       = unit === 'metric' ? '°C' : '°F';
  const id      = cur.weather[0].id;
  const isNight = cur.dt < cur.sys.sunrise || cur.dt > cur.sys.sunset;
  const tz      = fc.city?.timezone || 0;

  setBackground(id, isNight);
  applyFx(id, isNight);

  // Hero
  document.getElementById('h-city').textContent      = cur.name;
  document.getElementById('h-country').textContent   = cur.sys.country;
  document.getElementById('h-temp').textContent      = Math.round(cur.main.temp);
  document.getElementById('h-unit').textContent      = unit === 'metric' ? 'C' : 'F';
  document.getElementById('h-condition').textContent = condLabel(id);
  document.getElementById('h-desc').textContent      = cap(cur.weather[0].description);
  document.getElementById('h-max').textContent       = Math.round(cur.main.temp_max) + '°';
  document.getElementById('h-min').textContent       = Math.round(cur.main.temp_min) + '°';
  document.getElementById('h-feels').textContent     = Math.round(cur.main.feels_like) + u;
  document.getElementById('hero-icon').innerHTML     = iconSvg(id, isNight);

  // Stats
  const wspd  = unit === 'metric' ? cur.wind.speed : cur.wind.speed * 2.237;
  const wunit = unit === 'metric' ? 'm/s' : 'mph';
  document.getElementById('s-hum').textContent   = cur.main.humidity + '%';
  document.getElementById('s-wind').textContent  = wspd.toFixed(1) + ' ' + wunit;
  document.getElementById('s-gust').textContent  = cur.wind.gust ? cur.wind.gust.toFixed(1) + ' ' + wunit : '—';
  document.getElementById('s-wdir').textContent  = windDir(cur.wind.deg || 0);
  document.getElementById('s-pres').textContent  = cur.main.pressure + ' hPa';
  document.getElementById('s-vis').textContent   = cur.visibility ? (cur.visibility / 1000).toFixed(1) + ' km' : '—';
  document.getElementById('s-cloud').textContent = cur.clouds.all + '%';
  document.getElementById('s-dew').textContent   = dewPoint(cur.main.temp, cur.main.humidity) + (unit === 'metric' ? '°C' : '°F');
  document.getElementById('s-rise').textContent  = fmtTime(cur.sys.sunrise, tz);
  document.getElementById('s-set').textContent   = fmtTime(cur.sys.sunset, tz);

  // Mobile stats
  document.getElementById('mob-hum').textContent   = cur.main.humidity + '%';
  document.getElementById('mob-wind').textContent  = wspd.toFixed(1) + ' ' + wunit;
  document.getElementById('mob-pres').textContent  = cur.main.pressure;
  document.getElementById('mob-vis').textContent   = cur.visibility ? (cur.visibility / 1000).toFixed(1) + 'km' : '—';
  document.getElementById('mob-cloud').textContent = cur.clouds.all + '%';
  document.getElementById('mob-dew').textContent   = dewPoint(cur.main.temp, cur.main.humidity) + '°';
  document.getElementById('mob-rise').textContent  = fmtTime(cur.sys.sunrise, tz);
  document.getElementById('mob-set').textContent   = fmtTime(cur.sys.sunset, tz);

  updateMap(cur.coord.lat, cur.coord.lon);
  document.getElementById('map-coords').textContent =
    `${cur.coord.lat.toFixed(4)}°N  ${cur.coord.lon.toFixed(4)}°E`;

  buildForecast(fc, tz);
  buildHourly(fc, tz);
}

/* BACKGROUND CROSSFADE */
let bgActive = 'a', currentBgKey = '';

function setBackground(id, isNight) {
  const key = bgKey(id, isNight);
  if (key === currentBgKey) return;
  currentBgKey = key;
  const pool = BG[key] || BG.clouds;
  const url  = pool[Math.floor(Math.random() * pool.length)];
  const next = bgActive === 'a' ? 'b' : 'a';
  const elN  = document.getElementById('bg-' + next);
  const elC  = document.getElementById('bg-' + bgActive);
  elN.style.backgroundImage = `url(${url})`;
  elN.style.zIndex = '2'; elN.style.opacity = '1';
  elC.style.opacity = '0'; elC.style.zIndex = '1';
  bgActive = next;
}

function bgKey(id, isNight) {
  if (id >= 200 && id < 300) return 'storm';
  if (id >= 300 && id < 400) return 'drizzle';
  if (id >= 500 && id < 600) return 'rain';
  if (id >= 600 && id < 700) return 'snow';
  if (id >= 700 && id < 800) return 'mist';
  if (id === 800)             return isNight ? 'clear_night' : 'clear_day';
  return isNight ? 'clear_night' : 'clouds';
}

/*LEAFLET MAP */
function initMap() {
  map = L.map('map', {
    zoomControl: false, attributionControl: false,
    dragging: false, scrollWheelZoom: false,
    doubleClickZoom: false, touchZoom: false,
  }).setView([40.7, -74], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
  const icon = L.divIcon({
    html: `<div style="width:10px;height:10px;border-radius:50%;background:#fff;border:2px solid rgba(255,255,255,0.5);box-shadow:0 0 10px rgba(255,255,255,0.7)"></div>`,
    iconSize: [10, 10], iconAnchor: [5, 5], className: '',
  });
  mapMarker = L.marker([40.7, -74], { icon }).addTo(map);
}

function updateMap(lat, lon) {
  map.setView([lat, lon], 10, { animate: true, duration: 1.2 });
  mapMarker.setLatLng([lat, lon]);
}

/* FORECAST + HOURLY */
function buildForecast(fc, tz) {
  const days = groupDays(fc.list, tz);
  const keys = Object.keys(days).slice(1, 6);
  const dp = document.getElementById('forecast-rows');
  const dm = document.getElementById('mob-forecast');
  dp.innerHTML = dm.innerHTML = '';
  keys.forEach((key, i) => {
    const items = days[key];
    const noon  = bestNoon(items, tz);
    const hi    = Math.round(Math.max(...items.map(x => x.main.temp_max)));
    const lo    = Math.round(Math.min(...items.map(x => x.main.temp_min)));
    const lbl   = i === 0 ? 'Tomorrow'
      : new Date((noon.dt + tz) * 1000).toLocaleDateString('en', { weekday: 'short', timeZone: 'UTC' });
    const ico = iconSvg(noon.weather[0].id, false);
    dp.insertAdjacentHTML('beforeend', `
      <div class="fc-row">
        <span class="fc-day">${lbl}</span>
        <span class="fc-icon">${ico}</span>
        <span class="fc-hi">${hi}°</span>
        <span class="fc-lo">${lo}°</span>
      </div>`);
    dm.insertAdjacentHTML('beforeend', `
      <div class="mob-fc-row">
        <span class="mob-fc-day">${lbl}</span>
        <span class="mob-fc-icon">${ico}</span>
        <span class="mob-fc-hi">${hi}°</span>
        <span class="mob-fc-lo">${lo}°</span>
      </div>`);
  });
}

function buildHourly(fc, tz) {
  const todayStr = utcDate(Date.now() / 1000, tz);
  const slots    = fc.list.filter(x => utcDate(x.dt, tz) === todayStr).slice(0, 10);
  const el = document.getElementById('hourly-scroll');
  el.innerHTML = '';
  slots.forEach((s, i) => {
    const d = new Date((s.dt + tz) * 1000);
    let h = d.getUTCHours(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
    el.insertAdjacentHTML('beforeend', `
      <div class="h-slot${i === 0 ? ' now' : ''}">
        <div class="h-time">${i === 0 ? 'Now' : h + ap}</div>
        <div class="h-icon">${iconSvg(s.weather[0].id, false)}</div>
        <div class="h-temp">${Math.round(s.main.temp)}°</div>
      </div>`);
  });
}

/* CANVAS EFFECTS */
function initFx() {
  fxCanvas = document.getElementById('fx');
  fxCtx = fxCanvas.getContext('2d');
  resizeFx(); window.addEventListener('resize', resizeFx);
}
function resizeFx() { fxW = fxCanvas.width = window.innerWidth; fxH = fxCanvas.height = window.innerHeight; }
function stopFx() {
  cancelAnimationFrame(fxAnimId);
  if (lightTimer) { clearTimeout(lightTimer); lightTimer = null; }
  fxP = []; fxCtx?.clearRect(0, 0, fxW, fxH);
}

function applyFx(id, isNight) {
  stopFx();
  if      (id >= 200 && id < 300) { startRain(true); scheduleLightning(); }
  else if (id >= 300 && id < 400) startDrizzle();
  else if (id >= 500 && id < 600) startRain(false);
  else if (id >= 600 && id < 700) startSnow();
  else if (id >= 700 && id < 800) startMist();
  else if (isNight)                startStars();
  else if (id === 800)             startDust();
}

function startRain(heavy) {
  fxP = Array.from({ length: heavy ? 320 : 170 }, () => ({
    x: Math.random() * fxW, y: Math.random() * fxH,
    len: Math.random() * (heavy ? 24 : 16) + 8,
    spd: Math.random() * (heavy ? 14 : 9) + 6,
    a: Math.random() * 0.42 + 0.08,
  }));
  (function tick() {
    fxCtx.clearRect(0, 0, fxW, fxH);
    fxP.forEach(d => {
      fxCtx.beginPath(); fxCtx.moveTo(d.x, d.y);
      fxCtx.lineTo(d.x - d.len * 0.11, d.y + d.len);
      fxCtx.strokeStyle = `rgba(180,215,245,${d.a})`; fxCtx.lineWidth = 0.75; fxCtx.stroke();
      d.y += d.spd; d.x -= 0.35;
      if (d.y > fxH + 5) { d.y = -d.len; d.x = Math.random() * fxW; }
    });
    fxAnimId = requestAnimationFrame(tick);
  })();
}

function startDrizzle() {
  fxP = Array.from({ length: 90 }, () => ({
    x: Math.random() * fxW, y: Math.random() * fxH,
    len: Math.random() * 8 + 4, spd: Math.random() * 3.5 + 2.5, a: Math.random() * 0.22 + 0.06,
  }));
  (function tick() {
    fxCtx.clearRect(0, 0, fxW, fxH);
    fxP.forEach(d => {
      fxCtx.beginPath(); fxCtx.moveTo(d.x, d.y); fxCtx.lineTo(d.x, d.y + d.len);
      fxCtx.strokeStyle = `rgba(180,215,245,${d.a})`; fxCtx.lineWidth = 0.6; fxCtx.stroke();
      d.y += d.spd;
      if (d.y > fxH + 5) { d.y = -d.len; d.x = Math.random() * fxW; }
    });
    fxAnimId = requestAnimationFrame(tick);
  })();
}

function startSnow() {
  fxP = Array.from({ length: 120 }, () => ({
    x: Math.random() * fxW, y: Math.random() * fxH,
    r: Math.random() * 2.8 + 0.8, vx: (Math.random() - 0.5) * 0.6,
    vy: Math.random() * 1.1 + 0.3, a: Math.random() * 0.75 + 0.2, w: Math.random() * Math.PI * 2,
  }));
  (function tick() {
    fxCtx.clearRect(0, 0, fxW, fxH);
    fxP.forEach(p => {
      p.w += 0.015; p.x += p.vx + Math.sin(p.w) * 0.35; p.y += p.vy;
      fxCtx.beginPath(); fxCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      fxCtx.fillStyle = `rgba(228,240,255,${p.a})`; fxCtx.fill();
      if (p.y > fxH + 5) { p.y = -5; p.x = Math.random() * fxW; }
    });
    fxAnimId = requestAnimationFrame(tick);
  })();
}

function startMist() {
  fxP = Array.from({ length: 18 }, () => ({
    x: Math.random() * fxW, y: fxH * 0.25 + Math.random() * fxH * 0.65,
    w: Math.random() * 500 + 200, h: Math.random() * 100 + 50,
    vx: (Math.random() - 0.5) * 0.2, a: Math.random() * 0.06 + 0.02,
  }));
  (function tick() {
    fxCtx.clearRect(0, 0, fxW, fxH);
    fxP.forEach(p => {
      const g = fxCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.w / 2);
      g.addColorStop(0, `rgba(210,225,235,${p.a})`); g.addColorStop(1, 'transparent');
      fxCtx.fillStyle = g; fxCtx.beginPath();
      fxCtx.ellipse(p.x, p.y, p.w / 2, p.h / 2, 0, 0, Math.PI * 2); fxCtx.fill();
      p.x += p.vx;
      if (p.x > fxW + p.w) p.x = -p.w;
      if (p.x < -p.w)      p.x = fxW + p.w;
    });
    fxAnimId = requestAnimationFrame(tick);
  })();
}

function startStars() {
  fxP = Array.from({ length: 180 }, () => ({
    x: Math.random() * fxW, y: Math.random() * fxH * 0.78,
    r: Math.random() * 1.3 + 0.2, a: Math.random() * 0.85 + 0.1,
    t: Math.random() * Math.PI * 2, sp: Math.random() * 0.018 + 0.01,
  }));
  (function tick() {
    fxCtx.clearRect(0, 0, fxW, fxH);
    fxP.forEach(p => {
      p.t += p.sp;
      fxCtx.beginPath(); fxCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      fxCtx.fillStyle = `rgba(220,232,255,${p.a * (0.55 + 0.45 * Math.sin(p.t))})`;
      fxCtx.fill();
    });
    fxAnimId = requestAnimationFrame(tick);
  })();
}

function startDust() {
  fxP = Array.from({ length: 45 }, () => ({
    x: Math.random() * fxW, y: Math.random() * fxH,
    r: Math.random() * 1.4 + 0.3, vx: (Math.random() - 0.5) * 0.18,
    vy: Math.random() * -0.28 - 0.04, a: Math.random() * 0.22 + 0.04,
  }));
  (function tick() {
    fxCtx.clearRect(0, 0, fxW, fxH);
    fxP.forEach(p => {
      fxCtx.beginPath(); fxCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      fxCtx.fillStyle = `rgba(255,235,100,${p.a})`; fxCtx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.y < -4) { p.y = fxH + 4; p.x = Math.random() * fxW; }
    });
    fxAnimId = requestAnimationFrame(tick);
  })();
}

function scheduleLightning() {
  lightTimer = setTimeout(() => {
    const el = document.getElementById('lightning');
    el.style.background = 'rgba(210,225,255,0.22)';
    setTimeout(() => {
      el.style.background = '';
      setTimeout(() => {
        el.style.background = 'rgba(210,225,255,0.14)';
        setTimeout(() => { el.style.background = ''; }, 80);
      }, 55);
    }, 85);
    if (document.body.classList.contains('wx-storm')) scheduleLightning();
  }, Math.random() * 5000 + 3000);
}

/*MOBILE SHEET Close: backdrop click · swipe down · ESC · handle tap */
function openSheet()  { mobSheet.classList.add('open');    mobBackdrop.classList.add('visible'); }
function closeSheet() { mobSheet.classList.remove('open'); mobBackdrop.classList.remove('visible'); }

function setupSheet() {
  mobOpenBtn.addEventListener('click',  openSheet);
  mobHandle.addEventListener('click',   closeSheet);
  mobBackdrop.addEventListener('click', closeSheet);
  let sy = 0;
  mobSheet.addEventListener('touchstart', e => { sy = e.touches[0].clientY; }, { passive: true });
  mobSheet.addEventListener('touchend',   e => {
    const dy = e.changedTouches[0].clientY - sy;
    if (dy > 55)  closeSheet();
    if (dy < -55) openSheet();
  }, { passive: true });
}

/* HELPERS */
function updateClock() {
  const now = new Date(); let h = now.getHours();
  const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
  const m = String(now.getMinutes()).padStart(2, '0');
  const el = document.getElementById('clock'), amp = document.getElementById('ampm');
  if (el) el.textContent = `${h}:${m}`; if (amp) amp.textContent = ap;
}

function fmtTime(unix, tz) {
  const d = new Date((unix + tz) * 1000);
  let h = d.getUTCHours(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
  return `${h}:${String(d.getUTCMinutes()).padStart(2,'0')} ${ap}`;
}

function groupDays(list, tz) {
  const d = {};
  list.forEach(x => { const k = utcDate(x.dt, tz); if (!d[k]) d[k] = []; d[k].push(x); });
  return d;
}

function bestNoon(items, tz) {
  return items.reduce((b, x) => {
    const hb = new Date((b.dt + tz) * 1000).getUTCHours();
    const hx = new Date((x.dt + tz) * 1000).getUTCHours();
    return Math.abs(hx - 12) < Math.abs(hb - 12) ? x : b;
  });
}

function utcDate(sec, tz) { return new Date((sec + tz) * 1000).toISOString().slice(0, 10); }

const DIRS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
function windDir(deg) { return DIRS[Math.round(deg / 22.5) % 16]; }
function dewPoint(t, h) { return +(t - (100 - h) / 5).toFixed(1); }

function condLabel(id) {
  if (id >= 200 && id < 300) return 'Thunderstorm';
  if (id >= 300 && id < 400) return 'Drizzle';
  if (id >= 500 && id < 600) return 'Rain';
  if (id >= 600 && id < 700) return 'Snow';
  if (id >= 700 && id < 800) return 'Mist';
  if (id === 800)             return 'Clear';
  if (id === 801)             return 'Partly Cloudy';
  if (id === 802)             return 'Scattered Clouds';
  if (id === 803)             return 'Broken Clouds';
  return 'Overcast';
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }