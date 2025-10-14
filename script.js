// === Herní proměnné ===
let money = 100;
let level = 1;
let xp = 0;
let xpNeeded = 100;
let day = 1;
let farmSize = 8;
let selectedCrop = null;
let animals = [];
let fields = [];
let currentSeason = "Jaro";

// === Data ===
const cropList = [
  { name: "Mrkev", icon: "🥕", cost: 10, grow: 3, sell: 20, xp: 10 },
  { name: "Brambory", icon: "🥔", cost: 15, grow: 4, sell: 30, xp: 15 },
  { name: "Kukuřice", icon: "🌽", cost: 20, grow: 5, sell: 40, xp: 20 },
  { name: "Jahody", icon: "🍓", cost: 25, grow: 4, sell: 50, xp: 25 },
  { name: "Dýně", icon: "🎃", cost: 40, grow: 6, sell: 90, xp: 40 },
];

const animalList = [
  { name: "Slepice", icon: "🐔", cost: 50, income: 5 },
  { name: "Králík", icon: "🐇", cost: 80, income: 8 },
  { name: "Ovce", icon: "🐑", cost: 120, income: 12 },
  { name: "Koza", icon: "🐐", cost: 180, income: 15 },
];

// === Elementy ===
const farm = document.getElementById("farm");
const moneyEl = document.getElementById("money");
const levelEl = document.getElementById("level");
const xpBar = document.getElementById("xp-bar");
const xpText = document.getElementById("xp-text");
const dayEl = document.getElementById("day");
const plotsEl = document.getElementById("plots");
const selectedCropEl = document.getElementById("selected-crop");
const toast = document.getElementById("toast");
const seasonEl = document.getElementById("season");
const seasonIcon = document.getElementById("season-icon");

// === Inicializace ===
function init() {
  for (let i = 0; i < farmSize; i++) {
    fields.push({ state: "empty", crop: null, progress: 0 });
  }
  renderFarm();
  renderShop();
  renderAnimals();
  updateUI();
  updateSeason();
}

function renderFarm() {
  farm.innerHTML = "";
  fields.forEach((f, i) => {
    const div = document.createElement("div");
    div.className = "plot " + f.state;
    div.innerText = f.crop ? f.crop.icon : "+";
    div.addEventListener("click", () => handlePlot(i));
    farm.appendChild(div);
  });
}

function renderShop() {
  const container = document.getElementById("crops");
  container.innerHTML = "";
  cropList.forEach(crop => {
    const item = document.createElement("div");
    item.className = "shop-item";
    item.innerHTML = `<div>${crop.icon}</div><div>${crop.name}</div><small>$${crop.cost} • ${crop.grow} dní</small>`;
    item.onclick = () => selectCrop(crop);
    container.appendChild(item);
  });
}

function renderAnimals() {
  const container = document.getElementById("animals");
  container.innerHTML = "";
  animalList.forEach(a => {
    const item = document.createElement("div");
    item.className = "shop-item";
    item.innerHTML = `<div>${a.icon}</div><div>${a.name}</div><small>$${a.cost} • +$${a.income}/den</small>`;
    item.onclick = () => buyAnimal(a);
    container.appendChild(item);
  });
}

// === Logika ===
function selectCrop(crop) {
  selectedCrop = crop;
  selectedCropEl.textContent = `${crop.name} ${crop.icon}`;
}

function handlePlot(i) {
  const plot = fields[i];
  if (plot.state === "empty" && selectedCrop) {
    if (money >= selectedCrop.cost) {
      money -= selectedCrop.cost;
      plot.state = "planted";
      plot.crop = { ...selectedCrop };
      plot.progress = 0;
    }
  } else if (plot.state === "ready") {
    money += plot.crop.sell;
    xp += plot.crop.xp;
    plot.state = "empty";
    plot.crop = null;
  }
  updateUI();
  renderFarm();
}

function buyAnimal(animal) {
  if (money >= animal.cost) {
    money -= animal.cost;
    animals.push(animal);
    showToast(`${animal.name} přidán! 🐾`);
    updateUI();
  } else {
    showToast("Nedostatek peněz!");
  }
}

// === Den & XP ===
document.getElementById("next-day").onclick = () => {
  day++;
  fields.forEach(plot => {
    if (plot.state === "planted") {
      plot.progress++;
      if (plot.progress >= plot.crop.grow) {
        plot.state = "ready";
      }
    }
  });
  animals.forEach(a => (money += a.income));
  if (xp >= xpNeeded) levelUp();
  updateUI();
  renderFarm();
  updateSeason();
};

function levelUp() {
  level++;
  xp = 0;
  xpNeeded = Math.floor(xpNeeded * 1.5);
  if (level === 3 || level === 6 || level === 10) {
    farmSize += 2;
    fields.push({ state: "empty" }, { state: "empty" });
    showToast("🌾 Zahrada se rozšířila!");
  }
}

// === Sezóny ===
function updateSeason() {
  const seasons = ["Jaro", "Léto", "Podzim", "Zima"];
  currentSeason = seasons[Math.floor(((day - 1) / 90) % 4)];
  seasonEl.textContent = currentSeason;
  const icons = { Jaro: "🌸", Léto: "☀️", Podzim: "🍁", Zima: "❄️" };
  seasonIcon.textContent = icons[currentSeason];
}

// === UI ===
function updateUI() {
  moneyEl.textContent = money;
  levelEl.textContent = level;
  xpText.textContent = `${xp}/${xpNeeded} XP`;
  xpBar.style.width = `${(xp / xpNeeded) * 100}%`;
  dayEl.textContent = day;
  plotsEl.textContent = farmSize;
}

// === Ukládání ===
document.getElementById("save").onclick = () => {
  const data = { money, level, xp, xpNeeded, day, farmSize, fields, animals };
  localStorage.setItem("zahradnikSave", JSON.stringify(data));
  showToast("💾 Hra uložena!");
};

function loadGame() {
  const data = JSON.parse(localStorage.getItem("zahradnikSave"));
  if (!data) return;
  ({ money, level, xp, xpNeeded, day, farmSize, fields, animals } = data);
  renderFarm();
  updateUI();
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

loadGame();
init();
