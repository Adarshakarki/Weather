const API_KEY = 'a7f18020b55dd0b0ffc8a649d126a48e';
const BASE    = 'https://api.openweathermap.org/data/2.5/weather';

let unit        = 'metric';
let currentCity = 'New York';
let fxActive    = '';
let lightningTimer = null;

const NEARBY = ['Philadelphia', 'Boston', 'Washington D.C.', 'Pittsburgh'];
const ROW_CITIES = [
  { name: 'Washington D.C.', coord: '38.90°N', color: '#f4c842' },
  { name: 'Oklahoma City',   coord: '35.46°N', color: '#ff7675' },
  { name: 'Philadelphia',    coord: '40.00°N', color: '#74b9ff' },
];

// ── Boot ──────────────────────────────────────
window.addEventListener('load', () => {
  updateClock();
  setInterval(updateClock, 1000);
  updateDate();
  initFxCanvas();
  initWave();
  fetchMain(currentCity);
  loadCityRow();
  loadCityList();
  setupMobileSheet();
});

// ── DOM ───────────────────────────────────────
const searchInput  = document.getElementById('search-input');
const searchBtn    = document.getElementById('search-btn');
const unitTog      = document.getElementById('unit-tog');
const togDay       = document.getElementById('tog-day');
const togNight     = document.getElementById('tog-night');
const mobMenuBtn   = document.getElementById('mob-menu-btn');
const mobSheet     = document.getElementById('mob-sheet');
const mobHandle    = document.getElementById('mob-handle');
const mobUnitTog   = document.getElementById('mob-unit-tog');
const mobTogDay    = document.getElementById('mob-tog-day');
const mobTogNight  = document.getElementById('mob-tog-night');
const mobSearch    = document.getElementById('mob-search-input');
const mobSearchBtn = document.getElementById('mob-search-btn');

searchBtn.addEventListener('click',  () => doSearch(searchInput.value));
searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(searchInput.value); });

mobSearchBtn.addEventListener('click',  () => doSearch(mobSearch.value));
mobSearch.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(mobSearch.value); });

unitTog.addEventListener('click',    () => toggleUnit());
mobUnitTog.addEventListener('click', () => toggleUnit());

togDay.addEventListener('click',      () => setDayNight(false));
togNight.addEventListener('click',    () => setDayNight(true));
mobTogDay.addEventListener('click',   () => setDayNight(false));
mobTogNight.addEventListener('click', () => setDayNight(true));

function doSearch(q) {
  q = q?.trim();
  if (!q) return;
  currentCity = q;
  fetchMain(q);
  searchInput.value = '';
  mobSearch.value   = '';
}

function toggleUnit() {
  unit = unit === 'metric' ? 'imperial' : 'metric';
  const lbl = unit === 'metric' ? '°C' : '°F';
  unitTog.textContent    = lbl;
  mobUnitTog.textContent = lbl;
  fetchMain(currentCity);
  loadCityRow();
  loadCityList();
}

function setDayNight(isNight) {
  if (isNight) {
    document.body.classList.add('wx-night');
    [togNight, mobTogNight].forEach(b => b?.classList.add('active'));
    [togDay,   mobTogDay  ].forEach(b => b?.classList.remove('active'));
  } else {
    document.body.classList.remove('wx-night');
    [togDay,   mobTogDay  ].forEach(b => b?.classList.add('active'));
    [togNight, mobTogNight].forEach(b => b?.classList.remove('active'));
  }
}

// ── Fetch ─────────────────────────────────────
async function fetchMain(city) {
  try {
    const res  = await fetch(`${BASE}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${unit}`);
    const data = await res.json();
    if (!res.ok) { alert(`"${city}" not found.`); return; }
    renderMain(data);
  } catch { alert('Connection error. Check your internet.'); }
}

