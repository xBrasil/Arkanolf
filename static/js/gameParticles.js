// Particle Arrays
let introParticles = [];
let blockHitParticles = [];
let fireParticles = [];
let menuParticles = [];
let sparkleParticles = [];

// Constants
const BLOCKHIT_PARTICLE_SPEED = 0.3;
const BLOCKHIT_PARTICLE_LIFE = 0.3;
const BLOCKHIT_PARTICLE_SIZE = 0.003;
const BLOCKHIT_PARTICLE_COUNT = 20;

const FIRE_PARTICLE_SPEED = 0.2;
const FIRE_PARTICLE_LIFE = 0.3;
const FIRE_PARTICLE_SIZE = 0.003;

const WICKED_PARTICLE_SPEED = 0.05;
const WICKED_PARTICLE_LIFE = 0.5;
const WICKED_PARTICLE_SIZE = 0.0125;
const WICKED_PARTICLE_COUNT = 30;

const MENU_PARTICLE_SPEED = 100;

function clearGameParticles() {
    blockHitParticles = [];
    fireParticles = [];
}

function createSparkleParticles() {
    sparkleParticles = [];
    for (let i = 0; i < 100; i++) {
        sparkleParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3 + 1,
            speedY: Math.random() * -0.5 - 0.5,
            color: `hsl(${Math.random() * 360}, 100%, 80%)`,
            opacity: Math.random() * 0.5 + 0.5
        });
    }
}

function updateSparkleParticles(deltaTime) {
    for (let particle of sparkleParticles) {
        particle.y += particle.speedY * deltaTime * 60;
        if (particle.y < -particle.size) {
            particle.y = canvas.height + particle.size;
            particle.x = Math.random() * canvas.width;
        }
    }
}

function drawSparkleParticles() {
    for (let particle of sparkleParticles) {
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Block Hit Particles (When bricks are destroyed)
function createBlockHitParticles(x, y, particleColor) {
    if (!particleColor) {
        console.warn('Cor não definida para as partículas de impacto do bloco. Usando cor padrão.');
        particleColor = levelPalette.brickColor; // Cor padrão
    }
    for (let i = 0; i < BLOCKHIT_PARTICLE_COUNT; i++) {
        blockHitParticles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5),
            dy: (Math.random() - 0.5),
            life: BLOCKHIT_PARTICLE_LIFE,
            color: particleColor,
        });
    }
}

function updateBlockHitParticles(deltaTime) {
    for(let i = 0; i < blockHitParticles.length; i++) {
        let p = blockHitParticles[i];
        p.x += p.dx * deltaTime * canvasDiagonal * BLOCKHIT_PARTICLE_SPEED; // Atualiza a posição horizontal
        p.y += p.dy * deltaTime * canvasDiagonal * BLOCKHIT_PARTICLE_SPEED; // Atualiza a posição vertical
        p.life -= deltaTime;     // Reduz a vida da partícula

        if(p.life <= 0) {
            blockHitParticles.splice(i, 1);
            i--;
        }
    }
}

function drawBlockHitParticles() {
    const particleSize = canvasDiagonal * BLOCKHIT_PARTICLE_SIZE; // Ajuste o multiplicador conforme necessário

    for(let p of blockHitParticles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, particleSize, 0, Math.PI * 2);
        ctx.fillStyle = parseColorToRGBA(p.color, p.life / BLOCKHIT_PARTICLE_LIFE); // Opacidade baseada na vida
        ctx.fill();
        ctx.closePath();
    }
}

function createIntroParticles() {
    const MAX_PARTICLES = Math.floor(canvasDiagonal * 0.1);
    introParticles = [];

    for (let i = 0; i < MAX_PARTICLES; i++) {
        introParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            dx: (Math.random() - 0.5) * 2,
            dy: (Math.random() - 0.5) * 2,
            radius: Math.random() * 2 + 1,
            alpha: Math.random()
        });
    }
}

function updateIntroParticles(deltaTime) {
    for (let p of introParticles) {
        p.x += p.dx * deltaTime * 60;
        p.y += p.dy * deltaTime * 60;

        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    }
}

function drawIntroParticles() {
    for (let p of introParticles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255,' + p.alpha + ')';
        ctx.fill();
    }
}

function createMenuParticles() {
    // Cria as partículas para o menu (tanto para o Start Menu quanto para Game Over)
    const MAX_PARTICLES = Math.floor(canvasDiagonal * 0.1);
    menuParticles = [];
    
    for (let i = 0; i < MAX_PARTICLES; i++) { // Número de partículas aumentadas para uma estética mais rica
        menuParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            dx: (Math.random() * 2 - 1) * MENU_PARTICLE_SPEED, // Velocidade horizontal (pixels/segundo)
            dy: (Math.random() * 2 - 1) * MENU_PARTICLE_SPEED, // Velocidade vertical (pixels/segundo)
            radius: Math.random() * 3 + 1,
            alpha: Math.random() * 0.5 + 0.5, // Alpha entre 0.5 e 1
        });
    }
}

