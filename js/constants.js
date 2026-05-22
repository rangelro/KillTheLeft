export const FLASH_PHRASES = ["popcorn", "icecream", "sellers", "imbroxavel", "incomivel", "fora lula", "petralhada", "fora comunismo", "bolsonaro presidente"];

export const POWER_UP_LIST = [
    { id: 'rapid', name: 'CADÊNCIA MILITAR', desc: 'Aumenta a velocidade de disparo da sua arma!' },
    { id: 'v_shot', name: 'TIRO EM V', desc: 'Dobra seu poder de fogo com disparos angulares!' },
    { id: 'spread_3', name: 'LEQUE PATRIOTA', desc: 'Dispara 3 projéteis em arco para limpar o mapa!' },
    { id: 'spread_4', name: 'FORÇA TOTAL', desc: 'O poder máximo: 4 disparos simultâneos!' },
    { id: 'bounce', name: 'RICOCHETE', desc: 'Suas balas rebatem nas paredes contra os inimigos!' },
    { id: 'ice', name: 'CONGELAMENTO', desc: 'Munição especial que paralisa os oponentes!' },
    { id: 'electric', name: 'CHOQUE DE ORDEM', desc: 'Dano elétrico que se espalha entre os alvos!' },
    { id: 'chain', name: 'BALA BUSCADORA', desc: 'Projéteis que saltam automaticamente para o próximo alvo!' },
    { id: 'bullet_speed', name: 'VELOCIDADE DA VERDADE', desc: 'Seus tiros viajam muito mais rápido!' },
    { id: 'player_speed', name: 'AGILIDADE SUPREMA', desc: 'Aumenta a manobrabilidade da sua nave!' }
];

export const DIFFICULTY_SETTINGS = {
    facil: { speedBase: 1.5, speedRandom: 1.5, spawnRateBase: 150, spawnRateScaling: 25, minSpawnRate: 50, playerBulletSpeed: 10, playerCooldown: 25 },
    medio: { speedBase: 2.0, speedRandom: 2.0, spawnRateBase: 120, spawnRateScaling: 20, minSpawnRate: 40, playerBulletSpeed: 12, playerCooldown: 22 },
    dificil: { speedBase: 2.5, speedRandom: 2.5, spawnRateBase: 100, spawnRateScaling: 15, minSpawnRate: 30, playerBulletSpeed: 18, playerCooldown: 15 }
};

export const ENEMY_TYPES = [
    { color: '#c0392b', type: 'straight', shootCooldown: 120 }, // Vermelho: Tiro reto simples
    { color: '#8e44ad', type: 'double', shootCooldown: 150 },   // Roxo: Tiro duplo
    { color: '#e67e22', type: 'targeted', shootCooldown: 100 }, // Laranja: Direcionado ao player
    { color: '#34495e', type: 'circle', shootCooldown: 200 }    // Preto/Azul escuro: Círculo
];
