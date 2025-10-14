const fields = Array.from(document.querySelectorAll('.field'));
const dayText = document.getElementById('day-text');
const taskText = document.getElementById('task-text');
const scoreDisplay = document.getElementById('score');
const nextDayBtn = document.getElementById('next-day');
const toggleModeBtn = document.getElementById('toggle-mode');

let dayCount = 1;
let score = 0;
let weatherTypes = ['slunečno', 'déšť', 'bouřka'];
let farm = fields.map(() => ({ state: 'empty', days: 0 }));
let tasks = ['Sklidit 1 pole', 'Zasít 2 pole', 'Najít bonus'];

// Pomocné funkce
function getRandomWeather() {
  return weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
}

function getRandomTask() {
  return tasks[Math.floor(Math.random() * tasks.length)];
}

function randomEvent() {
  return Math.random() < 0.2 ? 'bonus' : 'nothing'; // 20% šance
}

// Kliknutí na pole
fields.forEach((field, index) => {
  field.addEventListener('click', () => {
    const f = farm[index];
    if(f.state === 'empty') {
      f.state = 'planted';
      f.days = 0;
      field.className = 'field planted';
      field.textContent = 'Zaseto';
    } else if(f.state === 'grown') {
      f.state = 'empty';
      f.days = 0;
      field.className = 'field';
      field.textContent = 'Sklizeno!';
      score += 1;
      scoreDisplay.textContent = score;
    } else if(f.state === 'bonus') {
      f.state = 'empty';
      f.days = 0;
      field.className = 'field';
      field.textContent = 'Bonus!';
      score += 3;
      scoreDisplay.textContent = score;
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
  const todayWeather = getRandomWeather();
  const todayTask = getRandomTask();

  dayText.textContent = `Den ${dayCount}: Počasí je ${todayWeather}.`;
  taskText.textContent = `Úkol dne: ${todayTask}`;

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

  dayCount++;
});
