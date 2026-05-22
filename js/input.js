export class InputHandler {
    constructor() {
        this.keys = {};
        
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = true;
            
            if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // Previne gestos de sistema no mobile que atrapalham o jogo
        window.addEventListener('touchstart', (e) => {
            if (e.target.tagName === 'CANVAS') e.preventDefault();
        }, { passive: false });
        
        window.addEventListener('touchend', (e) => {
            if (e.target.tagName === 'CANVAS') e.preventDefault();
        }, { passive: false });
    }

    isPressed(key) {
        return !!this.keys[key.toLowerCase()];
    }
}

