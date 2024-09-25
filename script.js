const gameArea = document.getElementById('gameArea');
const player = document.getElementById('player');
const replayButton = document.getElementById('replayButton');
const scoreDisplay = document.getElementById('scoreDisplay');

let playerPos = gameArea.clientWidth / 2;
let lasers = [];
let aliens = [];
let alienSpeed = 1; // Constant alien speed
let gameOver = false;
let score = 0;
let keys = {}; // Track key presses

function movePlayer() {
  if (gameOver) return;

  if (keys['ArrowLeft']) {
    playerPos -= 7;
    if (playerPos < 0) playerPos = 0;
  }
  if (keys['ArrowRight']) {
    playerPos += 7;
    if (playerPos + player.offsetWidth > gameArea.clientWidth) {
      playerPos = gameArea.clientWidth - player.offsetWidth;
    }
  }
  player.style.left = `${playerPos}px`;
}

function shootLaser() {
  if (gameOver || lasers.length >= 5) return; // Limit number of lasers on screen

  const laser = document.createElement('div');
  laser.classList.add('laser');
  laser.style.left = `${playerPos + player.offsetWidth / 2 - 2}px`;
  laser.style.bottom = '70px';
  gameArea.appendChild(laser);
  lasers.push(laser);
}

function spawnAlien() {
  if (gameOver) return;

  const alien = document.createElement('div');
  alien.classList.add('alien');
  alien.style.left = `${Math.random() * (gameArea.clientWidth - 50)}px`;
  alien.style.top = '0px';
  gameArea.appendChild(alien);
  aliens.push(alien);
}

function updateLasers() {
  lasers.forEach((laser, index) => {
    let laserBottom = parseInt(laser.style.bottom);
    laserBottom += 5;
    laser.style.bottom = `${laserBottom}px`;

    if (laserBottom > gameArea.clientHeight) {
      laser.remove();
      lasers.splice(index, 1);
    }
  });
}

function updateAliens() {
  aliens.forEach((alien, index) => {
    let alienTop = parseInt(alien.style.top);
    alienTop += alienSpeed;
    alien.style.top = `${alienTop}px`;

    if (alienTop + 50 >= gameArea.clientHeight) {
      endGame();
    }
  });
}

function detectCollisions() {
  lasers.forEach((laser, laserIndex) => {
    aliens.forEach((alien, alienIndex) => {
      const laserRect = laser.getBoundingClientRect();
      const alienRect = alien.getBoundingClientRect();

      if (
        laserRect.left < alienRect.right &&
        laserRect.right > alienRect.left &&
        laserRect.top < alienRect.bottom &&
        laserRect.bottom > alienRect.top
      ) {
        alien.remove();
        laser.remove();
        aliens.splice(alienIndex, 1);
        lasers.splice(laserIndex, 1);
        incrementScore();
      }
    });
  });
}

function incrementScore() {
  score += 1;
  scoreDisplay.textContent = `Score: ${score}`;
}

function gameLoop() {
  if (!gameOver) {
    movePlayer();
    updateLasers();
    updateAliens();
    detectCollisions();

    // Adjusted probability of spawning aliens
    if (Math.random() < 0.01) { // Reduced frequency of alien spawning
      spawnAlien();
    }

    requestAnimationFrame(gameLoop);
  }
}

function endGame() {
  gameOver = true;
  replayButton.style.display = 'block';
}

function replayGame() {
  lasers.forEach(laser => laser.remove());
  aliens.forEach(alien => alien.remove());

  lasers = [];
  aliens = [];
  playerPos = gameArea.clientWidth / 2;
  player.style.left = `${playerPos}px`;
  score = 0;
  alienSpeed = 1; // Reset to constant speed
  scoreDisplay.textContent = `Score: ${score}`;

  gameOver = false;
  replayButton.style.display = 'none';
  gameLoop();
}

document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if (e.key === ' ') shootLaser();
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

gameLoop();
