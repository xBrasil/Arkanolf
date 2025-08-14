let menuBackgroundTime = 0; // Tempo acumulado para o fundo do menu
let levelCompletionElapsedTime = 0; // Tempo acumulado para a tela de conclusão do nível

function drawLevelCompletion(deltaTime) {
    if (currentLevel >= levels.length) { // Verifica se o jogo foi concluído
            gameState = 'gameCompleted';
            gameCompletionTime = Date.now();
            return;
    } else { // Se não, continua com a conclusão do nível
        if (Date.now() - levelCompletionTime >= levelCompletionDuration) { // Verifica se o tempo de conclusão do nível foi atingido
            // Avançar para o próximo nível dentro do set
            currentLevel++;
            init();
            return;
        }
    }

    // Acumular o tempo decorrido
    levelCompletionElapsedTime += deltaTime;

    // Usar o mesmo fundo pulsante do nível atual
    drawLevelBackground(levelPalette.background, deltaTime, false);

    // Calcular o fator de pulsação baseado no tempo acumulado
    const time = levelCompletionElapsedTime * 2;
    const pulse = (Math.sin(time) + 1) / 2;

    // Interpolar a cor do texto
    const textColorStart = '#FFFFFF';
    const textColorEnd = levelPalette.paddleColor;

    const textColor = interpolateColor(textColorStart, textColorEnd, pulse);

    // Determinar o próximo nível
    let nextActualLevel;
    if (currentLevel < levels.length) {
        if (isRandomGame) {
            nextActualLevel = shuffledLevels[currentLevel]; // é currentLevel -1 +1, por isso não adicionamos nada
        } else {
            nextActualLevel = currentLevel + 1;
        }
    } else {
        nextActualLevel = 'N/A';
    }  

    // Exibir o texto "Next Level"
    ctx.font = 'bold ' + canvasDiagonal * 0.05 + GAME_FONT_ROBOTO;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("Next Level: " + nextActualLevel, canvas.width / 2, canvas.height / 2);
}

