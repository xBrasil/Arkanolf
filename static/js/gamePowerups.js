// Constants for power-up durations
const POWERUP_DURATIONS = {
    TINYBALL: 10,
    HUGEBALL: 20,
    STICKYPADDLE: 15,
    WICKEDBALL: 15,
    ICEBALL: 10,
    STONEBALL: 10,
    FIREBALL: 10,
    PLASMABALL: 10,
    BOMBBALL: 0,
    BIGPADDLE: 15,
    LASER: 15,
    FASTBALL: 15,
    SLOWBALL: 15,
};

// Constants for power-up types
const POWERUP_TYPES = {
    // Ball power-ups
    TINYBALL: 'tinyball',
    HUGEBALL: 'hugeball',
    WICKEDBALL: 'wickedball',
    ICEBALL: 'iceball',
    STONEBALL: 'stoneball',
    FIREBALL: 'fireball',
    PLASMABALL: 'plasmaball',
    BOMBBALL: 'bombball',
    FASTBALL: 'fastball',
    SLOWBALL: 'slowball',

    // Paddle power-ups
    BIGPADDLE: 'bigpaddle',
    LASER: 'laser',
    STICKYPADDLE: 'stickypaddle',

    // Instant effect power-ups
    EXTRALIFE: 'extralife',
    CURSEDSKULL: 'cursedskull',
    MULTIBALL: 'multiball'
};

// Other constants
const POWERUP_TINYBALL_SIZE_MULTIPLIER = 0.5;

const POWERUP_HUGEBALL_SIZE_MULTIPLIER = 1.5;

const POWERUP_FASTBALL_MULTIPLIER = 1.5;
const POWERUP_SLOWBALL_MULTIPLIER = 0.7;
const POWERUP_BOMBBALL_MULTIPLIER = 0.5;
const POWERUP_WICKEDBALL_MULTIPLIER = 0.8;

const POWERUP_BIGPADDLE_MULTIPLIER = 1.5;

const WICKEDBALL_MIN_INTERVAL = 0.5;
const WICKEDBALL_MAX_INTERVAL = 2.5;

const LASERSHOT_COOLDOWN_TIME = 0.4;

const ICE_SPREAD_MIN_COOLDOWN = 2; // In second
const ICE_SPREAD_MAX_COOLDOWN = 4; // In seconds

const EXPLOSION_DURATION = 3; // seconds
const BOMB_EXPLOSION_RADIUS = 0.2; // 20% of canvas diagonal

// Global variables for power-ups
let powerUps = [];
let effectMessages = [];

let activeBallPowerup = null; // Current active ball power-up type
let activeBallPowerupDuration = 0; // Remaining time for ball power-up

let activePaddlePowerup = null; // Current active paddle power-up type
let activePaddlePowerupDuration = 0; // Remaining time for paddle power-up

let powerupBigPaddleMultiplier = 1; // Multiplier for paddle size

let nextAngleChangeTime = WICKEDBALL_MAX_INTERVAL; // For Wicked Ball

let iceSpreadTimer = 0;
let frozenBricks = 0;
let nextIceCooldown = ICE_SPREAD_MAX_COOLDOWN;

let laserShots = []; // Array to store active laser shots
let laserShotCooldown = 0; // Cooldown time between laser shots

