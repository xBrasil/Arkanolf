const GAME_AREA_WIDTH_PERCENTAGE_DESKTOP = 0.75;
const GAME_AREA_HEIGHT_PERCENTAGE_DESKTOP = 0.95;
const GAME_AREA_WIDTH_PERCENTAGE_MOBILE = 1;
const GAME_AREA_HEIGHT_PERCENTAGE_MOBILE = 1;

// Seleciona o canvas e o contexto de desenho
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let previousCanvasWidth = 0, previousCanvasHeight = 0, widthRatio = 1, heightRatio = 1;
let oldCanvasWidth = 0; // força resizeCanvas() a executar certas funções ao menos uma vez
let oldCanvasHeight = 0; // força resizeCanvas() a executar certas funções ao menos uma vez
let canvasDiagonal = 0;

// Variáveis para controle touch
let isTouching = false;
let touchX = 0;
let lastTapTime = 0; // Tempo do último toque para detectar double-tap
let isMobile = isMobileUserAgent();

// Variáveis para controle com mouse
let mouseX = 0, mouseY = 0; // Variáveis globais para armazenar a posição do mouse
let isCursorShown = true;
let rightPressed=false, leftPressed=true;

// Função para iniciar o toque
function handleTouchStart(event) {
    // Prevenir comportamento padrão de mouse
    if (gameState === 'playing' && !isPaused) {
        event.preventDefault(); // Impede que o toque dispare eventos de clique

        const currentTime = Date.now();
        const tapLength = currentTime - lastTapTime;

        if (tapLength < 300 && tapLength > 0) {
            // Double tap detectado
            togglePause();
            isTouching = false;
        } else {
            // Single tap: iniciar movimentação do paddle
            isTouching = true;
            isPaused = false;
            if (isThereStuckBall()) releaseStuckBalls();
            handleTouchMove(event);
        }

        lastTapTime = currentTime;
    }
}

// Função para atualizar a posição do paddle baseado na posição do toque
function handleTouchMove(event) {
    if (!isTouching) return;

    // Obter a primeira posição de toque
    const touch = event.touches[0];
    touchX = touch.clientX;

    // Converter a posição do toque para coordenadas do jogo
    const rect = canvas.getBoundingClientRect();
    const relativeX = (touchX - rect.left) / (rect.width / canvas.width);

    // Atualizar a posição do paddle
    paddle.x = relativeX - paddle.width / 2;
}

function handleTouchEnd(event) {
    isTouching = false;
}

function vibrate(duration) {
    try {
        if (navigator.vibrate) {
            navigator.vibrate(duration);
        }
    }
    finally {
        return; // ignores errors
    }
}

function toggleEsc(event) {
    if (gameState === 'playing') {
        event.preventDefault(); // Impede que o toque dispare eventos de clique
        togglePause();
    }
}

function addAllListeners() {
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('focus', onWindowFocus);
    addMouseEventsListeners();
    addTouchEventsListeners()
    addKeyboardEventsListeners();
}

// Event Handlers para controle da raquete
function keyDownHandler(e) {
    switch (e.key) {
        case 'ArrowRight':
            paddle.dx = paddle.speed;
            rightPressed = true;
            break;
        case 'ArrowLeft':
            paddle.dx = -paddle.speed;
            leftPressed = true;
            break;
        case ' ':
        case 'Space':
            if (isThereStuckBall()) {
                releaseStuckBalls();
            } else {
                togglePause();
            }
            break;
        case 'Escape':
            togglePause();
            break;
        case 'F':
        case 'f':
            showFPS = !showFPS;
            saveProgress(); // Salvar a alteração no localStorage
            break;
        default:
            break;
    }
}

function keyUpHandler(e) {
    switch (e.key) {
        case 'ArrowRight':
            if (paddle.dx > 0) paddle.dx = 0;
            rightPressed = false;
            break;
        case 'ArrowLeft':
            if (paddle.dx < 0) paddle.dx = 0;
            leftPressed = false;
            break;
        default:
            break;
    }
}

function isThereStuckBall() {
    if (!balls) return false;
    for (let ball of balls) {
        if (ball.isStuck) return true;
    }
    return false;
}

function addKeyboardEventsListeners() {
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
}

function addTouchEventsListeners() {
    canvas.addEventListener('touchstart', handleTouchStart, false);
    canvas.addEventListener('touchmove', handleTouchMove, false);
    canvas.addEventListener('touchend', handleTouchEnd, false);
    canvas.addEventListener('touchcancel', handleTouchEnd, false);
}

