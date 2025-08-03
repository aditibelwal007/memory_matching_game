const cardsArray = [
  '🐶', '🐱', '🦁', '🐯', '🐸', '🐵', '🐼', '🦊'
];

let cards = [],
  firstCard = null,
  secondCard = null,
  lockBoard = false,
  moves = 0,
  matches = 0,
  timer = 0,
  timerInterval = null,
  starRating = 3,
  hintUsed = false,
  paused = false,
  soundOn = true;

const board = document.getElementById('game-board');
const movesDisplay = document.getElementById('moves');
const timerDisplay = document.getElementById('timer');
const starsDisplay = document.getElementById('stars');
const restartBtn = document.getElementById('restart');
const hintBtn = document.getElementById('hint');
const pauseBtn = document.getElementById('pause');
const difficultySelect = document.getElementById('difficulty');
const themeToggle = document.getElementById('theme-toggle');
const soundToggle = document.getElementById('sound-toggle');
const flipSound = document.getElementById('flip-sound');
const matchSound = document.getElementById('match-sound');
const winSound = document.getElementById('win-sound');
const leaderboardList = document.getElementById('leaderboard-list');

function shuffle(array) {
  return array.concat(array).sort(() => 0.5 - Math.random());
}

function startTimer() {
  timerInterval = setInterval(() => {
    if (!paused) {
      timer++;
      timerDisplay.textContent = `Time: ${timer}s`;
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function createBoard() {
  board.innerHTML = '';
  firstCard = secondCard = null;
  lockBoard = false;
  moves = matches = timer = 0;
  hintUsed = false;
  paused = false;
  starRating = 3;
  movesDisplay.textContent = 'Moves: 0';
  timerDisplay.textContent = 'Time: 0s';
  starsDisplay.textContent = '⭐️⭐️⭐️';
  pauseBtn.textContent = '⏸ Pause';
  document.getElementById('game-over').classList.add('hidden');

  let difficulty = difficultySelect?.value || 'medium';
  let numPairs = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
  cards = shuffle(cardsArray.slice(0, numPairs));

  for (let emoji of cards) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.emoji = emoji;
    card.innerHTML = '<span class="front">❓</span><span class="back">' + emoji + '</span>';
    card.addEventListener('click', flipCard);
    board.appendChild(card);
  }
  board.style.gridTemplateColumns = `repeat(${Math.sqrt(cards.length)}, 1fr)`;
  startTimer();
}

function flipCard() {
  if (lockBoard || this.classList.contains('matched') || this === firstCard) return;

  this.classList.add('flipped');
  if (soundOn) flipSound.play();

  if (!firstCard) {
    firstCard = this;
    return;
  }
  secondCard = this;
  checkMatch();
}

function checkMatch() {
  lockBoard = true;
  moves++;
  movesDisplay.textContent = `Moves: ${moves}`;
  if (firstCard.dataset.emoji === secondCard.dataset.emoji) {
    if (soundOn) matchSound.play();
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    matches++;
    if (matches === cards.length / 2) {
      endGame();
    }
    resetBoard();
  } else {
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      resetBoard();
    }, 1000);
  }
}

function resetBoard() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
  updateStars();
}

function updateStars() {
  if (moves > 15 && starRating === 3) starRating = 2;
  else if (moves > 25 && starRating === 2) starRating = 1;
  starsDisplay.textContent = '⭐️'.repeat(starRating);
}

function endGame() {
  stopTimer();
  if (soundOn) winSound.play();
  document.getElementById('summary').textContent = `Moves: ${moves}, Time: ${timer}s, Stars: ${'⭐️'.repeat(starRating)}`;
  document.getElementById('game-over').classList.remove('hidden');
  saveToLeaderboard();
}
function saveToLeaderboard() {
  let name = prompt("Enter your name for the leaderboard:", "Player");
  if (!name) name = "Anonymous";

  let leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');

  const newEntry = {
    name,
    moves,
    timer,
    stars: starRating,
    date: new Date().toLocaleString()
  };

  leaderboard.push(newEntry);

  // Sort leaderboard: first by stars desc, then by moves asc, then by time asc
  leaderboard.sort((a, b) => 
    b.stars - a.stars || 
    a.moves - b.moves || 
    a.timer - b.timer
  );

  // Keep top 5 entries
  leaderboard = leaderboard.slice(0, 5);
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

  // Display updated leaderboard
  leaderboardList.innerHTML = '';
  leaderboard.forEach((score, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>#${index + 1}</strong> ${score.name} 
      - ⭐️${score.stars}, 🕒 ${score.timer}s, 🎯 ${score.moves} moves 
      <br><small>${score.date}</small>
    `;
    leaderboardList.appendChild(li);
  });
}

restartBtn.addEventListener('click', createBoard);

hintBtn?.addEventListener('click', () => {
  if (hintUsed || paused) return;
  hintUsed = true;
  const unmatched = [...document.querySelectorAll('.card:not(.matched):not(.flipped)')];
  unmatched.slice(0, 2).forEach(card => card.classList.add('flipped'));
  setTimeout(() => unmatched.slice(0, 2).forEach(card => card.classList.remove('flipped')), 1000);
});

pauseBtn?.addEventListener('click', () => {
  paused = !paused;
  pauseBtn.textContent = paused ? '▶️ Resume' : '⏸ Pause';
});

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

difficultySelect?.addEventListener('change', createBoard);

soundToggle?.addEventListener('click', () => {
  soundOn = !soundOn;
  soundToggle.textContent = soundOn ? '🔊 Sound On' : '🔇 Sound Off';
});

createBoard();
