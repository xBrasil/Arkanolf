const GAME_FONT_ROBOTO = 'px Roboto, Arial, sans-serif';
const HUD_SEPARATOR = '    ';

let menuButtons = []; // To store the main menu buttons
let gameOverButtons = []; // Array para armazenar os botões da tela de Game Over
let gameCompletedButtons = []; // Array para armazenar os botões da tela de Jogo Completo
let explosionEffects = []; // Array para armazenar os efeitos de explosão

let pauseMenuButtons = [];
let pauseMenuNeedsUpdate = true;

// Variáveis para controle de FPS
let showFPS = false;       // Controle de exibição dos FPS
let fps = 0;               // Valor atual de FPS
let frameCount = 0;        // Contador de frames
let fpsTimer = 0;          // Timer para calcular FPS a cada segundo

let leftArmX, leftArmY, rightArmX, rightArmY, armWidth, armHeight, armOffsetY;
let blinkingPaddleEdge = 0;

let skullEffects = [];

const ICE_COLOR = 'rgba(173, 216, 230, 0.8)';

// Imagens de textura para tijolos
let stoneTextures = {
    full: new Image(),
    cracked1: new Image(),
    cracked2: new Image(),
    cracked3: new Image()
};

const STONE_COLOR = '#808080'; // Cor padrão para tijolos de pedra

const LASER_COLOR = '#FF00FF'; // Cor do laser

let plasmaTimeCounter = 0; // Contador de tempo para o efeito de plasma
let brickTimeCounter = 0; // Contador de tempo para o efeito de tijolo
let powerupTimeCounter = 0; // Contador de tempo para desenhar powerups

// Cached pattern canvas for unbreakable bricks
let cachedUnbreakablePattern = null;

// Cached parsed skull path for performance
let parsedSkullPath = null;

// You can get this SVG path from FontAwesome Free (MIT License)
const SKULL_SVG_PATH = "M368 128c0 44.4-25.4 83.5-64 106.4V256c0 17.7-14.3 32-32 32H176c-17.7 0-32-14.3-32-32V234.4c-38.6-23-64-62.1-64-106.4C80 57.3 144.5 0 224 0s144 57.3 144 128zM168 176a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm144-32a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM3.4 273.7c7.9-15.8 27.1-22.2 42.9-14.3L224 348.2l177.7-88.8c15.8-7.9 35-1.5 42.9 14.3s1.5 35-14.3 42.9L295.6 384l134.8 67.4c15.8 7.9 22.2 27.1 14.3 42.9s-27.1 22.2-42.9 14.3L224 419.8 46.3 508.6c-15.8 7.9-35 1.5-42.9-14.3s-1.5-35 14.3-42.9L152.4 384 17.7 316.6C1.9 308.7-4.5 289.5 3.4 273.7z";

const LASER_CANNON_SVG = `M10 0 L0 10 L0 25 L5 30 L15 30 L20 25 L20 10 L10 0 Z`; // Basic cannon shape
const LASER_CORE_SVG = `M8 27 L12 27 L12 10 L8 10 Z`; // Inner core/barrel of the cannon

const BASE_POWERUP_WIDTH = 0.06; // Base width for power-ups
const BASE_POWERUP_HEIGHT = 0.02; // Base height for power-ups

function svgToDataURL(svg) {
    return 'data:image/svg+xml;charset=utf8,' + encodeURIComponent(svg);
}

function createSkullEffect() {
    skullEffects.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        scale: 0.1,
        opacity: 0,
        duration: 1.5,
        elapsed: 0,
        rotation: -Math.PI / 4 // Start rotated
    });
}

function drawSkull(x, y, size) {
    let scale = size * (isMobile ? 0.5 : 1); // Scale down on mobile for performance

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * 0.001, scale * 0.001);

    // Central offset to properly center the skull
    ctx.translate(-256, -256); // SVG viewport is 512x512, so center at half

    // Multiple layers for depth effect
    for (let i = 0; i < 3; i++) {
        ctx.save();
        
        // Haunting glow effect
        const glowIntensity = (Math.sin(powerupTimeCounter * 5) + 1) / 2;
        const glowSize = 20 + glowIntensity * 15;
        
        // Layer-specific effects
        if (i === 0) {
            // Back glow
            ctx.shadowColor = 'rgba(255,0,0,0.4)';
            ctx.shadowBlur = glowSize * 2;
            ctx.fillStyle = 'rgba(50,0,0,0.3)';
        } else if (i === 1) {
            // Main skull
            ctx.shadowColor = 'rgba(0,0,0,0.6)';
            ctx.shadowBlur = glowSize;
            ctx.fillStyle = '#2a0a0a';
        } else {
            // Front highlight
            ctx.shadowColor = `rgba(255,0,0,${0.3 + glowIntensity * 0.3})`;
            ctx.shadowBlur = glowSize;
            ctx.fillStyle = `rgba(255,0,0,${0.1 + glowIntensity * 0.1})`;
        }

        ctx.beginPath();
        ctx.fill(parsedSkullPath);
        ctx.restore();
    }

    ctx.restore();
}

function updateSkullEffects(deltaTime) {
    for (let i = skullEffects.length - 1; i >= 0; i--) {
        let effect = skullEffects[i];
        effect.elapsed += deltaTime;

        if (effect.elapsed <= effect.duration) {
            const progress = effect.elapsed / effect.duration;
            
            // More dramatic animation curve
            if (progress < 0.3) {
                // Quick zoom in with rotation
                effect.scale = 0.1 + (2.5 * (progress / 0.3));
                effect.opacity = progress / 0.3;
                effect.rotation = -Math.PI / 4 + (progress / 0.3) * Math.PI / 4;
            } else {
                // Hold size and slowly fade while slightly rotating
                effect.scale = 2.5 - (0.3 * ((progress - 0.3) / 0.7));
                effect.opacity = 1 - ((progress - 0.3) / 0.7);
                effect.rotation = (Math.sin(progress * 6) * Math.PI / 32);
            }
        } else {
            skullEffects.splice(i, 1);
        }
    }
}