function addMouseEventsListeners() {
    document.addEventListener('pointerlockchange', onPointerLockChange, false);
    document.addEventListener('mozpointerlockchange', onPointerLockChange, false);
    document.addEventListener('webkitpointerlockchange', onPointerLockChange, false);
    document.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', handleClick);
}

function handleClick(event) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;

    switch(gameState) {
        case 'startMenu':
            // Verificar cliques nos botões de dificuldade
            for (let button of difficultyButtons) {
                if (
                    mouseX >= button.x &&
                    mouseX <= button.x + button.width &&
                    mouseY >= button.y &&
                    mouseY <= button.y + button.height
                ) {
                    selectedDifficulty = button.difficulty;
                    saveProgress();
                    return;
                }
            }

            // Verificar cliques nos botões do menu principal
            for (let button of menuButtons) {
                if (
                    mouseX >= button.x &&
                    mouseX <= button.x + button.width &&
                    mouseY >= button.y &&
                    mouseY <= button.y + button.height
                ) {
                    button.action();
                    return;
                }
            }
            break;

        case 'levelSelection':
            // Verificar cliques nos botões de seleção de nível
            for (let button of levelButtons) {
                if (
                    mouseX >= button.x &&
                    mouseX <= button.x + button.width &&
                    mouseY >= button.y &&
                    mouseY <= button.y + button.height
                ) {
                    button.action();
                    return;
                }
            }
            break;

        case 'credits':
            // Verificar cliques no botão de voltar dos créditos
            if (
                mouseX >= creditsBackButton.x &&
                mouseX <= creditsBackButton.x + creditsBackButton.width &&
                mouseY >= creditsBackButton.y &&
                mouseY <= creditsBackButton.y + creditsBackButton.height
            ) {
                creditsBackButton.action();
                return;
            }
            break;

        case 'playing':
            if (isPaused) {
                let clickedButton = false;
                for (let button of pauseMenuButtons) {
                    if (
                        mouseX >= button.x &&
                        mouseX <= button.x + button.width &&
                        mouseY >= button.y &&
                        mouseY <= button.y + button.height
                    ) {
                        button.onClick();
                        clickedButton = true;
                        break;
                    }
                }
                if (!clickedButton) {
                    // Clique fora dos botões retorna ao jogo
                    resumeGame();
                }
            } else {
                if (isThereStuckBall()) {
                    releaseStuckBalls();
                } else {
                    togglePause();
                }
            }
            break;

        case 'gameOver':
            // Verificar cliques nos botões da tela de Game Over
            for (let button of gameOverButtons) {
                if (
                    mouseX >= button.x &&
                    mouseX <= button.x + button.width &&
                    mouseY >= button.y &&
                    mouseY <= button.y + button.height
                ) {
                    button.action();
                    return;
                }
            }
            break;

        case 'gameCompleted':
            // Verificar cliques nos botões da tela de Jogo Completo
            for (let button of gameCompletedButtons) {
                if (
                    mouseX >= button.x &&
                    mouseX <= button.x + button.width &&
                    mouseY >= button.y &&
                    mouseY <= button.y + button.height
                ) {
                    button.action();
                    return;
                }
            }
            break;

        case 'setCompleted':
            // Verificar cliques nos botões da tela de Conclusão de Set
            for (let button of setButtons) {
                if (
                    mouseX >= button.x &&
                    mouseX <= button.x + button.width &&
                    mouseY >= button.y &&
                    mouseY <= button.y + button.height
                ) {
                    button.action();
                    return;
                }
            }
            break;

        // Adicione outros estados de jogo conforme necessário
        default:
            break;
    }
}

function onMouseMove(event) {
    let rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;

    if (gameState === 'playing' && !isPaused && paddle) {
        if (!isCursorShown) {
            // Pointer Lock está ativo, usar movimento relativo
            let movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            // Atualizar a posição do paddle com base no movimento relativo
            paddle.x += movementX;
        } else {
            // Pointer Lock não está ativo, usar posição absoluta
            paddle.x = mouseX - paddle.width / 2;
        }
    }
}

function isMobileUserAgent() {
    if (navigator.userAgentData && navigator.userAgentData.mobile !== undefined) {
        return navigator.userAgentData.mobile;
    }

    const ua = navigator.userAgent || window.opera;
    const mobileAgents = [
        /android/i,
        /webos/i,
        /iphone/i,
        /ipad/i,
        /ipod/i,
        /blackberry/i,
        /windows phone/i
    ];

    return mobileAgents.some((regex) => regex.test(ua));
}

