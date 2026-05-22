import { Player } from './entities/Player.js';
import { Target } from './entities/Target.js';
import { LifeUp } from './entities/LifeUp.js';
import { Bullet } from './entities/Bullet.js';
import { POWER_UP_LIST, FLASH_PHRASES } from './constants.js';

export class Game {
    constructor(canvas, ctx, ui, audio, input) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.ui = ui;
        this.audio = audio;
        this.input = input;

        this.gameRunning = false;
        this.gamePaused = false;
        
        this.score = 0;
        this.lives = 3;
        this.player = null;
        this.bullets = [];
        this.enemyBullets = [];
        this.targets = [];
        this.lifeUps = [];
        
        this.targetSpawnTimer = 120;
        this.lifeUpSpawnTimer = 500;
        this.scoreMilestone = 500;
        this.nextPowerUpScore = 1500;
        this.powerUpInterval = 1500;
        this.currentDifficulty = null;
    }

    init(difficulty) {
        this.currentDifficulty = difficulty;
        this.score = 0;
        this.lives = 3;
        this.bullets = [];
        this.enemyBullets = [];
        this.targets = [];
        this.lifeUps = [];
        
        this.scoreMilestone = 500;
        this.nextPowerUpScore = 1500;
        this.powerUpInterval = 1500;
        
        this.player = new Player(this.canvas.width, this.canvas.height);
        this.gameRunning = true;
        this.gamePaused = false;
        this.targetSpawnTimer = 120;
        this.lifeUpSpawnTimer = 500;
        
        this.ui.hideMilestoneModal();
        this.ui.updateUI(this.score, this.lives);
        this.ui.hideModal();
        this.ui.togglePauseModal(false);
        
        this.audio.play(true);
        this.loop();
    }

    togglePause() {
        if (!this.gameRunning) return;
        this.gamePaused = !this.gamePaused;
        this.ui.togglePauseModal(this.gamePaused);
        
        if (!this.gamePaused) {
            this.audio.play();
            this.loop();
        } else {
            this.audio.pause();
        }
    }

    loop() {
        if (!this.gameRunning || this.gamePaused) return;
        
        requestAnimationFrame(() => this.loop());
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.update();
        this.draw();
    }

    update() {
        this.player.update(this.input, this.canvas.width, this.canvas.height);
        
        if (this.input.isPressed(' ')) {
            this.player.shoot(this.bullets);
        }

        // Spawning
        this.targetSpawnTimer--;
        if (this.targetSpawnTimer <= 0) {
            this.targets.push(new Target(this.canvas.width, this.currentDifficulty));
            this.targetSpawnTimer = Math.max(
                this.currentDifficulty.minSpawnRate, 
                this.currentDifficulty.spawnRateBase - this.score / this.currentDifficulty.spawnRateScaling
            );
        }

        this.lifeUpSpawnTimer--;
        if (this.lifeUpSpawnTimer <= 0) {
            this.lifeUps.push(new LifeUp(this.canvas.width));
            this.lifeUpSpawnTimer = 400 + Math.random() * 200;
        }

        // Updates
        this.bullets.forEach(b => b.update(this.canvas.width));
        this.enemyBullets.forEach(b => b.update());
        this.targets.forEach(t => t.update(this.canvas.height, {x: this.player.x, y: this.player.y}, this.enemyBullets));
        this.lifeUps.forEach(l => l.update());

        // Cleanup
        this.bullets = this.bullets.filter(b => b.y > -50 && b.y < this.canvas.height + 50 && b.x > -50 && b.x < this.canvas.width + 50);
        this.enemyBullets = this.enemyBullets.filter(b => b.y > -50 && b.y < this.canvas.height + 50 && b.x > -50 && b.x < this.canvas.width + 50);
        this.lifeUps = this.lifeUps.filter(l => l.y < this.canvas.height);
        
        for (let i = this.targets.length - 1; i >= 0; i--) {
            if (this.targets[i].y > this.canvas.height + this.targets[i].radius) {
                this.targets.splice(i, 1);
                if (!this.player.invincible) {
                    this.takeDamage();
                }
            }
        }

        this.checkCollisions();
    }

    draw() {
        this.player.draw(this.ctx);
        this.bullets.forEach(b => b.draw(this.ctx));
        this.enemyBullets.forEach(b => b.draw(this.ctx));
        this.targets.forEach(t => t.draw(this.ctx));
        this.lifeUps.forEach(l => l.draw(this.ctx));
    }

    takeDamage() {
        this.lives--;
        this.player.invincible = true;
        this.player.invincibleTimer = 180;
        this.ui.updateUI(this.score, this.lives);
        if (this.lives <= 0) this.endGame();
    }

    checkCollisions() {
        // Player Bullets -> Targets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            for (let j = this.targets.length - 1; j >= 0; j--) {
                const t = this.targets[j];
                if (b && t && Math.hypot(b.x - t.x, b.y - t.y) < t.radius + b.height) {
                    if (b.isIce) { t.slowed = true; t.slowTimer = 300; }
                    if (b.isElectric) { this.chainElectric(t, j); }
                    if (b.isChain) { this.chainBullet(b, j); }

                    this.targets.splice(j, 1);
                    if (!b.isChain) this.bullets.splice(i, 1);
                    
                    this.score += 25;
                    this.ui.updateUI(this.score, this.lives);
                    this.checkMilestones();
                    break;
                }
            }
        }

        // Enemy Bullets -> Player
        if (!this.player.invincible) {
            for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
                const eb = this.enemyBullets[i];
                if (eb && Math.hypot(eb.x - this.player.x, eb.y - this.player.y) < eb.radius + this.player.width / 2 - 10) {
                    this.enemyBullets.splice(i, 1);
                    this.takeDamage();
                    if (this.lives <= 0) break;
                }
            }
        }

        // Player Bullets -> LifeUps
        for (let i = this.bullets.length - 1; i >= 0; i--) {
             for (let j = this.lifeUps.length - 1; j >= 0; j--) {
                const b = this.bullets[i], l = this.lifeUps[j];
                if (b && l && b.x > l.x && b.x < l.x + l.width && b.y > l.y && b.y < l.y + l.height) {
                    this.lifeUps.splice(j, 1);
                    this.bullets.splice(i, 1);
                    if (this.lives < 5) this.lives++;
                    this.score += 10;
                    this.ui.updateUI(this.score, this.lives);
                    
                    const phrase = FLASH_PHRASES[Math.floor(Math.random() * FLASH_PHRASES.length)];
                    this.ui.showFlashMessage(phrase);
                    
                    this.checkMilestones();
                    break;
                }
             }
        }
    }

    chainElectric(startTarget, index) {
        this.targets.forEach((t, i) => {
            if (i !== index && Math.hypot(startTarget.x - t.x, startTarget.y - t.y) < 180) {
                setTimeout(() => {
                    const targetIdx = this.targets.indexOf(t);
                    if (targetIdx !== -1) {
                        this.targets.splice(targetIdx, 1);
                        this.score += 15;
                        this.ui.updateUI(this.score, this.lives);
                        // Visual effect could be handled here or in a separate effects list
                    }
                }, 100);
            }
        });
    }

    chainBullet(bullet, index) {
        let nearest = null;
        let minDist = Infinity;
        this.targets.forEach((t, i) => {
            if (i !== index) {
                const dist = Math.hypot(bullet.x - t.x, bullet.y - t.y);
                if (dist < minDist) { minDist = dist; nearest = t; }
            }
        });
        if (nearest) {
            const angle = Math.atan2(nearest.x - bullet.x, bullet.y - nearest.y);
            bullet.angle = angle;
            bullet.isChain = false;
        } else {
            const idx = this.bullets.indexOf(bullet);
            if (idx !== -1) this.bullets.splice(idx, 1);
        }
    }

    checkMilestones() {
        if (this.score >= this.scoreMilestone) {
            this.ui.showMilestoneMessage();
            this.scoreMilestone += 500;
        }
        if (this.score >= this.nextPowerUpScore) {
            this.awardPowerUp();
            this.powerUpInterval += 500;
            this.nextPowerUpScore += this.powerUpInterval;
        }
    }

    awardPowerUp() {
        const pu = POWER_UP_LIST[Math.floor(Math.random() * POWER_UP_LIST.length)];
        this.player.applyPowerUp(pu.id);
        
        const message = `<div style="font-size: 20px; color: #f1c40f; margin-bottom: 10px;">POWER UP ADQUIRIDO!</div><div style="font-size: 28px;">${pu.name}</div><div style="font-size: 14px; margin-top: 10px; color: #ecf0f1;">${pu.desc}</div>`;
        this.ui.showFlashMessage(message, true);
    }

    endGame() {
        this.gameRunning = false;
        this.audio.pause();
        
        const content = `
            <div id="modal-content">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Luiz_In%C3%A1cio_Lula_da_Silva_em_24_de_fevereiro_de_2023.jpg/440px-Luiz_In%C3%A1cio_Lula_da_Silva_em_24_de_fevereiro_de_2023.jpg" 
                     alt="Foto do Lula" 
                     class="game-over-img"
                     onerror="this.onerror=null;this.src='https://placehold.co/150x150/c0392b/FFFFFF?text=L';">
                <div id="modal-title" style="color: #e74c3c;">O amor venceu</div>
                <div id="final-score">Sua pontuação: ${this.score}</div>
                <button id="startButton">Tentar Novamente</button>
            </div>
        `;
        this.ui.showModal(content);
        
        document.getElementById('startButton').addEventListener('click', () => {
            const difficultyContent = `
             <div id="modal-content">
                <div id="modal-title">Escolha a Dificuldade</div>
                <div class="difficulty-buttons">
                    <button id="facilButton">Fácil</button>
                    <button id="medioButton">Médio</button>
                    <button id="dificilButton">Difícil</button>
                </div>
                <p style="font-size: 12px; margin-top: 20px; color: #f1c40f;">Pressione 'ESC' para pausar o jogo.</p>
            </div>`;
            this.ui.showModal(difficultyContent);
            // Main.js will re-bind these listeners as it's the one that knows about constants/Game init
            window.dispatchEvent(new CustomEvent('rebindDifficulty'));
        });
    }
}