// Sistema de power-ups
function generatePowerUp(x, y) {
    // Define probabilities for each power-up type
    const weightedPowerUps = [
        { type: POWERUP_TYPES.FIREBALL, weight: 4 },
        { type: POWERUP_TYPES.MULTIBALL, weight: 7 },
        { type: POWERUP_TYPES.FASTBALL, weight: 7 },
        { type: POWERUP_TYPES.SLOWBALL, weight: 7 },
        { type: POWERUP_TYPES.BIGPADDLE, weight: 7 },
        { type: POWERUP_TYPES.EXTRALIFE, weight: 5 },
        { type: POWERUP_TYPES.PLASMABALL, weight: 3 },
        { type: POWERUP_TYPES.LASER, weight: 4 },
        { type: POWERUP_TYPES.CURSEDSKULL, weight: (selectedDifficulty === "Relax" ? 0 : 4) }, // No skulls in Relax mode
        { type: POWERUP_TYPES.TINYBALL, weight: (selectedDifficulty === "Relax" ? 0 : 4) }, // No tiny balls in Relax mode
        { type: POWERUP_TYPES.HUGEBALL, weight: 5 },
        { type: POWERUP_TYPES.STICKYPADDLE, weight: (isMobile ? 0 : 5) }, // No sticky paddle on mobile
        { type: POWERUP_TYPES.WICKEDBALL, weight: (selectedDifficulty === "Relax" ? 0 : 3) }, // No wicked balls in Relax mode
        { type: POWERUP_TYPES.ICEBALL, weight: 5 },
        { type: POWERUP_TYPES.STONEBALL, weight: (selectedDifficulty === "Relax" ? 0 : 3) }, // No stone balls in Relax mode
        { type: POWERUP_TYPES.BOMBBALL, weight: 2 }
    ];

    // Calculate total weight
    const totalWeight = weightedPowerUps.reduce((sum, powerUp) => sum + powerUp.weight, 0);

    // Generate a random number between 0 and totalWeight
    let randomNum = Math.random() * totalWeight;

    // Select the power-up based on weight
    let selectedType;
    for (let powerUp of weightedPowerUps) {
        if (randomNum < powerUp.weight) {
            selectedType = powerUp.type;
            break;
        }
        randomNum -= powerUp.weight;
    }

    // Create the power-up
    const pillWidth = canvas.width * 0.06;
    const pillHeight = canvas.height * 0.02;

    powerUps.push({
        x: x,
        y: y,
        width: pillWidth,
        height: pillHeight,
        type: selectedType,
        active: true,
        previousX: x,
        previousY: y
    });
}

function activatePowerUp(type) {
    let message = getPowerUpMessage(type);
    
    switch (type) {
        // Ball power-ups
        case POWERUP_TYPES.TINYBALL:
        case POWERUP_TYPES.HUGEBALL:
        case POWERUP_TYPES.WICKEDBALL:
        case POWERUP_TYPES.ICEBALL:
        case POWERUP_TYPES.STONEBALL:
        case POWERUP_TYPES.FIREBALL:
        case POWERUP_TYPES.PLASMABALL:
        case POWERUP_TYPES.BOMBBALL:
        case POWERUP_TYPES.FASTBALL:
        case POWERUP_TYPES.SLOWBALL:
            if (activeBallPowerup === type) {
                // Resets duration
                activeBallPowerupDuration = POWERUP_DURATIONS[type.toUpperCase()];
            } else {
                // Replace current power-up
                resetBallPowerups();
                activeBallPowerup = type;
                activeBallPowerupDuration = POWERUP_DURATIONS[type.toUpperCase()];
            }
            break;

        // Paddle power-ups
        case POWERUP_TYPES.BIGPADDLE:
        case POWERUP_TYPES.STICKYPADDLE:
        case POWERUP_TYPES.LASER:
            if (activePaddlePowerup === type) {
                // Resets duration
                activePaddlePowerupDuration = POWERUP_DURATIONS[type.toUpperCase()];
            } else {
                // Replace current power-up
                resetPaddlePowerups();
                activePaddlePowerup = type;
                activePaddlePowerupDuration = POWERUP_DURATIONS[type.toUpperCase()];
            }
            break;

        // Instant effect power-ups
        case POWERUP_TYPES.EXTRALIFE:
            lives++;
            break;
        case POWERUP_TYPES.CURSEDSKULL:
            if (lives > 0) {
                lives--;
                addScore(GAME_LIFELOSS_POINTS_PENALTY * difficultyConfig.scoreMultiplier);
                createSkullEffect();
            } else {
                return; // No effect if no lives left
            }
            break;
        case POWERUP_TYPES.MULTIBALL:
            createMultipleBalls();
            break;
        default:
            message = 'ERROR: type ' + type + ' unknown';
            break;
    }

    createEffectMessage(paddle.x + paddle.width / 2, paddle.y - paddle.height*2, message);
}

