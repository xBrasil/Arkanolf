const BASE_BALL_SPEED_RATIO = 0.35;

function lineIntersectsRect(x1, y1, x2, y2, rx, ry, rw, rh) {
    // Verifica se a linha colide com algum dos lados do retângulo
    return (
        lineIntersectsLine(x1, y1, x2, y2, rx, ry, rx + rw, ry) || // topo
        lineIntersectsLine(x1, y1, x2, y2, rx, ry, rx, ry + rh) || // esquerdo
        lineIntersectsLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh) || // direito
        lineIntersectsLine(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh) // base
    );
}

function lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4) {
    // Função auxiliar que verifica se duas linhas se interceptam
    let denominator = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
    if (denominator === 0) return false;

    let ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denominator;
    let ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denominator;

    return (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1);
}

function circleIntersectsRectangle(previousX, previousY, currentX, currentY, radius, rectX, rectY, rectWidth, rectHeight) {
    // Encontrar o ponto mais próximo no retângulo para o círculo
    const closestX = clamp(currentX, rectX, rectX + rectWidth);
    const closestY = clamp(currentY, rectY, rectY + rectHeight);
    
    // Calcular a distância entre o círculo e esse ponto
    const distanceX = currentX - closestX;
    const distanceY = currentY - closestY;
    
    // Calcular a distância quadrada
    const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
    
    return distanceSquared < (radius * radius);
}

function calcBallSpeed() {
    speedMultiplier = 1 + (speedMultiplierDelta / difficultyConfig.speedIncreaseInterval * difficultyConfig.speedIncreaseRate);

    speedMultiplierActual = Math.min(difficultyConfig.speedMultiplier * speedMultiplier * getBallSpeedMultiplier(), difficultyConfig.speedMaxMultiplier);

    return speedMultiplierActual * canvasDiagonal * BASE_BALL_SPEED_RATIO;
}

function calcBallSize() {
    return canvasDiagonal * 0.012 * difficultyConfig.ballSizeMultiplier;
}

function calcPaddleWidth() {
    if (powerupBigPaddleMultiplier < 1) powerupBigPaddleMultiplier = 1;
    return canvas.width * 0.2 * difficultyConfig.padSizeMultiplier * powerupBigPaddleMultiplier;
}

function calcPaddleHeight() {
    return canvas.height * 0.02 * difficultyConfig.padSizeMultiplier;
}

function calcPaddleY(paddleHeight) {
    return canvas.height - paddleHeight * 3;
}

function calcPaddleSpeed() {
    return canvas.width * 0.75 * difficultyConfig.speedMultiplier; // Velocidade de 50% da largura do canvas por segundo
}