function renderMain(d) {
  const u   = unit === 'metric' ? '°C' : '°F';
  const id  = d.weather[0].id;
  const desc = d.weather[0].description;

  // Left panel
  document.getElementById('condition-label').textContent = conditionLabel(id);
  document.getElementById('condition-sub').textContent   = conditionSub(desc);
  document.getElementById('condition-desc').textContent  =
    `${capitalise(desc)}. Temp ${Math.round(d.main.temp)}${u}, ` +
    `feels like ${Math.round(d.main.feels_like)}${u}. ` +
    `Wind ${d.wind.speed.toFixed(1)} ${unit === 'metric' ? 'm/s' : 'mph'}. ` +
    `Humidity ${d.main.humidity}%.`;

  // Right panel
  document.getElementById('main-temp').textContent    = Math.round(d.main.temp);
  document.getElementById('r-wind').textContent       = `${(unit === 'metric' ? d.wind.speed * 2.237 : d.wind.speed).toFixed(1)} MPH`;
  document.getElementById('r-hum-line').textContent   = d.main.humidity + '%';
  document.getElementById('r-pressure').textContent   = d.main.pressure + ' hPa';
  document.getElementById('r-city').textContent       = `- ${d.name.toUpperCase()}`;
  document.getElementById('r-hum').textContent        = d.main.humidity + '%';
  document.getElementById('quality-badge').textContent = airQuality(d.main.humidity);
  document.getElementById('quality-coords').textContent = `${d.coord.lat.toFixed(2)}°N ${d.coord.lon.toFixed(2)}°E`;

  // Mobile stats
  document.getElementById('ms-wind').textContent = `${d.wind.speed.toFixed(1)} m/s`;
  document.getElementById('ms-hum').textContent  = d.main.humidity + '%';
  document.getElementById('ms-pres').textContent = d.main.pressure;
  document.getElementById('ms-vis').textContent  = d.visibility ? (d.visibility / 1000).toFixed(1) + 'km' : '—';

  applyWeatherTheme(id, d.weather[0].icon);
  drawWave(d.main.temp_min, d.main.temp_max);
}

// ── City rows ─────────────────────────────────
async function loadCityRow() {
  const wrap = document.getElementById('cities-row');
  wrap.innerHTML = '';
  for (const c of ROW_CITIES) {
    try {
      const res  = await fetch(`${BASE}?q=${encodeURIComponent(c.name)}&appid=${API_KEY}&units=${unit}`);
      const data = await res.json();
      if (!res.ok) continue;
      const el = document.createElement('div');
      el.className = 'city-card';
      el.innerHTML = `
        <div class="city-temp">${Math.round(data.main.temp)}°</div>
        <div class="city-coords">${c.coord}</div>
        <div class="city-name-lbl">${c.name}</div>
        <div class="city-bar" style="background:${c.color}"></div>`;
      wrap.appendChild(el);
    } catch {}
  }
}

async function loadCityList() {
  const list    = document.getElementById('city-list');
  const mobList = document.getElementById('mob-cities');
  list.innerHTML    = '';
  mobList.innerHTML = '';

  for (const city of NEARBY) {
    try {
      const res  = await fetch(`${BASE}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${unit}`);
      const data = await res.json();
      if (!res.ok) continue;
      const ico = weatherEmoji(data.weather[0].id);
      const tmp = Math.round(data.main.temp) + '°';

      // Desktop row
      const row = document.createElement('div');
      row.className = 'city-row';
      row.innerHTML = `<div class="cr-name">${city}</div><div class="cr-temp">${tmp}</div><div class="cr-icon">${ico}</div>`;
      row.addEventListener('click', () => { currentCity = city; fetchMain(city); highlightRow(row); });
      list.appendChild(row);

      // Mobile row
      const mrow = document.createElement('div');
      mrow.className = 'mob-city-row';
      mrow.innerHTML = `<div class="mob-cr-name">${city}</div><div class="mob-cr-temp">${tmp}</div><div class="mob-cr-icon">${ico}</div>`;
      mrow.addEventListener('click', () => { currentCity = city; fetchMain(city); });
      mobList.appendChild(mrow);
    } catch {}
  }
}

function highlightRow(activeRow) {
  document.querySelectorAll('.city-row').forEach(r => r.classList.remove('active'));
  activeRow.classList.add('active');
}

// ── Weather theme ─────────────────────────────
function applyWeatherTheme(id, icon) {
  const isNight = icon?.endsWith('n');
  const body    = document.body;

  // Strip all wx classes
  ['wx-clear','wx-clouds','wx-rain','wx-storm','wx-snow','wx-mist','wx-night']
    .forEach(c => body.classList.remove(c));

  // Stop previous FX
  stopFx();

  if (isNight) {
    body.classList.add('wx-night');
    startStars();
  } else if (id >= 200 && id < 300) {
    body.classList.add('wx-storm');
    startRain(true);
    scheduleLightning();
  } else if (id >= 300 && id < 600) {
    body.classList.add('wx-rain');
    startRain(false);
  } else if (id >= 600 && id < 700) {
    body.classList.add('wx-snow');
    startSnow();
  } else if (id >= 700 && id < 800) {
    body.classList.add('wx-mist');
    startMist();
  } else if (id === 800) {
    body.classList.add('wx-clear');
    startSunParticles();
  } else {
    body.classList.add('wx-clouds');
  }
}