function getPowerUpMessage(type) {
    switch (type) {
        case POWERUP_TYPES.TINYBALL:
            return 'Tiny Ball';
        case POWERUP_TYPES.HUGEBALL:
            return 'HUGE Ball';
        case POWERUP_TYPES.STICKYPADDLE:
            return 'Sticky Paddle';
        case POWERUP_TYPES.WICKEDBALL:
            return 'Wicked Ball';
        case POWERUP_TYPES.ICEBALL:
            return 'Ice Ball';
        case POWERUP_TYPES.STONEBALL:
            return 'Stone Ball';
        case POWERUP_TYPES.FASTBALL:
            return 'Fast Ball';
        case POWERUP_TYPES.SLOWBALL:
            return 'Slow Ball';
        case POWERUP_TYPES.FIREBALL:
            return 'Fire Ball';
        case POWERUP_TYPES.PLASMABALL:
            return 'Plasma Ball';
        case POWERUP_TYPES.BOMBBALL:
            return 'DA BOMB';
        case POWERUP_TYPES.BIGPADDLE:
            return 'BIG Paddle';
        case POWERUP_TYPES.LASER:
            return 'Laser';
        case POWERUP_TYPES.EXTRALIFE:
            return 'Extra Life';
        case POWERUP_TYPES.CURSEDSKULL:
            return 'Life LOST';
        case POWERUP_TYPES.MULTIBALL:
            return 'Multi Ball';
        default:
            return '???';
    }
}

function clearPowerUpEffects() {
    powerUps = [];
    effectMessages = [];

    if (balls) resetBallPowerups();

    if (paddle) resetPaddlePowerups();

    //resetBrickPowerups(); // Resetar power-ups de tijolos (ficou mais legal sem!)

    laserShots = [];
}

function updatePowerUpEffects(deltaTime) {
    // Update activeBallPowerupDuration
    if (activeBallPowerupDuration > 0) {
        activeBallPowerupDuration -= deltaTime;
        if (activeBallPowerupDuration <= 0) {
            // Ball power-up expired
            resetBallPowerups();
        } else {
            applyBallPowerupEffects(deltaTime);
        }
    }

    // Update activePaddlePowerupDuration
    if (activePaddlePowerupDuration > 0) {
        activePaddlePowerupDuration -= deltaTime;
        if (activePaddlePowerupDuration <= 0) {
            // Paddle power-up expired
            activePaddlePowerup = null;
            resetPaddlePowerups();
        } else {
            applyPaddlePowerupEffects();
        }
    }

    // Update laser shots if laser power-up is active
    if (activePaddlePowerup === POWERUP_TYPES.LASER) {
        fireLaserShots(deltaTime);
        updateLaserShots(deltaTime);
    } else {
        laserShots = [];
    }

    // Update Wicked Ball angle change
    if (activeBallPowerup === POWERUP_TYPES.WICKEDBALL) {
        nextAngleChangeTime -= deltaTime;
        if (nextAngleChangeTime <= 0) {
            if (ballAbovePaddleHeight()) {
                changeBallAngles();
                nextAngleChangeTime = getRandomIntervalForWickedBall();
            }
        }
    }

    if (activeBallPowerup === POWERUP_TYPES.ICEBALL) {
        spreadIce(deltaTime);
    } else if (activeBallPowerup !== POWERUP_TYPES.ICEBALL && frozenBricks > 0) {
        destroyFrozenBricks();
    }
}

function getBallSpeedMultiplier() {
    switch (activeBallPowerup) {
        case POWERUP_TYPES.FASTBALL:
        case POWERUP_TYPES.TINYBALL:
            return POWERUP_FASTBALL_MULTIPLIER; // Por exemplo, 1.5
        case POWERUP_TYPES.SLOWBALL:
        case POWERUP_TYPES.HUGEBALL:
            return POWERUP_SLOWBALL_MULTIPLIER; // Por exemplo, 0.7
        case POWERUP_TYPES.BOMBBALL:
            return POWERUP_BOMBBALL_MULTIPLIER; // Por exemplo, 0.1
        case POWERUP_TYPES.WICKEDBALL:
            return POWERUP_WICKEDBALL_MULTIPLIER; // Por exemplo, 1.0
        default:
            return 1;
    }
}