// Função de detecção de colisão com pads e bricks
function collisionDetection() {
    for (let ball of balls) {
        if (ball.isStuck) continue;

        let previousX = ball.previousX;
        let previousY = ball.previousY;
        let radius = ball.radius;

        // Collision with bricks
        for (let r = 0; r < brickRowCount; r++) {
            for (let c = 0; c < brickColumnCount; c++) {
                let b = bricks[r][c];
                if (b && (b.status > 0 || b.unbreakable || b.stoneStatus > 0)) {
                    if (
                        circleIntersectsRectangle(
                            previousX,
                            previousY,
                            ball.x,
                            ball.y,
                            radius,
                            b.x,
                            b.y,
                            b.width,
                            b.height
                        )
                    ) {
                        let collisionSide = getCollisionSide(ball, b);
                        let hitPoint = calculateCollisionPoint(ball, b, collisionSide);
                        let shouldBounce = true;

                        if (activeBallPowerup === POWERUP_TYPES.PLASMABALL || (activeBallPowerup === POWERUP_TYPES.FIREBALL && !b.unbreakable)) shouldBounce = false;
                        
                        if (activeBallPowerup === POWERUP_TYPES.ICEBALL) {
                            b.isFrozen = true;
                            frozenBricks++;
                        }

                        if (activeBallPowerup === POWERUP_TYPES.STONEBALL) {
                            b.status = 0;
                            b.isFrozen = false;
                            b.stoneStatus = 4;
                            b.unbreakable = false;
                        }

                        if (shouldBounce) {
                            ball.x = previousX;
                            ball.y = previousY;

                            if (collisionSide === 'top') {
                                ball.dy = -Math.abs(ball.dy);
                                ball.y = b.y - ball.radius;
                            } else if (collisionSide === 'bottom') {
                                ball.dy = Math.abs(ball.dy);
                                ball.y = b.y + b.height + ball.radius;
                            } else if (collisionSide === 'left') {
                                ball.dx = -Math.abs(ball.dx);
                                ball.x = b.x - ball.radius;
                            } else if (collisionSide === 'right') {
                                ball.dx = Math.abs(ball.dx);
                                ball.x = b.x + b.width + ball.radius;
                            }
                        }

                        // Handle brick destruction
                        if (activeBallPowerup === POWERUP_TYPES.BOMBBALL) {
                            explodeBombs();
                            return;
                        } else if ((b.unbreakable && activeBallPowerup !== POWERUP_TYPES.PLASMABALL) || activeBallPowerup === POWERUP_TYPES.ICEBALL || activeBallPowerup === POWERUP_TYPES.STONEBALL) {  
                            // Do nothing for unbreakable bricks if it's not a plasma ball
                            // Do nothing during ice balls and stone balls
                        } else if (b.stoneStatus > 0) {
                            if (activeBallPowerup === POWERUP_TYPES.PLASMABALL) {
                                // Plasma ball destroys stone bricks in one hit
                                destroyBrick(b, hitPoint.x, hitPoint.y, STONE_COLOR);
                            } else if (activeBallPowerup === POWERUP_TYPES.HUGEBALL) {
                                // Huge ball destroys stone bricks in two hits
                                if (b.stoneStatus <= 2) {
                                    destroyBrick(b, hitPoint.x, hitPoint.y, STONE_COLOR);
                                } else {
                                    addScore(GAME_BASE_HIT_POINTS * difficultyConfig.scoreMultiplier * Math.min(b.stoneStatus, 2));
                                    b.stoneStatus = math.min(b.stoneStatus - 2, 0);
                                }
                            } else {
                                // Other balls reduce stone brick status by 1
                                if (b.stoneStatus <= 1) {
                                    destroyBrick(b, hitPoint.x, hitPoint.y, STONE_COLOR);
                                } else {
                                    addScore(GAME_BASE_HIT_POINTS * difficultyConfig.scoreMultiplier);
                                    b.stoneStatus -= 1;
                                }
                            }
                        } else { // not stone brick
                            if (activeBallPowerup === POWERUP_TYPES.FIREBALL || activeBallPowerup === POWERUP_TYPES.PLASMABALL || activeBallPowerup === POWERUP_TYPES.HUGEBALL) {
                                destroyBrick(b, hitPoint.x, hitPoint.y, b.color);
                            } else {
                                if (b.status > 1) {
                                    addScore(GAME_BASE_HIT_POINTS * difficultyConfig.scoreMultiplier);
                                    b.status -= 1;
                                } else {
                                    destroyBrick(b, hitPoint.x, hitPoint.y, b.color);
                                }
                            }
                        }
                        break;
                    }
                }
            }
        }

        // Collision with paddle
        if (
            ball.dy > 0 &&
            circleIntersectsRectangle(
                previousX,
                previousY,
                ball.x,
                ball.y,
                ball.radius,
                paddle.x,
                paddle.y,
                paddle.width,
                paddle.height
            )
        ) {
            ball.x = previousX;
            ball.y = previousY;

            let collidePoint = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
            collidePoint = clamp(collidePoint, -1, 1);
            let angle = collidePoint * (Math.PI / 3);

            ball.dx = ball.speed * Math.sin(angle);
            ball.dy = -Math.abs(ball.speed * Math.cos(angle));

            ball.y = paddle.y - ball.radius;

            vibrate(VIBRATION_HIT_PADDLE);

            if (activePaddlePowerup === POWERUP_TYPES.STICKYPADDLE) {
                let relativeX = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
                relativeX = clamp(relativeX, -1, 1);

                ball.isStuck = true;
                ball.stuckRelativeX = relativeX * (paddle.width / 2);

                ball.x = paddle.x + paddle.width / 2 + ball.stuckRelativeX;
                ball.y = paddle.y - ball.radius;
            }
        }

        // Paliativo: Verificar se a bola ficou presa de algum bloco inquebrável (nunca deveria acontecer, mas...)
        for (let r = 0; r < brickRowCount; r++) {
            for (let c = 0; c < brickColumnCount; c++) {
                let b = bricks[r][c];
                if (b && (b.unbreakable || b.stoneStatus > 0)) {
                    if (
                        circleIntersectsRectangle(
                            ball.x,
                            ball.y,
                            ball.radius,
                            b.x,
                            b.y,
                            b.width,
                            b.height
                        )
                    ) {
                        console.warn("Paliativo de colisão acionado");
                        // Determinar o lado da colisão novamente
                        let collisionSide = getCollisionSide(ball, b);

                        // Ajustar a posição da bola para fora do bloco
                        if (collisionSide === 'top') {
                            ball.dy = -Math.abs(ball.dy);
                            ball.y = b.y - ball.radius;
                        } else if (collisionSide === 'bottom') {
                            ball.dy = Math.abs(ball.dy);
                            ball.y = b.y + b.height + ball.radius;
                        } else if (collisionSide === 'left') {
                            ball.dx = -Math.abs(ball.dx);
                            ball.x = b.x - ball.radius;
                        } else if (collisionSide === 'right') {
                            ball.dx = Math.abs(ball.dx);
                            ball.x = b.x + b.width + ball.radius;
                        }
                    }
                }
            }
        }
    }
}

