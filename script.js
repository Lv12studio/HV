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
  themeToggleBtn.innerHTML = t==='
     
