/* =============================
   Garden Valley – script.js
   ============================= */

const farmEl = document.getElementById('farm');
const cropsEl = document.getElementById('crops');
const animalsEl = document.getElementById('animals');
const selectedCropNameEl = document.getElementById('selected-crop-name');
const selectedCropIconEl = document.getElementById('selected-crop-icon');
const moneyEl = document.getElementById('money');
const levelEl = document.getElementById('level');
const xpProgressEl = document.getElementById('xp-progress');
const xpTextEl = document.getElementById('xp-text');
const dayEl = document.getElementById('day');
const farmSizeEl = document.getElementById('farm-size');
const saveIndicator = document.getElementById('save-indicator');
const themeToggleBtn = document.getElementById('theme-toggle');

let selectedCrop = null;

const ALL_CROPS = [
  {name:'Mrkev', icon:'🥕', cost:10, growTime:2, profit:20, xp:5},
  {name:'Rajče', icon:'🍅', cost:15, growTime:3, profit:30, xp:6},
  {name:'Salát', icon:'🥬', cost:12, growTime:2, profit:22, xp:5},
  {name:'Brambory', icon:'🥔', cost:20, growTime:4, profit:40, xp:7},
  {name:'Jahody', icon:'🍓', cost:18, growTime:3, profit:35, xp:6},
  {name:'Cibule', icon:'🧅', cost:14, growTime:2, profit:25, xp:5},
  {name:'Paprika', icon:'🌶️', cost:16, growTime:3, profit:32, xp:6},
  {name:'Meloun', icon:'🍉', cost:25, growTime:5, profit:55, xp:8},
  {name:'Jablko', icon:'🍎', cost:22, growTime:4, profit:45, xp:7}
];

const ALL_ANIMALS = [
  {name:'Kráva', icon:'🐄', cost:50, income:10},
  {name:'Koza', icon:'🐐', cost:40, income:8},
  {name:'Slepice', icon:'🐔', cost:30, income:5},
  {name:'Ovce', icon:'🐑', cost:45, income:9},
  {name:'Prase', icon:'🐖', cost:35, income:6},
  {name:'Kůň', icon:'🐎', cost:60, income:12},
  {name:'Králík', icon:'🐇', cost:20, income:4},
  {name:'Kačer', icon:'🦆', cost:25, income:5},
  {name:'Medvěd', icon:'🐻', cost:100, income:20}
];

let state = {
  money:100,
  level:1,
  xp:0,
  day:1,
  farmSize:9,
  farm:Array(9).fill(null),
  selectedCrop:null,
  ownedAnimals:[],
  unlockedCrops:1,
  unlockedAnimals:1
};

/* ----- save/load ----- */
function saveState(){
  localStorage.setItem('gardenValley',JSON.stringify(state));
  saveIndicator.classList.add('show');
  setTimeout(()=>saveIndicator.classList.remove('show'),900);
}

function loadState(){
  const s = localStorage.getItem('gardenValley');
  if(s) state = JSON.parse(s);
}

/* ----- theme ----- */
function applyTheme(t){
  document.body.className = t==='dark'?'dark':'';
  themeToggleBtn.innerHTML = t==='dark'? '🌞' : '🌙';
}

/* ----- farm ----- */
function plantCrop(idx){
  if(!selectedCrop) return;
  if(state.farm[idx]) return;
  if(state.money < selectedCrop.cost) return;
  state.money -= selectedCrop.cost;
  state.farm[idx] = {
    ...selectedCrop,
    progress:0,
    ready:false
  };
  updateStats(); renderFarm(); saveState();
}

function harvestCrop(idx){
  const c = state.farm[idx];
  if(!c || !c.ready) return;
  state.money += c.profit;
  state.xp += c.xp; // XP jen za sklizeň
  state.farm[idx] = null;
  checkLevel(); updateStats(); renderFarm(); saveState();
}