function applyBallPowerupEffects(deltaTime) {
    if (!activeBallPowerup) return;

    applyBallSpeedToAllBalls();

    switch (activeBallPowerup) {
        case POWERUP_TYPES.TINYBALL:
            applyBallSizeToAllBalls(POWERUP_TINYBALL_SIZE_MULTIPLIER);
            break;
        case POWERUP_TYPES.HUGEBALL:
            applyBallSizeToAllBalls(POWERUP_HUGEBALL_SIZE_MULTIPLIER);
            break;
        case POWERUP_TYPES.FASTBALL:
            // Speed changes handled in applyBallSpeedToAllBalls
        case POWERUP_TYPES.SLOWBALL:
            // Speed changes handled in applyBallSpeedToAllBalls
        case POWERUP_TYPES.BOMBBALL:
            // Bomb effect handled in collision detection
        case POWERUP_TYPES.WICKEDBALL:
            // Angle changes handled in updatePowerUpEffects
            break;
        case POWERUP_TYPES.ICEBALL:
            // Ice effect handled in collision detection
            break;
        case POWERUP_TYPES.STONEBALL:
            // Stone effect handled in collision detection
            break;
        case POWERUP_TYPES.FIREBALL:
            // Fireball effect handled in collision detection
            break;
        case POWERUP_TYPES.PLASMABALL:
            // Plasma Ball effect handled in collision detection
            break;
    }
}

function applyPaddlePowerupEffects() {
    powerupBigPaddleMultiplier = 1; // Reset multiplier before applying new one

    if (!activePaddlePowerup) return;

    if (activePaddlePowerup ===  POWERUP_TYPES.BIGPADDLE) {
        powerupBigPaddleMultiplier = POWERUP_BIGPADDLE_MULTIPLIER;
        paddle.width = calcPaddleWidth();
    }
    /* Sticky effect handled during paddle collision
    case POWERUP_TYPES.STICKYPADDLE:
        break;*/
}

function resetBallPowerups() {
    activeBallPowerup = null;
    applyBallSizeToAllBalls(1);
    applyBallSpeedToAllBalls();

    nextIceCooldown = ICE_SPREAD_MAX_COOLDOWN;
    iceSpreadTimer = 0;
    nextAngleChangeTime = WICKEDBALL_MAX_INTERVAL;
}

// Função para resetar power-ups de tijolos
/*function resetBrickPowerups() {
    for (let r = 0; r < brickRowCount; r++) {
        for (let c = 0; c < brickColumnCount; c++) {
            let b = bricks[r][c];
            if (!b) continue;
            b.isFrozen = false;
        }
    }
}*/

function resetPaddlePowerups() {
    powerupBigPaddleMultiplier = 1;
    paddle.width = calcPaddleWidth();
    activePaddlePowerup = null;
}

function changeBallAngles() {
    for (let ball of balls) {
        
        do {
            let angle = Math.random() * Math.PI * 2; // Random angle
            ball.dx = ball.speed * Math.cos(angle);
            ball.dy = ball.speed * Math.sin(angle);
        } while (Math.abs(ball.dy) < 0.01); // Repeat if dy is too small
        
        // Criar partículas de fumaça roxa na posição atual da bola
        createWickedSmokeParticles(ball.x, ball.y);
    }
}

function fireLaserShots(deltaTime) {
    laserShotCooldown -= deltaTime;
    if (laserShotCooldown <= 0) {
        laserShotCooldown = LASERSHOT_COOLDOWN_TIME;

        // Calculate cannon positions based on same values used in drawLaserCannon
        armWidth = paddle.width * 0.08;
        armHeight = paddle.height * 2;
        armOffsetY = -armHeight * 0.6;

        // Calculate exact positions where laser shots should originate
        // Left cannon - add small offset to align with cannon core
        const leftCannonX = paddle.x + armWidth/2;
        const leftCannonY = paddle.y + armOffsetY + armHeight/4;

        // Right cannon - add small offset to align with cannon core
        const rightCannonX = paddle.x + paddle.width - armWidth/2;
        const rightCannonY = paddle.y + armOffsetY + armHeight/4;

        // Create laser shots at cannon positions
        createLaserShot(leftCannonX, leftCannonY);
        createLaserShot(rightCannonX, rightCannonY);
        vibrate(VIBRATE_LASER_SHOT);
    }
}

