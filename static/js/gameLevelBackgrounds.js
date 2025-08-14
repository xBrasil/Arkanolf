let backgroundTime = 0;

// Desenha o fundo
function drawLevelBackground(background, deltaTime, isBaseBackground) {
    if (!isBaseBackground) {
        backgroundTime += deltaTime;
    }

    // Validação de segurança
    if (!background) {
        console.error('Background não definido para o nível:', actualLevel);
        return;
    }

    const { type } = background;

    switch (type) {
        case 'linear':
            drawLinearGradient(background, deltaTime, isBaseBackground);
            break;
        case 'radial':
            drawRadialGradient(background, deltaTime, isBaseBackground);
            break;
        case 'radial-dual':
            drawRadialDualGradient(background, deltaTime, isBaseBackground);
            break;
        case 'spiral':
            drawSpiralPattern(background, deltaTime, isBaseBackground);
            break;
        case 'triangleTunnel':
            drawTriangleTunnelPattern(background, deltaTime, isBaseBackground);
            break;
        case 'squareTunnel':
            drawSquareTunnelPattern(background, deltaTime, isBaseBackground);
            break;
        case 'concentricCircles':
            drawConcentricCircles(background, deltaTime, isBaseBackground);
            break;
        case 'waves':
            drawWavesPattern(background, deltaTime, isBaseBackground);
            break;
        case 'waveCircles':
            drawWaveCirclesPattern(background, deltaTime, isBaseBackground);
            break;
        case 'checkerboard':
            drawCheckerboardPattern(background, deltaTime, isBaseBackground);
            break;
        case 'animatedCheckerboard':
            drawAnimatedCheckerboardPattern(background, deltaTime, isBaseBackground);
            break;
        case 'polygonTunnel':
            drawPolygonTunnelPattern(background, deltaTime, isBaseBackground);
            break;
        case 'spiralGalaxy':
            drawSpiralGalaxyPattern(background, deltaTime, isBaseBackground);
            break;
        case 'animatedDots':
            drawAnimatedDotsPattern(background, deltaTime, isBaseBackground);
            break;
        case 'rotatingStars':
            drawRotatingStarsPattern(background, deltaTime, isBaseBackground);
            break;
        case 'solid':
            drawSolidBackground(background, deltaTime, isBaseBackground);
            break;
        case 'snowfall':
            drawSnowfallPattern(background, deltaTime, isBaseBackground);
            break;
        case 'spooky':
            drawSpookyPattern(background, deltaTime, isBaseBackground);
            break;
        case 'vortex':
            drawVortexPattern(background, deltaTime, isBaseBackground);
            break;
        case 'crystalCave':
            drawCrystalCavePattern(background, deltaTime, isBaseBackground);
            break;
        case 'forestGlow':
                drawForestGlowPattern(background, deltaTime, isBaseBackground);
            break;
        
        // Adicione mais casos conforme você adiciona novos padrões
        default:
            // Fallback para linear diagonal se o tipo não for reconhecido
            console.warn(`Tipo de background desconhecido: ${type}. Usando linear diagonal como fallback.`);
            drawLinearGradient({
                type: 'linear',
                direction: 'diagonal1',
                A1: '#000000',
                A2: '#FFFFFF',
                B1: '#000000',
                B2: '#FFFFFF'
            }, deltaTime);
            break;
    }
}

function drawAnimatedCheckerboardPattern(background, deltaTime, isBaseBackground) {
    const { 
        baseBackground, color1, color2,
        animationSpeed = 0.5
    } = background;

    if (!isBaseBackground && baseBackground) {
        drawBaseBackground(baseBackground, deltaTime);
    }

    // Criar canvas offscreen se não existir
    if (!background.patternCanvas) {
        // Criar padrão base maior que a tela para permitir movimento suave
        const size = Math.min(canvas.width, canvas.height) * 0.05; // 5% do menor lado
        const patternSize = size * 4; // 4x4 quadrados
        
        background.patternCanvas = document.createElement('canvas');
        background.patternCanvas.width = patternSize * 2;  // 2x maior para tiling suave
        background.patternCanvas.height = patternSize * 2;
        
        const pctx = background.patternCanvas.getContext('2d');
        
        // Desenhar padrão base
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                pctx.fillStyle = (x + y) % 2 === 0 ? color1 : color2;
                pctx.fillRect(x * size, y * size, size, size);
            }
        }
    }

    // Calcular offset da animação
    const offset = (backgroundTime * animationSpeed * 50) % background.patternCanvas.width;
    
    // Criar padrão repetitivo
    const pattern = ctx.createPattern(background.patternCanvas, 'repeat');
    
    // Aplicar transformação para mover o padrão
    ctx.save();
    ctx.translate(-offset, -offset);
    ctx.fillStyle = pattern;
    ctx.fillRect(offset, offset, canvas.width, canvas.height);
    ctx.restore();
}

