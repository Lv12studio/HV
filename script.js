/* ============================
   Hra: script.js (v3 – unlock systém + max level 35)
   ============================ */

/* ---------- základní stav ---------- */
const DEFAULT_STATE = {
  money: 150,
  xp: 0,
  level: 1,
  day: 1,
  farmSize: 9,
  farm: Array(9).fill(null),
  ownedAnimals: [],
  unlockedCrops: 1, // začíná s 1 plodinou
  unlockedAnimals: 0, // žádné zvíře
  theme: 'light'
};

let state = loadState() || DEFAULT_STATE;

/* ---------- DOM prvky ---------- */
const moneyEl = document.getElementById('money');
const levelEl = document.getElementById('level');
const dayEl = document.getElementById('day');
const xpProgressEl = document.getElementById('xp-progress');
const xpTextEl = document.getElementById('xp-text');
const farmSizeEl = document.getElementById('farm-size');

const farmEl = document.getElementById('farm');
const cropsEl = document.getElementById('crops');
const animalsEl = document.getElementById('animals');

const selectedCropName = document.getElementById('selected-crop-name');
const selectedCropIcon = document.getElementById('selected-crop-icon');

const saveIndicator = document.getElementById('save-indicator');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

let selectedCrop = null;

/* ---------- data: plodiny + zvířata ---------- */
const ALL_CROPS = [
  { name: "Mrkev", icon: "🥕", cost: 10, growTime: 2, profit: 25, xp: 10 },
  { name: "Pšenice", icon: "🌾", cost: 8, growTime: 2, profit: 18, xp: 8 },
  { name: "Kukuřice", icon: "🌽", cost: 18, growTime: 3, profit: 40, xp: 18 },
  { name: "Brambora", icon: "🥔", cost: 12, growTime: 2, profit: 30, xp: 12 },
  { name: "Rajče", icon: "🍅", cost: 20, growTime: 3, profit: 50, xp: 20 },
  { name: "Jahoda", icon: "🍓", cost: 15, growTime: 2, profit: 35, xp: 14 },
  { name: "Slunečnice", icon: "🌻", cost: 25, growTime: 4, profit: 80, xp: 30 },
  { name: "Dýně", icon: "🎃", cost: 30, growTime: 5, profit: 120, xp: 40 },
  { name: "Jabloň", icon: "🍎", cost: 40, growTime: 6, profit: 160, xp: 55 },
  { name: "Levandule", icon: "💜", cost: 22, growTime: 3, profit: 60, xp: 25 }
];

const ALL_ANIMALS = [
  { name: "Slepice", icon: "🐔", cost: 50, income: 8 },
  { name: "Králík", icon: "🐇", cost: 80, income: 18 },
  { name: "Kráva", icon: "🐄", cost: 200, income: 50 },
  { name: "Prase", icon: "🐖", cost: 120, income: 28 },
  { name: "Ovce", icon: "🐑", cost: 100, income: 20 },
  { name: "Kachna", icon: "🦆", cost: 60, income: 10 },
  { name: "Kůň", icon: "🐎", cost: 250, income: 70 },
  { name: "Pes", icon: "🐕", cost: 40, income: 5 }
];

/* ---------- inicializace ---------- */
function init() {
  applyTheme(state.theme);
  renderCrops();
  renderAnimals();
  renderFarm();
  updateStats();
  setInterval(() => saveState(), 60_000);
}

/* ---------- renderování ---------- */
function renderCrops() {
  cropsEl.innerHTML = '';
  ALL_CROPS.forEach((c, index) => {
    const el = document.createElement('div');
    el.className = 'crop-item';
    const locked = index >= state.unlockedCrops;
    if (locked) el.classList.add('locked');
    el.innerHTML = `
      <div class="crop-icon">${c.icon}</div>
      <div class="crop-name">${c.name}</div>
      ${
        locked
          ? `<div class="crop-locked">🔒 Odemkne se na levelu ${index + 1}</div>`
          : `<div class="meta">Cena: ${c.cost} • Růst: ${c.growTime} dny</div>`
      }
    `;
    if (!locked) {
      el.addEventListener('click', () => {
        selectedCrop = c;
        selectedCropName.textContent = c.name;
        selectedCropIcon.textContent = c.icon;
      });
    }
    cropsEl.appendChild(el);
  });
}

