import { Bullet } from './Bullet.js';

export class Player {
    constructor(canvasWidth, canvasHeight) {
        this.width = 60;
        this.height = 60;
        this.x = canvasWidth / 2;
        this.y = canvasHeight - 60;
        
        this.speed = 7;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.shootCooldown = 0;
        this.baseCooldown = 25;
        this.bulletSpeed = 10;
        
        this.shotType = 'normal'; // normal, v, spread3, spread4
        this.iceShot = false;
        this.electricShot = false;
        this.chainShot = false;
        this.canBounce = false;

        this.image = new Image();
        this.image.src = 'media/nave.svg';
        this.imageLoaded = false;
        this.image.onload = () => { this.imageLoaded = true; };
    }

    update(input, canvasWidth, canvasHeight) {
        if (input.isPressed('a') || input.isPressed('arrowleft')) this.x -= this.speed;
        if (input.isPressed('d') || input.isPressed('arrowright')) this.x += this.speed;
        if (input.isPressed('w') || input.isPressed('arrowup')) this.y -= this.speed;
        if (input.isPressed('s') || input.isPressed('arrowdown')) this.y += this.speed;

        // Limites do Canvas
        this.x = Math.min(Math.max(this.x, this.width / 2), canvasWidth - this.width / 2);
        this.y = Math.min(Math.max(this.y, this.height / 2), canvasHeight - this.height / 2);

        if (this.shootCooldown > 0) this.shootCooldown--;
        
        if (this.invincible) {
            this.invincibleTimer--;
            if (this.invincibleTimer <= 0) this.invincible = false;
        }
    }

    shoot(bullets) {
        if (this.shootCooldown > 0) return;

        const bSpeed = this.bulletSpeed;
        const bColor = this.iceShot ? '#3498db' : (this.electricShot ? '#f1c40f' : '#f1c40f');
        const state = {
            canBounce: this.canBounce,
            iceShot: this.iceShot,
            electricShot: this.electricShot,
            chainShot: this.chainShot
        };
        
        if (this.shotType === 'normal') {
            bullets.push(new Bullet(this.x, this.y, 0, bSpeed, bColor, state));
        } else if (this.shotType === 'v') {
            bullets.push(new Bullet(this.x, this.y, -0.2, bSpeed, bColor, state));
            bullets.push(new Bullet(this.x, this.y, 0.2, bSpeed, bColor, state));
        } else if (this.shotType === 'spread3') {
            bullets.push(new Bullet(this.x, this.y, -0.3, bSpeed, bColor, state));
            bullets.push(new Bullet(this.x, this.y, 0, bSpeed, bColor, state));
            bullets.push(new Bullet(this.x, this.y, 0.3, bSpeed, bColor, state));
        } else if (this.shotType === 'spread4') {
            bullets.push(new Bullet(this.x, this.y, -0.45, bSpeed, bColor, state));
            bullets.push(new Bullet(this.x, this.y, -0.15, bSpeed, bColor, state));
            bullets.push(new Bullet(this.x, this.y, 0.15, bSpeed, bColor, state));
            bullets.push(new Bullet(this.x, this.y, 0.45, bSpeed, bColor, state));
        }

        this.shootCooldown = this.baseCooldown;
    }

    draw(ctx) {
        if (this.invincible && Math.floor(this.invincibleTimer / 10) % 2 !== 0) return;

        ctx.save();
        if (this.imageLoaded) {
            ctx.drawImage(this.image, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        } else {
            // Fallback draw
            ctx.fillStyle = '#2c3e50'; 
            ctx.fillRect(this.x - this.width / 4, this.y, this.width / 2, this.height * 0.8);
            ctx.fillStyle = '#ecf0f1'; 
            ctx.beginPath(); ctx.arc(this.x, this.y - 10, 15, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#f1c40f'; ctx.fillRect(this.x - 4, this.y - 25, 8, 25);
            ctx.fillStyle = '#27ae60'; ctx.fillRect(this.x - 4, this.y - 15, 8, 15);
        }

        // Aura visual para Power-ups ativos
        if (this.iceShot) { 
            ctx.strokeStyle = '#3498db'; ctx.lineWidth = 3; 
            ctx.strokeRect(this.x - this.width/2 - 2, this.y - this.height/2 - 2, this.width + 4, this.height + 4); 
        }
        if (this.electricShot) { 
            ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); 
            ctx.strokeRect(this.x - this.width/2 - 5, this.y - this.height/2 - 5, this.width + 10, this.height + 10); 
        }
        ctx.restore();
    }

    applyPowerUp(id) {
        switch(id) {
            case 'rapid': this.baseCooldown = Math.max(5, this.baseCooldown - 5); break;
            case 'v_shot': this.shotType = 'v'; break;
            case 'spread_3': this.shotType = 'spread3'; break;
            case 'spread_4': this.shotType = 'spread4'; break;
            case 'bounce': this.canBounce = true; break;
            case 'ice': this.iceShot = true; break;
            case 'electric': this.electricShot = true; break;
            case 'chain': this.chainShot = true; break;
            case 'bullet_speed': this.bulletSpeed += 4; break;
            case 'player_speed': this.speed += 2; break;
        }
    }
}