// ── FX Canvas ─────────────────────────────────
let fxCanvas, fxCtx, fxW, fxH, fxParticles = [], fxAnimId;

function initFxCanvas() {
  fxCanvas = document.getElementById('fx-canvas');
  fxCtx    = fxCanvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
}

function resize() {
  fxW = fxCanvas.width  = window.innerWidth;
  fxH = fxCanvas.height = window.innerHeight;
}

function stopFx() {
  cancelAnimationFrame(fxAnimId);
  if (lightningTimer) { clearTimeout(lightningTimer); lightningTimer = null; }
  fxParticles = [];
  fxCtx?.clearRect(0, 0, fxW, fxH);
  fxActive = '';
}

// Rain
function startRain(heavy) {
  fxActive = 'rain';
  const count = heavy ? 240 : 130;
  fxParticles = Array.from({ length: count }, () => ({
    x:   Math.random() * fxW,
    y:   Math.random() * fxH,
    len: Math.random() * (heavy ? 22 : 14) + 8,
    spd: Math.random() * (heavy ? 12 : 7) + 5,
    a:   Math.random() * 0.35 + 0.1,
  }));
  tickRain();
}

function tickRain() {
  fxCtx.clearRect(0, 0, fxW, fxH);
  fxParticles.forEach(d => {
    fxCtx.beginPath();
    fxCtx.moveTo(d.x, d.y);
    fxCtx.lineTo(d.x - 1.5, d.y + d.len);
    fxCtx.strokeStyle = `rgba(180,210,240,${d.a})`;
    fxCtx.lineWidth = 0.8;
    fxCtx.stroke();
    d.y += d.spd;
    if (d.y > fxH + 5) { d.y = -d.len; d.x = Math.random() * fxW; }
  });
  fxAnimId = requestAnimationFrame(tickRain);
}

// Snow
function startSnow() {
  fxActive = 'snow';
  fxParticles = Array.from({ length: 90 }, () => ({
    x:   Math.random() * fxW,
    y:   Math.random() * fxH,
    r:   Math.random() * 3 + 1,
    vx: (Math.random() - 0.5) * 0.8,
    vy:  Math.random() * 1.2 + 0.4,
    a:   Math.random() * 0.7 + 0.2,
    wobble: Math.random() * Math.PI * 2,
  }));
  tickSnow();
}

function tickSnow() {
  fxCtx.clearRect(0, 0, fxW, fxH);
  fxParticles.forEach(p => {
    p.wobble += 0.02;
    p.x += p.vx + Math.sin(p.wobble) * 0.4;
    p.y += p.vy;
    fxCtx.beginPath();
    fxCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    fxCtx.fillStyle = `rgba(220,235,255,${p.a})`;
    fxCtx.fill();
    if (p.y > fxH + 5) { p.y = -5; p.x = Math.random() * fxW; }
    if (p.x < -5 || p.x > fxW + 5) p.x = Math.random() * fxW;
  });
  fxAnimId = requestAnimationFrame(tickSnow);
}

// Mist
function startMist() {
  fxActive = 'mist';
  fxParticles = Array.from({ length: 12 }, () => ({
    x:    Math.random() * fxW,
    y:    Math.random() * fxH,
    w:    Math.random() * 300 + 150,
    h:    Math.random() * 80 + 40,
    vx:   (Math.random() - 0.5) * 0.3,
    a:    Math.random() * 0.08 + 0.02,
  }));
  tickMist();
}

function tickMist() {
  fxCtx.clearRect(0, 0, fxW, fxH);
  fxParticles.forEach(p => {
    const grad = fxCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.w / 2);
    grad.addColorStop(0, `rgba(200,215,225,${p.a})`);
    grad.addColorStop(1, 'transparent');
    fxCtx.fillStyle = grad;
    fxCtx.beginPath();
    fxCtx.ellipse(p.x, p.y, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
    fxCtx.fill();
    p.x += p.vx;
    if (p.x > fxW + p.w / 2) p.x = -p.w / 2;
    if (p.x < -p.w / 2) p.x = fxW + p.w / 2;
  });
  fxAnimId = requestAnimationFrame(tickMist);
}