function renderAnimals() {
  animalsEl.innerHTML = '';
  ALL_ANIMALS.forEach((a, index) => {
    const el = document.createElement('div');
    el.className = 'animal-item';
    const locked = index >= state.unlockedAnimals;
    if (locked) el.classList.add('locked');
    el.innerHTML = `
      <div class="animal-icon">${a.icon}</div>
      <div class="animal-name">${a.name}</div>
      ${
        locked
          ? `<div class="crop-locked">🔒 Odemkne se na levelu ${index + 1}</div>`
          : `<div class="meta">Cena: ${a.cost} • Příjem: ${a.income}/den</div>`
      }
    `;
    if (!locked) el.addEventListener('click', () => buyAnimal(a));
    animalsEl.appendChild(el);
  });
}

function renderFarm() {
  farmEl.innerHTML = '';
  while (state.farm.length < state.farmSize) state.farm.push(null);
  state.farm = state.farm.slice(0, state.farmSize);

  state.farm.forEach((slot, idx) => {
    const plot = document.createElement('div');
    plot.className = 'plot';
    plot.innerHTML = `
      <div class="crop-emoji"></div>
      <div class="small-name"></div>
      <div class="grow-wrap"><div class="grow"></div></div>
    `;
    const emoji = plot.querySelector('.crop-emoji');
    const name = plot.querySelector('.small-name');
    const growBar = plot.querySelector('.grow');

    if (!slot) {
      plot.classList.add('empty');
      emoji.textContent = '🟫';
      growBar.style.width = '0%';
    } else {
      if (slot.state === 'planted') {
        plot.classList.add('planted');
        emoji.textContent = slot.crop.icon;
        name.textContent = slot.crop.name;
        growBar.style.width =
          Math.min(100, Math.round((slot.days / slot.crop.growTime) * 100)) + '%';
      } else if (slot.state === 'ready') {
        plot.classList.add('ready');
        emoji.textContent = slot.crop.icon;
        name.textContent = slot.crop.name;
        growBar.style.width = '100%';
      } else if (slot.state === 'withered') {
        plot.classList.add('withered');
        emoji.textContent = '☠️';
        name.textContent = 'Uhyne';
        growBar.style.width = '100%';
      }
    }

    plot.addEventListener('click', () => onPlotClick(idx));
    farmEl.appendChild(plot);
  });
}

/* ---------- interakce ---------- */
function onPlotClick(index) {
  const slot = state.farm[index];
  if (!slot) {
    if (!selectedCrop) {
      alert('Vyber plodinu v obchodě.');
      return;
    }
    if (state.money < selectedCrop.cost) {
      alert('Nemáš dost peněz.');
      return;
    }
    state.money -= selectedCrop.cost;
    state.farm[index] = { crop: { ...selectedCrop }, days: 0, state: 'planted' };
    renderFarm();
    updateStats();
    saveStateDebounced();
  } else if (slot.state === 'ready') {
    state.money += slot.crop.profit;
    state.xp += slot.crop.xp;
    state.farm[index] = null;
    checkLevelUp();
    renderFarm();
    updateStats();
    saveStateDebounced();
  } else if (slot.state === 'withered') {
    state.farm[index] = null;
    renderFarm();
    saveStateDebounced();
  }
}

