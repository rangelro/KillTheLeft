import { drawStar } from '../utils.js';
import { ENEMY_TYPES } from '../constants.js';
import { EnemyBullet } from './EnemyBullet.js';

// Cache de imagens para os inimigos
const enemyImages = {};
const spritePaths = {
    'straight': 'media/enemies/enemy_straight.svg',
    'double': 'media/enemies/enemy_double.svg',
    'targeted': 'media/enemies/enemy_targeted.svg',
    'circle': 'media/enemies/enemy_circle.svg',
    'elite': 'media/enemies/enemy_elite.svg',
    // Novas variações visuais
    'psol': 'media/enemies/enemy_psol.svg',
    'pcdb': 'media/enemies/enemy_pcdb.svg',
    'sus': 'media/enemies/enemy_sus.svg',
    'chinelo': 'media/enemies/enemy_chinelo.svg',
    'seringa': 'media/enemies/enemy_seringa.svg'
};

Object.entries(spritePaths).forEach(([type, path]) => {
    const img = new Image();
    img.src = path;
    enemyImages[type] = img;
});

const visualVariations = ['straight', 'psol', 'pcdb', 'sus', 'chinelo', 'seringa'];

export class Target {
    constructor(canvasWidth, currentDifficulty, score) {
        this.radius = 30;
        this.x = this.radius + Math.random() * (canvasWidth - this.radius * 2);
        this.y = -this.radius;
        this.speed = currentDifficulty.speedBase + Math.random() * currentDifficulty.speedRandom;
        this.slowed = false;
        this.slowTimer = 0;
        
        // Frequência AUMENTADA de inimigos fortes
        const eliteChance = score > 8000 ? 0.6 : (score > 4000 ? 0.4 : (score > 2000 ? 0.2 : 0.05));
        const isElite = Math.random() < eliteChance;
        
        const typeInfo = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
        
        this.color = isElite ? '#000000' : typeInfo.color;
        this.attackType = isElite ? 'homing' : typeInfo.type;
        this.shootCooldown = (isElite ? 45 : typeInfo.shootCooldown) + Math.random() * 40;
        
        // HP AUMENTADO e visível
        this.maxHp = isElite ? 6 : (score > 12000 ? 4 : (score > 6000 ? 3 : (score > 1500 ? 2 : 1)));
        this.hp = this.maxHp;
        this.isElite = isElite;
        
        // Determina qual sprite usar
        if (isElite) {
            this.spriteType = 'elite';
        } else {
            // Se for ataque especial (double, circle, etc), tenta manter a coerência ou varia
            if (typeInfo.type === 'straight') {
                this.spriteType = visualVariations[Math.floor(Math.random() * visualVariations.length)];
            } else {
                this.spriteType = typeInfo.type;
            }
        }
        this.image = enemyImages[this.spriteType];
    }

    update(canvasHeight, playerPos, enemyBullets) {
        let curSpeed = this.speed;
        if (this.slowed) {
            curSpeed *= 0.5;
            this.slowTimer--;
            if (this.slowTimer <= 0) this.slowed = false;
        }
        this.y += curSpeed;
        
        this.shootCooldown--;
        if (this.shootCooldown <= 0 && this.y > 0 && this.y < canvasHeight - 100) {
            this.shoot(enemyBullets, playerPos);
            const baseCooldown = this.isElite ? 45 : ENEMY_TYPES.find(t => t.type === this.attackType || (this.isElite && t.type === 'circle')).shootCooldown;
            this.shootCooldown = baseCooldown + Math.random() * 30;
        }
    }

    takeDamage(amount) {
        this.hp -= amount;
        return this.hp <= 0;
    }

    shoot(enemyBullets, playerPos) {
        const speed = this.isElite ? 6 : 4;
        if (this.attackType === 'straight') {
            enemyBullets.push(new EnemyBullet(this.x, this.y, 0, speed, this.color));
        } else if (this.attackType === 'double') {
            enemyBullets.push(new EnemyBullet(this.x - 15, this.y, 0, speed, this.color));
            enemyBullets.push(new EnemyBullet(this.x + 15, this.y, 0, speed, this.color));
        } else if (this.attackType === 'targeted' || this.attackType === 'homing') {
            const angle = Math.atan2(playerPos.x - this.x, playerPos.y - this.y);
            const bullet = new EnemyBullet(this.x, this.y, angle, speed, this.color);
            if (this.attackType === 'homing') bullet.isHoming = true;
            enemyBullets.push(bullet);
        } else if (this.attackType === 'circle') {
            for (let i = 0; i < 10; i++) { 
                const angle = (Math.PI * 2 / 10) * i;
                enemyBullets.push(new EnemyBullet(this.x, this.y, angle, speed - 1, this.color));
            }
        }
    }

    draw(ctx) {
        ctx.save();
        
        if (this.slowed) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#3498db';
        }

        // Desenha o Sprite SVG
        if (this.image && this.image.complete) {
            ctx.drawImage(this.image, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        } else {
            const drawColor = this.slowed ? '#3498db' : this.color;
            drawStar(ctx, this.x, this.y, 5, this.radius, this.radius / 2, drawColor);
        }
        
        ctx.restore();

        // Barra de Vida
        if (this.maxHp > 1) {
            const barWidth = 40;
            const barHeight = 6;
            const healthPercent = this.hp / this.maxHp;
            
            ctx.fillStyle = '#333';
            ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 15, barWidth, barHeight);
            ctx.fillStyle = this.isElite ? '#f1c40f' : '#27ae60';
            ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 15, barWidth * healthPercent, barHeight);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x - barWidth/2, this.y - this.radius - 15, barWidth, barHeight);
        }
    }
}