// Helper function to calculate collision point
function calculateCollisionPoint(ball, brick, side) {
    switch(side) {
        case 'top':
            return {
                x: ball.x,
                y: brick.y
            };
        case 'bottom':
            return {
                x: ball.x, 
                y: brick.y + brick.height
            };
        case 'left':
            return {
                x: brick.x,
                y: ball.y
            };
        case 'right':
            return {
                x: brick.x + brick.width,
                y: ball.y
            };
    }
}

function destroyBrick(b, hitX, hitY, particlesColor) {
    if (b.hasPowerUp) {
        generatePowerUp(b.x + b.width / 2, b.y + b.height / 2);
        addScore(GAME_POWERUP_HIT_POINTS * difficultyConfig.scoreMultiplier);
        b.hasPowerUp = false;
    } else {
        addScore(GAME_BASE_HIT_POINTS * difficultyConfig.scoreMultiplier * Math.max(b.status + b.stoneStatus, 1));
    }

    b.status = 0;
    b.stoneStatus = 0;
    b.unbreakable = false;
    b.isFrozen = false;
    
    if (activeBallPowerup && activeBallPowerup ===  POWERUP_TYPES.FIREBALL || activeBallPowerup === POWERUP_TYPES.PLASMABALL) {
        // Doesnt create block hit particles for fireball and plasmaball
    } else {
        createBlockHitParticles(hitX, hitY, particlesColor);
    }

    vibrate(VIBRATION_DESTROY_BRICK);
}

// Função para clonar um objeto
function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Função para normalizar um vetor
function normalize(dx, dy) {
    let length = Math.hypot(dx, dy);
    if (length === 0) return { dx: 0, dy: 0 };
    return { dx: dx / length, dy: dy / length };
}