function drawSpiralGalaxyPattern(background, deltaTime, isBaseBackground) {
    const { baseBackground, spiralColor, arms, rotationSpeed } = background;

    // Desenhar background base primeiro
    if (!isBaseBackground && baseBackground) {
        drawBaseBackground(baseBackground, deltaTime);
    }

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2); // Centro do canvas
    ctx.rotate(backgroundTime * rotationSpeed); // Rotação baseada no tempo

    ctx.strokeStyle = spiralColor;
    const spiralRadius = canvasDiagonal * 0.25; // 25% da diagonal

    for (let arm = 0; arm < arms; arm++) {
        ctx.beginPath();
        for (let angle = 0; angle <= 4 * Math.PI; angle += 0.1) { // 2 voltas
            const radius = spiralRadius * angle / (4 * Math.PI);
            const x = radius * Math.cos(angle + (arm * (2 * Math.PI) / arms));
            const y = radius * Math.sin(angle + (arm * (2 * Math.PI) / arms));
            if (angle === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }

    ctx.restore();
}

function drawAnimatedDotsPattern(background, deltaTime, isBaseBackground) {
    const { baseBackground, color, density, speed } = background;

    // Desenhar background base primeiro
    if (!isBaseBackground && baseBackground) {
        drawBaseBackground(baseBackground, deltaTime);
    }

    // Ajustes dinâmicos
    const dotSize = Math.max(2, canvasDiagonal * 0.003);
    let numDots = Math.floor(canvas.width * canvas.height * density);

    // Inicializar dots se necessário
    if (!background.dots) {
        background.dots = [];
        for (let i = 0; i < numDots; i++) {
            background.dots.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                dx: (Math.random() * 2 - 1) * speed * (canvas.width / 1000),
                dy: (Math.random() * 2 - 1) * speed * (canvas.height / 1000)
            });
        }
    }

    ctx.fillStyle = color;
    for (let dot of background.dots) {
        dot.x += dot.dx * deltaTime;
        dot.y += dot.dy * deltaTime;

        if (dot.x < 0 || dot.x > canvas.width) dot.dx *= -1;
        if (dot.y < 0 || dot.y > canvas.height) dot.dy *= -1;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawRotatingStarsPattern(background, deltaTime, isBaseBackground) {
    const { baseBackground, starColor, numStars, size, rotationSpeed } = background;

    const starSize = Math.min(canvas.width, canvas.height) * size; // Tamanho relativo da estrela

    // Desenhar background base primeiro
    if (!isBaseBackground && baseBackground) {
        drawBaseBackground(baseBackground, deltaTime);
    }
    // Inicializar estrelas se ainda não estiverem
    if (!background.stars) {
        background.stars = [];
        for (let i = 0; i < numStars; i++) {
            background.stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                rotation: Math.random() * 2 * Math.PI,
                rotationSpeed: (Math.random() * 0.5 - 0.25) * rotationSpeed // Rotação aleatória
            });
        }
    }

    ctx.fillStyle = starColor;

    for (let star of background.stars) {
        ctx.save();
        ctx.translate(star.x, star.y);
        ctx.rotate(star.rotation);
        drawStar(0, 0, 5, starSize, starSize / 2);
        ctx.restore();

        // Atualizar rotação
        star.rotation += star.rotationSpeed * deltaTime;
    }
}

// Função auxiliar para desenhar uma estrela
function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
}

