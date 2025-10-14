/* =============================
   Harvest Valley – script.js (finální)
   ============================= */

const farmEl = document.getElementById("farm");
const cropsEl = document.getElementById("crops");
const animalsEl = document.getElementById("animals");
const selectedCropNameEl = document.getElementById("selected-crop-name");
const selectedCropIconEl = document.getElementById("selected-crop-icon");
const moneyEl = document.getElementById("money");
const levelEl = document.getElementById("level");
const xpProgressEl = document.getElementById("xp-progress");
const xpTextEl = document.getElementById("xp-text");
const dayEl = document.getElementById("day");
const farmSizeEl = document.getElementById("farm-size");
const themeToggleBtn = document.getElementById("theme-toggle");

let selectedCrop = null;

/* =============================
   PLANTY
   ============================= */
const ALL_CROPS = [
  { name: "Mrkev", icon: "🥕", cost: 10, growTime: 2, profit: Math.ceil(10 * 1.5), xp: 3 },
  { name: "Rajče", icon: "🍅", cost: 15, growTime: 3, profit: Math.ceil(15 * 1.5), xp: 4 },
  { name: "Salát", icon: "🥬", cost: 12, growTime: 2, profit: Math.ceil(12 * 1.5), xp: 3 },
  { name: "Brambory", icon: "🥔", cost: 20, growTime: 4, profit: Math.ceil(20 * 1.5), xp: 5 },
  { name: "Jahody", icon: "🍓", cost: 18, growTime: 3, profit: Math.ceil(18 * 1.5), xp: 4 },
  { name: "Cibule", icon: "🧅", cost: 14, growTime: 2, profit: Math.ceil(14 * 1.5), xp: 3 },
  { name: "Paprika", icon: "🌶️", cost: 16, growTime: 3, profit: Math.ceil(16 * 1.5), xp: 4 },
  { name: "Meloun", icon: "🍉", cost: 25, growTime: 5, profit: Math.ceil(25 * 1.5), xp: 6 },
  { name: "Jablko", icon: "🍎", cost: 22, growTime: 4, profit: Math.ceil(22 * 1.5), xp: 5 },
];

/* =============================
   ZVÍŘATA
   ============================= */
const ALL_ANIMALS = [
  { name: "Kráva", icon: "🐄", cost: 50, income: Math.ceil(50 * 1.5 / 12) },
  { name: "Koza", icon: "🐐", cost: 40, income: Math.ceil(40 * 1.5 / 12) },
  { name: "Slepice", icon: "🐔", cost: 30, income: Math.ceil(30 * 1.5 / 12) },
  { name: "Ovce", icon: "🐑", cost: 45, income: Math.ceil(45 * 1.5 / 12) },
  { name: "Prase", icon: "🐖", cost: 35, income: Math.ceil(35 * 1.5 / 12) },
  { name: "Kůň", icon: "🐎", cost: 60, income: Math.ceil(60 * 1.5 / 12) },
  { name: "Králík", icon: "🐇", cost: 20, income: Math.ceil(20 * 1.5 / 12) },
  { name: "Kačer", icon: "🦆", cost: 25, income: Math.ceil(25 * 1.5 / 12) },
  { name: "Medvěd", icon: "🐻", cost: 100, income: Math.ceil(100 * 1.5 / 12) },
];

/* =============================
   STAV HRY
   ============================= */
let state = {
  money: 100,
  level: 1,
  xp: 0,
  day: 1,
  farmSize: 9,
  farm: Array(9).fill(null),
  selectedCrop: null,
  ownedAnimals: [],
  unlockedCrops: 1,
  unlockedAnimals: 1,
};

/* =============================
   SAVE / LOAD
   ============================= */
function saveState() {
  localStorage.setItem("hv_state", JSON.stringify(state));
}

function loadState() {
  const s = localStorage.getItem("hv_state");
  if (s) state = JSON.parse(s);
}

/* =============================
   THEME
   ============================= */
function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  themeToggleBtn.innerHTML = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem("hv_theme", theme);
}

themeToggleBtn.addEventListener("click", () => {
  const newTheme = document.body.classList.contains("dark") ? "light" : "dark";
  applyTheme(newTheme);
});

const savedTheme = localStorage.getItem("hv_theme") || "light";
applyTheme(savedTheme);

/* =============================
   FARM GENERATION
   ============================= */