function drawPauseScreen(deltaTime) {
    // Escurecer a tela
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Exibir "Game Paused" acima dos botões
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${canvas.height * 0.075}px ` + GAME_FONT_ROBOTO;
    ctx.textAlign = 'center';
    ctx.fillText('Game Paused', canvas.width / 2, canvas.height * 0.2);

    // Recalcular posições dos botões se necessário
    if (pauseMenuNeedsUpdate) {
        pauseMenuButtons = [];
        const buttonTexts = [
            'Return to game',
            'Restart level',
            'Reset ball',
            'Next level',
            'Main menu'
        ];
        const buttonCount = buttonTexts.length;
        const buttonWidth = canvas.width * 0.4;
        const buttonHeight = canvas.height * 0.06;
        const gap = canvas.height * 0.02; // Espaçamento entre botões
        const totalHeight = buttonCount * buttonHeight + (buttonCount - 1) * gap;
        let currentY = canvas.height / 2 - totalHeight / 2 + canvas.height * 0.05;

        for (let i = 0; i < buttonCount; i++) {
            const text = buttonTexts[i];
            pauseMenuButtons.push({
                text: text,
                x: canvas.width / 2 - buttonWidth / 2,
                y: currentY,
                width: buttonWidth,
                height: buttonHeight,
                onClick: getPauseMenuButtonAction(text),
                disabled: determineButtonDisabledState(text),
                hovered: false
            });
            currentY += buttonHeight + gap;
        }
        pauseMenuNeedsUpdate = false;
    }

    // Atualizar estado de hover
    for (let button of pauseMenuButtons) {
        button.hovered = false;
        if (
            mouseX >= button.x &&
            mouseX <= button.x + button.width &&
            mouseY >= button.y &&
            mouseY <= button.y + button.height
        ) {
            button.hovered = true;
            canvas.style.cursor = button.disabled ? 'default' : 'pointer';
        }
    }

    // Desenhar os botões
    for (let button of pauseMenuButtons) {
        // Cor do botão
        if (button.disabled) {
            ctx.fillStyle = '#AAAAAA'; // Cinza para desabilitado
        } else if (button.hovered) {
            ctx.fillStyle = '#0ff'; // Ciano brilhante para destaque
        } else {
            ctx.fillStyle = '#FFFFFF'; // Branco padrão
        }
        ctx.fillRect(button.x, button.y, button.width, button.height);

        // Texto do botão
        ctx.fillStyle = button.disabled ? '#666666' : '#000000';
        ctx.font = `${canvas.height * 0.03}px ` + GAME_FONT_ROBOTO;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            button.text,
            button.x + button.width / 2,
            button.y + button.height / 2
        );
    }
}

function determineButtonDisabledState(buttonText) {
    if (buttonText === 'Reset ball') {
        return hasActiveBallPowerUp() || !ballAbovePaddleHeight();
    } else if (buttonText === 'Next level') {
        return !canGoToNextLevel();
    }
    return false; // Outros botões estão sempre habilitados
}

function canGoToNextLevel() {
    if (isRandomGame) {
        // Em modo aleatório, pode avançar se não for o último nível
        return currentLevel < levels.length;
    } else {
        // Verifica se há um próximo nível e se está desbloqueado
        return (currentLevel < levels.length) && (highestLevelCompleted[difficultyConfig.difficultyName] >= currentLevel);
    }
}

function getPauseMenuButtonAction(text) {
    return function () {
        const button = pauseMenuButtons.find(b => b.text === text);
        if (button.disabled) return; // Não fazer nada se estiver desativado

        switch (text) {
            case 'Return to game':
                resumeGame();
                break;
            case 'Restart level':
                restartLevel();
                break;
            case 'Reset ball':
                resetBall();
                break;
            case 'Next level':
                goToNextLevel();
                break;
            case 'Main menu':
                backToMenu();
                break;
        }
    };
}

function updatePauseMenuButtons() {
    for (let button of pauseMenuButtons) {
        if (button.text === 'Reset ball') {
            button.disabled = hasActiveBallPowerUp() || !ballAbovePaddleHeight();
        }
    }
    pauseMenuNeedsUpdate = true;
}

function drawStartMenu(deltaTime) {
    drawMenuBackground(deltaTime); // Mantém o fundo existente com um toque de luz sutil

    // Texto de título "Arkanolf"
    ctx.font = 'bold ' + canvasDiagonal * 0.05 + GAME_FONT_ROBOTO;
    ctx.fillStyle = '#0ff'; // Ciano brilhante para o neon
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.shadowColor = '#0ff';
    ctx.shadowBlur = 12;
    ctx.fillText('Arkanolf', canvas.width / 2, canvas.height * 0.1);

    // Subtítulo "Choose Difficulty"
    ctx.font = 'bold ' + canvasDiagonal * 0.02 + GAME_FONT_ROBOTO;
    ctx.fillStyle = '#FFFFFF';
    ctx.textBaseline = 'top';
    ctx.shadowBlur = 0;
    ctx.fillText('Choose Difficulty', canvas.width / 2, canvas.height * 0.225);

    // Botões de Dificuldade (2x2) com estilo neon
    const difficulties = ['Relax', 'Normal', 'Hard', 'Insane'];
    let buttonWidth = canvas.width * 0.22;
    let buttonHeight = canvas.height * 0.07;
    let buttonSpacing = canvas.width * 0.03;

    let startX = canvas.width / 2 - (buttonWidth * 2 + buttonSpacing) / 2;
    let startY = canvas.height * 0.275;
    difficultyButtons = []; // Limpa o array para os botões

    for (let i = 0; i < difficulties.length; i++) {
        const row = Math.floor(i / 2);
        const col = i % 2;
        const x = startX + col * (buttonWidth + buttonSpacing);
        const y = startY + row * (buttonHeight + buttonSpacing);

        const isSelected = selectedDifficulty === difficulties[i];
        const isMouseOver = mouseX >= x && mouseX <= x + buttonWidth &&
                            mouseY >= y && mouseY <= y + buttonHeight;

        // Fundo do botão com gradiente
        if (isMouseOver || isSelected) {
            ctx.fillStyle = '#0ff'; // Ciano brilhante para destaque
        } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0)'; // Transparente
        }
        ctx.fillRect(x, y, buttonWidth, buttonHeight);

        // Borda do botão
        ctx.strokeStyle = '#FFFFFF';
        ctx.strokeRect(x, y, buttonWidth, buttonHeight);

        // Texto do botão
        ctx.fillStyle = (isMouseOver || isSelected) ? '#000000' : '#FFFFFF';
        ctx.font = 'bold ' + canvasDiagonal * 0.035/1.5 + GAME_FONT_ROBOTO;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(difficulties[i], x + buttonWidth / 2, y + buttonHeight / 2);

        // Armazenar informações do botão para detecção de clique
        difficultyButtons.push({
            difficulty: difficulties[i],
            x: x,
            y: y,
            width: buttonWidth,
            height: buttonHeight
        });
    }

    // Define the menu buttons
    const buttons = ['New Game', 'Continue', 'Play Random', 'Credits'];
    buttonWidth = canvas.width * 0.4;
    buttonHeight = canvas.height * 0.07;
    buttonSpacing = canvas.height * 0.02;
    startY = canvas.height * 0.5;
    startX = (canvas.width - buttonWidth) / 2;

    menuButtons = []; // Reset the menu buttons array

    for (let i = 0; i < buttons.length; i++) {
        const x = startX;
        const y = startY + i * (buttonHeight + buttonSpacing);

        // Check if the 'Continue' button should be disabled
        let isDisabled = false;
        if (buttons[i] === 'Continue' && (highestLevelCompleted[selectedDifficulty] === 0 || highestLevelCompleted[selectedDifficulty] === levels.length)) {
            isDisabled = true;
        }

        const isMouseOver = mouseX >= x && mouseX <= x + buttonWidth &&
                            mouseY >= y && mouseY <= y + buttonHeight;

        // Button background
        if (isMouseOver && !isDisabled) {
            ctx.fillStyle = '#0ff'; // Highlight color
        } else {
            ctx.fillStyle = isDisabled ? 'rgba(150, 150, 150, 0.7)' : 'rgba(255, 255, 255, 0.9)'; // Disabled or normal
        }
        ctx.fillRect(x, y, buttonWidth, buttonHeight);

        // Button text
        ctx.fillStyle = '#000000';
        ctx.font = 'bold ' + canvasDiagonal * 0.035/1.5 + GAME_FONT_ROBOTO;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(buttons[i], x + buttonWidth / 2, y + ((buttonHeight+(canvas.height * 0.005)) / 2));

        // Store button info
        menuButtons.push({
            label: buttons[i],
            x: x,
            y: y,
            width: buttonWidth,
            height: buttonHeight,
            action: function() {
                if (buttons[i] === 'New Game') {
                    startNewGame();
                } else if (buttons[i] === 'Continue') {
                    if (!isDisabled) continueGame();
                } else if (buttons[i] === 'Play Random') {
                    startRandomGame();
                } else if (buttons[i] === 'Credits') {
                    showCredits();
                }
            }
        });
    }

    drawVersion();
}

function drawVersion() {
    // Exibir o nome e a versão do jogo no canto inferior direito
    ctx.font = canvasDiagonal * 0.015 + GAME_FONT_ROBOTO;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('v' + GAME_VERSION, canvas.width - 10, canvas.height - 10);
}

function drawLevelSelectionMenu(deltaTime) {
    drawMenuBackground(deltaTime);

    const difficultyName = selectedDifficulty;
    let maxLevel = highestLevelCompleted[difficultyName];
    if (maxLevel < levels.length) maxLevel++;

    ctx.font = 'bold ' + canvasDiagonal * 0.03 + GAME_FONT_ROBOTO;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(`Select Starting Level`, canvas.width / 2, canvas.height * 0.125);

    const levelsPerRow = 5;
    let buttonWidth = canvas.width * 0.12;
    let buttonHeight = canvas.height * 0.05;
    const buttonSpacing = canvas.width * 0.02;
    const startX = (canvas.width - (buttonWidth + buttonSpacing) * levelsPerRow + buttonSpacing) / 2;
    const startY = canvas.height * 0.2;

    levelButtons = [];

    for (let i = 1; i <= maxLevel; i++) {
        const row = Math.floor((i - 1) / levelsPerRow);
        const col = (i - 1) % levelsPerRow;
        const x = startX + col * (buttonWidth + buttonSpacing);
        const y = startY + row * (buttonHeight + buttonSpacing);

        const isMouseOver = mouseX >= x && mouseX <= x + buttonWidth &&
                            mouseY >= y && mouseY <= y + buttonHeight;

        ctx.fillStyle = isMouseOver ? '#0ff' : '#FFFFFF';
        ctx.fillRect(x, y, buttonWidth, buttonHeight);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold ' + canvasDiagonal * 0.03 / 2 + GAME_FONT_ROBOTO;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Level ${i}`, x + buttonWidth / 2, y + buttonHeight / 2);

        levelButtons.push({
            level: i,
            x: x,
            y: y,
            width: buttonWidth,
            height: buttonHeight,
            action: function() {
                startGame(i, false);
            }
        });
    }

    // Back button
    buttonWidth = canvas.width * 0.3;
    buttonHeight = canvas.height * 0.06;
    const x = (canvas.width - buttonWidth) / 2;
    const y = canvas.height * 0.75;

    const isMouseOver = mouseX >= x && mouseX <= x + buttonWidth &&
                        mouseY >= y && mouseY <= y + buttonHeight;

    ctx.fillStyle = isMouseOver ? '#0ff' : '#FFFFFF';
    ctx.fillRect(x, y, buttonWidth, buttonHeight);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold ' + canvasDiagonal * 0.03 / 1.75 + GAME_FONT_ROBOTO;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Back', x + buttonWidth / 2, y + buttonHeight / 2);

    // Store back button for interaction
    levelButtons.push({
        x: x,
        y: y,
        width: buttonWidth,
        height: buttonHeight,
        action: function() {
            gameState = 'startMenu';
        }
    });
}

