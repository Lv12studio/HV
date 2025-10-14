// ---------------------------
// 🌱 PROMĚNNÉ
// ---------------------------
let money = 100;
let xp = 0;
let level = 1;
let day = 1;
let farmSize = 8;

const farmEl = document.getElementById("farm");
const cropsEl = document.getElementById("crops");
const animalsEl = document.getElementById("animals");

const moneyEl = document.getElementById("money");
const levelEl = document.getElementById("level");
const xpText = document.getElementById("xp-text");
const xpProgress = document.getElementById("xp-progress");
const dayEl = document.getElementById("day");
const farmSizeEl = document.getElementById("farm-size");

const selectedCropName = document.getElementById("selected-crop-name");
const selectedCropIcon = document.getElementById("selected-crop-icon");

let selectedCrop = null;

// ---------------------------
// 🌾 DATA
// ---------------------------
const crops = [
  { name: "Mrkev", icon: "🥕", cost: 10, growTime: 2, profit: 25, xp: 10 },
  { name: "Rajče", icon: "🍅", cost: 20, growTime: 3, profit: 45, xp: 20 },
  { name: "Slunečnice", icon: "🌻", cost: 30, growTime: 4, profit: 70, xp: 30 },
];

const animals = [
  { name: "Slepice", icon: "🐔", cost: 50, income: 10 },
  { name: "Králík", icon: "🐇", cost: 100, income: 25 },
  { name: "Kráva", icon: "🐄", cost: 200, income: 50 },
];

let farm = [];
let ownedAnimals = [];

// ---------------------------
// 🔧 FUNKCE
// ---------------------------
function renderFarm() {
  farmEl.innerHTML = "";
  for (let i = 0; i < farmSize; i++) {
    const plot = document.createElement("div");
    plot.classList.add("plot");
    const tile = farm[i];
    if (!tile) {
      plot.classList.add("empty");
    } else if (tile.state === "planted") {
      plot.classList.add("planted");
      plot.textContent = tile.crop.icon;
    } else if (tile.state === "ready") {
      plot.classList.add("ready");
      plot.textContent = tile.crop.icon;
    }
    plot.addEventListener("click", () => handlePlotClick(i));
    farmEl.appendChild(plot);
  }
}

function renderCrops() {
  cropsEl.innerHTML = "";
  crops.forEach(crop => {
    const div = document.createElement("div");
    div.classList.add("crop-item");
    div.innerHTML = `
      <div class="crop-icon">${crop.icon}</div>
      <div class="crop-name">${crop.name}</div>
      <div class="crop-cost">Cena: ${crop.cost}</div>
      <div class="crop-time">Roste: ${crop.growTime} dny</div>
    `;
    div.addEventListener("click", () => selectCrop(crop));
    cropsEl.appendChild(div);
  });
}

function renderAnimals() {
  animalsEl.innerHTML = "";
  animals.forEach(animal => {
    const div = document.createElement("div");
    div.classList.add("animal-item");
    div.innerHTML = `
      <div class="animal-icon">${animal.icon}</div>
      <div class="animal-name">${animal.name}</div>
      <div class="animal-cost">Cena: ${animal.cost}</div>
      <div class="animal-income">Příjem: ${animal.income}/den</div>
    `;
    div.addEventListener("click", () => buyAnimal(animal));
    animalsEl.appendChild(div);
  });
}

function selectCrop(crop) {
  selectedCrop = crop;
  selectedCropName.textContent = crop.name;
  selectedCropIcon.textContent = crop.icon;
}

function handlePlotClick(index) {
  const tile = farm[index];
  if (!tile && selectedCrop) {
    if (money >= selectedCrop.cost) {
      money -= selectedCrop.cost;
      farm[index] = { crop: selectedCrop, days: 0, state: "planted" };
      updateStats();
      renderFarm();
    } else alert("Nemáš dost peněz!");
  } else if (tile && tile.state === "ready") {
    money += tile.crop.profit;
    xp += tile.crop.xp;
    farm[index] = null;
    checkLevelUp();
    updateStats();
    renderFarm();
  }
}

function nextDay() {
  day++;
  dayEl.textContent = day;
  farm.forEach(tile => {
    if (tile && tile.state === "planted") {
      tile.days++;
      if (tile.days >= tile.crop.growTime) tile.state = "ready";
    }
  });
  ownedAnimals.forEach(a => (money += a.income));
  updateStats();
  renderFarm();
}

function buyAnimal(animal) {
  if (money >= animal.cost) {
    money -= animal.cost;
    ownedAnimals.push(animal);
    updateStats();
    alert(`Koupil jsi ${animal.name}!`);
  } else alert("Nemáš dost peněz!");
}

function updateStats() {
  moneyEl.textContent = money;
  levelEl.textContent = level;
  xpText.textContent = `${xp}/100 XP`;
  xpProgress.style.width = `${(xp % 100)}%`;
  farmSizeEl.textContent = farmSize;
}

function checkLevelUp() {
  if (xp >= 100) {
    xp -= 100;
    level++;
    alert(`🎉 Level UP! Jsi na levelu ${level}!`);
  }
  updateStats();
}

// ---------------------------
// ▶️ SPUŠTĚNÍ
// ---------------------------
document.getElementById("next-day").addEventListener("click", nextDay);
document.getElementById("save-game").addEventListener("click", () => {
  localStorage.setItem("farmData", JSON.stringify({ money, xp, level, day, farm, ownedAnimals }));
  const s = document.getElementById("save-indicator");
  s.style.display = "block";
  setTimeout(() => (s.style.display = "none"), 1500);
});

// inicializace
renderFarm();
renderCrops();
renderAnimals();
updateStats();
