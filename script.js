/* Garden Valley – script.js */

const DEFAULT_STATE = {
  money: 150, xp: 0, level: 1, day: 1, farmSize: 9,
  farm: Array(9).fill(null), ownedAnimals: [],
  unlockedCrops: 1, unlockedAnimals: 0, theme: 'light'
};
let state = loadState() || DEFAULT_STATE;
let selectedCrop = null;

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

const ALL_CROPS = [
  { name:"Mrkev", icon:"🥕", cost:10, growTime:2, profit:25, xp:10 },
  { name:"Pšenice", icon:"🌾", cost:8, growTime:2, profit:18, xp:8 },
  { name:"Kukuřice", icon:"🌽", cost:18, growTime:3, profit:40, xp:18 },
  { name:"Brambora", icon:"🥔", cost:12, growTime:2, profit:30, xp:12 },
  { name:"Rajče", icon:"🍅", cost:20, growTime:3, profit:50, xp:20 },
  { name:"Jahoda", icon:"🍓", cost:15, growTime:2, profit:35, xp:14 },
  { name:"Slunečnice", icon:"🌻", cost:25, growTime:4, profit:80, xp:30 },
  { name:"Dýně", icon:"🎃", cost:30, growTime:5, profit:120, xp:40 },
  { name:"Jabloň", icon:"🍎", cost:40, growTime:6, profit:160, xp:55 },
  { name:"Levandule", icon:"💜", cost:22, growTime:3, profit:60, xp:25 }
];

const ALL_ANIMALS = [
  { name:"Slepice", icon:"🐔", cost:50, income:8 },
  { name:"Králík", icon:"🐇", cost:80, income:18 },
  { name:"Kráva", icon:"🐄", cost:200, income:50 },
  { name:"Prase", icon:"🐖", cost:120, income:28 },
  { name:"Ovce", icon:"🐑", cost:100, income:20 },
  { name:"Kachna", icon:"🦆", cost:60, income:10 },
  { name:"Kůň", icon:"🐎", cost:250, income:70 },
  { name:"Pes", icon:"🐕", cost:40, income:5 }
];

/* ----- inicializace ----- */
function init() {
  applyTheme(state.theme);
  renderCrops(); renderAnimals(); renderFarm(); updateStats();
  setInterval(saveState, 60000);
}

/* ----- render ----- */
function renderCrops() {
  cropsEl.innerHTML='';
  ALL_CROPS.forEach((c,i)=>{
    const el=document.createElement('div'); el.className='crop-item';
    if(i>=state.unlockedCrops) el.classList.add('locked');
    el.innerHTML=`<div class="crop-icon">${c.icon}</div><div class="crop-name">${c.name}</div>${
      i>=state.unlockedCrops?`<div class="crop-locked">🔒 Level ${i+1}</div>`:
      `<div class="meta">Cena:${c.cost} • Růst:${c.growTime}d</div>`
    }`;
    if(i<state.unlockedCrops) el.onclick=()=>{selectedCrop=c; selectedCropName.textContent=c.name; selectedCropIcon.textContent=c.icon;};
    cropsEl.appendChild(el);
  });
}

function renderAnimals() {
  animalsEl.innerHTML='';
  ALL_ANIMALS.forEach((a,i)=>{
    const el=document.createElement('div'); el.className='animal-item';
    if(i>=state.unlockedAnimals) el.classList.add('locked');
    el.innerHTML=`<div class="animal-icon">${a.icon}</div><div class="animal-name">${a.name}</div>${
      i>=state.unlockedAnimals?`<div class="crop-locked">🔒 Level ${i+1}</div>`:
      `<div class="meta">Cena:${a.cost} • Příjem:${a.income}/den</div>`
    }`;
    if(i<state.unlockedAnimals) el.onclick=()=>buyAnimal(a);
    animalsEl.appendChild(el);
  });
}

function renderFarm() {
  farmEl.innerHTML='';
  for(let i=0;i<state.farmSize;i++){
    const plot = document.createElement('div'); plot.className='plot';
    const crop = state.farm[i];
    if(crop){
      plot.innerHTML=`<div class="crop-emoji">${crop.icon}</div>
      <div class="small-name">${crop.name}</div>
      <div class="grow-wrap"><div class="grow" style="width:${crop.progress*20}%"></div></div>`;
    }
    plot.onclick = ()=>plantCrop(i);
    farmEl.appendChild(plot);
  }
}

/* ----- funkce ----- */
function updateStats(){
  moneyEl.textContent=state.money;
  levelEl.textContent=state.level;
  dayEl.textContent=state.day;
  xpProgressEl.style.width=Math.min(state.xp,100)+'%';
  xpTextEl.textContent=`${state.xp}/100 XP`;
  farmSizeEl.textContent=state.farmSize;
}

function plantCrop(idx){
  if(!selectedCrop) return;
  if(state.farm[idx]) return;
  if(state.money<selectedCrop.cost) return;
  state.money-=selectedCrop.cost;
  state.farm[idx]={...selectedCrop, progress:0};
  updateStats(); renderFarm();
}

function nextDay(){
  state.day++;
  state.farm.forEach(c=>{
    if(c){ c.progress++; if(c.progress>=c.growTime) state.money+=c.profit; }
  });
  state.xp+=5;
  checkLevel();
  updateStats(); renderFarm(); autoUnlock();
}

function buyAnimal(a){
  if(state.money<a.cost) return;
  state.money-=a.cost;
  state.ownedAnimals.push(a);
  state.xp+=3; checkLevel(); updateStats(); renderAnimals();
}

function checkLevel(){
  const neededXP = 100;
  if(state.xp>=neededXP){
    state.level++;
    state.xp=state.xp-neededXP;
    state.farmSize = Math.min(9 + Math.floor(state.level/5)*3,21);
    autoUnlock();
  }
}

function autoUnlock(){
  state.unlockedCrops=Math.min(state.level, ALL_CROPS.length);
  state.unlockedAnimals=Math.min(state.level, ALL_ANIMALS.length);
  renderCrops(); renderAnimals();
}

/* ----- save/load ----- */
function saveState(){
  localStorage.setItem('gardenValley', JSON.stringify(state));
  saveIndicator.classList.add('show');
  setTimeout(()=>saveIndicator.classList.remove('show'),1000);
}
function loadState(){
  const s=localStorage.getItem('gardenValley');
  return s?JSON.parse(s):null;
}

/* ----- theme ----- */
function applyTheme(t){
  document.body.className = t==='dark'?'dark':'';
  themeIcon.className = t==='dark'?'fas fa-sun':'fas fa-moon';
}
themeToggle.onclick=()=>{
  state.theme=state.theme==='light'?'dark':'light';
  applyTheme(state.theme);
  saveState();
}

/* ----- události ----- */
document.getElementById('next-day').onclick=nextDay;
document.getElementById('save-game').onclick=saveState;

/* ----- start ----- */
init();
     