function drawSkullEffects() {
    for (let effect of skullEffects) {
        ctx.save();
        ctx.globalAlpha = effect.opacity;
        
        // Center and rotate
        ctx.translate(effect.x, effect.y);
        ctx.rotate(effect.rotation);
        
        drawSkull(0, 0, effect.scale * 500);
        
        ctx.restore();
    }
}

function updateFPS(deltaTime) {
    // Atualização de FPS
    frameCount++;
    fpsTimer += deltaTime;
    if (fpsTimer >= 1) { // A cada segundo
        fps = frameCount;
        frameCount = 0;
        fpsTimer = 0;
    }
}

function interpolateColor(color1, color2, factor) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);

    const r = Math.round(c1.r + (c2.r - c1.r) * factor);
    const g = Math.round(c1.g + (c2.g - c1.g) * factor);
    const b = Math.round(c1.b + (c2.b - c1.b) * factor);

    return rgbToHex(r, g, b);
}

function hexToRgb(hex) {
    // Remove o '#' se estiver presente
    hex = hex.replace(/^#/, '');

    let bigint = parseInt(hex, 16);
    let r, g, b;

    if (hex.length === 6) {
        r = (bigint >> 16) & 255;
        g = (bigint >> 8) & 255;
        b = bigint & 255;
    } else if (hex.length === 3) {
        r = (bigint >> 8) & 15;
        g = (bigint >> 4) & 15;
        b = bigint & 15;

        r = r * 17;
        g = g * 17;
        b = b * 17;
    } else {
        throw new Error('Formato de cor inválido: ' + hex);
    }

    return { r, g, b };
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function invertColor(hex) {
    const c = hexToRgb(hex);
    const r = 255 - c.r;
    const g = 255 - c.g;
    const b = 255 - c.b;
    return rgbToHex(r, g, b);
}

function hexToRGBA(hex, alpha) {
    const c = hexToRgb(hex);
    return `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
}

// Função auxiliar para ajustar a cor
function shadeColor(color, intensity) {
    const c = hexToRgb(color);
    const r = Math.min(255, Math.max(0, Math.round(c.r * intensity)));
    const g = Math.min(255, Math.max(0, Math.round(c.g * intensity)));
    const b = Math.min(255, Math.max(0, Math.round(c.b * intensity)));

    return rgbToHex(r, g, b);
}

// Limpa o canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawPaddle() {
    const paddleColor = (activePaddlePowerup === POWERUP_TYPES.LASER) ? LASER_COLOR : levelPalette.paddleColor; // Magenta color during laser power-up
    
    ctx.save(); // Salvar o estado atual do contexto

    // Configurar o efeito de brilho
    ctx.shadowBlur = 20; // Ajuste o valor conforme necessário
    ctx.shadowColor = paddleColor;

    // Verificar se BIG Paddle está ativo e faltam 5 segundos
    let showFullPaddle = true;

    if (activePaddlePowerup === POWERUP_TYPES.BIGPADDLE) {
        const timeRemaining = activePaddlePowerupDuration;
        if (timeRemaining > 0 && timeRemaining <= 5) {
            showFullPaddle = false;
        }
    }

    if (showFullPaddle) {
        // Desenhar o paddle completo
        blinkingPaddleEdge = 0;
        ctx.beginPath();
        ctx.fillStyle = paddleColor;
        ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        ctx.closePath();
    } else {
        // Desenhar a parte central do paddle, removendo as pontas
        const centralWidth = paddle.width / powerupBigPaddleMultiplier;
        const edgeWidth = (paddle.width - centralWidth) / 2;
        blinkingPaddleEdge = edgeWidth;

        ctx.beginPath();
        ctx.fillStyle = paddleColor;
        ctx.fillRect(paddle.x + edgeWidth, paddle.y, centralWidth, paddle.height);
        ctx.closePath();

        // Calcular a opacidade para o efeito de piscar
        const blinkFrequency = 1; // Frequência de piscar (pisca 2 vezes por segundo)
        const opacity = (Math.sin(backgroundTime * blinkFrequency * 2 * Math.PI) + 1) / 2; // Varia entre 0 e 1

        // Configurar a opacidade
        ctx.globalAlpha = opacity;

        // Desenhar as pontas como quadrados vazios (translúcidos)
        ctx.beginPath();
        ctx.fillStyle = paddleColor; // Mesmo color do paddle
        // Esquerda
        ctx.fillRect(paddle.x, paddle.y, edgeWidth, paddle.height);
        // Direita
        ctx.fillRect(paddle.x + paddle.width - edgeWidth, paddle.y, edgeWidth, paddle.height);
        ctx.closePath();

        // Resetar a opacidade para evitar afetar outros desenhos
        ctx.globalAlpha = 1.0;
    }

    ctx.restore(); // Restaurar o estado anterior do contexto

    // Desenhar os braços da raquete se o power-up de laser estiver ativo
    if (activePaddlePowerup === POWERUP_TYPES.LASER) drawEnhancedPaddleArms(paddle);
}

// Função para desenhar os braços aprimorados do paddle
function drawEnhancedPaddleArms(paddle) {
    ctx.save();

    // Calculate cannon positions
    armWidth = paddle.width * 0.08;
    armHeight = paddle.height * 2;
    armOffsetY = -armHeight * 0.6;

    // Draw left cannon
    drawLaserCannon(paddle.x, paddle.y + armOffsetY, armWidth, armHeight, true);
    
    // Draw right cannon
    drawLaserCannon(paddle.x + paddle.width - armWidth, paddle.y + armOffsetY, armWidth, armHeight, false);

    ctx.restore();
}

function drawLaserCannon(x, y, width, height, isLeft) {
    ctx.save();
    ctx.translate(x + width/2, y + height/2);
    if (!isLeft) ctx.scale(-1, 1); // Flip for right cannon

    // Time-based effects
    const shootingEffect = (laserShotCooldown < LASERSHOT_COOLDOWN_TIME * 0.2) ? 1 : 0; // Reduced window for flash
    
    // Base glow - always present but intensified during shooting
    ctx.shadowBlur = 15 + (shootingEffect * 10);
    ctx.shadowColor = LASER_COLOR;
    
    // Draw cannon body
    ctx.beginPath();
    const path = new Path2D(LASER_CANNON_SVG);
    ctx.fillStyle = '#440044';
    ctx.fill(path);
    ctx.strokeStyle = shootingEffect ? '#FF40FF' : LASER_COLOR; // Brighter when shooting
    ctx.lineWidth = 2;
    ctx.stroke(path);

    // Draw inner core with glowing effect
    ctx.beginPath();
    const core = new Path2D(LASER_CORE_SVG);
    const coreGradient = ctx.createLinearGradient(8, 30, 12, 0);
    coreGradient.addColorStop(0, `rgba(255, 0, 255, ${0.5 + shootingEffect * 0.5})`);
    coreGradient.addColorStop(0.5, `rgba(255, 128, 255, ${0.7 + shootingEffect * 0.3})`);
    coreGradient.addColorStop(1, shootingEffect ? '#FF80FF' : LASER_COLOR);
    ctx.fillStyle = coreGradient;
    ctx.fill(core);

    // Energy rings effect - only visible when about to shoot
    if (shootingEffect > 0) {
        const ringsCount = 3;
        for (let i = 0; i < ringsCount; i++) {
            const ringY = 15 + i * 5;
            ctx.beginPath();
            ctx.arc(10, ringY, 3, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 0, 255, ${shootingEffect * (1 - i * 0.2)})`; 
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Additional tip glow when shooting
        ctx.beginPath();
        const shootGlow = ctx.createRadialGradient(10, 5, 0, 10, 5, 10);
        shootGlow.addColorStop(0, 'rgba(255, 0, 255, 0.8)');
        shootGlow.addColorStop(1, 'rgba(255, 0, 255, 0)');
        ctx.fillStyle = shootGlow;
        ctx.arc(10, 5, 10, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function drawPlasmaBall(ball, deltaTime) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    plasmaTimeCounter += deltaTime;
    const coreRadius = ball.radius * 0.9;
    const maxRadius = ball.radius * 2;

    // Plasma core
    const coreGradient = ctx.createRadialGradient(
        ball.x, ball.y, 0,
        ball.x, ball.y, coreRadius
    );
    coreGradient.addColorStop(0, 'rgba(220, 250, 255, 1)');    // White hot center
    coreGradient.addColorStop(0.4, 'rgba(120, 200, 255, 0.8)'); // Bright blue
    coreGradient.addColorStop(0.8, 'rgba(40, 120, 255, 0.6)');  // Deep blue
    coreGradient.addColorStop(1, 'rgba(20, 80, 255, 0)');       // Fade out

    // Draw core
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, coreRadius, 0, Math.PI * 2);
    ctx.fillStyle = coreGradient;
    ctx.fill();

    // Plasma waves
    const waveCount = 3;
    for (let i = 0; i < waveCount; i++) {
        const waveTime = plasmaTimeCounter * (2 + i) + i * Math.PI / waveCount;
        const waveRadius = coreRadius + Math.sin(waveTime * 2) * ball.radius * 0.2;
        
        ctx.beginPath();
        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
            const distortion = Math.sin(angle * 6 + waveTime) * ball.radius * 0.15;
            const r = waveRadius + distortion;
            const x = ball.x + Math.cos(angle) * r;
            const y = ball.y + Math.sin(angle) * r;
            
            if (angle === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        
        const alpha = 0.4 - (i * 0.1);
        ctx.strokeStyle = `rgba(100, 180, 255, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    if (!isMobileUserAgent) { // No tendrils on mobile for performance
        // Energy tendrils
        const tendrilCount = 4;
        for (let i = 0; i < tendrilCount; i++) {
            const angle = (i / tendrilCount) * Math.PI * 2 + plasmaTimeCounter;
            ctx.beginPath();
            ctx.moveTo(ball.x, ball.y);
            
            // Create lightning-like path
            let x = ball.x;
            let y = ball.y;
            const segments = 3;
            for (let j = 0; j < segments; j++) {
                const radius = coreRadius + (maxRadius - coreRadius) * ((j + 1) / segments);
                const segmentAngle = angle + Math.sin(plasmaTimeCounter * 5 + i) * 0.2;
                x = ball.x + Math.cos(segmentAngle) * radius;
                y = ball.y + Math.sin(segmentAngle) * radius;
                
                if (j === segments - 1) {
                    ctx.lineTo(x + Math.random() * 5, y + Math.random() * 5);
                } else {
                    ctx.lineTo(x + Math.random() * 10 - 5, y + Math.random() * 10 - 5);
                }
            }
            
            const gradient = ctx.createLinearGradient(ball.x, ball.y, x, y);
            gradient.addColorStop(0, 'rgba(150, 220, 255, 0.7)');
            gradient.addColorStop(1, 'rgba(100, 180, 255, 0)');
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    // Outer glow
    const glowSize = maxRadius * 1.2;
    const glowGradient = ctx.createRadialGradient(
        ball.x, ball.y, coreRadius,
        ball.x, ball.y, glowSize
    );
    glowGradient.addColorStop(0, 'rgba(100, 180, 255, 0.3)');
    glowGradient.addColorStop(1, 'rgba(100, 180, 255, 0)');

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, glowSize, 0, Math.PI * 2);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    ctx.restore();
}

function drawIceBall(ball) {
    ctx.save();

    // Desenhar a bola principal com gradiente radial para efeito de gelo
    const gradient = ctx.createRadialGradient(
        ball.x, ball.y, ball.radius * 0.1,
        ball.x, ball.y, ball.radius
    );
    gradient.addColorStop(0, 'rgba(173, 216, 230, 0.9)'); // LightBlue com maior opacidade
    gradient.addColorStop(1, 'rgba(0, 191, 255, 0.5)'); // DeepSkyBlue mais transparente

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    // Adicionar rachaduras leves
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ball.x - ball.radius * 0.5, ball.y - ball.radius * 0.2);
    ctx.lineTo(ball.x + ball.radius * 0.3, ball.y + ball.radius * 0.4);
    ctx.moveTo(ball.x + ball.radius * 0.4, ball.y - ball.radius * 0.3);
    ctx.lineTo(ball.x - ball.radius * 0.2, ball.y + ball.radius * 0.5);
    ctx.stroke();
    ctx.closePath();

    ctx.restore();
}

function drawBalls(deltaTime) {
    for (let ball of balls) {
        if (activeBallPowerup === POWERUP_TYPES.FIREBALL) {
            drawFireBall(ball);
        } else if (activeBallPowerup === POWERUP_TYPES.PLASMABALL) {
            drawPlasmaBall(ball, deltaTime);
        } else if (activeBallPowerup === POWERUP_TYPES.BOMBBALL) {
            drawBombBall(ball);
        } else if (activeBallPowerup === POWERUP_TYPES.WICKEDBALL) {
            drawWickedBall(ball);
        } else if (activeBallPowerup === POWERUP_TYPES.ICEBALL) {
            drawIceBall(ball);
        } else {
            drawNormalBall(ball);
        }
    }
}

function drawNormalBall(ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    const ballColor = levelPalette.ballColor;
    ctx.fillStyle = ballColor;
    ctx.fill();
    ctx.closePath();
}

function drawFireBall(ball) {
    createFireParticles(ball);
    ctx.save();
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    let gradient = ctx.createRadialGradient(ball.x, ball.y, ball.radius / 2, ball.x, ball.y, ball.radius);
    gradient.addColorStop(0, '#FFFF00');
    gradient.addColorStop(1, '#FF4500');
    ctx.fillStyle = gradient;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#FF4500';
    ctx.fill();
    ctx.closePath();
    ctx.restore();
}

function drawWickedBall(ball) {
    ctx.save();

    // Core gradient with haunting purple shades
    const gradient = ctx.createRadialGradient(
        ball.x, ball.y, 0,
        ball.x, ball.y, ball.radius
    );
    gradient.addColorStop(0, '#8B008B'); // Dark magenta
    gradient.addColorStop(0.7, '#4B0082'); // Indigo
    gradient.addColorStop(1, '#2E0854'); // Deep purple

    // Main ball with subtle glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#9932CC';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.restore();
}

function drawBombBall(ball) {
    // Salva o estado atual do contexto
    ctx.save();
    
    // Move o contexto para a posição da bola
    ctx.translate(ball.x, ball.y);
    
    // Escala a bomba se necessário
    ctx.scale(ball.scale || 1, ball.scale || 1);
    
    // Desenha o corpo principal da bomba
    drawBombBody(ball.radius);
    
    // Desenha o pavio brilhante
    drawBombWick(ball.radius);
    
    // Restaura o estado do contexto
    ctx.restore();
}

function drawBombBody(radius) {
    // Corpo principal da bomba
    ctx.fillStyle = '#333333'; // Cinza escuro
    ctx.strokeStyle = '#000000'; // Preto para a borda
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Adiciona detalhes de sombreado para dar profundidade
    let gradient = ctx.createRadialGradient(0, -radius * 0.2, radius * 0.1, 0, 0, radius);
    gradient.addColorStop(0, '#555555'); // Centro mais claro
    gradient.addColorStop(1, '#333333'); // Borda mais escura
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

function drawBombWick(radius) {
    // Configurações para o pavio
    const wickWidth = radius * 0.1;
    const wickHeight = radius * 0.4;
    const wickX = 0; // Centralizado
    const wickY = -radius - wickHeight / 2; // Posicionado acima do topo da bomba
    
    // Desenha o pavio
    ctx.fillStyle = '#8B4513'; // Marrom para o pavio
    ctx.fillRect(wickX - wickWidth / 2, wickY, wickWidth, wickHeight);
    
    // Cria o efeito de brilho na ponta do pavio
    ctx.beginPath();
    ctx.arc(wickX, wickY, wickWidth * 1.5, 0, Math.PI * 2); // Aumentei o tamanho do brilho
    ctx.closePath();
    
    // Gradiente para o brilho com mais intensidade
    let glowGradient = ctx.createRadialGradient(wickX, wickY, 0, wickX, wickY, wickWidth * 3);
    glowGradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); // Centro branco mais brilhante
    glowGradient.addColorStop(0.3, 'rgba(255, 215, 0, 1)'); // Dourado brilhante
    glowGradient.addColorStop(1, 'rgba(255, 140, 0, 0)'); // Laranja transparente
    
    ctx.fillStyle = glowGradient;
    ctx.fill();
    
    // Adiciona múltiplas camadas de brilho
    for(let i = 0; i < 3; i++) {
        ctx.shadowColor = 'rgba(255, 200, 0, 0.8)'; // Amarelo mais brilhante
        ctx.shadowBlur = 15 + i * 5; // Brilho progressivamente maior
        ctx.beginPath();
        ctx.arc(wickX, wickY, wickWidth * (1 - i * 0.2), 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
        ctx.fill();
    }
    
    // Remove a sombra para não afetar outros desenhos
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
}

function drawHUD() {
    ctx.font = 0.03 * canvas.width + GAME_FONT_ROBOTO;

    const paddleColor = levelPalette.paddleColor;
    ctx.fillStyle = paddleColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const levelDisplay = actualLevel; // Mostrar o nível real

    let hudText = `${difficultyConfig.difficultyName}${HUD_SEPARATOR}Level: ${levelDisplay}${HUD_SEPARATOR}Lives: ${lives}${HUD_SEPARATOR}Score: ${score}${HUD_SEPARATOR}x${(speedMultiplierActual * difficultyConfig.scoreMultiplier).toFixed(1)}`;
    if (showFPS) hudText += `${HUD_SEPARATOR}FPS: ${fps}`

    ctx.fillText(hudText, canvas.width / 2, canvas.height * 0.02);

    drawActivePowerupsInHUD();
}

function drawActivePowerupsInHUD() {
    if (gameState !== 'playing') return;

    // Reference sizes
    const hudPowerupWidth = canvas.width * BASE_POWERUP_WIDTH * 0.65;
    const hudPowerupHeight = canvas.height * BASE_POWERUP_HEIGHT * 0.65;
    const marginH = hudPowerupHeight * 0.4;
    
    // Positioning
    const rightEdge = canvas.width + hudPowerupWidth / 4;
    let startY = hudPowerupHeight * 2 + marginH * 3;
    const progressBarHeight = hudPowerupHeight * 0.15;
    
    // Ball powerup (top)
    if (activeBallPowerup) {
        const ballPowerup = {
            type: activeBallPowerup,
            width: hudPowerupWidth,
            height: hudPowerupHeight
        };
        
        // Draw powerup icon with specific dimensions
        drawPowerUpAt(
            ballPowerup,
            rightEdge - hudPowerupWidth,
            startY,
            hudPowerupWidth,
            hudPowerupHeight
        );
        
        // Duration bar directly below
        const duration = POWERUP_DURATIONS[activeBallPowerup.toUpperCase()];
        const remainingRatio = activeBallPowerupDuration / duration;

        startY += + hudPowerupHeight + marginH;
        
        // Duration bar background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(
            rightEdge-hudPowerupWidth*1.5,
            startY,
            hudPowerupWidth,
            progressBarHeight
        );
        
        // Duration bar fill
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(
            rightEdge-hudPowerupWidth*1.5,
            startY,
            hudPowerupWidth * remainingRatio,
            progressBarHeight
        );

        startY += (progressBarHeight + marginH)*8;
    }

    // Paddle powerup (below ball powerup)
    if (activePaddlePowerup) {
        const paddlePowerup = {
            type: activePaddlePowerup,
            width: hudPowerupWidth,
            height: hudPowerupHeight
        };
                
        // Draw powerup icon with specific dimensions
        drawPowerUpAt(
            paddlePowerup,
            rightEdge - hudPowerupWidth,
            startY,
            hudPowerupWidth,
            hudPowerupHeight
        );
        
        // Duration bar
        const duration = POWERUP_DURATIONS[activePaddlePowerup.toUpperCase()];
        const remainingRatio = activePaddlePowerupDuration / duration;

        startY += + hudPowerupHeight + marginH;
        
        // Duration bar background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(
            rightEdge-hudPowerupWidth*1.5,
            startY,
            hudPowerupWidth,
            progressBarHeight
        );
        
        // Duration bar fill
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(
            rightEdge-hudPowerupWidth*1.5,
            startY,
            hudPowerupWidth * remainingRatio,
            progressBarHeight
        );
    }
}

// Desenha os blocos
function drawBricks(deltaTime) {
    brickTimeCounter += deltaTime*6;
    let pulse = 0.5 + 0.5 * Math.sin(brickTimeCounter); // Varia entre 0 e 1

    for (let r = 0; r < brickRowCount; r++) {
        for (let c = 0; c < brickColumnCount; c++) {
            let b = bricks[r][c];
            if (b && (b.status > 0 || b.unbreakable || b.stoneStatus > 0)) {
                let brickX = c * (brickWidth + brickPadding) + offsetLeft;
                let brickY = r * (brickHeight + brickPadding) + offsetTop;
                b.x = brickX;
                b.y = brickY;

                if (b.isFrozen) {
                    // Criar um gradiente radial para simular gelo
                    const gradient = ctx.createRadialGradient(
                        brickX + brickWidth / 2, 
                        brickY + brickHeight / 2, 
                        0, 
                        brickX + brickWidth / 2, 
                        brickY + brickHeight / 2, 
                        brickWidth / 2
                    );
                    gradient.addColorStop(0, 'rgba(173, 216, 230, 0.9)'); // LightBlue com transparência
                    gradient.addColorStop(1, 'rgba(0, 191, 255, 0.5)'); // DeepSkyBlue mais transparente
                    ctx.fillStyle = gradient;
                    ctx.fillRect(brickX, brickY, brickWidth, brickHeight);

                    // Adicionar detalhes de rachaduras ou cristais de gelo
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(brickX + brickWidth * 0.2, brickY + brickHeight * 0.3);
                    ctx.lineTo(brickX + brickWidth * 0.8, brickY + brickHeight * 0.7);
                    ctx.moveTo(brickX + brickWidth * 0.8, brickY + brickHeight * 0.3);
                    ctx.lineTo(brickX + brickWidth * 0.2, brickY + brickHeight * 0.7);
                    ctx.stroke();

                    // Adicionar efeito de brilho
                    ctx.save();
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = 'rgba(173, 216, 230, 0.8)';
                    ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
                    ctx.restore();
                } else if (b.stoneStatus > 0) {
                    // Selecionar o padrão com base no stoneStatus
                    let image;
                    switch (b.stoneStatus) {
                        case 4:
                            image = stoneTextures.full;
                            break;
                        case 3:
                            image = stoneTextures.cracked1;
                            break;
                        case 2:
                            image = stoneTextures.cracked2;
                            break;
                        case 1:
                            image = stoneTextures.cracked3;
                            break;
                        default:
                            console.warn('Invalid stone status:', b.stoneStatus);
                            image = stoneTextures.full;
                    }
                    ctx.drawImage(image, brickX, brickY, brickWidth, brickHeight);

                } else if (b.unbreakable) {
                    // Aplicar o padrão aos blocos inquebráveis
                    ctx.fillStyle = cachedUnbreakablePattern;
                    ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
                } else if (b.hasPowerUp) {
                     // Ajustar a opacidade com base no efeito de pulsação
                     ctx.fillStyle = shadeColor(b.color, pulse);
 
                     // Adicionar contorno brilhante
                     ctx.save(); // Salvar o estado atual do contexto
                     ctx.shadowBlur = 10; // Ajuste o valor conforme necessário
                     ctx.shadowColor = b.color;
                     ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
                     ctx.restore();
                } else {
                    // Ajustar a cor com base no status do bloco
                    const intensity = b.status / maxStatus; // Valor entre 0 e 1
                    ctx.fillStyle = shadeColor(b.color, intensity);
                    ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
                }

                if (b.hasPowerUp) {
                    // Desenhar símbolo no bloco com power-up
                    ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`; // Ajustar a opacidade do símbolo
                    ctx.font = brickDiagonal * 0.3 + GAME_FONT_ROBOTO;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('?', brickX + (brickWidth / 2), brickY + (brickHeight / 2));
                }
            }
        }
    }
}

