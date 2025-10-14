const farmEl = document.getElementById("farm");
const cropsEl = document.getElementById("crops");
const animalsEl = document.getElementById("animals");
const upgradesEl = document.getElementById("upgrades");
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

const ALL_CROPS = [
  { name: "Mrkev", icon: "🥕", cost: 10, growTime: 2, profit: 15, xp: 3 },
  { name: "Salát", icon: "🥬", cost: 12, growTime: 2, profit: 18, xp: 3 },
  { name: "Cibule", icon: "🧅", cost: 14, growTime: 2, profit: 21, xp: 3 },
  { name: "Rajče", icon: "🍅", cost: 18, growTime: 3, profit: 27, xp: 4 },
  { name: "Paprika", icon: "🌶️", cost: 22, growTime: 3, profit: 33, xp: 4 },
  { name: "Okurka", icon: "🥒", cost: 25, growTime: 3, profit: 37, xp: 5 },
  { name: "Brambory", icon: "🥔", cost: 30, growTime: 4, profit: 45, xp: 6 },
  { name: "Jahody", icon: "🍓", cost: 35, growTime: 4, profit: 52, xp: 7 },
  { name: "Dýně", icon: "🎃", cost: 50, growTime: 5, profit: 75, xp: 8 },
];

const ALL_ANIMALS = [
  { name: "Slepička", icon: "🐔", cost: 50, income: 6, xp: 5 },
  { name: "Koza", icon: "🐐", cost: 120, income: 15, xp: 10 },
  { name: "Kráva", icon: "🐄", cost: 200, income: 25, xp: 15 },
  { name: "Ovce", icon: "🐑", cost: 300, income: 37, xp: 20 },
  { name: "Prase", icon: "🐖", cost: 400, income: 50, xp: 25 },
  { name: "Koník", icon: "🐎", cost: 600, income: 75, xp: 30 },
  { name: "Medvěd", icon: "🐻", cost: 1000, income: 125, xp: 50 },
];

const ALL_UPGRADES = [
  { name: "Malý skleník", desc: "Růst plodin +10%", cost: 100, type:"growth" },
  { name: "Velký skleník", desc: "Růst plodin +20%", cost: 200, type:"growth" },
  { name: "Zalévací systém", desc: "Růst plodin +15%", cost: 150, type:"growth" },
  { name: "Hnojivo I", desc: "Profit +10%", cost: 120, type:"profit" },
  { name: "Hnojivo II", desc: "Profit +20%", cost: 240, type:"profit" },
  { name: "Hnojivo III", desc: "Profit +30%", cost: 360, type:"profit" },
  { name: "Rozšíření farmy I", desc: "+3 políčka", cost: 100, type:"farm" },
  { name: "Rozšíření farmy II", desc: "+3 políčka", cost: 200, type:"farm" },
  { name: "Rozšíření farmy III", desc: "+3 políčka", cost: 300, type:"farm" },
  { name: "Automatické krmení", desc: "Zvýší příjem zvířat +10%", cost: 150, type:"animal" },
  { name: "Skleníková podlaha", desc: "Rychlejší růst", cost: 180, type:"growth" },
  { name: "Extra osvětlení", desc: "Rychlejší růst", cost: 200, type:"growth" },
  { name: "Robotický farmář", desc: "Zvýší příjem zvířat +20%", cost: 500, type:"animal" },
  { name: "Zásobník vody", desc: "Rychlejší růst", cost: 250, type:"growth" },
  { name: "Oplocení", desc: "Zabezpečení farmy", cost: 300, type:"farm" },
];

let state = {
  money: 100,
  level: 1,
  xp: 0,
  day: 1,
  farmSize: 9,
  farm: Array(9).fill(null),
  selectedCrop: null,
  darkMode: false,
  animals: [],
  upgrades: []
};

function saveState(){
  localStorage.setItem("harvestState", JSON.stringify(state));
}

function loadState(){
  const saved = JSON.parse(localStorage.getItem("harvestState"));
  if(saved) state = saved;
}

function renderFarm(){
  farmEl.innerHTML="";
  state.farm.forEach((plot,i)=>{
    const div=document.createElement("div");
    div.className="plot";
    if(plot){
      div.innerHTML=`<div class="crop-emoji">${plot.icon}</div><div class="small-name">${plot.name}</div><div class="grow-wrap"><div class="grow" style="width:${(plot.age/plot.growTime)*100}%"></div></div>`;
    }
    div.onclick=()=>plantOrHarvest(i);
    farmEl.appendChild(div);
  });
}

