export const FLASH_PHRASES = ["popcorn", "icecream", "sellers", "imbroxavel", "incomivel", "fora lula", "petralhada", "fora comunismo", "bolsonaro presidente"];

export const POWER_UP_LIST = [
    { id: 'rapid', name: 'TIRO SEGUIDO', desc: 'Cadência de tiro aumentada!' },
    { id: 'v_shot', name: 'TIRO EM V', desc: 'Dispara 2 balas em ângulo!' },
    { id: 'spread_3', name: 'SPREAD 3', desc: 'Dispara 3 balas em leque!' },
    { id: 'spread_4', name: 'SPREAD 4', desc: 'Dispara 4 balas em leque!' },
    { id: 'bounce', name: 'RICOCHETE', desc: 'Balas rebatem nas paredes!' },
    { id: 'ice', name: 'TIRO DE GELO', desc: 'Inimigos ficam lentos!' },
    { id: 'electric', name: 'TIRO ELÉTRICO', desc: 'Dano em cadeia (Statikk)!' },
    { id: 'chain', name: 'BALA REBATEDORA', desc: 'Bala pula para outro inimigo!' },
    { id: 'bullet_speed', name: 'VELOCIDADE DO TIRO', desc: 'Projéteis mais rápidos!' },
    { id: 'player_speed', name: 'VELOCIDADE+', desc: 'Movimentação mais ágil!' }
];

export const DIFFICULTY_SETTINGS = {
    facil: { speedBase: 1.5, speedRandom: 1.5, spawnRateBase: 150, spawnRateScaling: 25, minSpawnRate: 50 },
    medio: { speedBase: 2.0, speedRandom: 2.0, spawnRateBase: 120, spawnRateScaling: 20, minSpawnRate: 40 },
    dificil: { speedBase: 2.5, speedRandom: 2.5, spawnRateBase: 100, spawnRateScaling: 15, minSpawnRate: 30 }
};

export const ENEMY_TYPES = [
    { color: '#c0392b', type: 'straight', shootCooldown: 120 }, // Vermelho: Tiro reto simples
    { color: '#8e44ad', type: 'double', shootCooldown: 150 },   // Roxo: Tiro duplo
    { color: '#e67e22', type: 'targeted', shootCooldown: 100 }, // Laranja: Direcionado ao player
    { color: '#34495e', type: 'circle', shootCooldown: 200 }    // Preto/Azul escuro: Círculo
];