function drawCreditsScreen(deltaTime) {
    drawMenuBackground(deltaTime);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Definir os itens dos créditos
    const credits = [
        { text: 'Creator & Developer', style: 'bold', size: 0.04, color: '#FFFFFF' },
        { text: GAME_AUTHOR, style: 'normal', size: 0.035, color: '#FFFFFF' },
        { text: '', style: 'normal', size: 0.06, color: '#FFFFFF' },
        { text: '♡ Special Thanks to ♡', style: 'bold', size: 0.04, color: '#FFFFFF' },
        { text: 'Gustavo Motta', style: 'normal', size: 0.035, color: '#FFFFFF' },
        { text: 'Pedro Motta', style: 'normal', size: 0.035, color: '#FFFFFF' },
        { text: 'VALéria Miura', style: 'normal', size: 0.035, color: '#FFFFFF' }
        // Adicione mais nomes conforme necessário
    ];

    // Calcular altura total do conteúdo
    let totalHeight = 0;
    for (let item of credits) {
        totalHeight += canvas.height * item.size + canvas.height * 0.02; // Altura do texto + espaçamento
    }

    // Posição vertical inicial para centralizar
    let startY = (canvas.height - totalHeight) / 2;

    // Renderizar os itens dos créditos
    for (let item of credits) {
        ctx.font = `${item.style} ${canvasDiagonal * item.size}px ${GAME_FONT_ROBOTO}`;
        ctx.fillStyle = item.color;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 1.5;
        ctx.fillText(item.text, canvas.width / 2, startY);
        ctx.shadowBlur = 0; // Resetar o blur

        // Atualizar a posição Y para o próximo item
        startY += canvas.height * item.size + canvas.height * 0.02; // Altura do texto + espaçamento
    }

    // Botão "Back"
    const buttonWidth = canvas.width * 0.3;
    const buttonHeight = canvas.height * 0.06;
    const x = (canvas.width - buttonWidth) / 2;
    const y = canvas.height * 0.85;

    const isMouseOver = mouseX >= x && mouseX <= x + buttonWidth &&
                        mouseY >= y && mouseY <= y + buttonHeight;

    ctx.fillStyle = isMouseOver ? 'rgba(255, 215, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(x, y, buttonWidth, buttonHeight);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold ' + canvas.width * 0.04 + 'px ' + GAME_FONT_ROBOTO;
    ctx.textBaseline = 'middle';
    ctx.fillText('Back', x + buttonWidth / 2, y + buttonHeight / 2);

    // Store back button for interaction
    creditsBackButton = {
        x: x,
        y: y,
        width: buttonWidth,
        height: buttonHeight,
        action: function() {
            gameState = 'startMenu';
        }
    };
}

