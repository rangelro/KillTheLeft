// Cache de imagens para os buffs
const buffImages = {};
const buffPaths = {
    'brasil': 'media/buffs/buff_brasil.svg',
    'usa': 'media/buffs/buff_usa.svg',
    'ype': 'media/buffs/buff_ype.svg'
};

Object.entries(buffPaths).forEach(([type, path]) => {
    const img = new Image();
    img.src = path;
    buffImages[type] = img;
});

const buffTypes = ['brasil', 'usa', 'ype'];

export class LifeUp {
    constructor(canvasWidth) {
        this.width = 60;
        this.height = 40;
        this.x = Math.random() * (canvasWidth - this.width);
        this.y = -this.height;
        this.speed = 3;

        this.type = buffTypes[Math.floor(Math.random() * buffTypes.length)];
        this.image = buffImages[this.type];
        
        // Ajusta dimensões para o frasco de detergente que é mais alto
        if (this.type === 'ype') {
            this.width = 40;
            this.height = 60;
        }
    }

    update() {
        this.y += this.speed;
    }

    draw(ctx) {
        ctx.save();
        if (this.image && this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            // Fallback original
            ctx.fillStyle = '#009B3A';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = '#FFCC29';
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y + 5);
            ctx.lineTo(this.x + this.width - 5, this.y + this.height / 2);
            ctx.lineTo(this.x + this.width / 2, this.y + this.height - 5);
            ctx.lineTo(this.x + 5, this.y + this.height / 2);
            ctx.closePath(); ctx.fill();
        }
        ctx.restore();
    }
}