function updateMenuParticles(deltaTime) {
    for (let i = 0; i < menuParticles.length; i++) {
        let p = menuParticles[i];
        p.x += p.dx * deltaTime; // Atualiza a posição horizontal
        p.y += p.dy * deltaTime; // Atualiza a posição vertical
        p.life -= deltaTime;     // Reduz a vida da partícula

        // Rebater partículas nas bordas do canvas
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    }
}

function drawMenuParticles() {
    for (let p of menuParticles) {
        // Verificar se os valores são finitos
        if (!isFinite(p.x) || !isFinite(p.y) || !isFinite(p.radius)) {
            continue; // Ignorar partículas inválidas
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        let particleColor;
        if (gameState === 'gameOver') {
            particleColor = `rgba(255, 0, 0, ${p.alpha})`; // Vermelho dramático para Game Over
        } else if (gameState === 'gameCompleted' || gameState === 'credits') {
            particleColor = `rgba(0, 255, 0, ${p.alpha})`; // Verde vibrante para Game Completion
        } else if (gameState === 'startMenu' || gameState === 'levelSelection') {
            particleColor = `rgba(255, 255, 255, ${p.alpha})`; // Partículas brancas para o Start Menu
        }

        // Criar gradiente radial
        let particleGradient;
        try {
            particleGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        } catch (error) {
            console.error('Erro ao criar gradiente radial:', error);
            continue; // Ignorar esta partícula se houver erro
        }

        particleGradient.addColorStop(0, particleColor);
        particleGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

        ctx.fillStyle = particleGradient;
        ctx.fill();
    }
}

// Fire Particles (For Fireball power-up)
function createFireParticles(ball) {
    for (let i = 0; i < 5; i++) {
        // Fire particles
        fireParticles.push({
            x: ball.x,
            y: ball.y,
            dx: (Math.random() * 2 - 1),
            dy: (Math.random() * 2 - 1),
            life: FIRE_PARTICLE_LIFE,
            initialLife: FIRE_PARTICLE_LIFE,
            size: FIRE_PARTICLE_SIZE,
            type: 'fire'
        });

        // Smoke particles
        fireParticles.push({
            x: ball.x,
            y: ball.y,
            dx: (Math.random() * 2 - 1) / 2,
            dy: (Math.random() * 2 - 1) / 2,
            life: FIRE_PARTICLE_LIFE * 1.5,
            initialLife: FIRE_PARTICLE_LIFE * 1.5,
            size: FIRE_PARTICLE_SIZE * 1.2,
            type: 'smoke'
        });
    }
}


function createWickedSmokeParticles(x, y) {
    for (let i = 0; i < WICKED_PARTICLE_COUNT; i++) {
        fireParticles.push({
            x: x,
            y: y,
            dx: (Math.random() * 2 - 1),
            dy: (Math.random() * 2 - 1),
            life: WICKED_PARTICLE_LIFE,
            initialLife: WICKED_PARTICLE_LIFE,
            size:  Math.min(Math.random(), 0.5) * WICKED_PARTICLE_SIZE,
            type: 'wickedSmoke'
        });
    }
}

function updateFireParticles(deltaTime) {
    let speed;

    for (let i = fireParticles.length - 1; i >= 0; i--) {
        let p = fireParticles[i];

        p.life -= deltaTime;

        // Update opacity based on life
        let lifeRatio = p.life / p.initialLife;
        if (p.type === 'fire') {
            p.alpha = lifeRatio;
            speed = FIRE_PARTICLE_SPEED;
        } else if (p.type === 'smoke') {
            p.alpha = 0.5 * lifeRatio;
            speed = FIRE_PARTICLE_SPEED;
        } else if (p.type === 'wickedSmoke') {
            p.alpha = 0.7 * lifeRatio; // Opacidade para a fumaça enfeitiçada
            speed = WICKED_PARTICLE_SPEED;
        }

        p.x += p.dx * deltaTime * canvasDiagonal * speed;
        p.y += p.dy * deltaTime * canvasDiagonal * speed;

        // Remove particle if life ends
        if (p.life <= 0) {
            fireParticles.splice(i, 1);
        }
    }
}

function drawFireParticles() {
    for (let p of fireParticles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * canvasDiagonal, 0, Math.PI * 2);
        if (p.type === 'fire') {
            ctx.fillStyle = `rgba(255, ${Math.floor(Math.random() * 150 + 100)}, 0, ${p.alpha})`;
        } else if (p.type === 'smoke') {
            ctx.fillStyle = `rgba(100, 100, 100, ${p.alpha})`;
        } else if (p.type === 'wickedSmoke') {
            ctx.fillStyle = `rgba(128, 0, 128, ${p.alpha})`; // Cor roxa para a fumaça enfeitiçada
        }
        ctx.fill();
    }
}

function createFixedParticles() {
    createMenuParticles();
    createIntroParticles();
    createSparkleParticles();
}