function drawGameOverScreen(deltaTime) {
    drawMenuBackground(deltaTime); // Fundo para a tela de Game Over

    // Título "Game Over"
    ctx.font = 'bold ' + canvasDiagonal * 0.065 + GAME_FONT_ROBOTO;
    ctx.fillStyle = '#FF0000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height * 0.225);

    // Exibir informações do jogo
    ctx.font = 'bold ' + canvasDiagonal * 0.065 / 2 + GAME_FONT_ROBOTO;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`Difficulty: ${difficultyConfig.difficultyName}`, canvas.width / 2, canvas.height * 0.35);
    ctx.fillText(`Died at Level: ${currentLevel}`, canvas.width / 2, canvas.height * 0.425);
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height * 0.5);

    // Definir botões
    const buttons = ['Try Again', 'Back to Menu'];
    const buttonWidth = canvas.width * 0.3;
    const buttonHeight = canvas.height * 0.08;
    const buttonSpacing = canvas.height * 0.02;
    const startX = (canvas.width - buttonWidth) / 2;
    const startY = canvas.height * 0.6;

    gameOverButtons = []; // Resetar o array de botões

    for (let i = 0; i < buttons.length; i++) {
        const x = startX;
        const y = startY + i * (buttonHeight + buttonSpacing);

        const isMouseOver = mouseX >= x && mouseX <= x + buttonWidth &&
                            mouseY >= y && mouseY <= y + buttonHeight;

        // Fundo do botão
        ctx.fillStyle = (isMouseOver) ? '#0ff' : '#FFFFFF'; // Cor de destaque ou normal
        ctx.fillRect(x, y, buttonWidth, buttonHeight);

        // Texto do botão
        ctx.fillStyle = '#000000';
        ctx.font = 'bold ' + canvasDiagonal * 0.065 / 3 + GAME_FONT_ROBOTO;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(buttons[i], x + buttonWidth / 2, y + buttonHeight / 2);

        // Armazenar informações do botão
        gameOverButtons.push({
            label: buttons[i],
            x: x,
            y: y,
            width: buttonWidth,
            height: buttonHeight,
            action: function() {
                if (buttons[i] === 'Try Again') {
                    startGame(currentLevel, isRandomGame);
                } else if (buttons[i] === 'Back to Menu') {
                    gameState = 'startMenu';
                }
            }
        });
    }
}