async function preloadTextures() {
    stoneTextures.full = await loadImage('static/images/textures/stone0.svg');
    stoneTextures.cracked1 = await loadImage('static/images/textures/stone1.svg');
    stoneTextures.cracked2 = await loadImage('static/images/textures/stone2.svg');
    stoneTextures.cracked3 = await loadImage('static/images/textures/stone3.svg');
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

function createPatterns() {
    cachedUnbreakablePattern = createUnbreakablePattern();
    parsedSkullPath = new Path2D(SKULL_SVG_PATH);
}

function createUnbreakablePattern() {
    // Criar um canvas temporário para o padrão
    const patternCanvas = document.createElement('canvas');
    const patternSize = 20; // Tamanho do padrão
    patternCanvas.width = patternSize;
    patternCanvas.height = patternSize;
    const pctx = patternCanvas.getContext('2d');

    // Desenhar o padrão (listras diagonais)
    pctx.strokeStyle = '#555555'; // Cor das listras
    pctx.lineWidth = 2;
    pctx.beginPath();
    pctx.moveTo(0, 0);
    pctx.lineTo(patternSize, patternSize);
    pctx.stroke();
    pctx.beginPath();
    pctx.moveTo(patternSize, 0);
    pctx.lineTo(0, patternSize);
    pctx.stroke();

    // Criar o padrão
    return ctx.createPattern(patternCanvas, 'repeat');
}

function drawPowerUps(deltaTime) {
    powerupTimeCounter += deltaTime;

    for (let pu of powerUps) {
        if (!pu.active) continue;

        const baseWidth = canvas.width * BASE_POWERUP_WIDTH;
        const baseHeight = canvas.height * BASE_POWERUP_HEIGHT;
        drawPowerUpAt(pu, pu.x, pu.y, baseWidth, baseHeight);
    }
}

function drawPowerUpAt(pu, x, y, baseWidth, baseHeight) {

    pu.width = baseWidth;
    pu.height = baseHeight;

    ctx.save();
    ctx.translate(x, y);

    // Determine powerup category and if it's harmful
    const isBallPowerup = [
        POWERUP_TYPES.FIREBALL, POWERUP_TYPES.PLASMABALL,
        POWERUP_TYPES.BOMBBALL, POWERUP_TYPES.HUGEBALL,
        POWERUP_TYPES.ICEBALL, POWERUP_TYPES.STONEBALL,
        POWERUP_TYPES.WICKEDBALL, POWERUP_TYPES.FASTBALL,
        POWERUP_TYPES.SLOWBALL,
    ].includes(pu.type);

    const isPaddlePowerup = [
        POWERUP_TYPES.BIGPADDLE, POWERUP_TYPES.LASER,
        POWERUP_TYPES.STICKYPADDLE,
    ].includes(pu.type);

    const isHarmful = [
        POWERUP_TYPES.CURSEDSKULL, POWERUP_TYPES.STONEBALL,
        POWERUP_TYPES.WICKEDBALL, POWERUP_TYPES.TINYBALL,
        POWERUP_TYPES.SLOWBALL
    ].includes(pu.type);

    // Get powerup colors
    const colors = getPowerUpColors(pu.type);
    
    // Time-based effects
    const pulse = Math.sin(powerupTimeCounter * 3) * 0.1 + 0.9;
    
    // Draw based on category
    if (isBallPowerup) {
        drawBallPowerup(baseWidth, colors, pulse, isHarmful);
    } else if (isPaddlePowerup) {
        drawPaddlePowerup(baseWidth, baseHeight, colors, pulse, isHarmful);
    } else {
        drawUserPowerup(baseWidth, colors, pulse, isHarmful);
    }

    ctx.restore();
}

function drawBallPowerup(size, colors, pulse, isHarmful) {
    // Circular design with orbital rings
    const radius = size * 0.3;
    
    // Outer glow
    const glowGradient = ctx.createRadialGradient(0, 0, radius * 0.5, 0, 0, radius * 2);
    glowGradient.addColorStop(0, `${colors[0]}88`);
    glowGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Crossing orbital rings
    ctx.beginPath();
    
    // First ring - rotated 30 degrees clockwise
    ctx.ellipse(0, 0, radius * 1.5, radius * 0.6, -Math.PI/6, 0, Math.PI * 2);
    
    // Second ring - rotated 30 degrees counter-clockwise
    ctx.ellipse(0, 0, radius * 1.5, radius * 0.6, Math.PI/6, 0, Math.PI * 2);
    
    ctx.strokeStyle = colors[0];
    ctx.lineWidth = 2;
    ctx.stroke();

    // Core
    ctx.beginPath();
    ctx.arc(0, 0, radius * pulse, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    gradient.addColorStop(0, colors[1]);
    gradient.addColorStop(1, colors[2]);
    ctx.fillStyle = gradient;
    ctx.fill();

    if (isHarmful) {
        drawHarmfulEffect(radius);
    }
}

function drawPaddlePowerup(width, height, colors, pulse, isHarmful) {
    // Tech/mechanical design
    const w = width * 0.5;
    const h = height * 1.5;
    
    // Tech pattern background
    ctx.strokeStyle = colors[0];
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        ctx.strokeRect(-w * (0.8 - i * 0.2), -h * (0.8 - i * 0.2), 
                      w * (1.6 - i * 0.4), h * (1.6 - i * 0.4));
    }

    // Energy core
    const gradient = ctx.createLinearGradient(-w/2, 0, w/2, 0);
    colors.forEach((color, i) => {
        gradient.addColorStop(i / (colors.length - 1), color);
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(-w/2 * pulse, -h/3 * pulse, w * pulse, h * 0.67 * pulse);

    if (isHarmful) {
        drawHarmfulEffect(Math.max(w, h)/2);
    }
}

function drawUserPowerup(size, colors, pulse, isHarmful) {
    // Diamond/crystal design
    const radius = size * 0.3;
    
    // Crystal shape
    ctx.beginPath();
    ctx.moveTo(0, -radius * 1.5);
    ctx.lineTo(radius, 0);
    ctx.lineTo(0, radius * 1.5);
    ctx.lineTo(-radius, 0);
    ctx.closePath();

    // Crystal gradient
    const gradient = ctx.createLinearGradient(-radius, -radius, radius, radius);
    colors.forEach((color, i) => {
        gradient.addColorStop(i / (colors.length - 1), color);
    });
    
    ctx.fillStyle = gradient;
    ctx.fill();

    // Shine effect
    const shine = ctx.createLinearGradient(-radius/2, -radius/2, radius/2, radius/2);
    shine.addColorStop(0, 'rgba(255, 255, 255, 0)');
    shine.addColorStop(0.5, `rgba(255, 255, 255, ${0.5 * pulse})`);
    shine.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = shine;
    ctx.fill();

    if (isHarmful) {
        drawHarmfulEffect(radius);
    }
}

function drawHarmfulEffect(radius) {
    // Add danger indicators
    ctx.strokeStyle = 'rgba(255, 0, 0, ' + (Math.sin(powerupTimeCounter * 5) * 0.3 + 0.7) + ')';
    ctx.lineWidth = (isMobile) ? 3 : 2; // Thicker on mobile for visibility
    
    // Warning marks
    for (let i = 0; i < 4; i++) {
        const angle = (powerupTimeCounter * 2 + i * Math.PI/2) % (Math.PI * 2);
        ctx.beginPath();
        ctx.arc(0, 0, radius * 2, angle, angle + 0.5);
        ctx.stroke();
    }
}

function getPowerUpColors(type) {
    switch (type) {
        // Ball Power-ups (Beneficial)
        case POWERUP_TYPES.FIREBALL:
            return ['#FF4400', '#FFAA00', '#FF0000']; // Fire colors
        case POWERUP_TYPES.PLASMABALL:
            return ['#00FFFF', '#0088FF', '#4B0082']; // Plasma blue/purple
        case POWERUP_TYPES.HUGEBALL:
            return ['#FFD700', '#FFA500', '#FF8C00']; // Golden colors
        case POWERUP_TYPES.ICEBALL:
            return ['#E0FFFF', '#87CEEB', '#4682B4']; // Ice blue
        case POWERUP_TYPES.FASTBALL:
            return ['#FF8C00', '#FFA500', '#FFFF00']; // Bright orange and yellow
        case POWERUP_TYPES.BOMBBALL:
            return ['#FFA500', '#FFD700', '#FF8C00']; // Warm orange and gold

        // Ball Power-ups (Harmful)
        case POWERUP_TYPES.TINYBALL:
            return ['#00CED1', '#20B2AA', '#008B8B']; // Turquoise shades
        case POWERUP_TYPES.WICKEDBALL:
            return ['#FF69B4', '#FF1493', '#FF00FF']; // Super Pink
        case POWERUP_TYPES.SLOWBALL:
            return ['#1E90FF', '#00BFFF', '#87CEFA']; // Calming blues
        case POWERUP_TYPES.STONEBALL:
            return ['#808080', '#A9A9A9', '#696969']; // Grey shades

        // Paddle Power-ups
        case POWERUP_TYPES.BIGPADDLE:
            return ['#0000CD', '#0000B0', '#000090']; // Medium blue
        case POWERUP_TYPES.LASER:
            return [LASER_COLOR, '#CC00CC', '#990099']; // Laser pink
        case POWERUP_TYPES.STICKYPADDLE:
            return ['#90EE90', '#32CD32', '#228B22']; // Sticky green

        // User Effect Power-ups
        case POWERUP_TYPES.EXTRALIFE:
            return ['#FF69B4', '#FFB6C1', '#FFC0CB']; // Heart pink
        case POWERUP_TYPES.MULTIBALL:
            return ['#1E90FF', '#4169E1', '#0000CD']; // Bright blue

        // Harmful Effect
        case POWERUP_TYPES.CURSEDSKULL:
            return ['#8B0000', '#000000', '#000000']; // Blacky red

        // Default
        default:
            return ['#FFFFFF', '#CCCCCC', '#999999']; // Neutral white/gray
    }
}

function drawEffectMessage() {
    for(let effectMessage of effectMessages) {
        ctx.save();
        ctx.globalAlpha = effectMessage.opacity;
        ctx.font = canvasDiagonal * 0.04 * effectMessage.scale + GAME_FONT_ROBOTO;
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(effectMessage.text, effectMessage.x, effectMessage.y);
        ctx.restore();
    }
}

function createLaserHitEffect(x, y) {
    for(let i = 0; i < 5; i++) {
        blockHitParticles.push({
            x: x,
            y: y,
            dx: (Math.random() * 2 - 1) * 100, // Velocidade
            dy: (Math.random() * 2 - 1) * 100,
            life: 0.5,
            color: LASER_COLOR // Cor magenta
        });
    }
}

function drawLaserShots() {
    if (!laserShots) return;

    ctx.save();
    ctx.fillStyle = LASER_COLOR; // Cor magenta para os lasers
    ctx.shadowColor = LASER_COLOR;
    ctx.shadowBlur = 10;

    for (let shot of laserShots) {
        ctx.fillRect(shot.x - shot.width / 2, shot.y, shot.width, shot.height);
    }

    ctx.restore();
}

function updateExplosionEffects(deltaTime) {
    for (let i = explosionEffects.length - 1; i >= 0; i--) {
        let effect = explosionEffects[i];
        effect.elapsed += deltaTime;

        // Update shockwave
        effect.shockwave.radius += deltaTime * canvasDiagonal * 0.5;
        effect.shockwave.opacity = Math.max(0, 1 - (effect.elapsed / effect.duration));

        // Update particles
        for (let p of effect.particles) {
            p.x += p.dx * deltaTime;
            p.dy += 300 * deltaTime; // Gravity
            p.y += p.dy * deltaTime;
            p.life -= deltaTime;
            if (p.type === 'smoke') {
                p.size += deltaTime * 10;
            }
        }

        // Remove dead particles
        effect.particles = effect.particles.filter(p => p.life > 0);

        // Update debris
        for (let d of effect.debris) {
            d.x += d.dx * deltaTime;
            d.dy += 500 * deltaTime; // Gravity
            d.y += d.dy * deltaTime;
            d.rotation += d.rotationSpeed * deltaTime;
            d.life -= deltaTime;
            
            // Slow down
            d.dx *= 0.98;
            d.dy *= 0.98;
        }
        
        // Remove dead debris
        effect.debris = effect.debris.filter(d => d.life > 0);

        // Remove completed explosions
        if (effect.elapsed >= effect.duration) {
            explosionEffects.splice(i, 1);
        }
    }
}

function drawExplosionEffects() {
    for (let effect of explosionEffects) {
        ctx.save();
        
        // Draw shockwave
        const gradient = ctx.createRadialGradient(
            effect.x, effect.y, 0,
            effect.x, effect.y, effect.shockwave.radius
        );
        gradient.addColorStop(0, `rgba(255,255,255,${effect.shockwave.opacity * 0.8})`);
        gradient.addColorStop(0.4, `rgba(255,140,0,${effect.shockwave.opacity * 0.4})`);
        gradient.addColorStop(1, 'rgba(255,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.shockwave.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw particles
        ctx.globalCompositeOperation = 'lighter';
        for (let p of effect.particles) {
            ctx.beginPath();
            if (p.type === 'fire') {
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                gradient.addColorStop(0, `rgba(255,255,255,${p.life})`);
                gradient.addColorStop(0.4, `rgba(255,140,0,${p.life})`);
                gradient.addColorStop(1, `rgba(255,0,0,0)`);
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = `rgba(100,100,100,${p.life * 0.3})`;
            }
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        // Inside drawExplosionEffects, after drawing particles:
        // Draw debris
        for (let d of effect.debris) {
            ctx.save();
            ctx.translate(d.x, d.y);
            ctx.rotate(d.rotation);
            
            ctx.fillStyle = d.color;
            ctx.globalAlpha = d.life;
            
            // Draw debris piece as a small rectangle
            ctx.fillRect(-d.size/2, -d.size/2, d.size, d.size);
            
            ctx.restore();
        }
    }
}

function createExplosionDebris(x, y, dirX, dirY, color) {
    // Random number of debris pieces per brick
    const numDebris = Math.floor(Math.random() * 4) + 3;
    const baseSpeed = 200;
    
    for (let i = 0; i < numDebris; i++) {
        // Add some randomness to direction
        const angleVariation = (Math.random() - 0.5) * Math.PI / 2;
        const speed = baseSpeed + Math.random() * 200;
        
        // Calculate velocity components
        const angle = Math.atan2(dirY, dirX) + angleVariation;
        const dx = Math.cos(angle) * speed;
        const dy = Math.sin(angle) * speed;
        
        // Create debris piece
        explosionEffects[explosionEffects.length - 1].debris.push({
            x: x,
            y: y,
            dx: dx,
            dy: dy,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 10,
            size: Math.random() * 8 + 4,
            life: Math.random() * 0.5 + 0.5,
            color: color
        });
    }
}

function parseColorToRGBA(color, alpha) {
    if (color === null || color === undefined) {
        console.warn('Invalid color: color is null or undefined');
        return `rgba(255, 255, 255, ${alpha})`;
    }

    // Converter para string se não for
    if (typeof color !== 'string') {
        if (typeof color === 'object' && color.toString) {
            console.warn('Color provided as object, attempting toString()');
            color = color.toString();
        } else {
            console.warn('Invalid color format, using default');
            return `rgba(255, 255, 255, ${alpha})`;
        }
    }

    let r = 0, g = 0, b = 0;

    if (color.startsWith('#')) {
        // Conversão de hexadecimal para RGB
        let hex = color.slice(1);

        if (hex.length === 3) {
            // Formato curto #RGB
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length === 6) {
            // Formato completo #RRGGBB
            r = parseInt(hex.slice(0, 2), 16);
            g = parseInt(hex.slice(2, 4), 16);
            b = parseInt(hex.slice(4, 6), 16);
        }
    } else if (color.startsWith('rgb')) {
        // Extrair valores numéricos de "rgb()" ou "rgba()"
        const nums = color.match(/\d+/g);
        if (nums) {
            r = nums[0];
            g = nums[1];
            b = nums[2];
        }
    } else {
        // Para nomes de cores, podemos usar um canvas temporário
        let tempCtx = document.createElement('canvas').getContext('2d');
        tempCtx.fillStyle = color;
        const computedColor = tempCtx.fillStyle; // Isso converte para formato rgb()
        const nums = computedColor.match(/\d+/g);
        if (nums) {
            r = nums[0];
            g = nums[1];
            b = nums[2];
        }
    }

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function updateParticles(deltaTime) {
    updateBlockHitParticles(deltaTime);
    updateFireParticles(deltaTime);
}

function updateEffects(deltaTime) {
    updateSkullEffects(deltaTime);
    updateEffectMessage(deltaTime);
    updateExplosionEffects(deltaTime);
}

function drawEffects() {
    drawSkullEffects();
    drawEffectMessage();
    drawExplosionEffects()
}

// Função para carregar múltiplas variantes da fonte Roboto
async function loadFonts() {
    try {
        if (document.fonts && document.fonts.load) {
            // Carregar Regular (400), Light (300) e Bold (700), além de Italic
            await Promise.all([
                document.fonts.load('300 100px Roboto'),
                document.fonts.load('400 100px Roboto'),
                document.fonts.load('700 100px Roboto'),
                document.fonts.load('italic 400 100px Roboto'),
                document.fonts.load('italic 700 100px Roboto')
            ]);
            console.log('Todas as variantes da fonte Roboto foram carregadas.');
        } else {
            console.warn('API de Font Loading não suportada. Usando fontes fallback.');
        }
    } catch (error) {
        console.error('Erro ao carregar as fontes Roboto:', error);
    }
}