/* ---------- další den ---------- */
function nextDay() {
  state.day++;
  state.farm.forEach(slot => {
    if (slot && slot.state === 'planted') {
      slot.days++;
      if (slot.days >= slot.crop.growTime) slot.state = 'ready';
      if (slot.days >= slot.crop.growTime + 3) slot.state = 'withered';
    }
  });

  state.ownedAnimals.forEach(a => {
    state.money += a.income;
  });

  renderFarm();
  updateStats();
  saveStateDebounced();
}

/* ---------- zvířata ---------- */
function buyAnimal(animal) {
  if (state.money < animal.cost) {
    alert('Nemáš dost peněz.');
    return;
  }
  state.money -= animal.cost;
  state.ownedAnimals.push({ ...animal });
  updateStats();
  saveStateDebounced();
  alert(`Koupil jsi ${animal.name}!`);
}

/* ---------- level systém + unlocky ---------- */
function checkLevelUp() {
  while (state.xp >= 100 && state.level < 35) {
    state.xp -= 100;
    state.level++;
    alert(`🎉 Level UP! Jsi nyní na levelu ${state.level}`);

    // odemykání nových plodin/zvířat prvních 9 levelů
    if (state.level <= 9) {
      if (state.level % 2 === 1 && state.unlockedCrops < ALL_CROPS.length) {
        state.unlockedCrops++;
        alert(`🌱 Nová plodina odemčena: ${ALL_CROPS[state.unlockedCrops - 1].name}`);
      } else if (state.unlockedAnimals < ALL_ANIMALS.length) {
        state.unlockedAnimals++;
        alert(`🐾 Nové zvíře odemknuto: ${ALL_ANIMALS[state.unlockedAnimals - 1].name}`);
      }
    }

    // rozšíření farmy každých 5 levelů
    if (state.level % 5 === 0 && state.farmSize < 21) {
      state.farmSize = Math.min(state.farmSize + 3, 21);
      while (state.farm.length < state.farmSize) state.farm.push(null);
      alert(`🌾 Farma se rozšířila! Nyní máš ${state.farmSize} políček.`);
    }
  }

  renderCrops();
  renderAnimals();
  renderFarm();
}

/* ---------- update UI ---------- */
function updateStats() {
  moneyEl.textContent = state.money;
  levelEl.textContent = state.level;
  dayEl.textContent = state.day;
  xpTextEl.textContent = `${state.xp}/100 XP`;
  xpProgressEl.style.width = `${(state.xp % 100)}%`;
  farmSizeEl.textContent = state.farmSize;
}

/* ---------- save / load ---------- */
function saveState() {
  try {
    localStorage.setItem('garden_save_v3', JSON.stringify(state));
    showSaveIndicator();
  } catch (e) {
    console.error('Save failed', e);
  }
}
function loadState() {
  try {
    const s = localStorage.getItem('garden_save_v3');
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}
function saveStateDebounced() {
  if (window._saveTimeout) clearTimeout(window._saveTimeout);
  window._saveTimeout = setTimeout(saveState, 500);
}

/* ---------- theme ---------- */
function applyTheme(t) {
  document.body.classList.toggle('dark', t === 'dark');
  state.theme = t;
  themeIcon.className = t === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  saveStateDebounced();
}

/* ---------- UI pomocné ---------- */
function showSaveIndicator() {
  saveIndicator.style.display = 'block';
  setTimeout(() => (saveIndicator.style.display = 'none'), 1200);
}

/* ---------- reset ---------- */
function resetGame() {
  if (!confirm('Opravdu chceš resetovat hru?')) return;
  localStorage.removeItem('garden_save_v3');
  state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  renderFarm();
  updateStats();
  renderCrops();
  renderAnimals();
  applyTheme(state.theme);
}

/* ---------- eventy ---------- */
document.getElementById('next-day').addEventListener('click', nextDay);
document.getElementById('save-game').addEventListener('click', saveState);
document.getElementById('clear-game').addEventListener('click', resetGame);

themeToggle.addEventListener('click', () => {
  applyTheme(state.theme === 'dark' ? 'light' : 'dark');
});

/* ---------- start ---------- */
init();
