export class LifeUp {
    constructor(canvasWidth) {
        this.width = 60;
        this.height = 40;
        this.x = Math.random() * (canvasWidth - this.width);
        this.y = -this.height;
        this.speed = 3;
    }

    update() {
        this.y += this.speed;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = '#009B3A';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = '#FFCC29';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + 5);
        ctx.lineTo(this.x + this.width - 5, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height - 5);
        ctx.lineTo(this.x + 5, this.y + this.height / 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#002776';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}
