/* ===== logika farmy ===== */
function plantCrop(idx){
  if(!selectedCrop) return;
  if(state.farm[idx]) return; // už obsazeno
  if(state.money < selectedCrop.cost) return;
  
  state.money -= selectedCrop.cost;
  state.farm[idx] = {
    ...selectedCrop,
    progress: 0,
    ready: false
  };
  updateStats();
  renderFarm();
}

// Kliknutí na pole – sklizení, pokud zralé
function harvestCrop(idx){
  const c = state.farm[idx];
  if(!c) return;
  if(!c.ready) return;
  state.money += c.profit;
  state.xp += c.xp;
  state.farm[idx] = null;
  checkLevel();
  updateStats();
  renderFarm();
}

// Render farmy s možností sklizně
function renderFarm(){
  farmEl.innerHTML = '';
  for(let i=0;i<state.farmSize;i++){
    const plot = document.createElement('div');
    plot.className = 'plot';
    const c = state.farm[i];
    if(c){
      // zobrazení zralé plodiny
      if(c.progress >= c.growTime) c.ready = true;
      plot.innerHTML = `
        <div class="crop-emoji">${c.icon}</div>
        <div class="small-name">${c.name}</div>
        <div class="grow-wrap">
          <div class="grow" style="width:${Math.min((c.progress/c.growTime)*100,100)}%"></div>
        </div>
        ${c.ready ? '<div class="small-name">🌟 Zralé!</div>':''}
      `;
      plot.onclick = () => harvestCrop(i); // sklizeň kliknutím
    } else {
      plot.onclick = () => plantCrop(i); // zasazení
    }
    farmEl.appendChild(plot);
  }
}

// Funkce další den – posune progress všech plodin
function nextDay(){
  state.day++;
  state.farm.forEach(c=>{
    if(c && !c.ready){
      c.progress++;
      if(c.progress >= c.growTime){
        c.ready = true; // zralá plodina
      }
    }
  });

  // příjem od zvířat
  state.ownedAnimals.forEach(a=>{ state.money += a.income; });

  state.xp += 5; // XP za den
  checkLevel();
  updateStats();
  renderFarm();
  autoUnlock();
}