function drawGameCompletion(deltaTime) {
    drawMenuBackground(deltaTime);

    // Título "Congratulations!!!"
    ctx.save();
    ctx.font = 'bold ' + canvasDiagonal * 0.04 + GAME_FONT_ROBOTO;
    ctx.fillStyle = '#0ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#0ff';
    ctx.fillText('Congratulations!!!', canvas.width / 2, canvas.height * 0.3);
    ctx.restore();

    ctx.font = 'bold ' + canvasDiagonal * 0.055 / 2 + GAME_FONT_ROBOTO;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText("You've beaten the game!", canvas.width / 2, canvas.height * 0.425);
    ctx.fillText(`Difficulty: ${difficultyConfig.difficultyName}`, canvas.width / 2, canvas.height * 0.5);
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height * 0.575);

    // Definir botões
    const buttons = ['New Game', 'Back to Menu'];
    const buttonWidth = canvas.width * 0.3;
    const buttonHeight = canvas.height * 0.08;
    const buttonSpacing = canvas.height * 0.02;
    const startX = (canvas.width - buttonWidth) / 2;
    const startY = canvas.height * 0.65;

    gameCompletedButtons = []; // Resetar o array de botões

    for (let i = 0; i < buttons.length; i++) {
        const x = startX;
        const y = startY + i * (buttonHeight + buttonSpacing);

        const isMouseOver = mouseX >= x && mouseX <= x + buttonWidth &&
                            mouseY >= y && mouseY <= y + buttonHeight;

        // Fundo do botão
        ctx.fillStyle = isMouseOver ? '#0ff' : '#FFFFFF';
        ctx.fillRect(x, y, buttonWidth, buttonHeight);

        // Texto do botão
        ctx.fillStyle = '#000000';
        ctx.font = 'bold ' + canvas.width * 0.04 + GAME_FONT_ROBOTO;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(buttons[i], x + buttonWidth / 2, y + buttonHeight / 2);

        // Armazenar informações do botão
        gameCompletedButtons.push({
            label: buttons[i],
            x: x,
            y: y,
            width: buttonWidth,
            height: buttonHeight,
            action: function() {
                if (buttons[i] === 'New Game') {
                    startNewGame();
                } else if (buttons[i] === 'Back to Menu') {
                    gameState = 'startMenu';
                }
            }
        });
    }
}