function createLaserShot(x, y) {
    const laserSpeed = canvas.height * -3; // Velocidade do tiro (valor negativo para subir)
    laserShots.push({
        x: x,
        y: y,
        width: canvas.width * 0.005, // Largura do tiro
        height: canvas.height * 0.03, // Altura do tiro
        dy: laserSpeed,
    });
}

function applyBallSpeedToAllBalls() {
    const speed = calcBallSpeed();

    for (let ball of balls) {
        if (ball.isStuck) continue;
        const angle = Math.atan2(ball.dy, ball.dx);
        ball.speed = speed;
        ball.dx = speed * Math.cos(angle);
        ball.dy = speed * Math.sin(angle);
    }
}

function applyBallSizeToAllBalls(multiplier) {
    const newBallRadius = calcBallSize() * multiplier;
    for (let ball of balls) {
        ball.radius = newBallRadius;
    }
}

function createMultipleBalls() {
    const numBalls = Math.floor(Math.random() * 3) + 1; // De 1 a 3 bolas adicionais
    const speed = balls[0].speed;
    const ballRadius = balls[0].radius;

    for (let i = 0; i < numBalls; i++) {
        const angle = (-Math.PI / 2) + (Math.random() * Math.PI / 4) - (Math.PI / 8); // Direção para cima com variação

        balls.push({
            x: paddle.x + paddle.width / 2,
            y: paddle.y - ballRadius,
            radius: ballRadius,
            speed: speed,
            dx: speed * Math.cos(angle),
            dy: speed * Math.sin(angle),
            isStuck: false,
            stuckRelativeX: 0,
            isInitialBall: false
        });
    }
}

function getRandomIntervalForWickedBall() {
    return Math.random() * (WICKEDBALL_MAX_INTERVAL - WICKEDBALL_MIN_INTERVAL) + WICKEDBALL_MIN_INTERVAL;
}

function destroyFrozenBricks() {
    if (frozenBricks === 0) return;

    for (let r = 0; r < brickRowCount; r++) {
        for (let c = 0; c < brickColumnCount; c++) {
            let b = bricks[r][c];
            if (b && b.isFrozen && (b.status > 0 || b.unbreakable)) destroyBrick(b, b.x + b.width/2, b.y + b.height/2, ICE_COLOR);
        }
    }
    frozenBricks = 0;
}

function spreadIce(deltaTime) {
    // Incrementa o timer com o tempo passado desde o último frame
    iceSpreadTimer += deltaTime;

    // Verifica se o cooldown foi atingido
    if (iceSpreadTimer < nextIceCooldown) {
        return; // Ainda está no cooldown
    }

    // Reinicia o timer
    iceSpreadTimer = 0;

    // Calcula a probabilidade base uma única vez para evitar recalculá-la para cada aplicação
    const validBricksCount = Math.max(countValidBricks(),1);
    const baseProb = clamp(1 - frozenBricks / validBricksCount, 0.001, 0.1); // Probabilidade base entre 0,1% e 10%

    for (let r = 0; r < brickRowCount; r++) {
        for (let c = 0; c < brickColumnCount; c++) {
            let b = bricks[r][c];
            if (b && b.isFrozen && (b.status > 0 || b.unbreakable)) {
                // Lista dos deslocamentos para os vizinhos
                const neighbors = [
                    { dr: -1, dc: -1 },
                    { dr: -1, dc:  1 },
                    { dr:  1, dc:  1 },
                    { dr:  1, dc: -1 },
                    { dr:  0, dc: -1 },
                    { dr:  0, dc:  1 },
                    { dr: -1, dc:  0 },
                    { dr:  1, dc:  0 }
                ];

                for (let offset of neighbors) {
                    const rAdj = r + offset.dr;
                    const cAdj = c + offset.dc;

                    // Verifica se está dentro dos limites
                    if (rAdj < 0 || rAdj >= brickRowCount || cAdj < 0 || cAdj >= brickColumnCount) {
                        continue;
                    }

                    let adjBrick = bricks[rAdj][cAdj];
                    if (adjBrick && !adjBrick.isFrozen && (adjBrick.status > 0 || adjBrick.unbreakable || adjBrick.isPowerup || adjBrick.stoneStatus > 0)) {
                        // Aplica a probabilidade de congelamento
                        if (Math.random() < baseProb) {
                            adjBrick.isFrozen = true;
                            frozenBricks++;
                        }
                    }
                }
            }
        }
    }

    // Define um novo cooldown aleatório entre os limites mínimo e máximo
    nextIceCooldown = ICE_SPREAD_MIN_COOLDOWN + 
        Math.random() * (ICE_SPREAD_MAX_COOLDOWN - ICE_SPREAD_MIN_COOLDOWN);
}

