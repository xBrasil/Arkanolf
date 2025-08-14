const GAME_NAME = 'Arkanolf.com';
const GAME_NAME_HUD = 'Arkanolf';
const GAME_AUTHOR = 'Rodolfo Motta Saraiva';
const GAME_VERSION = '1.2.2';

const GAME_BASE_HIT_POINTS = 10;
const GAME_POWERUP_HIT_POINTS = 50;
const GAME_LIFELOSS_POINTS_PENALTY = 100;
const GAME_LEVELCOMPLETE_POINTS = 200;
const GAME_OVER_EFFECT_DURATION = 2; // In seconds
const GAME_OVER_EFFECT_INITIAL_SHAKE_INTENSITY = 3;

// Controle de vibração em mobile
const VIBRATION_GAME_OVER = GAME_OVER_EFFECT_DURATION * 1000 / 2;
const VIBRATION_DESTROY_BRICK = 20;
const VIBRATION_HIT_PADDLE = 100;
const VIBRATE_LASER_SHOT = 10;
const VIBRATE_BOMB_EXPLOSION = EXPLOSION_DURATION * 1000 / 2;

// Variáveis globais
let gameState = 'intro'; // Possíveis estados: 'intro', 'startMenu', 'playing', 'paused', 'levelCompleted', 'gameOver', 'gameCompleted'
let isPaused = false;
let levelCompletionTime;
let gameCompletionTime;

let selectedDifficulty;

const levelCompletionDuration = 3000; // Duração da animação de nível concluído (3 segundos)
const gameCompletionDuration = 5000;  // Duração da animação de jogo concluído (5 segundos)

let introDuration = 3; // Duração em segundos
let introElapsed = 0;

let gameOverEffectElapsed = 0;

let shakeIntensity = 0;
let isGameOverTransition = false;

let paddle, bricks;
let balls = []; // Array de bolas
let brickRowCount, brickColumnCount;
let score, lives;

let brickWidth, brickHeight, brickDiagonal, brickPadding, offsetTop, offsetLeft;
let paddleWidth, paddleHeight;

let lastFrameTime = Date.now(); // Tempo do último quadro em milissegundos
let speedMultiplierDelta = 0, speedMultiplier = 0; // Multiplicador de velocidade inicial
let speedMultiplierActual = 1;

let highestLevelCompleted = {
    'Relax': 0,
    'Normal': 0,
    'Hard': 0,
    'Insane': 0
};

let isRandomGame = false;
let shuffledLevels = [];
let currentLevel = 1, actualLevel = 1; // Nível atual (lógico e real)
let levelMap, levelPalette;

// Função principal do loop do jogo
function gameLoop() {
    const now = Date.now();
    let deltaTime = (now - lastFrameTime) / 1000; // Converter para segundos
    lastFrameTime = now;
    requestAnimationFrame(gameLoop);
    updateCursorStyle();
    updateFPS(deltaTime);

    clearCanvas();

    switch(gameState) {
        case 'intro':
            drawIntro(deltaTime);
            break;
        case 'startMenu':
            drawStartMenu(deltaTime);
            break;
        case 'levelSelection':
            drawLevelSelectionMenu(deltaTime);
            break;
        case 'credits':
            drawCreditsScreen(deltaTime);
            break;
        case 'playing':
            updateGamePlaying(deltaTime);
            renderGamePlaying(deltaTime);
            if (isGameOverTransition) {
                drawGameOverTransition(deltaTime);
            } else {
                if (checkWin()) doLevelCompleted(); // Verificar se o nível foi concluído apenas após atualizar e desenhar tudo
            }
            break;
        case 'levelCompleted':
            drawLevelCompletion(deltaTime);            
            break;
        case 'gameCompleted':
            drawGameCompletion(deltaTime);
            break;
        case 'gameOver':
            drawGameOverScreen(deltaTime);
            break;
        default:
            console.warn('Estado de jogo desconhecido:', gameState);
            break;
        }
}