// Função de detecção e resolução de colisão entre bolas
function ballCollisionDetection() {
    if (activeBallPowerup === POWERUP_TYPES.PLASMABALL) return; // plasma balls não colidem umas com as outras, e quando o efeito está ativo todas são plasma ball, então desnecessário
    for (let i = 0; i < balls.length; i++) {
        if (balls[i].isStuck) continue; // Bolas presas não colidem com outras bolas
        for (let j = i + 1; j < balls.length; j++) {
            let ballA = balls[i];
            let ballB = balls[j];

            let dx = ballB.x - ballA.x;
            let dy = ballB.y - ballA.y;
            let distance = Math.hypot(dx, dy);
            let minDist = ballA.radius + ballB.radius;

            if (distance < minDist) {
                // Calcular a direção normal da colisão
                let { dx: nx, dy: ny } = normalize(dx, dy);

                // Calcular a sobreposição
                let overlap = minDist - distance;

                // Ajustar as posições para eliminar a sobreposição
                ballA.x -= nx * (overlap / 2);
                ballA.y -= ny * (overlap / 2);
                ballB.x += nx * (overlap / 2);
                ballB.y += ny * (overlap / 2);

                // Calcular as componentes das velocidades na direção da colisão
                let velocityA = ballA.dx * nx + ballA.dy * ny;
                let velocityB = ballB.dx * nx + ballB.dy * ny;

                // Trocar as componentes das velocidades
                let temp = velocityA;
                velocityA = velocityB;
                velocityB = temp;

                // Atualizar as velocidades das bolas
                ballA.dx += (velocityA - (ballA.dx * nx + ballA.dy * ny)) * nx;
                ballA.dy += (velocityA - (ballA.dx * nx + ballA.dy * ny)) * ny;
                ballB.dx += (velocityB - (ballB.dx * nx + ballB.dy * ny)) * nx;
                ballB.dy += (velocityB - (ballB.dx * nx + ballB.dy * ny)) * ny;

                // Normalizar as velocidades para manter a velocidade constante
                let speedA = Math.hypot(ballA.dx, ballA.dy);
                let speedB = Math.hypot(ballB.dx, ballB.dy);

                if (speedA > 0) {
                    ballA.dx = (ballA.dx / speedA) * ballA.speed;
                    ballA.dy = (ballA.dy / speedA) * ballA.speed;
                }
                if (speedB > 0) {
                    ballB.dx = (ballB.dx / speedB) * ballB.speed;
                    ballB.dy = (ballB.dy / speedB) * ballB.speed;
                }
            }
        }
    }

    // Paliativo: Verificar e corrigir sobreposições persistentes
    for (let i = 0; i < balls.length; i++) {
        if (balls[i].isStuck) continue;
        for (let j = i + 1; j < balls.length; j++) {
            if (balls[j].isStuck) continue;

            let ballA = balls[i];
            let ballB = balls[j];

            let dx = ballB.x - ballA.x;
            let dy = ballB.y - ballA.y;
            let distance = Math.hypot(dx, dy);
            let minDist = ballA.radius + ballB.radius;

            if (distance < minDist) {
                // Calcular a direção normal da colisão
                let { dx: nx, dy: ny } = normalize(dx, dy);

                // Calcular a sobreposição
                let overlap = minDist - distance;

                // Ajustar as posições para eliminar a sobreposição
                ballA.x -= nx * (overlap / 2);
                ballA.y -= ny * (overlap / 2);
                ballB.x += nx * (overlap / 2);
                ballB.y += ny * (overlap / 2);

                // Log de depuração (opcional)
                // console.warn(`Correção paliativa de sobreposição entre bola ${i} e bola ${j}`);
            }
        }
    }
}

function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    return !(x2 > x1 + w1 || 
             x2 + w2 < x1 || 
             y2 > y1 + h1 || 
             y2 + h2 < y1);
}

function rectsMovingIntersect(prevX1, prevY1, currX1, currY1, width1, height1,
    prevX2, prevY2, currX2, currY2, width2, height2) {
    // Cria retângulos que cobrem as áreas percorridas pelos objetos
    let minX1 = Math.min(prevX1, currX1);
    let maxX1 = Math.max(prevX1 + width1, currX1 + width1);
    let minY1 = Math.min(prevY1, currY1);
    let maxY1 = Math.max(prevY1 + height1, currY1 + height1);

    let minX2 = Math.min(prevX2, currX2);
    let maxX2 = Math.max(prevX2 + width2, currX2 + width2);
    let minY2 = Math.min(prevY2, currY2);
    let maxY2 = Math.max(prevY2 + height2, currY2 + height2);

    // Verifica se os retângulos se sobrepõem
    return !(maxX1 < minX2 || maxX2 < minX1 || maxY1 < minY2 || maxY2 < minY1);
}

