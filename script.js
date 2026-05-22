// --- Configurações Iniciais ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesContainer = document.getElementById('lives-container');
const modal = document.getElementById('modal');
const milestoneModal = document.getElementById('milestone-modal');
const pauseModal = document.getElementById('pause-modal');
const flashMessageEl = document.getElementById('flash-message');
const gameContainer = document.getElementById('game-container');
const fullscreenButton = document.getElementById('fullscreen-button');
const playerImage = new Image();
playerImage.src = 'media/nave.svg';
let playerImageLoaded = false;

playerImage.onload = () => {
    playerImageLoaded = true;
    if (!gameRunning && player) {
        player.draw();
    }
};

let canvasWidth = 0;
let canvasHeight = 0;

// --- Variáveis do Jogo ---
let score, lives, player, bullets, targets, lifeUps, gameRunning, gamePaused, targetSpawnTimer, lifeUpSpawnTimer, scoreMilestone, currentDifficulty, milestoneHideTimer;
const flashPhrases = ["popcorn", "icecream", "sellers", "imbroxavel", "incomivel", "fora lula", "petralhada", "fora comunismo", "bolsonaro presidente"];
const keys = {};

const difficultySettings = {
    facil: { speedBase: 1.5, speedRandom: 1.5, spawnRateBase: 150, spawnRateScaling: 25, minSpawnRate: 50 },
    medio: { speedBase: 2.0, speedRandom: 2.0, spawnRateBase: 120, spawnRateScaling: 20, minSpawnRate: 40 },
    dificil: { speedBase: 2.5, speedRandom: 2.5, spawnRateBase: 100, spawnRateScaling: 15, minSpawnRate: 30 }
};

// --- Funções de Desenho Auxiliares ---
function drawStar(cx, cy, spikes, outerRadius, innerRadius, color) {
    let rot = Math.PI / 2 * 3; let x = cx; let y = cy; let step = Math.PI / spikes;
    ctx.beginPath(); ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius; y = cy + Math.sin(rot) * outerRadius; ctx.lineTo(x, y); rot += step;
        x = cx + Math.cos(rot) * innerRadius; y = cy + Math.sin(rot) * innerRadius; ctx.lineTo(x, y); rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius); ctx.closePath(); ctx.fillStyle = color; ctx.fill();
}

function resizeGame() {
    const isFullscreen = Boolean(document.fullscreenElement);
    const uiHeight = document.getElementById('ui-container').offsetHeight;
    const availableWidth = isFullscreen ? window.innerWidth : Math.min(window.innerWidth * 0.9, 800);
    const availableHeight = isFullscreen ? window.innerHeight - uiHeight : Math.min(window.innerHeight * 0.6, 600);

    canvasWidth = Math.max(320, Math.floor(availableWidth));
    canvasHeight = Math.max(240, Math.floor(availableHeight));

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    gameContainer.style.width = `${canvasWidth}px`;
    gameContainer.style.height = `${canvasHeight + uiHeight}px`;

    if (player) {
        player.x = Math.min(Math.max(player.x, player.width / 2), canvas.width - player.width / 2);
        player.y = Math.min(Math.max(player.y, player.height / 2), canvas.height - player.height / 2);
    }
}

