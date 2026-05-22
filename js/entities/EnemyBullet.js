export class EnemyBullet {
    constructor(x, y, angle, speed, color) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.color = color;
        this.radius = 5;
        this.isHoming = false;
    }

    update(playerPos) {
        if (this.isHoming && playerPos) {
            const targetAngle = Math.atan2(playerPos.x - this.x, playerPos.y - this.y);
            // Suaviza a rotação para perseguição
            const angleDiff = targetAngle - this.angle;
            this.angle += Math.sin(angleDiff) * 0.05;
        }
        
        this.x += Math.sin(this.angle) * this.speed;
        this.y += Math.cos(this.angle) * this.speed;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        if (this.isHoming) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
}