function getCollisionSide(ball, brick) {
    let ballCenterX = ball.x;
    let ballCenterY = ball.y;
    let brickCenterX = brick.x + brick.width / 2;
    let brickCenterY = brick.y + brick.height / 2;

    let dx = (ballCenterX - brickCenterX) / (brick.width / 2);
    let dy = (ballCenterY - brickCenterY) / (brick.height / 2);

    if (Math.abs(dx) > Math.abs(dy)) {
        return dx > 0 ? 'right' : 'left';
    } else {
        return dy > 0 ? 'bottom' : 'top';
    }
}

//Função auxiliar para limitar um valor dentro de um intervalo.
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Movimenta as bolas
function moveBalls(deltaTime) {
    speedMultiplierDelta += deltaTime;
    const speed = calcBallSpeed();

    for (let i = 0; i < balls.length; i++) {
        if (balls[i].isStuck) continue;

        balls[i].speed = speed;

        // Manter a direção atual da bola
        const direction = Math.atan2(balls[i].dy, balls[i].dx);
        balls[i].dx = balls[i].speed * Math.cos(direction);
        balls[i].dy = balls[i].speed * Math.sin(direction);

        // Store previous position
        balls[i].previousX = balls[i].x;
        balls[i].previousY = balls[i].y;

        // Update position
        balls[i].x += balls[i].dx * deltaTime;
        balls[i].y += balls[i].dy * deltaTime;

        // Collision with side walls
        if (balls[i].x - balls[i].radius < 0) {
            balls[i].x = balls[i].radius;
            balls[i].dx = Math.abs(balls[i].dx);
        } else if (balls[i].x + balls[i].radius > canvas.width) {
            balls[i].x = canvas.width - balls[i].radius;
            balls[i].dx = -Math.abs(balls[i].dx);
        }

        // Collision with top wall
        if (balls[i].y - balls[i].radius < 0) {
            balls[i].y = balls[i].radius;
            balls[i].dy = Math.abs(balls[i].dy);
        }

        // Ball falls below paddle
        if (balls[i].y - balls[i].radius > canvas.height) {
            balls.splice(i, 1);
            i--;

            if (balls.length <= 0) {
                lives--;
                addScore(GAME_LIFELOSS_POINTS_PENALTY * difficultyConfig.scoreMultiplier);
                if (lives >= 0) {
                    initLevel();
                } else {
                    lives = 0; // Corrige a exibição de vidas negativas
                    doGameOver();
                }
                return false;
            }
        }
    }
    return true; // sinaliza que OK para prosseguir (não houve perda de vida / bola)
}

function movePowerUps(deltaTime) {
    for (let i = 0; i < powerUps.length; i++) {
        let pu = powerUps[i];
        if (pu.active) {
            // Armazenar posição anterior
            pu.previousX = pu.x;
            pu.previousY = pu.y;

            const powerUpSpeed = canvas.height * 0.2; // Velocidade de queda dos power-ups

            // Atualizar posição com base no deltaTime
            pu.y += (powerUpSpeed * deltaTime * difficultyConfig.speedMultiplier);

            // Colisão com a raquete considerando o movimento de ambos
            if (rectsMovingIntersect(
                pu.previousX, pu.previousY, pu.x, pu.y, pu.width, pu.height,
                paddle.previousX, paddle.previousY, paddle.x, paddle.y, paddle.width, paddle.height
            )) {
                pu.active = false;
                activatePowerUp(pu.type);
                powerUps.splice(i, 1);
                i--;
                continue; // Ir para o próximo power-up
            }

            // Remove power-up se sair da tela
            if (pu.y > canvas.height) {
                powerUps.splice(i, 1);
                i--;
                continue;
            }
        }
    }
}