function countValidBricks() {
    let count = 0;
    for (let r = 0; r < brickRowCount; r++) {
        for (let c = 0; c < brickColumnCount; c++) {
            let b = bricks[r][c];
            if (b && b.status > 0) count++;
        }
    }

    return count;
}

function updateEffectMessage(deltaTime) {
    if (!effectMessages) return;
    for(let i = 0; i < effectMessages.length; i++) {
        let effectMessage = effectMessages[i];
        effectMessage.opacity -= (1 / effectMessage.duration) * deltaTime * 60; // Ajuste para deltaTime
        effectMessage.scale -= 0.01 * deltaTime * 60;
        effectMessage.y -= 60 * deltaTime; // Move para cima, ajustado para deltaTime
        if(effectMessage.opacity <= 0 || effectMessage.scale <= 0) {
            effectMessages.splice(i, 1);
            i--;
        }
    }
}

function explodeBombs() {
    for (let i = balls.length - 1; i >= 0; i--) {
        explodeBomb(balls[i].x, balls[i].y);
        balls.splice(i, 1);
    }
    activeBallPowerup = null;
    createInitialBall();
    vibrate(VIBRATE_BOMB_EXPLOSION);
}

function explodeBomb(x, y) {
    let bombExplosionRadius = canvasDiagonal * BOMB_EXPLOSION_RADIUS;
    
    // Create explosion animation state
    let explosionState = {
        x: x,
        y: y,
        radius: bombExplosionRadius,
        elapsed: 0,
        duration: EXPLOSION_DURATION,
        complete: false,
        particles: [],
        debris: [],
        shockwave: {
            radius: 0,
            opacity: 1
        }
    };

    // Add to explosionEffects array (need to create this globally)
    explosionEffects.push(explosionState);

    // Destroy bricks within radius
    for (let r = 0; r < brickRowCount; r++) {
        for (let c = 0; c < brickColumnCount; c++) {
            let b = bricks[r][c];
            if (b && (b.status > 0 || b.unbreakable)) {
                let dx = b.x + b.width / 2 - x;
                let dy = b.y + b.height / 2 - y;
                let distance = Math.hypot(dx, dy);
                if (distance <= bombExplosionRadius) {
                    // Create debris particles for each destroyed brick
                    createExplosionDebris(b.x + b.width/2, b.y + b.height/2, dx/distance, dy/distance, b.color);
                    destroyBrick(b, b.x + b.width/2, b.y + b.height/2, b.color);
                }
            }
        }
    }

    // Create initial explosion particles
    for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 400 + 200;
        explosionState.particles.push({
            x: x,
            y: y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            life: Math.random() * 0.5 + 0.5,
            size: Math.random() * 8 + 4,
            color: `hsl(${Math.random() * 60 + 10}, 100%, ${Math.random() * 50 + 50}%)`,
            type: Math.random() < 0.7 ? 'fire' : 'smoke'
        });
    }

    // Animation will continue in updateExplosionEffects()
}

function createEffectMessage(x, y, text) {
    effectMessages.push({
        x: x,
        y: y,
        text: text,
        opacity: 1,
        scale: 1,
        duration: 60 // Duração em frames
    });
}