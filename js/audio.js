export class AudioManager {
    constructor() {
        console.log("Inicializando AudioManager...");
        this.gameAudio = new Audio('media/audio/Carnival_Whistle.mp3');
        this.gameAudio.loop = true;
        this.gameAudio.preload = 'auto';
        this.isMuted = false;
        
        this.gameAudio.muted = this.isMuted;

        this.gameAudio.addEventListener('error', (e) => {
            console.error("Erro ao carregar arquivo de áudio:", e);
        });
    }

    play(reset = false) {
        if (reset) {
            this.gameAudio.currentTime = 0;
        }
        this.gameAudio.muted = this.isMuted;
        
        console.log("Tentando tocar áudio. Mudo:", this.isMuted);
        this.gameAudio.play().then(() => {
            console.log("Áudio tocando com sucesso.");
        }).catch(err => {
            console.warn("Autoplay bloqueado pelo navegador. O som tocará após interação.", err.message);
        });
    }

    pause() {
        console.log("Pausando áudio.");
        this.gameAudio.pause();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.gameAudio.muted = this.isMuted;
        console.log("Estado de mudo alterado para:", this.isMuted);
        return this.isMuted;
    }
}
