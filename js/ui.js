export class UIManager {
    constructor() {
        this.scoreEl = document.getElementById('score');
        this.livesContainer = document.getElementById('lives-container');
        this.modal = document.getElementById('modal');
        this.milestoneModal = document.getElementById('milestone-modal');
        this.pauseModal = document.getElementById('pause-modal');
        this.flashMessageEl = document.getElementById('flash-message');
        this.muteButton = document.getElementById('mute-button');
        
        this.milestoneHideTimer = null;
    }

    updateUI(score, lives) {
        this.scoreEl.textContent = `Pontos: ${score}`;
        this.livesContainer.innerHTML = '';
        for (let i = 0; i < lives; i++) {
            this.livesContainer.innerHTML += `<svg class="heart" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
        }
    }

    showFlashMessage(message, isHTML = false) {
        if (isHTML) {
            this.flashMessageEl.innerHTML = message;
        } else {
            this.flashMessageEl.textContent = message.toUpperCase();
        }
        
        this.flashMessageEl.classList.remove('flash-active');
        void this.flashMessageEl.offsetWidth; 
        this.flashMessageEl.classList.add('flash-active');
    }

    showMilestoneMessage() {
        clearTimeout(this.milestoneHideTimer);
        this.milestoneModal.style.display = 'flex';
        this.milestoneHideTimer = setTimeout(() => {
            this.milestoneModal.style.display = 'none';
        }, 2000);
    }

    hideMilestoneModal() {
        clearTimeout(this.milestoneHideTimer);
        this.milestoneModal.style.display = 'none';
    }

    showModal(content) {
        this.modal.innerHTML = content;
        this.modal.style.display = 'flex';
    }

    hideModal() {
        this.modal.style.display = 'none';
    }

    togglePauseModal(paused) {
        this.pauseModal.style.display = paused ? 'flex' : 'none';
    }

    updateMuteButton(isMuted) {
        this.muteButton.classList.toggle('is-muted', isMuted);
        this.muteButton.title = isMuted ? 'Ativar som' : 'Silenciar som';
        this.muteButton.setAttribute('aria-label', isMuted ? 'Ativar som' : 'Silenciar som');
    }
}