function drawConcentricCircles(background, deltaTime, isBaseBackground) {
    const { baseBackground, colors, speed, spacing } = background;
    
    // Desenhar background base primeiro
    if (!isBaseBackground && baseBackground) {
        drawBaseBackground(baseBackground, deltaTime);
    }

    // Calcular dimensões dinâmicas
    const maxRadius = canvasDiagonal * 0.5; // 50% da diagonal
    const adjustedSpacing = canvasDiagonal * spacing;  // % da diagonal
    const lineWidth = Math.max(2, canvasDiagonal * 0.002); // Linha mínima de 2px

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Desenhar círculos usando o spacing
    for (let i = 0; i < colors.length; i++) {
        // Raio base usando spacing para separação uniforme
        const baseRadius = (i + 1) * adjustedSpacing;
        
        // Limitar o raio máximo
        if (baseRadius > maxRadius) break;
        
        // Animação senoidal
        const waveAmplitude = canvasDiagonal * 0.01;
        const radius = baseRadius + Math.sin(backgroundTime * speed + i) * waveAmplitude;
        
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = colors[i];
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }

    ctx.restore();
}

function drawWavesPattern(background, deltaTime, isBaseBackground) {
    const { baseBackground, color, frequency, speed } = background;

    // Desenhar background base primeiro
    if (!isBaseBackground && baseBackground) {
        drawBaseBackground(baseBackground, deltaTime);
    }

    // Amplitude dinâmica baseada na altura da tela
    const amplitude = canvas.height * 0.1; // 10% da altura
    const step = Math.max(1, canvas.width * 0.005); // Ajuste de performance

    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, canvasDiagonal * 0.001);

    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += step) {
        const y = canvas.height / 2 + amplitude * Math.sin((x / canvas.width) * frequency * 2 * Math.PI + backgroundTime * speed);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
}