// Atualiza o estado do jogo
function updateGamePlaying(deltaTime) {
    if (isPaused || isGameOverTransition) return;
    updatePowerUpEffects(deltaTime);
    movePaddle(deltaTime);
    if (!moveBalls(deltaTime)) { return; } // se moveBalls levar à perda de uma vida ou fim de jogo, não segue processando
    ballCollisionDetection();
    collisionDetection();
    movePowerUps(deltaTime);
    updateParticles(deltaTime);
    updateEffects(deltaTime);
}

// Renderiza os elementos do jogo
function renderGamePlaying(deltaTime) {
    drawLevelBackground(levelPalette.background, deltaTime, false);
    drawBricks(deltaTime);
    drawPaddle();
    drawLaserShots();
    drawFireParticles(); // Desenhar as partículas de fogo antes das bolas
    drawBalls(deltaTime);
    drawBlockHitParticles(); // Desenha as demais partículas depois das bolas
    drawPowerUps(deltaTime);
    drawHUD();
    drawEffects();

    if (isPaused && gameState === 'playing') drawPauseScreen();
}

// Verifica se o jogador venceu
function checkWin() {
    // Aguarda fim da animação de explosão para verificar se todos os blocos foram destruídos
    if (explosionEffects && explosionEffects.length > 0) return false;

    for (let r = 0; r < brickRowCount; r++) {
        for (let c = 0; c < brickColumnCount; c++) {
            let b = bricks[r][c];
            if (b && !b.unbreakable && (b.status > 0 || b.stoneStatus > 0)) {
                return false;
            }
        }
    }
    return true;
}

function doGameOver() {
    isGameOverTransition = true;
    gameOverEffectElapsed = 0;
    shakeIntensity = GAME_OVER_EFFECT_INITIAL_SHAKE_INTENSITY * canvasDiagonal / 800;
    isPaused = false;
    vibrate(VIBRATION_GAME_OVER);
    ctx.save(); // Salvar o estado do contexto
}

function doLevelCompleted() {
    gameState = 'levelCompleted';
    addScore(GAME_LEVELCOMPLETE_POINTS * difficultyConfig.scoreMultiplier);
    levelCompletionTime = Date.now();

    // Atualizar o nível mais alto alcançado se não for modo aleatório
    if (!isRandomGame) {
        const difficultyName = difficultyConfig.difficultyName;
        if (currentLevel > highestLevelCompleted[difficultyName]) {
            highestLevelCompleted[difficultyName] = currentLevel;
            saveProgress();
        }
    }
}

function togglePause() {
    if (isGameOverTransition) return; // Não permite pausar durante a transição de fim de jogo
    if (gameState === 'playing') {
        isPaused = !isPaused;
        if (isPaused) {
            updatePauseMenuButtons();
        } else {
            // Continuar o jogo
        }
    }
}

function resumeGame() {
    isPaused = false;
}

function restartLevel() {
    isPaused = false;
    resetGame(currentLevel);
    init();
}

function backToMenu() {
    isPaused = false;
    gameState = 'startMenu';
}

function startGame(atLevel, startRandomGame) {
    // Configurar a dificuldade
    difficultyConfig = gameDifficulties.find(d => d.difficultyName === selectedDifficulty);
    if (!difficultyConfig) {
        difficultyConfig = gameDifficulties[1]; // Padrão para 'Normal' se não encontrado
    }

    // Reiniciar o jogo
    resetGame(atLevel);
    isRandomGame = startRandomGame;
    init();

    // Mudar o estado para 'playing'
    gameState = 'playing';
}

function addScore(addPoints) {
    if (addPoints<=0) { // não aplica multiplier de velocidade para remover pontos
        score += addPoints;
        if (score < 0) score = 0;
    } else { // aplicar multiplier de velocidade para adicionar pontos
        score += (addPoints * speedMultiplierActual);
    }
    score = Math.floor(score);
}

function saveProgress() {
    localStorage.setItem('highestLevelCompleted', JSON.stringify(highestLevelCompleted));
    localStorage.setItem('lastDifficulty', selectedDifficulty);
    localStorage.setItem('showFPS', showFPS); // Salvar o estado de showFPS
}