function renderCrops(){
  cropsEl.innerHTML="";
  ALL_CROPS.forEach(c=>{
    const div=document.createElement("div");
    div.className="crop-item";
    div.innerHTML=`<div class="crop-icon">${c.icon}</div><div class="meta">${c.name}</div><div class="meta">${c.cost}💰</div>`;
    div.onclick=()=>selectCrop(c);
    cropsEl.appendChild(div);
  });
}

function renderAnimals(){
  animalsEl.innerHTML="";
  ALL_ANIMALS.forEach(a=>{
    const div=document.createElement("div");
    div.className="animal-item";
    div.innerHTML=`<div class="animal-icon">${a.icon}</div><div class="meta">${a.name}</div><div class="meta">${a.cost}💰</div>`;
    div.onclick=()=>{
      if(state.money>=a.cost){ state.money-=a.cost; state.animals.push({...a}); updateUI(); saveState(); }
    }
    animalsEl.appendChild(div);
  });
}

function renderUpgrades(){
  upgradesEl.innerHTML="";
  ALL_UPGRADES.forEach(u=>{
    const div=document.createElement("div");
    div.className="crop-item";
    div.innerHTML=`<div class="meta">${u.name}</div><div class="meta">${u.desc}</div><div class="meta">${u.cost}💰</div>`;
    div.onclick=()=>{
      if(state.money>=u.cost){
        state.money-=u.cost;
        state.upgrades.push(u);
        if(u.type==="farm") { state.farmSize=Math.min(21,state.farmSize+3); while(state.farm.length<state.farmSize) state.farm.push(null);}
        if(u.type==="growth") ALL_CROPS.forEach(c=>c.growTime=Math.max(1,c.growTime*0.9));
        if(u.type==="profit") ALL_CROPS.forEach(c=>c.profit=Math.ceil(c.profit*1.1));
        if(u.type==="animal") ALL_ANIMALS.forEach(a=>a.income=Math.ceil(a.income*1.1));
        updateUI(); saveState();
      }
    }
    upgradesEl.appendChild(div);
  });
}

function selectCrop(c){ selectedCrop=c; state.selectedCrop=c.name; selectedCropNameEl.textContent=c.name; selectedCropIconEl.textContent=c.icon; saveState(); }

function plantOrHarvest(i){
  const plot=state.farm[i];
  if(plot){
    if(plot.age>=plot.growTime){
      state.money+=plot.profit;
      state.xp+=plot.xp;
      state.farm[i]=null;
      checkLevelUp();
      updateUI();
      saveState();
    }
  } else{
    if(selectedCrop && state.money>=selectedCrop.cost){
      state.money-=selectedCrop.cost;
      state.farm[i]={...selectedCrop, age:0};
      updateUI();
      saveState();
    }
  }
}

function nextDay(){
  state.day++;
  state.farm.forEach(p=>{if(p)p.age++;});
  state.animals.forEach(a=>state.money+=Math.floor(a.income/10));
  updateUI();
  saveState();
}

function checkLevelUp(){
  while(state.xp>=100){
    state.xp-=100;
    state.level++;
    state.farmSize=Math.min(21,9+Math.floor((state.level-1)/5)*3);
    while(state.farm.length<state.farmSize) state.farm.push(null);
  }
}

function restartGame(){
  if(confirm("Opravdu restartovat hru?")){
    localStorage.removeItem("harvestState");
    location.reload();
  }
}

function updateUI(){
  renderFarm();
  renderCrops();
  renderAnimals();
  renderUpgrades();
  moneyEl.textContent=state.money;
  levelEl.textContent=state.level;
  dayEl.textContent=state.day;
  farmSizeEl.textContent=state.farmSize;
  xpProgressEl.style.width=`${(state.xp/100)*100}%`;
  xpTextEl.textContent=`${state.xp}/100 XP`;
  document.body.classList.toggle("dark",state.darkMode);
}

themeToggleBtn.onclick=()=>{
  state.darkMode=!state.darkMode;
  updateUI();
  saveState();
}

document.getElementById("next-day").onclick=nextDay;
document.getElementById("restart-game").onclick=restartGame;

loadState();
updateUI();