// Função para ajustar o tamanho do canvas
function resizeCanvas(forceUpdate=false) {
    // Tamanho original da janela
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;

    // Calcular a proporção atual da janela
    let aspectRatio = windowWidth / windowHeight;

    // Ajustar proporções para garantir que não ultrapasse 3:2 ou 2:3
    if (aspectRatio > 3 / 2) {
        // Se a largura for muito maior que a altura (maior que 3:2)
        windowWidth = windowHeight * (3 / 2);
    } else if (aspectRatio < 2 / 3) {
        // Se a altura for muito maior que a largura (menor que 2:3)
        windowHeight = windowWidth * (3 / 2);
    }

    // Detectar se é mobile
    if (isMobile) {
        // Aplicar porcentagens de área de jogo para mobile
        canvas.width = windowWidth * GAME_AREA_WIDTH_PERCENTAGE_MOBILE;
        canvas.height = windowHeight * GAME_AREA_HEIGHT_PERCENTAGE_MOBILE;

        // Ajustar proporções para garantir que não ultrapasse 4:3
        if (aspectRatio > 4 / 3) {
            // Se a largura for muito maior que a altura (maior que 4:3)
            windowWidth = windowHeight * (4 / 3);
        }
    } else { // é Desktop!
        // Aplicar porcentagens de área de jogo para desktop
        canvas.width = windowWidth * GAME_AREA_WIDTH_PERCENTAGE_DESKTOP;
        canvas.height = windowHeight * GAME_AREA_HEIGHT_PERCENTAGE_DESKTOP;
    }

    // Atualizar o valor da diagonal do canvas
    canvasDiagonal = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);

    if (canvas.width != oldCanvasWidth || canvas.height != oldCanvasHeight || forceUpdate) resizeAllElements();

    // Armazenar as dimensões atuais do canvas
    oldCanvasWidth = canvas.width;
    oldCanvasHeight = canvas.height;    
}

function resizeAllElements() {
    // Store the previous canvas dimensions
    previousCanvasWidth = oldCanvasWidth || canvas.width;
    previousCanvasHeight = oldCanvasHeight || canvas.height;

    widthRatio = canvas.width / previousCanvasWidth;
    heightRatio = canvas.height / previousCanvasHeight;

    // Recalculate proportional sizes based on the new canvas size
    paddleWidth = calcPaddleWidth();
    paddleHeight = calcPaddleHeight();
    ballRadius = calcBallSize();
    brickPadding = canvasDiagonal * 0.006;

    brickHeight = canvas.height * 0.05;
    brickWidth = (canvas.width - (1 + 1) * brickPadding) / 1;
    if (brickColumnCount) {
        brickWidth = (canvas.width - (brickColumnCount + 1) * brickPadding) / brickColumnCount;
    }

    // Adjust paddle size considering active power-ups
    if (paddle) {
        // Apply paddle size multiplier from active power-up
        if (activePaddlePowerup === POWERUP_TYPES.BIGPADDLE) {
            paddleWidth *= POWERUP_BIGPADDLE_MULTIPLIER;
        }

        paddle.width = paddleWidth;
        paddle.height = paddleHeight;
        paddle.y = calcPaddleY(paddleHeight);
        paddle.speed = calcPaddleSpeed();

        // Keep paddle within canvas bounds
        if (paddle.x < 0) {
            paddle.x = 0;
        } else if (paddle.x + paddle.width > canvas.width) {
            paddle.x = canvas.width - paddle.width;
        }
    }

    // Update balls
    for (let ball of balls) {
        // Recalculates ball radius considering active power-ups
        applyBallSizeToAllBalls(1);

        // Recalculates ball speed
        applyBallSpeedToAllBalls();

        // Then reapply power-up effects
        applyBallPowerupEffects();

        // Adjust ball position proportionally
        ball.x = (ball.x / previousCanvasWidth) * canvas.width;
        ball.y = (ball.y / previousCanvasHeight) * canvas.height;
    }

    // Update bricks
    offsetTop = canvas.height * 0.1;
    offsetLeft = (canvas.width - (1 * (brickWidth + brickPadding))) / 2;
    if (bricks && brickColumnCount && brickRowCount) {
        offsetLeft = (canvas.width - (brickColumnCount * (brickWidth + brickPadding))) / 2;

        for (let r = 0; r < brickRowCount; r++) {
            for (let c = 0; c < brickColumnCount; c++) {
                let b = bricks[r][c];
                if (b) {
                    b.width = brickWidth;
                    b.height = brickHeight;
                    b.x = c * (brickWidth + brickPadding) + offsetLeft;
                    b.y = r * (brickHeight + brickPadding) + offsetTop;
                }
            }
        }
    }

    // Update power-ups
    if (powerUps) {
        for (let pu of powerUps) {
            // Recalculate power-up size if necessary
            pu.width = canvas.width * 0.05;
            pu.height = canvas.height * 0.02;

            // Adjust power-up position proportionally
            pu.x = (pu.x / previousCanvasWidth) * canvas.width;
            pu.y = (pu.y / previousCanvasHeight) * canvas.height;
        }
    }

    // Update effect messages
    if (effectMessages) {
        for (let effectMessage of effectMessages) {
            effectMessage.x = (effectMessage.x / previousCanvasWidth) * canvas.width;
            effectMessage.y = (effectMessage.y / previousCanvasHeight) * canvas.height;
        }
    }

    // Resizes particles
    resizeParticles(blockHitParticles);
    resizeParticles(fireParticles);
    resizeParticles(menuParticles);
    resizeParticles(introParticles);
    resizeParticles(sparkleParticles);

    // Recreates patterns
    createPatterns();

    pauseMenuNeedsUpdate = true;

    // Store the current canvas dimensions for future resizes
    oldCanvasWidth = canvas.width;
    oldCanvasHeight = canvas.height;
}