function drawCheckerboardPattern(background, deltaTime, isBaseBackground) {
    const { baseBackground, color1, color2, strokeWidth } = background;

    if (!isBaseBackground && baseBackground) {
        drawBaseBackground(baseBackground, deltaTime);
    } else {
        ctx.fillStyle = color1;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const gridSize = Math.min(canvas.width, canvas.height) * 0.05; // 5% da diagonal

    ctx.strokeStyle = color2;
    ctx.strokeWidth = strokeWidth * canvasDiagonal;

    ctx.beginPath();
    for (let x = -gridSize; x < canvas.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }
    for (let y = -gridSize; y < canvas.height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();
}

function drawPolygonTunnelPattern(background, deltaTime, isBaseBackground) {
    let { baseBackground, color, numSides, speed } = background;

    // Desenhar background base primeiro
    if (!isBaseBackground && baseBackground) {
        drawBaseBackground(baseBackground, deltaTime);
    }

    // Dimensões dinâmicas
    const tunnelRadius = canvasDiagonal * 0.25;
    const lineWidth = Math.max(2, canvasDiagonal * 0.002);
    
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(backgroundTime * speed);

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    // Desenhar múltiplos polígonos concêntricos
    const numRings = 5;
    for (let ring = 1; ring <= numRings; ring++) {
        const currentRadius = (tunnelRadius / numRings) * ring;
        
        ctx.beginPath();
        for (let i = 0; i <= numSides; i++) {
            const angle = (i / numSides) * Math.PI * 2;
            const x = Math.cos(angle) * currentRadius;
            const y = Math.sin(angle) * currentRadius;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    }

    ctx.restore();
}

function drawLinearGradient(background, deltaTime, isBaseBackground) {
    const { direction, A1, A2, B1, B2 } = background;

    // Calcular o fator de pulsação baseado no tempo acumulado
    const time = backgroundTime * 0.5 * difficultyConfig.speedMultiplier;
    const pulse = (Math.sin(time) + 1) / 2; // Varia entre 0 e 1

    // Interpolar as cores A e B entre suas variações
    const backgroundColorA = interpolateColor(A1, A2, pulse);
    const backgroundColorB = interpolateColor(B1, B2, pulse);

    // Criar o gradiente baseado na direção
    let gradient;
    switch (direction) {
        case 'horizontal':
            gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            break;
        case 'vertical':
            gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            break;
        case 'diagonal1':
            gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            break;
        case 'diagonal2':
            gradient = ctx.createLinearGradient(canvas.width, 0, 0, canvas.height);
            break;
        case 'angle':
            // Converter ângulo para coordenadas
            const angle = background.angle; // Em radianos
            const x = Math.cos(angle) * canvas.width;
            const y = Math.sin(angle) * canvas.height;
            gradient = ctx.createLinearGradient(0, 0, x, y);
            break;
        case 'horizontal-reverse':
            gradient = ctx.createLinearGradient(canvas.width, 0, 0, 0);
            break;
        default:
            // Fallback para gradiente diagonal
            gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            break;
    }

    gradient.addColorStop(0, backgroundColorA);
    gradient.addColorStop(1, backgroundColorB);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBaseBackground(baseBackground, deltaTime) {
    // Desenhar o fundo base, se especificado
    if (baseBackground && baseBackground.type) {
        drawLevelBackground(baseBackground, deltaTime, true);
    } else {
        // Fallback para fundo preto se nenhum baseBackground for fornecido
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        console.warn('Nenhum background base fornecido. Usando preto como fallback.');
    }
}

function drawWaveCirclesPattern(background, deltaTime, isBaseBackground) {
    const { 
        baseBackground, circleColors, waveColor, 
        circleSpacing, waveFrequency, waveAmplitude,
        rotationSpeed, pulseIntensity 
    } = background;

    if (!isBaseBackground && baseBackground) {
        drawBaseBackground(baseBackground, deltaTime);
    }

    const WAVECIRCLE_SPEED_AJUST = 0.1;

    // Centro do canvas
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = canvasDiagonal * 0.35;

    // Rotação baseada no tempo
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(backgroundTime * rotationSpeed * WAVECIRCLE_SPEED_AJUST);

    // Desenhar círculos concêntricos com ondulação
    for (let i = 0; i < circleColors.length; i++) {
        const baseRadius = maxRadius * (i + 1) * circleSpacing;
        ctx.strokeStyle = circleColors[i];
        ctx.lineWidth = Math.max(2, canvasDiagonal * 0.002);

        ctx.beginPath();
        for (let angle = 0; angle <= Math.PI * 2; angle += 0.05) {
            const waveOffset = Math.sin(angle * waveFrequency + backgroundTime * WAVECIRCLE_SPEED_AJUST) * 
                             waveAmplitude * canvasDiagonal;
            const pulseOffset = Math.sin(backgroundTime*WAVECIRCLE_SPEED_AJUST) * pulseIntensity * canvasDiagonal;
            const radius = baseRadius + waveOffset + pulseOffset;
            
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (angle === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    }

    // Desenhar ondas radiais
    ctx.strokeStyle = waveColor;
    ctx.lineWidth = Math.max(1, canvasDiagonal * 0.001);
    ctx.globalAlpha = 0.5;

    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + backgroundTime*WAVECIRCLE_SPEED_AJUST;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        const endX = Math.cos(angle) * maxRadius * 1.2;
        const endY = Math.sin(angle) * maxRadius * 1.2;
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }

    ctx.restore();
    ctx.globalAlpha = 1.0;
}

function drawSpiralPattern(background, deltaTime, isBaseBackground) {
    const { baseBackground, spiralColor, rotationSpeed } = background;

    // Desenhar background base primeiro
    if (!isBaseBackground && baseBackground) {
        drawBaseBackground(baseBackground, deltaTime);
    }

    // Parâmetros da espiral ajustados à tela
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = canvasDiagonal * 0.2; // 20% da diagonal
    const spaceFromCenter = canvasDiagonal * 0.01; // 1% da diagonal
    const lineThickness = Math.max(2, canvasDiagonal * 0.002); // Mínimo 2px
    const rotations = 5;
    const points = 200;

    // Configurar estilo
    ctx.strokeStyle = spiralColor;
    ctx.lineWidth = lineThickness;
    ctx.beginPath();

    // Desenhar espiral
    for (let i = 0; i <= points; i++) {
        const progress = i / points;
        const angle = progress * Math.PI * 2 * rotations + backgroundTime * rotationSpeed;
        const radius = progress * maxRadius + spaceFromCenter;
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.stroke();
}

function drawTriangleTunnelPattern(background, deltaTime, isBaseBackground) {
    const { baseBackground, color, speed, radius } = background;

    // Desenhar background base primeiro
    if (!isBaseBackground && baseBackground) {
        drawBaseBackground(baseBackground, deltaTime);
    }

    // Dimensões dinâmicas
    const triangleSize = Math.min(canvas.width, canvas.height) * 0.06;
    const tunnelRadius = canvasDiagonal * radius;
    
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);

    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, canvasDiagonal * 0.001);

    const numTriangles = 36;
    for (let i = 0; i < numTriangles; i++) {
        const angle = (i / numTriangles) * Math.PI * 2 + backgroundTime * speed;
        const x = Math.cos(angle) * tunnelRadius;
        const y = Math.sin(angle) * tunnelRadius;

        ctx.beginPath();
        ctx.moveTo(x, y - triangleSize/2);
        ctx.lineTo(x - triangleSize/2, y + triangleSize/2);
        ctx.lineTo(x + triangleSize/2, y + triangleSize/2);
        ctx.closePath();
        ctx.fill();
    }

    ctx.restore();
}

function drawSquareTunnelPattern(background, deltaTime, isBaseBackground) {
    let { baseBackground, color, speed } = background;

    // Desenhar background base primeiro
    if (!isBaseBackground && baseBackground) {
        drawBaseBackground(baseBackground, deltaTime);
    }

    // Dimensões dinâmicas
    const squareSize = Math.min(canvas.width, canvas.height) * 0.08;
    const tunnelRadius = canvasDiagonal * 0.2;
    
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);

    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, canvasDiagonal * 0.001);

    const numSquares = 36;
    for (let i = 0; i < numSquares; i++) {
        const angle = (i / numSquares) * Math.PI * 2 + backgroundTime * speed;
        const x = Math.cos(angle) * tunnelRadius;
        const y = Math.sin(angle) * tunnelRadius;

        ctx.beginPath();
        ctx.rect(x - squareSize/2, y - squareSize/2, squareSize, squareSize);
        ctx.fill();
    }

    ctx.restore();
}

function drawRadialGradient(background, deltaTime, isBaseBackground) {
    const { center, radius, A1, A2, B1, B2 } = background;

    // Verificar se todas as propriedades necessárias estão presentes
    if (!center || typeof center.x !== 'number' || typeof center.y !== 'number') {
        console.error('Propriedade "center" inválida no background radial.');
        return;
    }
    if (typeof radius !== 'number') {
        console.error('Propriedade "radius" inválida no background radial.');
        return;
    }
    if (!A1 || !A2 || !B1 || !B2) {
        console.error('Propriedades de cor "A1", "A2", "B1", "B2" são necessárias no background radial.');
        return;
    }

    // Calcular o fator de pulsação baseado no tempo acumulado
    const time = backgroundTime * 0.5 * (background.speedMultiplier || 1); // Adicione speedMultiplier se necessário
    const pulse = (Math.sin(time) + 1) / 2; // Varia entre 0 e 1

    // Função auxiliar para interpolar cores
    // Certifique-se de ter implementado a função interpolateColor(A, B, t)
    const backgroundColorA = interpolateColor(A1, A2, pulse);
    const backgroundColorB = interpolateColor(B1, B2, pulse);

    // Calcular as coordenadas do centro em pixels
    const centerX = center.x * canvas.width;
    const centerY = center.y * canvas.height;

    // Calcular o raio em pixels
    const gradientRadius = radius * Math.min(canvas.width, canvas.height);

    // Criar o gradiente radial
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, gradientRadius);
    gradient.addColorStop(0, backgroundColorA);
    gradient.addColorStop(1, backgroundColorB);

    // Aplicar o gradiente como fillStyle e preencher o canvas
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawRadialDualGradient(background, deltaTime, isBaseBackground) {
    // Extrair as propriedades necessárias do objeto background
    const {
        center1 = { x: 0.5, y: 0.5 },
        radius1 = 0.5,
        center2 = { x: 0.5, y: 0.5 },
        radius2 = 0.8,
        colors1 = ['#FFFFFF', '#000000'],
        colors2 = ['#000000', '#FFFFFF'],
        pulse = false,       // Indica se o gradiente deve pulsar
        pulseSpeed = 1.0     // Velocidade do pulso
    } = background;

    // Atualizar o tempo de fundo
    backgroundTime += deltaTime;

    // Ajustar o raio se o pulso estiver ativo
    let pulseFactor = 1.0;
    if (pulse) {
        pulseFactor = 0.75 + 0.25 * Math.sin(backgroundTime * pulseSpeed);
    }

    // Converter coordenadas relativas em absolutas
    const centerX1 = center1.x * canvas.width;
    const centerY1 = center1.y * canvas.height;
    const radiusPixels1 = radius1 * Math.min(canvas.width, canvas.height) * pulseFactor;

    const centerX2 = center2.x * canvas.width;
    const centerY2 = center2.y * canvas.height;
    const radiusPixels2 = radius2 * Math.min(canvas.width, canvas.height) * pulseFactor;

    // Criar o primeiro gradiente radial
    const gradient1 = ctx.createRadialGradient(centerX1, centerY1, 0, centerX1, centerY1, radiusPixels1);
    const numColors1 = colors1.length;
    for (let i = 0; i < numColors1; i++) {
        gradient1.addColorStop(i / (numColors1 - 1), colors1[i]);
    }

    // Criar o segundo gradiente radial
    const gradient2 = ctx.createRadialGradient(centerX2, centerY2, 0, centerX2, centerY2, radiusPixels2);
    const numColors2 = colors2.length;
    for (let i = 0; i < numColors2; i++) {
        gradient2.addColorStop(i / (numColors2 - 1), colors2[i]);
    }

    // Desenhar o primeiro gradiente
    ctx.fillStyle = gradient1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Definir a operação de composição para sobrepor o segundo gradiente
    ctx.globalCompositeOperation = 'overlay';

    // Desenhar o segundo gradiente
    ctx.fillStyle = gradient2;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Restaurar a operação de composição padrão
    ctx.globalCompositeOperation = 'source-over';
}

function drawSolidBackground(background, deltaTime, isBaseBackground) {
    const { color } = background;

    if (!color) {
        console.warn('Cor não especificada para o background do tipo "solid". Usando preto como padrão.');
        ctx.fillStyle = '#000000';
    } else {
        ctx.fillStyle = color;
    }

    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnowfallPattern(background, deltaTime, isBaseBackground) {
    const {
        baseBackground, snowColor = '#FFFFFF', snowflakeCount = 100, fallSpeed = 1
    } = background;

    if (!isBaseBackground && baseBackground) {
        drawBaseBackground(baseBackground, deltaTime);
    }

    // Inicializar flocos de neve se não existir
    if (!background.snowflakes) {
        background.snowflakes = [];
        for (let i = 0; i < snowflakeCount; i++) {
            background.snowflakes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2 + 1,
                speed: Math.random() * 0.5 + 0.5
            });
        }
    }

    // Atualizar posição dos flocos de neve
    for (let flake of background.snowflakes) {
        flake.y += flake.speed * fallSpeed * deltaTime * 50; // Ajuste de velocidade
        if (flake.y > canvas.height) {
            flake.y = -flake.radius;
            flake.x = Math.random() * canvas.width;
        }
    }

    // Desenhar flocos de neve
    ctx.fillStyle = snowColor;
    for (let flake of background.snowflakes) {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawSpookyPattern(background, deltaTime, isBaseBackground) {
    const {
        baseBackground, ghostColor = '#FFFFFF', ghostCount = 10
    } = background;

    if (!isBaseBackground && baseBackground) {
        drawBaseBackground(baseBackground, deltaTime);
    }

    // Inicializar fantasmas se não existir
    if (!background.ghosts) {
        background.ghosts = [];
        for (let i = 0; i < ghostCount; i++) {
            background.ghosts.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                speed: Math.random() * 0.5 + 0.2,
                opacity: Math.random() * 0.5 + 0.2,
                scale: Math.random() * 0.5 + 0.5
            });
        }
    }

    // Desenhar fantasmas
    for (let ghost of background.ghosts) {
        ghost.x += ghost.speed * deltaTime * 50;
        if (ghost.x > canvas.width + 50) {
            ghost.x = -50;
            ghost.y = Math.random() * canvas.height;
        }

        ctx.save();
        ctx.globalAlpha = ghost.opacity;
        ctx.translate(ghost.x, ghost.y);
        ctx.scale(ghost.scale, ghost.scale);

        // Desenhar forma básica de um fantasma
        ctx.beginPath();
        ctx.arc(0, 0, 20, Math.PI, 0, false); // Cabeça
        ctx.lineTo(20, 30); // Corpo
        ctx.quadraticCurveTo(15, 25, 10, 30);
        ctx.quadraticCurveTo(5, 25, 0, 30);
        ctx.quadraticCurveTo(-5, 25, -10, 30);
        ctx.quadraticCurveTo(-15, 25, -20, 30);
        ctx.closePath();
        ctx.fillStyle = ghostColor;
        ctx.fill();

        // Olhos
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-7, -5, 2, 0, Math.PI * 2);
        ctx.arc(7, -5, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

function drawVortexPattern(background, deltaTime, isBaseBackground) {
    const { baseBackground, vortexColor, rotationSpeed, pulseRate } = background;

    // Desenhar background base primeiro
    if (!isBaseBackground && baseBackground) {
        drawBaseBackground(baseBackground, deltaTime);
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.45; // 45% do menor lado
    
    // Calcular pulsação
    const pulse = Math.sin(backgroundTime * pulseRate) * 0.2 + 0.8; // Varia entre 0.6 e 1.0
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(backgroundTime * rotationSpeed);

    // Configurar gradiente radial para dar profundidade ao vórtice
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius);
    const alpha1 = 0.7 * pulse;
    const alpha2 = 0.3 * pulse;
    gradient.addColorStop(0, `${vortexColor}FF`); // Centro sólido
    gradient.addColorStop(0.1, `${vortexColor}${Math.floor(alpha1 * 255).toString(16).padStart(2, '0')}`);
    gradient.addColorStop(1, `${vortexColor}${Math.floor(alpha2 * 255).toString(16).padStart(2, '0')}`);

    // Desenhar espirais do vórtice
    const numSpirals = 4;
    const lineWidth = Math.max(2, canvasDiagonal * 0.002);
    
    for (let s = 0; s < numSpirals; s++) {
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = gradient;

        const angleOffset = (s * Math.PI * 2) / numSpirals;
        
        for (let i = 0; i <= 720; i++) {
            const angle = (i * Math.PI / 180) + angleOffset;
            const spiralRadius = (i / 720) * maxRadius * pulse;
            const distortion = Math.sin(angle * 3 + backgroundTime * 2) * 10; // Efeito de ondulação
            
            const x = Math.cos(angle) * (spiralRadius + distortion);
            const y = Math.sin(angle) * (spiralRadius + distortion);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }

    // Adicionar efeito de brilho central
    const glowRadius = maxRadius * 0.2 * pulse;
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
    glow.addColorStop(0, `${vortexColor}CC`);
    glow.addColorStop(1, `${vortexColor}00`);
    
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawCrystalCavePattern(background, deltaTime, isBaseBackground) {
    const { baseBackground, crystalColor, glowIntensity } = background;

    // Desenhar background base primeiro
    if (!isBaseBackground && baseBackground) {
        drawBaseBackground(baseBackground, deltaTime);
    }

    // Se não houver cristais inicializados, criar array
    if (!background.crystals) {
        const numCrystals = 15;
        background.crystals = [];
        
        for (let i = 0; i < numCrystals; i++) {
            // Criar cristais com formas e posições aleatórias
            const points = 5 + Math.floor(Math.random() * 4); // 5-8 pontos
            const vertices = [];
            const size = (Math.random() * 0.05 + 0.03) * canvasDiagonal; // 3-8% da diagonal
            
            // Gerar vértices do cristal
            for (let j = 0; j < points; j++) {
                const angle = (j / points) * Math.PI * 2;
                const distance = size * (0.6 + Math.random() * 0.4); // Variação no tamanho
                vertices.push({
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance
                });
            }

            background.crystals.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vertices: vertices,
                rotation: Math.random() * Math.PI * 2,
                pulseOffset: Math.random() * Math.PI * 2,
                pulseSpeed: 0.5 + Math.random() * 0.5
            });
        }
    }

    // Desenhar cada cristal
    for (let crystal of background.crystals) {
        const pulse = Math.sin(backgroundTime * crystal.pulseSpeed + crystal.pulseOffset) * 0.3 + 0.7;
        const alpha = pulse * glowIntensity;

        // Desenhar brilho (glow)
        ctx.save();
        ctx.translate(crystal.x, crystal.y);
        ctx.rotate(crystal.rotation);
        
        // Camada de brilho externo
        ctx.globalAlpha = alpha * 0.3;
        ctx.fillStyle = crystalColor;
        ctx.beginPath();
        drawCrystalPath(ctx, crystal.vertices, 1.5);
        ctx.fill();

        // Camada de brilho médio
        ctx.globalAlpha = alpha * 0.5;
        ctx.beginPath();
        drawCrystalPath(ctx, crystal.vertices, 1.2);
        ctx.fill();

        // Cristal interno
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        drawCrystalPath(ctx, crystal.vertices, 1);
        ctx.fill();

        // Reflexo
        ctx.globalAlpha = alpha * 0.8;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const firstVertex = crystal.vertices[0];
        ctx.moveTo(firstVertex.x * 0.3, firstVertex.y * 0.3);
        for (let i = 1; i < crystal.vertices.length; i++) {
            const vertex = crystal.vertices[i];
            ctx.lineTo(vertex.x * 0.3, vertex.y * 0.3);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
    }
}

function drawCrystalPath(ctx, vertices, scale = 1) {
    const firstVertex = vertices[0];
    ctx.moveTo(firstVertex.x * scale, firstVertex.y * scale);
    for (let i = 1; i < vertices.length; i++) {
        const vertex = vertices[i];
        ctx.lineTo(vertex.x * scale, vertex.y * scale);
    }
    ctx.closePath();
}

function drawForestGlowPattern(background, deltaTime, isBaseBackground) {
    const {
        baseBackground, glowColor = '#228B22', glowIntensity = 0.3, mistEffect = true
    } = background;

    // Desenhar background base primeiro
    if (!isBaseBackground && baseBackground) {
        drawBaseBackground(baseBackground, deltaTime);
    }

    // Criar efeito de glow
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const glowRadius = canvasDiagonal * 0.6;

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
    gradient.addColorStop(0, `${glowColor}AA`);
    gradient.addColorStop(1, `${glowColor}00`);

    ctx.globalAlpha = glowIntensity;
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;

    // Névoa da floresta (ajustada)
    if (mistEffect) {
        drawForestMistEffect(background, deltaTime);
    }
}

function drawForestMistEffect(background, deltaTime) {
    const mistColor = 'rgba(255, 255, 255, 0.05)'; // Névoa branca muito sutil

    // Inicializar partículas de névoa se não existirem
    if (!background.mistParticles) {
        background.mistParticles = [];
        const numParticles = 100; // Número de partículas de névoa

        for (let i = 0; i < numParticles; i++) {
            background.mistParticles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * canvasDiagonal * 0.02 + 5, // Tamanho pequeno e consistente
                opacity: Math.random() * 0.05 + 0.02, // Opacidade muito baixa
                dx: (Math.random() - 0.5) * 0.3, // Movimento suave horizontal
                dy: (Math.random() - 0.5) * 0.3  // Movimento suave vertical
            });
        }
    }

    // Atualizar e desenhar partículas de névoa
    ctx.fillStyle = mistColor;
    ctx.globalAlpha = 0.8; // Intensidade geral da névoa

    for (let particle of background.mistParticles) {
        // Atualizar posição
        particle.x += particle.dx * deltaTime * 50;
        particle.y += particle.dy * deltaTime * 50;

        // Reaparecer no outro lado se sair da tela
        if (particle.x < -particle.radius) particle.x = canvas.width + particle.radius;
        if (particle.x > canvas.width + particle.radius) particle.x = -particle.radius;
        if (particle.y < -particle.radius) particle.y = canvas.height + particle.radius;
        if (particle.y > canvas.height + particle.radius) particle.y = -particle.radius;

        // Desenhar partícula
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.globalAlpha = 1.0; // Resetar opacidade
}
