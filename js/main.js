import { Game } from './game.js';
import { UIManager } from './ui.js';
import { AudioManager } from './audio.js';
import { InputHandler } from './input.js';
import { DIFFICULTY_SETTINGS } from './constants.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameContainer = document.getElementById('game-container');
const fullscreenButton = document.getElementById('fullscreen-button');
const muteButton = document.getElementById('mute-button');

const ui = new UIManager();
const audio = new AudioManager();
const input = new InputHandler();
const game = new Game(canvas, ctx, ui, audio, input);

function resizeGame() {
    const isFullscreen = Boolean(document.fullscreenElement);
    const uiHeight = document.getElementById('ui-container').offsetHeight;
    const availableWidth = isFullscreen ? window.innerWidth : Math.min(window.innerWidth * 0.9, 800);
    const availableHeight = isFullscreen ? window.innerHeight - uiHeight : Math.min(window.innerHeight * 0.6, 600);

    const canvasWidth = Math.max(320, Math.floor(availableWidth));
    const canvasHeight = Math.max(240, Math.floor(availableHeight));

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    gameContainer.style.width = `${canvasWidth}px`;
    gameContainer.style.height = `${canvasHeight + uiHeight}px`;

    if (game.player) {
        game.player.x = Math.min(Math.max(game.player.x, game.player.width / 2), canvas.width - game.player.width / 2);
        game.player.y = Math.min(Math.max(game.player.y, game.player.height / 2), canvas.height - game.player.height / 2);
    }
}

function bindDifficultyButtons() {
    const facilBtn = document.getElementById('facilButton');
    const medioBtn = document.getElementById('medioButton');
    const dificilBtn = document.getElementById('dificilButton');

    if (facilBtn) facilBtn.addEventListener('click', () => game.init(DIFFICULTY_SETTINGS.facil));
    if (medioBtn) medioBtn.addEventListener('click', () => game.init(DIFFICULTY_SETTINGS.medio));
    if (dificilBtn) dificilBtn.addEventListener('click', () => game.init(DIFFICULTY_SETTINGS.dificil));
}

// Global Events
window.addEventListener('resize', resizeGame);
document.addEventListener('fullscreenchange', resizeGame);

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') game.togglePause();
    if (e.key.toLowerCase() === 'f') toggleFullScreen();
});

window.addEventListener('rebindDifficulty', bindDifficultyButtons);

fullscreenButton.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFullScreen();
});

muteButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const isMuted = audio.toggleMute();
    ui.updateMuteButton(isMuted);
});

gameContainer.addEventListener('click', () => {
    ui.hideMilestoneModal();
    if (game.gameRunning && !game.gamePaused) {
        game.player.shoot(game.bullets);
    }
});

canvas.addEventListener('mousemove', (e) => { 
    if (game.gamePaused || !game.gameRunning) return;
    const rect = canvas.getBoundingClientRect(); 
    const scaleX = canvas.width / rect.width;
    if(game.player) game.player.x = (e.clientX - rect.left) * scaleX; 
});

canvas.addEventListener('touchmove', (e) => {
    if (game.gamePaused || !game.gameRunning) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if(game.player) {
        game.player.x = (touch.clientX - rect.left) * scaleX;
        game.player.y = (touch.clientY - rect.top) * scaleY;
    }
}, { passive: false });

canvas.addEventListener('touchstart', (e) => {
    if (game.gamePaused || !game.gameRunning) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if(game.player) {
        game.player.x = (touch.clientX - rect.left) * scaleX;
        game.player.y = (touch.clientY - rect.top) * scaleY;
        // Atira ao tocar se estiver rodando
        game.player.shoot(game.bullets);
    }
}, { passive: false });

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        gameContainer.requestFullscreen().catch(err => {
            console.error(`Erro ao tentar ativar modo tela cheia: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// Initial setup
resizeGame();
bindDifficultyButtons();
ui.updateMuteButton(audio.isMuted);
ui.updateUI(0, 3);