function drawGameOverBackground(deltaTime) {
    // Cores dramáticas para Game Over
    let gradientColor1 = `hsl(${(menuBackgroundTime + 240) % 360}, 80%, 20%)`;
    let gradientColor2 = `hsl(${(menuBackgroundTime + 360) % 360}, 80%, 10%)`;

    let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, gradientColor1);
    gradient.addColorStop(1, gradientColor2);
    ctx.fillStyle = gradient;

    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawHappyBackground(deltaTime) {
    // Gradiente radial com partículas de brilho
    let gradientColor1 = `hsl(${(menuBackgroundTime) % 360}, 100%, 65%)`;
    let gradientColor2 = `hsl(${(menuBackgroundTime + 180) % 360}, 100%, 35%)`;

    let gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
    );
    gradient.addColorStop(0, gradientColor1);
    gradient.addColorStop(1, gradientColor2);
    ctx.fillStyle = gradient;

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Atualizar e desenhar partículas exclusivas
    updateSparkleParticles(deltaTime);
    drawSparkleParticles();
}

// Função para desenhar o fundo do menu inicial com uma grade neon
function drawStartMenuBackground(deltaTime) {
    // Desenha um gradiente de fundo
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#000428');
    gradient.addColorStop(1, '#004e92');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenha a grade neon
    const gridSize = 50;
    const speed = 3;
    const offset = (menuBackgroundTime * speed) % gridSize;

    ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
    ctx.lineWidth = 1;

    ctx.beginPath();
    for (let x = -gridSize + offset; x < canvas.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }
    for (let y = -gridSize + offset; y < canvas.height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    /*/ Desenha partículas opcionais
    updateMenuParticles(deltaTime);
    drawMenuParticles();*/
}

// Função para desenhar o fundo do menu
function drawMenuBackground(deltaTime) {
    // Atualizar o tempo acumulado
    menuBackgroundTime += deltaTime*10;

    if (gameState === 'gameOver') {
        drawGameOverBackground(deltaTime);
    } else if (gameState === 'gameCompleted' || gameState === 'credits') {
        drawHappyBackground(deltaTime);
    } else {
        drawStartMenuBackground(deltaTime);
    }
}

function drawIntro(deltaTime) {
    introElapsed += deltaTime;
    if (introElapsed >= introDuration) {
        gameState = 'startMenu';
        return;
    }

    // Fundo com gradiente animado
    let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    /*gradient.addColorStop(0, '#8E2DE2');
    gradient.addColorStop(1, '#4A00E0');*/
    gradient.addColorStop(0, '#000428');
    gradient.addColorStop(1, '#004e92');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Atualizar e desenhar partículas
    updateIntroParticles(deltaTime);
    drawIntroParticles();

    // Efeito de brilho pulsante
    let time = Date.now() * 0.002;
    let alpha = 0.5 + Math.sin(time) * 0.5;

    // Configurar o texto
    ctx.font = 'bold ' + canvasDiagonal * 0.065 + GAME_FONT_ROBOTO;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0, 255, 255, ' + alpha + ')';
    ctx.shadowColor = 'rgba(0, 255, 255, ' + alpha + ')';
    ctx.shadowBlur = 20;

    // Desenhar o texto
    ctx.fillText(GAME_NAME, canvas.width / 2, canvas.height / 2);

    // Resetar sombra
    ctx.shadowBlur = 0;
}