function loadProgress() {
    const savedProgress = localStorage.getItem('highestLevelCompleted');
    if (savedProgress) {
        highestLevelCompleted = JSON.parse(savedProgress);
    }

    const savedDifficulty = localStorage.getItem('lastDifficulty');
    if (savedDifficulty) {
        selectedDifficulty = savedDifficulty;
    } else {
        selectedDifficulty = 'Normal'; // Dificuldade padrão
    }

    const savedShowFPS = localStorage.getItem('showFPS');
    if (savedShowFPS !== null) {
        showFPS = JSON.parse(savedShowFPS); // Converter string para booleano
    } else {
        showFPS = false; // Valor padrão se não estiver salvo
    }
}

function startNewGame() {
    // Check if the player has reached any levels in the selected difficulty
    const difficultyName = selectedDifficulty;
    if (highestLevelCompleted[difficultyName] === 0) {
        startGame(1, false);
    } else {
        // Show level selection screen
        gameState = 'levelSelection';
    }
}

function continueGame() {
    const difficulties = ['Relax', 'Normal', 'Hard', 'Insane'];
    const currentDifficultyIndex = difficulties.indexOf(selectedDifficulty);
    const difficultyName = selectedDifficulty;
    if (highestLevelCompleted[difficultyName] >= levels.length) {
        // Se todos os níveis foram completados nessa dificuldade
        if (currentDifficultyIndex < difficulties.length - 1) {
            // Passar para a próxima dificuldade
            selectedDifficulty = difficulties[currentDifficultyIndex + 1];
            difficultyConfig = gameDifficulties.find(d => d.difficultyName === selectedDifficulty);
            startGame(1, false);
        } else {
            // Nenhuma dificuldade restante, desabilitar "Continue Game"
            return;
        }
    } else {
        startGame(highestLevelCompleted[difficultyName] + 1, false);
    }
}

function startRandomGame() {
    // Criar uma array de números de 1 até o total de níveis
    const levelNumbers = Array.from({ length: levels.length }, (_, i) => i + 1);
    // Embaralhar a array de números
    shuffledLevels = shuffleArray(levelNumbers);
    startGame(1, true); // Iniciar a partir do currentLevel 1
}

function showCredits() {
    gameState = 'credits';
}

function initLevel() {
    // Reiniciar a bola e posição da raquete
    paddleWidth = calcPaddleWidth();
    paddleHeight = calcPaddleHeight();
    if (paddle) {
        paddle.x = canvas.width / 2 - paddleWidth / 2;       
    } else {
        paddle = {
            x: canvas.width / 2 - paddleWidth / 2,
            previousX: canvas.width / 2 - paddleWidth / 2,
            y: calcPaddleY(paddleHeight),
            previousY: calcPaddleY(paddleHeight),
            width: paddleWidth,
            height: paddleHeight,
            dx: 0,
            speed: calcPaddleSpeed() // Velocidade em unidades por segundo
        };
    }

    // Resetar partículas e powerups
    clearGameParticles();
    clearPowerUpEffects();

    // Inicializar a bola principal (precisa vir por último!!)
    balls = [];
    createInitialBall();
}

function goToNextLevel() {
    isPaused = false;
    currentLevel++;
    if (isRandomGame) {
        // Em modo aleatório, pegar o próximo nível da lista embaralhada
        if (currentLevel > shuffledLevels.length) {
            // Se não houver mais níveis, finalizar o jogo
            isRandomGame = false;
            gameState = 'gameCompleted';
        } else {
            actualLevel = shuffledLevels[currentLevel - 1];
            resetGame(currentLevel);
            init();
        }
    } else {
        if (currentLevel > levels.length) {
            // Se não houver mais níveis, finalizar o jogo
            gameState = 'gameCompleted';
        } else {
            actualLevel = currentLevel;
            resetGame(currentLevel);
            init();
        }
    }
}

function createInitialBall() {
    const ballRadius = calcBallSize();
    let ball = {
        x: paddle.x + paddle.width / 2,
        y: paddle.y - ballRadius,
        radius: ballRadius,
        speed: 0,
        dx: 0,
        dy: 0,
        isStuck: true,
        stuckRelativeX: 0,
        isInitialBall: true
        };
    resetBallSpeed(ball);
    balls.push(ball);
}

function resetGame(atLevel) {
    if (!difficultyConfig) difficultyConfig = gameDifficulties[0];
    lives = difficultyConfig.initialLives;
    score = 0;
    currentLevel = atLevel;
    isGameOverTransition = false;
}