// --- Objetos do Jogo ---
function createPlayer() {
    return {
        x: canvas.width / 2, y: canvas.height - 60, width: 60, height: 60,
        speed: 7,
        invincible: false, invincibleTimer: 0,
        shootCooldown: 0,
        draw() {
            ctx.save();
            if (playerImageLoaded) {
                ctx.drawImage(playerImage, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
            } else {
                ctx.fillStyle = '#2c3e50'; ctx.fillRect(this.x - this.width / 4, this.y, this.width / 2, this.height * 0.8);
                ctx.fillStyle = '#ecf0f1'; ctx.beginPath(); ctx.arc(this.x, this.y - 10, 15, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#f1c40f'; ctx.fillRect(this.x - 4, this.y - 25, 8, 25);
                ctx.fillStyle = '#27ae60'; ctx.fillRect(this.x - 4, this.y - 15, 8, 15);
            }
            ctx.restore();
        },
        update() {
            if (keys['a'] || keys['arrowleft']) this.x -= this.speed;
            if (keys['d'] || keys['arrowright']) this.x += this.speed;
            if (keys['w'] || keys['arrowup']) this.y -= this.speed;
            if (keys['s'] || keys['arrowdown']) this.y += this.speed;

            // Limites do Canvas
            if (this.x < this.width / 2) this.x = this.width / 2;
            if (this.x > canvas.width - this.width / 2) this.x = canvas.width - this.width / 2;
            if (this.y < this.height / 2) this.y = this.height / 2;
            if (this.y > canvas.height - this.height / 2) this.y = canvas.height - this.height / 2;

            if (this.shootCooldown > 0) this.shootCooldown--;
            if (keys[' '] && this.shootCooldown <= 0) {
                bullets.push(new Bullet(this.x, this.y));
                this.shootCooldown = 15; // Cooldown para não disparar rápido demais
            }
        }
    };
}

class Bullet {
    constructor(x, y) { this.x = x; this.y = y; this.width = 5; this.height = 15; this.speed = 10; this.color = '#f1c40f'; }
    update() { this.y -= this.speed; }
    draw() { ctx.fillStyle = this.color; ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height); }
}

class Target {
    constructor() {
        this.radius = 30;
        this.x = this.radius + Math.random() * (canvas.width - this.radius * 2);
        this.y = -this.radius;
        this.speed = currentDifficulty.speedBase + Math.random() * currentDifficulty.speedRandom;
    }
    update() { this.y += this.speed; }
    draw() {
        drawStar(this.x, this.y, 5, this.radius, this.radius / 2, '#c0392b');
        ctx.fillStyle = 'white'; ctx.font = 'bold 16px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('PT', this.x, this.y + 2);
    }
}

class LifeUp {
    constructor() { this.width = 60; this.height = 40; this.x = Math.random() * (canvas.width - this.width); this.y = -this.height; this.speed = 3; }
    update() { this.y += this.speed; }
    draw() {
        ctx.save();
        ctx.fillStyle = '#009B3A'; ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#FFCC29'; ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + 5); ctx.lineTo(this.x + this.width - 5, this.y + this.height / 2); ctx.lineTo(this.x + this.width / 2, this.y + this.height - 5); ctx.lineTo(this.x + 5, this.y + this.height / 2);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#002776'; ctx.beginPath(); ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 8, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
}

// --- Funções Principais do Jogo ---
function initGame(difficulty) {
    currentDifficulty = difficulty;
    score = 0; lives = 3; bullets = []; targets = []; lifeUps = [];
    scoreMilestone = 500;
    resizeGame();
    player = createPlayer(); gameRunning = true; gamePaused = false; targetSpawnTimer = 120; lifeUpSpawnTimer = 500;
    hideMilestoneModal();
    updateUI();
    modal.style.display = 'none';
    pauseModal.style.display = 'none';
    gameLoop();
}

function togglePause() {
    if (!gameRunning) return;
    gamePaused = !gamePaused;
    pauseModal.style.display = gamePaused ? 'flex' : 'none';
    if (!gamePaused) {
        gameLoop();
    }
}

function gameLoop() {
    if (!gameRunning || gamePaused) return; 
    requestAnimationFrame(gameLoop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    player.update();

    if (player.invincible) {
        player.invincibleTimer--;
        if (player.invincibleTimer <= 0) player.invincible = false;
        if (Math.floor(player.invincibleTimer / 10) % 2 === 0) player.draw();
    } else {
        player.draw();
    }
    
    targetSpawnTimer--;
    if (targetSpawnTimer <= 0) {
        targets.push(new Target());
        targetSpawnTimer = Math.max(currentDifficulty.minSpawnRate, currentDifficulty.spawnRateBase - score / currentDifficulty.spawnRateScaling);
    }
    lifeUpSpawnTimer--;
    if (lifeUpSpawnTimer <= 0) { lifeUps.push(new LifeUp()); lifeUpSpawnTimer = 400 + Math.random() * 200; }
    [...bullets, ...targets, ...lifeUps].forEach(obj => { obj.update(); obj.draw(); });
    bullets = bullets.filter(b => b.y > 0); lifeUps = lifeUps.filter(l => l.y < canvas.height);
    
    for (let i = targets.length - 1; i >= 0; i--) {
        if (targets[i].y > canvas.height + targets[i].radius) {
            targets.splice(i, 1);
            if (!player.invincible) {
                lives--;
                player.invincible = true;
                player.invincibleTimer = 180;
                updateUI();
                if (lives <= 0) endGame();
            }
        }
    }
    checkCollisions();
}

function checkCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = targets.length - 1; j >= 0; j--) {
            const b = bullets[i], t = targets[j];
            if (b && t && Math.hypot(b.x - t.x, b.y - t.y) < t.radius + b.height) {
                targets.splice(j, 1); bullets.splice(i, 1); score += 25; updateUI(); checkMilestone(); break;
            }
        }
    }
    for (let i = bullets.length - 1; i >= 0; i--) {
         for (let j = lifeUps.length - 1; j >= 0; j--) {
            const b = bullets[i], l = lifeUps[j];
             if (b && l && b.x > l.x && b.x < l.x + l.width && b.y > l.y && b.y < l.y + l.height) {
                lifeUps.splice(j, 1); bullets.splice(i, 1);
                if (lives < 5) {
                   lives++;
                }
                score += 10; updateUI();
                showFlashMessage();
                checkMilestone(); break;
            }
         }
    }
}