// Movimenta a raquete
function movePaddle(deltaTime) {
    // Armazenar posição anterior
    paddle.previousX = paddle.x;
    paddle.previousY = paddle.y;
    
    // Update Paddle Size
    paddleWidth = calcPaddleWidth();
    paddleHeight = calcPaddleHeight();

    // Assign new dimensions to the paddle
    let previousWidth = paddle.width;
    paddle.width = paddleWidth;
    paddle.height = paddleHeight;

    // Adjust paddle position to keep it centered
    paddle.x += (previousWidth - paddle.width) / 2;

    // Apply friction when there's no input
    if (!leftPressed && !rightPressed) {
        paddle.dx *= 0.9; // Adjust the friction coefficient as needed
    }

    // Atualizar posição com base no deltaTime
    paddle.x += paddle.dx * deltaTime;

    // Prevent the paddle from moving out of the canvas boundaries
    let leftLimit = 0;
    let rightLimit = canvas.width;

    // Se o paddle está piscando pra mostrar que vai diminuir, permite ao usuário ajustar a posição do paddle considerando o limite futuro, não o atual (desconsidera as pontas)
    if (blinkingPaddleEdge > 0) {
        leftLimit -= blinkingPaddleEdge;
        rightLimit += blinkingPaddleEdge;
    }

    if (paddle.x < leftLimit) {
        paddle.x = leftLimit;
        paddle.dx = 0;
    } else if (paddle.x + paddle.width > rightLimit) {
        paddle.x = rightLimit - paddle.width;
        paddle.dx = 0;
    }

    // Atualizar posição das bolas presas
    for (let ball of balls) {
        if (ball.isStuck) {
            ball.x = paddle.x + paddle.width / 2 + ball.stuckRelativeX;
            ball.y = paddle.y - ball.radius;
        }
    }
}

function releaseStuckBalls() {
    for (let ball of balls) {
        if (ball.isStuck) releaseStuckBall(ball);
    }
}

function releaseStuckBall(ball) {
    // Se a bola não tem uma velocidade definida, reseta a velocidade antes de liberá-la
    if (ball.dx === 0 && ball.dy === 0) {
        resetBallSpeed(ball);
    }
    ball.isStuck = false;
    ball.stuckRelativeX = 0;
}

function resetBallSpeed(ball) {
    const speed = calcBallSpeed();
    let angle;

    if (ball.dx === 0 && ball.dy === 0) {
        // Define um ângulo aleatório apontando para cima (entre -60 e -120 graus)
        angle = -Math.PI / 2 + (Math.random() * Math.PI / 3 - Math.PI / 6);
    } else {
        angle = Math.atan2(ball.dy, ball.dx);
    }

    ball.speed = speed;
    ball.dx = speed * Math.cos(angle);
    ball.dy = speed * Math.sin(angle);
}

function updateLaserShots(deltaTime) {
    for (let i = 0; i < laserShots.length; i++) {
        let shot = laserShots[i];
        shot.y += shot.dy * deltaTime;

        // Verificar colisão com blocos
        for (let r = 0; r < brickRowCount; r++) {
            for (let c = 0; c < brickColumnCount; c++) {
                let b = bricks[r][c];
                if (b && (b.status > 0 || b.unbreakable || b.stoneStatus > 0)) {
                    if (rectIntersect(shot.x, shot.y, shot.width, shot.height, b.x, b.y, b.width, b.height)) {
                        if (b.stoneStatus > 0) {
                            if (b.stoneStatus <= 1) {
                                destroyBrick(b, shot.x, shot.y, LASER_COLOR);
                            } else {
                                addScore(GAME_BASE_HIT_POINTS * difficultyConfig.scoreMultiplier);
                                b.stoneStatus -= 1;
                                createLaserHitEffect(shot.x, shot.y);
                            }
                        } else {
                            if (b.status > 1) {
                                addScore(GAME_BASE_HIT_POINTS * difficultyConfig.scoreMultiplier);
                                b.status -= 1;
                                createLaserHitEffect(shot.x, shot.y);
                            } else {
                                destroyBrick(b, shot.x, shot.y, LASER_COLOR);
                            }
                        }

                        // Remover o tiro após atingir um bloco
                        laserShots.splice(i, 1);
                        i--;
                        
                        break;
                    }
                }
            }
        }

        // Remover tiro se sair da tela
        if (shot.y + shot.height < 0) {
            laserShots.splice(i, 1);
            i--;
        }
    }
}