function renderFarm(){
  farmEl.innerHTML = '';
  for(let i=0;i<state.farmSize;i++){
    const plot = document.createElement('div');
    plot.className = 'plot';
    const c = state.farm[i];
    if(c){
      if(c.progress >= c.growTime) c.ready=true;
      plot.innerHTML = `
        <div class="crop-emoji">${c.icon}</div>
        <div class="small-name">${c.name}</div>
        <div class="grow-wrap">
          <div class="grow" style="width:${Math.min((c.progress/c.growTime)*100,100)}%"></div>
        </div>
        ${c.ready?'<div class="small-name">🌟 Zralé!</div>':''}
      `;
      plot.onclick = () => harvestCrop(i);
    } else {
      plot.onclick = () => plantCrop(i);
    }
    farmEl.appendChild(plot);
  }
}

/* ----- crops/animals ----- */
function renderCrops(){
  cropsEl.innerHTML='';
  for(let i=0;i<state.unlockedCrops;i++){
    const c = ALL_CROPS[i];
    const el = document.createElement('div');
    el.className='crop-item';
    el.innerHTML = `<div class="crop-icon">${c.icon}</div>
                    <div class="meta">${c.name}<br>${c.cost}💰/${c.growTime}d</div>`;
    el.onclick=()=>{ selectedCrop=c; selectedCropNameEl.textContent=c.name; selectedCropIconEl.textContent=c.icon; saveState(); };
    cropsEl.appendChild(el);
  }
}

function renderAnimals(){
  animalsEl.innerHTML='';
  for(let i=0;i<state.unlockedAnimals;i++){
    const a = ALL_ANIMALS[i];
    const el = document.createElement('div');
    el.className='animal-item';
    el.innerHTML = `<div class="animal-icon">${a.icon}</div>
                    <div class="meta">${a.name}<br>${a.cost}💰/${a.income}💰/den</div>`;
    el.onclick=()=>{ buyAnimal(a); };
    animalsEl.appendChild(el);
  }
}

function buyAnimal(a){
  if(state.money<a.cost) return;
  state.money -= a.cost;
  state.ownedAnimals.push(a);
  state.xp += 3; // XP jen za koupení zvířete
  checkLevel();
  updateStats();
  renderAnimals();
  saveState();
}

/* ----- level, unlocks ----- */
function checkLevel(){
  const neededXP=100;
  while(state.xp >= neededXP){
    state.level++;
    state.xp -= neededXP;
    // farm size každých 5 levelů +3
    state.farmSize = Math.min(9 + Math.floor(state.level/5)*3,21);
  }
  autoUnlock();
}

function autoUnlock(){
  state.unlockedCrops=Math.min(state.level,ALL_CROPS.length);
  state.unlockedAnimals=Math.min(state.level,ALL_ANIMALS.length);
  renderCrops(); renderAnimals();
}

/* ----- další den ----- */
function nextDay(){
  state.day++;
  state.farm.forEach(c=>{
    if(c && !c.ready){
      c.progress++;
      if(c.progress >= c.growTime) c.ready=true; // zralá plodina
    }
  });
  // příjem od zvířat, bez XP
  state.ownedAnimals.forEach(a=> state.money += a.income);

  checkLevel();
  updateStats();
  renderFarm();
  saveState();
}

/* ----- stats ----- */
function updateStats(){
  moneyEl.textContent = state.money;
  levelEl.textContent = state.level;
  xpProgressEl.style.width = `${Math.min(state.xp,100)}%`;
  xpTextEl.textContent = `${state.xp}/100 XP`;
  dayEl.textContent = state.day;
  farmSizeEl.textContent = state.farmSize;
}

/* ----- events ----- */
document.getElementById('next-day').onclick = nextDay;
themeToggleBtn.onclick = () => {
  const dark = document.body.classList.contains('dark');
  applyTheme(dark?'light':'dark');
  saveState();
}

/* ----- init ----- */
loadState();
applyTheme(document.body.classList.contains('dark')?'dark':'light');
renderFarm();
renderCrops();
renderAnimals();
updateStats();
