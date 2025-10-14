document.addEventListener("DOMContentLoaded", () => {
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
  const nextDayBtn = document.getElementById("next-day");
  const restartBtn = document.getElementById("restart");

  // --- Plodiny ---
  const ALL_CROPS = [
    { name:"Mrkev", icon:"🥕", cost:10, growTime:2, profit:15, xp:10 },
    { name:"Rajče", icon:"🍅", cost:20, growTime:3, profit:30, xp:15 },
    { name:"Okurka", icon:"🥒", cost:30, growTime:4, profit:45, xp:20 },
    { name:"Brambory", icon:"🥔", cost:40, growTime:5, profit:60, xp:25 },
    { name:"Jablko", icon:"🍎", cost:50, growTime:6, profit:75, xp:30 },
    { name:"Hruška", icon:"🍐", cost:60, growTime:7, profit:90, xp:35 },
    { name:"Meloun", icon:"🍉", cost:80, growTime:8, profit:120, xp:40 },
    { name:"Brokolice", icon:"🥦", cost:90, growTime:9, profit:135, xp:45 },
    { name:"Hroznové víno", icon:"🍇", cost:100, growTime:10, profit:150, xp:50 }
  ];

  // --- Zvířata ---
  const ALL_ANIMALS = [
    { name:"Kuře", icon:"🐔", cost:50, income:5 },
    { name:"Kráva", icon:"🐄", cost:100, income:12 },
    { name:"Koza", icon:"🐐", cost:150, income:18 },
    { name:"Ovce", icon:"🐑", cost:200, income:25 },
    { name:"Prase", icon:"🐖", cost:250, income:30 },
    { name:"Koník", icon:"🐎", cost:300, income:35 },
    { name:"Králík", icon:"🐇", cost:350, income:40 },
    { name:"Medvěd", icon:"🐻", cost:400, income:45 },
    { name:"Slon", icon:"🐘", cost:500, income:55 }
  ];

  // --- Upgrady ---
  const ALL_UPGRADES = [
    { name:"Zalévání", desc:"Rychlejší růst plodin", cost:50, type:"growth" },
    { name:"Hnojivo", desc:"Plodiny rostou rychleji", cost:80, type:"growth" },
    { name:"Malý sklad", desc:"Zvýšení kapacity", cost:100, type:"farm" },
    { name:"Robotický farmář", desc:"Zvýší příjem zvířat", cost:150, type:"animal" },
    { name:"Skleník", desc:"Rychlejší růst", cost:200, type:"growth" },
    { name:"Extra osvětlení", desc:"Rychlejší růst", cost:250, type:"growth" },
    { name:"Oplocení", desc:"Zabezpečení farmy", cost:300, type:"farm" },
    { name:"Zásobník vody", desc:"Rychlejší růst", cost:350, type:"growth" },
    { name:"Zlepšená krmítka", desc:"Zvýší příjem zvířat", cost:400, type:"animal" },
    { name:"Robotický sklizeň", desc:"Automatická sklizeň", cost:450, type:"growth" },
    { name:"Větší stodola", desc:"Rozšíření farmy", cost:500, type:"farm" },
    { name:"Automatické krmivo", desc:"Zvýšení zvířecího příjmu", cost:550, type:"animal" },
    { name:"Skleníková podlaha", desc:"Rychlejší růst", cost:600, type:"growth" },
    { name:"Zahradní osvětlení", desc:"Rychlejší růst", cost:650, type:"growth" },
    { name:"Velká stodola", desc:"Rozšíření farmy", cost:700, type:"farm" }
  ];

  // --- Stav hry ---
  let state = {
    money:100,
    level:1,
    xp:0,
    day:1,
    farmSize:9,
    farm:Array(9).fill(null),
    selectedCrop:null,
    selectedCropObj:null,
    darkMode:false,
    animals:[],
    upgrades:[]
  };

  // --- Ukládání / Načtení ---
  function saveState(){ localStorage.setItem("harvestState", JSON.stringify(state)); }
  function loadState(){
    const saved = JSON.parse(localStorage.getItem("harvestState"));
    if(saved) state = saved;
  }

  // --- Render farmy ---
  function renderFarm(){
    farmEl.innerHTML="";
    state.farm.forEach((plot,i)=>{
      const div=document.createElement("div");
      div.className="plot";
      if(plot){
        div.innerHTML=`<div class="crop-emoji">${plot.icon}</div>
          <div class="small-name">${plot.name}</div>
          <div class="grow-wrap"><div class="grow" style="width:${Math.min((plot.age/plot.growTime)*100,100)}%"></div></div>`;
      }
      div.onclick=()=>plantOrHarvest(i);
      farmEl.appendChild(div);
    });
  }

  // --- Render plodin ---
  function renderCrops(){
    cropsEl.innerHTML="";
    ALL_CROPS.forEach(c=>{
      const div=document.createElement("div");
      div.className="crop-item";
      div.innerHTML=`<div class="crop-icon">${c.icon}</div>
        <div class="meta">${c.name}</div>
        <div class="meta">${c.cost}💰</div>`;
      div.onclick=()=>selectCrop(c);
      cropsEl.appendChild(div);
    });
  }

  // --- Render zvířat ---
  function renderAnimals(){
    animalsEl.innerHTML="";
    ALL_ANIMALS.forEach(a=>{
      const div=document.createElement("div");
      div.className="animal-item";
      div.innerHTML=`<div class="animal-icon">${a.icon}</div>
        <div class="meta">${a.name}</div>
        <div class="meta">${a.cost}💰</div>`;
      div.onclick=()=>{
        if(state.money>=a.cost){ state.money-=a.cost; state.animals.push({...a}); updateUI(); saveState(); }
      }
      animalsEl.appendChild(div);
    });
  }

  // --- Render upgradů ---
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
          if(u.type==="farm") { 
            state.farmSize=Math.min(21,state.farmSize+3); 
            while(state.farm.length<state.farmSize) state.farm.push(null);
          }
          if(u.type==="growth") ALL_CROPS.forEach(c=>c.growTime=Math.max(1,Math.floor(c.growTime*0.9)));
          if(u.type==="animal") ALL_ANIMALS.forEach(a=>a.income=Math.ceil(a.income*0.1));
          updateUI(); saveState();
        }
      }
      upgradesEl.appendChild(div);
    });
  }

  // --- Výběr plodiny ---
  function selectCrop(c){ 
    state.selectedCropObj = c;
    state.selectedCrop = c.name; 
    selectedCropNameEl.textContent=c.name; 
    selectedCropIconEl.textContent=c.icon; 
    saveState(); 
  }

  // --- Sadba nebo sklizeň ---
  function plantOrHarvest(i){
    const plot=state.farm[i];
    if(plot){
      if(plot.age>=plot.growTime){
        state.money+=Math.ceil(plot.profit);
        state.xp+=plot.xp;
        state.farm[i]=null;
        checkLevelUp();
        updateUI();
        saveState();
      }
    } else{
      if(state.selectedCropObj && state.money>=state.selectedCropObj.cost){
        state.money-=state.selectedCropObj.cost;
        state.farm[i]={...state.selectedCropObj, age:0};
        updateUI();
        saveState();
      }
    }
  }

  // --- Další den s animací ---
  function nextDay(){
    state.day++;
    state.farm.forEach(p=>{if(p)p.age++;});
    state.animals.forEach(a=>state.money+=Math.floor(a.income/10));
    updateUI();
    saveState();
    farmEl.style.transition="transform 0.2s";
    farmEl.style.transform="scale(1.03)";
    setTimeout(()=>{farmEl.style.transform="scale(1)";},200);
  }

  // --- Level up ---
  function checkLevelUp(){
    while(state.xp>=100){
      state.xp-=100;
      state.level++;
      // Každých 5 levelů rozšíření farmy
      if(state.level%5===0 && state.farmSize<21){
        state.farmSize+=3;
        while(state.farm.length<state.farmSize) state.farm.push(null);
      }
    }
  }

  // --- Aktualizace UI ---
  function updateUI(){
    moneyEl.textContent=state.money;
    levelEl.textContent=state.level;
    xpProgressEl.style.width=Math.min((state.xp/100)*100,100)+"%";
    xpTextEl.textContent=`${state.xp}/100 XP`;
    dayEl.textContent=state.day;
    farmSizeEl.textContent=state.farmSize;
    renderFarm();
  }

  // --- Dark mode toggle ---
  themeToggleBtn.onclick=()=>{
    state.darkMode=!state.darkMode;
    document.body.classList.toggle("dark",state.darkMode);
    saveState();
  }

  // --- Další den a restart ---
  nextDayBtn.onclick=nextDay;
  restartBtn.onclick=()=>{
    if(confirm("Opravdu restartovat hru?")) {
      state={
        money:100,
        level:1,
        xp:0,
        day:1,
        farmSize:9,
        farm:Array(9).fill(null),
        selectedCrop:null,
        selectedCropObj:null,
        darkMode:state.darkMode,
        animals:[],
        upgrades:[]
      };
      updateUI();
      saveState();
    }
  }

  // --- Inicializace ---
  loadState();
  document.body.classList.toggle("dark",state.darkMode);
  renderCrops();
  renderAnimals();
  renderUpgrades();
  updateUI();
});