// Add new function for drawing game over effects
function drawGameOverTransition(deltaTime) {
    gameOverEffectElapsed += deltaTime;
    if (gameOverEffectElapsed >= GAME_OVER_EFFECT_DURATION) {
        isGameOverTransition = false;
        gameState = 'gameOver';
        ctx.restore(); // Restore the context to its original state
        return;
    }

    const progress = Math.min(gameOverEffectElapsed / GAME_OVER_EFFECT_DURATION, 1);

    try {
        // Screen shake
        if (shakeIntensity > 0) {
            const shakeX = (Math.random() - 0.5) * shakeIntensity;
            const shakeY = (Math.random() - 0.5) * shakeIntensity;
            ctx.translate(shakeX, shakeY);
            shakeIntensity *= 0.95;
        }

        // Red flash effect
        ctx.fillStyle = `rgba(255, 0, 0, ${progress * 0.5})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Multiple shockwave rings
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const maxRadius = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height) / 2;
        
        // Draw 3 shockwave rings with different sizes and opacities
        for (let i = 0; i < 3; i++) {
            const ringProgress = Math.max(0, progress - (i * 0.2));
            const currentRadius = ringProgress * maxRadius;
            const opacity = Math.max(0, 1 - ringProgress * 2);
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, ${255 - i * 50}, ${255 - i * 100}, ${opacity})`;
            ctx.lineWidth = (10 - i * 2) * (1 - ringProgress);
            ctx.stroke();

            // Add distortion effect
            const distortions = 8;
            for (let j = 0; j < distortions; j++) {
                const angle = (j / distortions) * Math.PI * 2;
                const distortRadius = currentRadius + Math.sin(angle * 4 + progress * 10) * 20;
                
                ctx.beginPath();
                ctx.arc(
                    centerX + Math.cos(angle) * 5,
                    centerY + Math.sin(angle) * 5,
                    distortRadius,
                    angle - 0.2,
                    angle + 0.2
                );
                ctx.strokeStyle = `rgba(255, ${255 - i * 50}, ${255 - i * 100}, ${opacity * 0.5})`;
                ctx.stroke();
            }
        }
    }
    finally {
        return; // ignores errors
    }
}