// Sun particles
function startSunParticles() {
  fxActive = 'sun';
  fxParticles = Array.from({ length: 30 }, () => ({
    x:   Math.random() * fxW,
    y:   Math.random() * fxH,
    r:   Math.random() * 1.5 + 0.3,
    vx: (Math.random() - 0.5) * 0.2,
    vy:  Math.random() * -0.3 - 0.05,
    a:   Math.random() * 0.3 + 0.05,
  }));
  tickSun();
}

function tickSun() {
  fxCtx.clearRect(0, 0, fxW, fxH);
  fxParticles.forEach(p => {
    fxCtx.beginPath();
    fxCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    fxCtx.fillStyle = `rgba(255,235,100,${p.a})`;
    fxCtx.fill();
    p.x += p.vx;
    p.y += p.vy;
    if (p.y < -3) { p.y = fxH + 3; p.x = Math.random() * fxW; }
  });
  fxAnimId = requestAnimationFrame(tickSun);
}

// Stars (night)
function startStars() {
  fxActive = 'stars';
  fxParticles = Array.from({ length: 120 }, () => ({
    x:  Math.random() * fxW,
    y:  Math.random() * fxH * 0.65,
    r:  Math.random() * 1.2 + 0.3,
    a:  Math.random() * 0.8 + 0.1,
    twinkle: Math.random() * Math.PI * 2,
  }));
  tickStars();
}

function tickStars() {
  fxCtx.clearRect(0, 0, fxW, fxH);
  fxParticles.forEach(p => {
    p.twinkle += 0.025;
    const alpha = p.a * (0.6 + 0.4 * Math.sin(p.twinkle));
    fxCtx.beginPath();
    fxCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    fxCtx.fillStyle = `rgba(220,230,255,${alpha})`;
    fxCtx.fill();
  });
  fxAnimId = requestAnimationFrame(tickStars);
}

// Lightning
function scheduleLightning() {
  const delay = Math.random() * 5000 + 3000;
  lightningTimer = setTimeout(() => {
    flash();
    if (document.body.classList.contains('wx-storm')) scheduleLightning();
  }, delay);
}

function flash() {
  const el = document.getElementById('lightning');
  el.style.background = 'rgba(210,220,255,0.18)';
  setTimeout(() => {
    el.style.background = 'rgba(210,220,255,0)';
    setTimeout(() => {
      el.style.background = 'rgba(210,220,255,0.10)';
      setTimeout(() => { el.style.background = 'rgba(210,220,255,0)'; }, 80);
    }, 60);
  }, 80);
}

// ── Wave chart ────────────────────────────────
let waveCanvas, waveCtx, wW, wH;

function initWave() {
  waveCanvas = document.getElementById('wave-canvas');
  waveCtx    = waveCanvas.getContext('2d');
  resizeWave();
  window.addEventListener('resize', resizeWave);
}

function resizeWave() {
  const sec = document.querySelector('.wave-section');
  wW = waveCanvas.width  = sec.offsetWidth;
  wH = waveCanvas.height = sec.offsetHeight;
  drawWave(14, 27);
}

