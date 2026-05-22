import { drawStar } from '../utils.js';
import { ENEMY_TYPES } from '../constants.js';
import { EnemyBullet } from './EnemyBullet.js';

export class Target {
    constructor(canvasWidth, currentDifficulty) {
        this.radius = 30;
        this.x = this.radius + Math.random() * (canvasWidth - this.radius * 2);
        this.y = -this.radius;
        this.speed = currentDifficulty.speedBase + Math.random() * currentDifficulty.speedRandom;
        this.slowed = false;
        this.slowTimer = 0;
        
        const typeInfo = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
        this.color = typeInfo.color;
        this.attackType = typeInfo.type;
        this.shootCooldown = typeInfo.shootCooldown + Math.random() * 60;
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
            this.shootCooldown = ENEMY_TYPES.find(t => t.type === this.attackType).shootCooldown + Math.random() * 80;
        }
    }

    shoot(enemyBullets, playerPos) {
        const speed = 4;
        if (this.attackType === 'straight') {
            enemyBullets.push(new EnemyBullet(this.x, this.y, 0, speed, this.color));
        } else if (this.attackType === 'double') {
            enemyBullets.push(new EnemyBullet(this.x - 15, this.y, 0, speed, this.color));
            enemyBullets.push(new EnemyBullet(this.x + 15, this.y, 0, speed, this.color));
        } else if (this.attackType === 'targeted') {
            const angle = Math.atan2(playerPos.x - this.x, playerPos.y - this.y);
            enemyBullets.push(new EnemyBullet(this.x, this.y, angle, speed + 1, this.color));
        } else if (this.attackType === 'circle') {
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i;
                enemyBullets.push(new EnemyBullet(this.x, this.y, angle, speed - 1, this.color));
            }
        }
    }

    draw(ctx) {
        const drawColor = this.slowed ? '#3498db' : this.color;
        drawStar(ctx, this.x, this.y, 5, this.radius, this.radius / 2, drawColor);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PT', this.x, this.y + 2);
    }
}
