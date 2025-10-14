// ----------------------
// Inicializace farmy
// ----------------------
const fields = Array.from(document.querySelectorAll('.field'));
const dayText = document.getElementById('day-text');
const nextDayBtn = document.getElementById('next-day');
const toggleModeBtn = document.getElementById('toggle-mode');

let dayCount = 1;
let weather = ['slunečno', 'déšť', 'bouřka'];
let farm = fields.map(() => ({ state: 'empty', days: 0 }));

// Náhodná událost na poli
function randomEvent() {
  const events = ['bonus', 'nothing'];
  return events[Math.floor(Math.random() * events.length)];
}

// Kliknutí na pole
fields.forEach((field, index) => {
  field.addEventListener('click', () => {
    const f = farm[index];
    if(f.state === 'empty') {
      f.state = 'planted';
      f.days = 0;
      field.className = 'field planted';
      field.textContent = `Zaseto`;
    } else if(f.state === 'grown') {
      f.state = 'empty';
      f.days = 0;
      field.className = 'field';
      field.textContent = `Sklizeno!`;
    }
  });
});

// Přepnutí módu
toggleModeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  document.body.classList.toggle('dark-mode');
});

// Další den
nextDayBtn.addEventListener('click', () => {
  const todayWeather = weather[Math.floor(Math.random() * weather.length)];
  let message = `Den ${dayCount}: Počasí je ${todayWeather}. `;
  
  farm.forEach((f, i) => {
    if(f.state === 'planted') {
      f.days += todayWeather === 'déšť' ? 2 : 1; // déšť urychlí růst
      if(f.days >= 3) {
        f.state = 'grown';
        fields[i].className = 'field grown';
        fields[i].textContent = 'Rostlina zralá!';
      }
      if(randomEvent() === 'bonus') {
        f.state = 'bonus';
        fields[i].className = 'field bonus';
        fields[i].textContent = '🎁 Bonus!';
      }
    }
  });

  dayText.textContent = message;
  dayCount++;
});