function resetBall() {
    if (!hasActiveBallPowerUp() && ballAbovePaddleHeight()) {
        balls = [];
        createInitialBall();
        isPaused = false;
    }
}

function hasActiveBallPowerUp() {
    return activeBallPowerup !== null;
}

function ballAbovePaddleHeight() {
    return balls.every(ball => (ball.y + ball.radius < paddle.y - (paddle.height*3)) && ball.y < canvas.height*0.8);
}

function shuffleArray(arrayofitems) {
    let array = arrayofitems.slice(); // Criar uma cópia do array origina
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Inicialização dos elementos do jogo
function init() {
    resizeCanvas(true);

    // Recalcular tamanhos proporcionais ao canvas
    ballRadius = calcBallSize();

    // Inicializar o level
    initLevel();
    
    // Get the map for the current level
    if (isRandomGame) {
        // Obter o nível real a partir da lista embaralhada
        actualLevel = shuffledLevels[currentLevel - 1];
    } else {
        actualLevel = currentLevel;
    }

    // Get the current level data
    //let levelData = levels[actualLevel - 1];
    levelMap = levels[actualLevel - 1].levelBricks;
    levelPalette = levels[actualLevel - 1].levelPalette;

    brickRowCount = levelMap.length;
    brickColumnCount = levelMap.reduce((max, row) => Math.max(max, row.length), 0);

    bricks = [];

    brickWidth = (canvas.width - (brickColumnCount + 1) * brickPadding) / brickColumnCount;
    brickHeight = canvas.height * 0.05;
    brickDiagonal = Math.sqrt(brickWidth ** 2 + brickHeight ** 2);

    // Inicialização dos blocos
    for (let r = 0; r < brickRowCount; r++) {
        bricks[r] = [];
        for (let c = 0; c < brickColumnCount; c++) {
            let char = levelMap[r][c] || ' ';
            let status = 0;
            let hasPowerUp = false;
            let unbreakable = false;

            switch (char) {
                case "1":
                    status = 1; // Bloco simples
                    break;
                case "2":
                    status = 2; // Bloco reforçado
                    break;
                case "3":
                    status = 3; // Bloco super reforçado
                    break;
                case "P":
                    status = 1; // Bloco simples com power-up
                    hasPowerUp = true;
                    break;
                case "U":
                    if (selectedDifficulty === 'Relax') {
                        status = 1; // Bloco simples no lugar do inquebrável no modo Relax
                    } else {
                        status = -1; // Bloco inquebrável
                        unbreakable = true;
                    }
                    break;
                default:
                    status = 0;
            }

            if (status !== 0) {
                // Determinar a cor do bloco baseada no status inicial e se é power-up
                let brickColor = levelPalette.brickColor;
                if (typeof brickColor === 'object' && !unbreakable) {
                    if (hasPowerUp) {
                        brickColor = brickColor[0] || brickColor[1]; // fallback para cor do status 1
                    } else {
                        brickColor = brickColor[status] || brickColor[1]; // fallback para cor do status 1
                    }
                }

                bricks[r][c] = {
                    x: 0,
                    y: 0,
                    width: brickWidth,
                    height: brickHeight,
                    status: status,
                    hasPowerUp: hasPowerUp,
                    unbreakable: unbreakable,
                    isFrozen: false,
                    stoneStatus: 0,
                    color: brickColor, // Cor definida baseada no status inicial
                };
            } else {
                bricks[r][c] = null;
            }
        }
    }

    // Resetar o tempo e o multiplicador de velocidade
    speedMultiplier = 1;
    speedMultiplierActual = 1;
    speedMultiplierDelta = 0;

    // Inicializar a fundo pulsante com o estilo selecionado
    backgroundTime = 0; // Resetar o tempo de fundo para cada fase

    gameState='playing'
    resizeCanvas(true);
}

// Iniciar o jogo após as fontes serem carregadas
(async function initializeGame() {
    await loadFonts();
    resizeCanvas(true);
    addAllListeners();
    createFixedParticles();
    loadProgress();
    await preloadTextures();
    gameLoop();
})();