function renderFarm() {
  farmEl.innerHTML = "";
  for (let i = 0; i < state.farmSize; i++) {
    const plot = document.createElement("div");
    plot.className = "plot";
    const crop = state.farm[i];

    if (crop) {
      const progress = Math.min(100, (crop.days / crop.growTime) * 100);
      plot.innerHTML = `
        <div class="crop-emoji">${crop.icon}</div>
        <div class="small-name">${crop.name}</div>
        <div class="grow-wrap"><div class="grow" style="width:${progress}%;"></div></div>
      `;
      if (crop.days >= crop.growTime) {
        plot.style.border = "2px solid var(--accent)";
      }
    } else {
      plot.innerHTML = "<div style='opacity:0.3;'>🌾</div>";
    }

    plot.onclick = () => handlePlotClick(i);
    farmEl.appendChild(plot);
  }
  farmSizeEl.textContent = state.farmSize;
}

/* =============================
   SHOP
   ============================= */
function renderShop() {
  cropsEl.innerHTML = "";
  animalsEl.innerHTML = "";

  ALL_CROPS.forEach((c, i) => {
    const div = document.createElement("div");
    div.className = "crop-item" + (i >= state.unlockedCrops ? " locked" : "");
    div.innerHTML = `
      <div class="crop-icon">${c.icon}</div>
      <div>${c.name}</div>
      <div class="meta">${c.cost}💰</div>
    `;
    if (i < state.unlockedCrops) div.onclick = () => selectCrop(c);
    cropsEl.appendChild(div);
  });

  ALL_ANIMALS.forEach((a, i) => {
    const div = document.createElement("div");
    div.className = "animal-item" + (i >= state.unlockedAnimals ? " locked" : "");
    div.innerHTML = `
      <div class="animal-icon">${a.icon}</div>
      <div>${a.name}</div>
      <div class="meta">${a.cost}💰</div>
    `;
    if (i < state.unlockedAnimals) div.onclick = () => buyAnimal(a);
    animalsEl.appendChild(div);
  });
}

/* =============================
   CROPS & ANIMALS
   ============================= */
function selectCrop(crop) {
  selectedCrop = crop;
  selectedCropNameEl.textContent = crop.name;
  selectedCropIconEl.textContent = crop.icon;
  state.selectedCrop = crop.name;
  saveState();
}

function buyAnimal(a) {
  if (state.money >= a.cost) {
    state.money -= a.cost;
    state.ownedAnimals.push(a);
    gainXP(2);
    saveState();
    updateUI();
  }
}

/* =============================
   GAME LOGIC
   ============================= */
function handlePlotClick(i) {
  const plot = state.farm[i];
  if (!plot && selectedCrop) {
    if (state.money >= selectedCrop.cost) {
      state.money -= selectedCrop.cost;
      state.farm[i] = { ...selectedCrop, days: 0 };
      saveState();
      updateUI();
    }
  } else if (plot && plot.days >= plot.growTime) {
    state.money += plot.profit;
    gainXP(plot.xp);
    state.farm[i] = null;
    saveState();
    updateUI();
  }
}

function nextDay() {
  state.day++;
  state.farm.forEach((crop) => {
    if (crop) crop.days++;
  });

  // příjem od zvířat
  state.ownedAnimals.forEach((a) => (state.money += a.income));

  checkUnlocks();
  saveState();
  updateUI();
}

function restartGame() {
  if (confirm("Opravdu chceš začít znovu?")) {
    localStorage.removeItem("hv_state");
    location.reload();
  }
}

/* =============================
   XP / LEVEL
   ============================= */
function gainXP(amount) {
  state.xp += amount;
  const needed = 100;
  if (state.xp >= needed) {
    state.xp -= needed;
    state.level++;
    checkUnlocks();
  }
}

function checkUnlocks() {
  if (state.level < 35) {
    state.unlockedCrops = Math.min(ALL_CROPS.length, Math.floor(state.level / 1) + 1);
    state.unlockedAnimals = Math.min(ALL_ANIMALS.length, Math.floor(state.level / 1) + 1);
  }
  if (state.level % 5 === 0 && state.farmSize < 21) {
    state.farmSize += 3;
    while (state.farm.length < state.farmSize) state.farm.push(null);
  }
}

/* =============================
   UPDATE UI
   ============================= */
function updateUI() {
  renderFarm();
  renderShop();
  moneyEl.textContent = state.money;
  levelEl.textContent = state.level;
  dayEl.textContent = state.day;
  xpProgressEl.style.width = `${(state.xp / 100) * 100}%`;
  xpTextEl.textContent = `${state.xp}/100 XP`;
}

/* =============================
   INIT
   ============================= */
loadState();
if (!state.farm) state.farm = Array(state.farmSize).fill(null);
if (state.selectedCrop) {
  const sel = ALL_CROPS.find(c => c.name === state.selectedCrop);
  if (sel) selectCrop(sel);
}
updateUI();

/* =============================
   BUTTONS
   ============================= */
document.getElementById("next-day").onclick = nextDay;
document.getElementById("restart-game").onclick = restartGame;
     