function drawWave(lo, hi) {
  if (!waveCtx || wW === 0) return;
  waveCtx.clearRect(0, 0, wW, wH);

  const pts  = 9;
  const step = wW / (pts - 1);
  const range = (hi - lo) + 12;

  const hiPts = Array.from({ length: pts }, (_, i) =>
    hi + Math.sin(i * 0.85 + 1.1) * 3.5 + (Math.random() * 1.5 - 0.75)
  );
  const loPts = Array.from({ length: pts }, (_, i) =>
    lo + Math.cos(i * 0.85) * 2.5 + (Math.random() * 1.5 - 0.75)
  );

  const toY = t => wH * 0.12 + (wH * 0.62) * (1 - (t - lo + 3) / range);

  function curve(pts, color, width) {
    waveCtx.beginPath();
    waveCtx.strokeStyle = color;
    waveCtx.lineWidth   = width;
    pts.forEach((t, i) => {
      const x = i * step, y = toY(t);
      if (i === 0) waveCtx.moveTo(x, y);
      else {
        const px = (i-1) * step, py = toY(pts[i-1]);
        waveCtx.bezierCurveTo(px + step*.4, py, x - step*.4, y, x, y);
      }
    });
    waveCtx.stroke();
  }

  curve(hiPts, 'rgba(255,255,255,0.7)', 1.5);
  curve(loPts, 'rgba(255,255,255,0.32)', 1.2);

  waveCtx.font = '500 9px Outfit, sans-serif';
  waveCtx.textAlign = 'center';

  hiPts.forEach((t, i) => {
    const x = i * step, y = toY(t);
    waveCtx.fillStyle = 'rgba(255,255,255,0.72)';
    waveCtx.fillText(`HIGH ${Math.round(t)}°C`, x, y - 7);
    waveCtx.beginPath();
    waveCtx.arc(x, y, 2.5, 0, Math.PI * 2);
    waveCtx.fillStyle = 'rgba(255,255,255,0.9)';
    waveCtx.fill();
  });

  loPts.forEach((t, i) => {
    const x = i * step, y = toY(t);
    waveCtx.fillStyle = 'rgba(255,255,255,0.42)';
    waveCtx.fillText(`LOW ${Math.round(t)}°C`, x, y + 13);
    waveCtx.beginPath();
    waveCtx.arc(x, y, 2, 0, Math.PI * 2);
    waveCtx.fillStyle = 'rgba(255,255,255,0.48)';
    waveCtx.fill();
  });
}

// ── Mobile sheet ──────────────────────────────
function setupMobileSheet() {
  mobMenuBtn.addEventListener('click', () => {
    mobSheet.classList.toggle('open');
  });
  mobHandle.addEventListener('click', () => {
    mobSheet.classList.toggle('open');
  });

  // Swipe down to close
  let startY = 0;
  mobSheet.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, { passive: true });
  mobSheet.addEventListener('touchend', e => {
    const dy = e.changedTouches[0].clientY - startY;
    if (dy > 60) mobSheet.classList.remove('open');
    if (dy < -60) mobSheet.classList.add('open');
  }, { passive: true });
}

// ── Helpers ───────────────────────────────────
function updateClock() {
  const now = new Date();
  const el  = document.getElementById('clock');
  if (el) el.textContent =
    String(now.getHours()).padStart(2,'0') + ':' +
    String(now.getMinutes()).padStart(2,'0');
}

function updateDate() {
  const now = new Date();
  const el  = document.getElementById('nav-date');
  if (el) el.innerHTML =
    `${now.getDate()} ${now.toLocaleString('en',{month:'short'}).toUpperCase()} ` +
    `<span style="opacity:.5;font-size:.7rem">${now.getFullYear()}</span>`;
}

function conditionLabel(id) {
  if (id >= 200 && id < 300) return 'Stormy';
  if (id >= 300 && id < 500) return 'Drizzle';
  if (id >= 500 && id < 600) return 'Rainy';
  if (id >= 600 && id < 700) return 'Snowy';
  if (id >= 700 && id < 800) return 'Misty';
  if (id === 800)             return 'Clear Sky';
  if (id <= 802)              return 'Partly Cloudy';
  return 'Overcast';
}

function conditionSub(desc) {
  const d = desc.toLowerCase();
  if (d.includes('heavy'))   return 'with Heavy Rain';
  if (d.includes('light'))   return 'with Light Showers';
  if (d.includes('shower'))  return 'with Showers';
  if (d.includes('snow'))    return 'with Snowfall';
  if (d.includes('thunder')) return 'with Thunderstorms';
  if (d.includes('mist') || d.includes('fog')) return 'with Low Visibility';
  return 'Conditions Today';
}

function airQuality(h) {
  if (h < 35) return 'Dry';
  if (h < 55) return 'Excellent';
  if (h < 70) return 'Good';
  return 'Humid';
}

function weatherEmoji(id) {
  if (id >= 200 && id < 300) return '⛈';
  if (id >= 300 && id < 600) return '🌧';
  if (id >= 600 && id < 700) return '❄';
  if (id >= 700 && id < 800) return '🌫';
  if (id === 800)             return '☀';
  return '⛅';
}

function capitalise(s) { return s.charAt(0).toUpperCase() + s.slice(1); }