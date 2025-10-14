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

/* -----------------------
   Plodiny (levnější → dražší)
------------------------ */
const ALL_CROPS = [
  { name: "Mrkev", icon: "🥕", cost: 10, growTime: 2, profit: Math.ceil(10*1.5), xp: 3 },
  { name: "Salát", icon: "🥬", cost: 12, growTime: 2, profit: Math.ceil(12*1.5), xp: 3 },
  { name: "Cibule", icon: "🧅", cost: 14, growTime: 2, profit: Math.ceil(14*1.5), xp: 3 },
  { name: "Rajče", icon: "🍅", cost: 18, growTime: 3, profit: Math.ceil(18*1.5), xp: 4 },
  { name: "Paprika", icon: "🌶️", cost: 22, growTime: 3, profit: Math.ceil(22*1.5), xp: 4 },
  { name: "Okurka", icon: "🥒", cost: 25, growTime: 3, profit: Math.ceil(25*1.5), xp: 5 },
  { name: "Brambory", icon: "🥔", cost: 30, growTime: 4, profit: Math.ceil(30*1.5), xp: 6 },
  { name: "Jahody", icon: "🍓", cost: 35, growTime: 4, profit: Math.ceil(35*1.5), xp: 7 },
];

/* -----------------------
   Zvířata
------------------------ */
const ALL_ANIMALS = [
  { name: "Slepička", icon: "🐔", cost: 50, income: Math.ceil(50*1.5/12), xp: 5 },
  { name: "Koza", icon: "🐐", cost: 120, income: Math.ceil(120*1.5/12), xp: 10 },
  { name: "Kráva", icon: "🐄", cost: 200, income: Math.ceil(200*1.5/12), xp: 15 },
  { name: "Ovce", icon: "🐑", cost: 300, income: Math.ceil(300*1.5/12), xp: 20 },
];

/* -----------------------
   Stav hry
------------------------ */
let state = JSON.parse(localStorage.getItem("harvestState")) || {
  money: 100,
  xp: 0,
  level: 1,
  day: 1,
  farmSize: 9,
  farm: Array(9).fill(null),
  animals: [],
  selectedCrop: null,
  darkMode: false,
};

/* -----------------------
   Funkce
------------------------ */
function saveState() {
  localStorage.setItem("harvestState", JSON.stringify(state));
}

function renderFarm() {
  farmEl.innerHTML = "";
  state.farm.forEach((plot,i)=>{
    const div = document.createElement("div");
    div.classList.add("plot");
    if(plot){
      div.innerHTML = `<div class="crop-emoji">${plot.icon}</div>
        <div class="small-name">${plot.name}</div>
        <div class="grow-wrap"><div class="grow" style="width:${(plot.age/plot.growTime)*100}%"></div></div>`;
      if(plot.age >= plot.growTime) div.style.borderColor="gold";
    }
    div.onclick = ()=>plantOrHarvest(i);
    farmEl.appendChild(div);
  });
}

function renderCrops() {
  cropsEl.innerHTML = "";
  ALL_CROPS.forEach(c=>{
    const div = document.createElement("div");
    div.classList.add("crop-item");
    if(state.level < ALL_CROPS.indexOf(c)+1) div.classList.add("locked");
    div.innerHTML = `<div class="crop-icon">${c.icon}</div>
      <div class="meta">${c.name} (${c.cost}💰)</div>`;
    div.onclick = ()=>{
      if(state.level >= ALL_CROPS.indexOf(c)+1) selectCrop(c);
    };
    cropsEl.appendChild(div);
  });
}

function renderAnimals() {
  animalsEl.innerHTML = "";
  ALL_ANIMALS.forEach(a=>{
    const div = document.createElement("div");
    div.classList.add("animal-item");
    if(state.level < ALL_ANIMALS.indexOf(a)+1) div.classList.add("locked");
    div.innerHTML = `<div class="animal-icon">${a.icon}</div>
      <div class="meta">${a.name} (${a.cost}💰)</div>`;
    div.onclick = ()=>{
      if(state.level >= ALL_ANIMALS.indexOf(a)+1 && state.money >= a.cost){
        state.money -= a.cost;
        state.animals.push(a);
        updateUI();
        saveState();
      }
    };
    animalsEl.appendChild(div);
  });
}

function selectCrop(c) {
  selectedCrop = c;
  state.selectedCrop = c.name;
  selectedCropNameEl.textContent = c.name;
  selectedCropIconEl.textContent = c.icon;
  saveState();
}

function plantOrHarvest(i){
  const plot = state.farm[i];
  if(plot){
    if(plot.age >= plot.growTime){
      state.money += plot.profit;
      state.xp += plot.xp;
      state.farm[i] = null;
      checkLevelUp();
      updateUI();
      saveState();
    }
  } else {
    if(selectedCrop && state.money >= selectedCrop.cost){
      state.money -= selectedCrop.cost;
      state.farm[i] = {...selectedCrop, age:0};
      updateUI();
      saveState();
    }
  }
}

function nextDay(){
  state.day++;
  state.farm.forEach(plot=>{
    if(plot) plot.age++;
  });
  // Zvířata přinášejí peníze
  state.animals.forEach(a=>state.money += a.income);
  updateUI();
  saveState();
}

function updateUI(){
  renderFarm();
  renderCrops();
  renderAnimals();
  moneyEl.textContent = state.money;
  levelEl.textContent = state.level;
  dayEl.textContent = state.day;
  farmSizeEl.textContent = state.farmSize;
  xpProgressEl.style.width = `${(state.xp/100)*100}%`;
  xpTextEl.textContent = `${state.xp}/100 XP`;
  document.body.classList.toggle("dark", state.darkMode);
}

/* -----------------------
   Level up
------------------------ */
function checkLevelUp(){
  while(state.xp >= 100){
    state.xp -= 100;
    state.level++;
    state.farmSize = Math.min(21,9 + Math.floor((state.level-1)/5)*3);
    if(state.farm.length < state.farmSize){
      for(let i=state.farm.length;i<state.farmSize;i++) state.farm.push(null);
    }
  }
}

/* -----------------------
   Restart
------------------------ */
function restartGame(){
  if(confirm("Opravdu restartovat hru?")) {
    localStorage.removeItem("harvestState");
    location.reload();
  }
}

/* -----------------------
   Theme toggle
------------------------ */
themeToggleBtn.onclick = ()=>{
  state.darkMode = !state.darkMode;
  updateUI();
  saveState();
};

/* -----------------------
   Init
------------------------ */
renderFarm();
renderCrops();
renderAnimals();
updateUI();
       
