// ZÁKLADNÍ HERNÍ LOGIKA

let money = 100;
let level = 1;
let xp = 0;
let xpNeeded = 100;
let day = 1;
let farmSize = 8;
let selectedCrop = null;

const farm = document.getElementById("farm");
const moneyEl = document.getElementById("money");
const levelEl = document.getElementById("level");
const xpProgress = document.getElementById("xp-progress");
const xpText = document.getElementById("xp-text");
const dayEl = document.getElementById("day");
const selectedCropName = document.getElementById("selected-crop-name");
const selectedCropIcon = document.getElementById("selected-crop-icon");

const crops = [
    { name: "Mrkev", icon: "🥕", cost: 10, growTime: 3, xp: 20, sell: 20 },
    { name: "Rajče", icon: "🍅", cost: 15, growTime: 4, xp: 30, sell: 30 },
    { name: "Slunečnice", icon: "🌻", cost: 25, growTime: 5, xp: 40, sell: 50 }
];

let fields = [];

// Inicializace farmy
function initFarm() {
    farm.innerHTML = "";
    fields = [];
    for (let i = 0; i < farmSize; i++) {
        const plot = document.createElement("div");
        plot.classList.add("plot", "empty");
        plot.dataset.state = "empty";
        farm.appendChild(plot);
        fields.push({ state: "empty", crop: null, progress: 0 });

        plot.addEventListener("click", () => handlePlotClick(i));
    }
}

// Zobrazení plodin
function renderCrops() {
    const container = document.getElementById("crops");
    container.innerHTML = "";
    crops.forEach(crop => {
        const el = document.createElement("div");
        el.classList.add("crop-item");
        el.innerHTML = `
            <div class="crop-icon">${crop.icon}</div>
            <div class="crop-name">${crop.name}</div>
            <div class="crop-cost">💰 ${crop.cost}</div>
            <div class="crop-time">⏳ ${crop.growTime} dny</div>
        `;
        el.addEventListener("click", () => selectCrop(crop));
        container.appendChild(el);
    });
}

function selectCrop(crop) {
    selectedCrop = crop;
    selectedCropName.textContent = crop.name;
    selectedCropIcon.textContent = crop.icon;
}

// Kliknutí na pole
function handlePlotClick(index) {
    const plot = fields[index];
    const plotEl = farm.children[index];

    if (plot.state === "empty" && selectedCrop) {
        if (money >= selectedCrop.cost) {
            money -= selectedCrop.cost;
            plot.state = "planted";
            plot.crop = selectedCrop;
            plot.progress = 0;
            plotEl.className = "plot planted";
            plotEl.textContent = selectedCrop.icon;
            updateUI();
        } else {
            alert("Nemáš dost peněz!");
        }
    } else if (plot.state === "ready") {
        money += plot.crop.sell;
        addXP(plot.crop.xp);
        plot.state = "empty";
        plot.crop = null;
        plotEl.className = "plot empty";
        plotEl.textContent = "";
        updateUI();
    }
}

// Postup dne
document.getElementById("next-day").addEventListener("click", () => {
    day++;
    dayEl.textContent = day;

    fields.forEach((plot, i) => {
        if (plot.state === "planted") {
            plot.progress++;
            if (plot.progress >= plot.crop.growTime) {
                plot.state = "ready";
                farm.children[i].className = "plot ready";
            }
        }
    });
});

function addXP(amount) {
    xp += amount;
    if (xp >= xpNeeded) {
        xp -= xpNeeded;
        level++;
        xpNeeded = Math.floor(xpNeeded * 1.5);
        levelEl.textContent = level;
        alert(`🎉 Postoupil jsi na level ${level}!`);
    }
    updateUI();
}

function updateUI() {
    moneyEl.textContent = money;
    const xpPercent = Math.min((xp / xpNeeded) * 100, 100);
    xpProgress.style.width = xpPercent + "%";
    xpText.textContent = `${xp}/${xpNeeded} XP`;
}

initFarm();
renderCrops();
updateUI();
