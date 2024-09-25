const gameArea = document.getElementById('gameArea');
const player = document.getElementById('player');
const replayButton = document.getElementById('replayButton');
const scoreDisplay = document.getElementById('scoreDisplay');
const welcomeScreen = document.getElementById('welcomeScreen');
const startButton = document.getElementById('startButton');

let playerPos = gameArea.clientWidth / 2;
let lasers = [];
let aliens = [];
let alienSpeed = 1; // Static speed, no difficulty adjustment
let gameOver = false;
let score = 0;
let keys = {};
let canShoot = true;

function movePlayer() {
  if (gameOver) return;

  if (keys.left) {
    playerPos -= 7;
    if (playerPos < 0) playerPos = 0;
  }
  if (keys.right) {
    playerPos += 7;
    if (playerPos + player.offsetWidth > gameArea.clientWidth) {
      playerPos = gameArea.clientWidth - player.offsetWidth;
    }
  }
  player.style.left = `${playerPos}px`;
}

function shootLaser() {
  if (gameOver || !canShoot) return;

  const laser = document.createElement('div');
  laser.classList.add('laser');
  laser.style.left = `${playerPos + player.offsetWidth / 2 - 2}px`;
  laser.style.bottom = '70px';
  gameArea.appendChild(laser);
  lasers.push(laser);

  canShoot = false;
  setTimeout(() => canShoot = true, 300);
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

    if (keys.shoot) shootLaser();

    if (Math.random() < 0.01) {
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
  alienSpeed = 1; // Reset to static speed
  scoreDisplay.textContent = `Score: ${score}`;

  gameOver = false;
  replayButton.style.display = 'none';
  gameLoop();
}

function startGame() {
  welcomeScreen.style.display = 'none';
  gameArea.style.display = 'block';
  gameLoop();
}

startButton.addEventListener('click', startGame);

document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowLeft':
      keys.left = true;
      break;
    case 'ArrowRight':
      keys.right = true;
      break;
    case ' ':
      keys.shoot = true;
      break;
  }
});

document.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'ArrowLeft':
      keys.left = false;
      break;
    case 'ArrowRight':
      keys.right = false;
      break;
    case ' ':
      keys.shoot = false;
      break;
  }
});

// Add touch controls for mobile devices
function handleTouch(e) {
  if (e.touches.length > 0) {
    const touch = e.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;
    
    // Check if touch is in the left half of the screen
    if (touchX < window.innerWidth / 2) {
      keys.left = true;
      keys.right = false;
    } else {
      keys.right = true;
      keys.left = false;
    }
    
    // Check if touch is on the bottom quarter of the screen
    if (touchY > window.innerHeight * 0.75) {
      keys.shoot = true;
    } else {
      keys.shoot = false;
    }
  }
}

function handleTouchEnd(e) {
  keys.left = false;
  keys.right = false;
  keys.shoot = false;
}

document.addEventListener('touchstart', handleTouch);
document.addEventListener('touchend', handleTouchEnd);
document.addEventListener('touchmove', handleTouch);
