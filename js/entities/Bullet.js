export class Bullet {
    constructor(x, y, angle, speed, color, playerState) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.color = color;
        this.width = 5;
        this.height = 15;
        
        this.bounces = playerState.canBounce ? 2 : 0;
        this.isIce = playerState.iceShot;
        this.isElectric = playerState.electricShot;
        this.isChain = playerState.chainShot;
    }

    update(canvasWidth) {
        this.x += Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;

        if (this.bounces > 0) {
            if (this.x < 0 || this.x > canvasWidth) {
                this.angle = -this.angle;
                this.bounces--;
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        if (this.isElectric) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.strokeRect(-this.width / 2 - 2, -this.height / 2 - 2, this.width + 4, this.height + 4);
        }
        ctx.restore();
    }
}