function updateUI() { 
    scoreEl.textContent = `Pontos: ${score}`;
    livesContainer.innerHTML = '';
    for (let i = 0; i < lives; i++) {
        livesContainer.innerHTML += `<svg class="heart" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
    }
}

function hideMilestoneModal() {
    clearTimeout(milestoneHideTimer);
    if (milestoneModal.style.display === 'flex') {
        milestoneModal.style.display = 'none';
    }
}

function checkMilestone() {
    if (score >= scoreMilestone) {
        showMilestoneMessage();
        scoreMilestone += 500;
    }
}

function showFlashMessage() {
    const randomPhrase = flashPhrases[Math.floor(Math.random() * flashPhrases.length)];
    flashMessageEl.textContent = randomPhrase.toUpperCase();
    flashMessageEl.classList.remove('flash-active');
    void flashMessageEl.offsetWidth; 
    flashMessageEl.classList.add('flash-active');
}

function showMilestoneMessage() {
    clearTimeout(milestoneHideTimer);
    milestoneModal.style.display = 'flex';
    milestoneHideTimer = setTimeout(() => {
        milestoneModal.style.display = 'none';
    }, 2000);
}

function endGame() {
    gameRunning = false;
    modal.innerHTML = `
        <div id="modal-content">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Luiz_In%C3%A1cio_Lula_da_Silva_em_24_de_fevereiro_de_2023.jpg/440px-Luiz_In%C3%A1cio_Lula_da_Silva_em_24_de_fevereiro_de_2023.jpg" 
                 alt="Foto do Lula" 
                 class="game-over-img"
                 onerror="this.onerror=null;this.src='https://placehold.co/150x150/c0392b/FFFFFF?text=L';">
            <div id="modal-title" style="color: #e74c3c;">O amor venceu</div>
            <div id="final-score">Sua pontuação: ${score}</div>
            <button id="startButton">Tentar Novamente</button>
        </div>
    `;
    modal.style.display = 'flex';
    document.getElementById('startButton').addEventListener('click', () => {
        modal.innerHTML = `
         <div id="modal-content">
            <div id="modal-title">Escolha a Dificuldade</div>
            <div class="difficulty-buttons">
                <button id="facilButton">Fácil</button>
                <button id="medioButton">Médio</button>
                <button id="dificilButton">Difícil</button>
            </div>
            <p style="font-size: 12px; margin-top: 20px; color: #f1c40f;">Pressione 'ESC' para pausar o jogo.</p>
        </div>`;
        addDifficultyListeners();
    });
}

function addDifficultyListeners() {
    document.getElementById('facilButton').addEventListener('click', () => initGame(difficultySettings.facil));
    document.getElementById('medioButton').addEventListener('click', () => initGame(difficultySettings.medio));
    document.getElementById('dificilButton').addEventListener('click', () => initGame(difficultySettings.dificil));
}

// --- Event Listeners ---
addDifficultyListeners();
gameContainer.addEventListener('click', () => {
    hideMilestoneModal();
    if (gameRunning && !gamePaused) { bullets.push(new Bullet(player.x, player.y)); }
});

fullscreenButton.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFullScreen();
});

canvas.addEventListener('mousemove', (e) => { 
    if (gamePaused || !gameRunning) return;
    const rect = canvas.getBoundingClientRect(); 
    if(player) player.x = e.clientX - rect.left; 
});

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    keys[key] = true;
    if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault();
    }
    if (e.key === 'Escape') {
        togglePause();
    }
    if (key === 'f') {
        toggleFullScreen();
    }
});

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        gameContainer.requestFullscreen().catch(err => {
            console.error(`Erro ao tentar ativar modo tela cheia: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

window.addEventListener('resize', () => {
    resizeGame();
    if (!gameRunning && player) { player.draw(); }
});

document.addEventListener('fullscreenchange', () => {
    resizeGame();
    if (!gameRunning && player) { player.draw(); }
});

// Estado inicial
resizeGame();
player = createPlayer();
updateUI();