function resizeParticles(particlesArray) {
    for (let p of particlesArray) {
        p.x = (p.x / previousCanvasWidth) * canvas.width;
        p.y = (p.y / previousCanvasHeight) * canvas.height;
        if (p.dx) p.dx = (p.dx / previousCanvasWidth) * canvas.width;
        if (p.dy) p.dy = (p.dy / previousCanvasHeight) * canvas.height;
        if (p.size) p.size *= Math.sqrt(widthRatio * heightRatio);
    }
}

function onWindowBlur() {
    if (gameState === 'playing' && !isPaused) {
        togglePause();
    }
}

function onWindowFocus() {
    // Você pode optar por não fazer nada aqui, deixando o jogo pausado até que o usuário o retome manualmente.
    // Se desejar que o jogo continue automaticamente ao ganhar foco, você pode descomentar a linha abaixo.
    // if (gameState === 'playing' && isPaused) {
    //     isPaused = false;
    // }
    updateCursorStyle();
}

function updateCursorStyle() {
    try {
        if (gameState === 'playing' && !isPaused && isCursorShown) {
            canvas.classList.add('hide-cursor');
            isCursorShown = false;
            requestPointerLock();
        } else if ((gameState != 'playing' || isPaused) && !isCursorShown) {
            canvas.classList.remove('hide-cursor');
            isCursorShown = true;
            exitPointerLock();
        }
    }
    finally {
        return; // ignores errors
    }
}

function requestPointerLock() {
    try {
        if (canvas.requestPointerLock) {
            canvas.requestPointerLock();
        } else if (canvas.mozRequestPointerLock) { // Suporte para Firefox
            canvas.mozRequestPointerLock();
        } else if (canvas.webkitRequestPointerLock) { // Suporte para Chrome
            canvas.webkitRequestPointerLock();
        }
    }
    finally {
        return; // ignores errors
    }
}

function exitPointerLock() {
    try {
        if (document.exitPointerLock) {
            document.exitPointerLock();
        } else if (document.mozExitPointerLock) { // Suporte para Firefox
            document.mozExitPointerLock();
        } else if (document.webkitExitPointerLock) { // Suporte para Chrome
            document.webkitExitPointerLock();
        }
    }
    finally {
        return; // ignores errors
    }
}

function onPointerLockChange() {
    const isLocked = document.pointerLockElement === canvas ||
                     document.mozPointerLockElement === canvas ||
                     document.webkitPointerLockElement === canvas;

    if (!isCursorShown && !isLocked) {
        // Se o Pointer Lock foi liberado, atualize o estado do jogo conforme necessário
        // Por exemplo, você pode pausar o jogo se o Pointer Lock for perdido
        if (gameState === 'playing' && !isPaused) {
            requestPointerLock();
        }
    }
}
