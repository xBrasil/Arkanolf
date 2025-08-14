const maxStatus = 3; // Maximum brick status based on the highest value in level maps

let levels = [
    // Level 1 - Circuito Neon (Fácil)
    {
        levelBricks: [
            "                 ",
            "    111111111    ",
            "   1         1   ",
            "  1  P     P  1  ",
            " 1   2222222   1 ",
            "1    2     2    1",
            "1    2     2    1",
            " 1   2 3 3 1   1 ",
            "  1  P     P  1  ",
        ],
        levelPalette: {
            background: {
                type: 'linear',
                direction: 'horizontal',
                A1: '#000033', // Azul Muito Escuro
                A2: '#1a1a40', // Azul Acinzentado
                B1: '#240050', // Roxo Escuro
                B2: '#993399'  // Roxo Brilhante
            },
            paddleColor: '#00FFFF', // Neon Azul Ciano
            brickColor: '#00FFFF',  // Neon Azul Ciano
            ballColor: '#00FFFF'    // Neon Azul Ciano
        }
    },
    // Level 2 - Space Invader (Moderado)
    {
        levelBricks: [
            "             ",
            "     1111    ",
            "    122221   ",
            "   P 2 2 2 P ",
            "  1111111111 ",
            " 1 1 1 1 1 1 ",
            " P        P  ",
            "             ",
        ],
        levelPalette: {
            background: {
                type: 'rotatingStars',
                baseBackground: {
                    type: 'radial',
                    center: { x: 0.5, y: 0.5 },
                    radius: 0.8,
                    A1: '#000000', // Preto
                    A2: '#000033', // Azul Muito Escuro
                    B1: '#000066', // Azul Escuro
                    B2: '#000099'  // Azul Médio
                },
                starColor: '#7FFF00',     // Chartreuse
                numStars: 150,
                size: 0.001,
                rotationSpeed: 0.1
            },
            paddleColor: '#00FF00', // Verde Limão
            brickColor: '#7FFF00',  // Chartreuse
            ballColor: '#ADFF2F'    // Amarelo-Verde
        }
    },
    // Level 3 - Nave Espacial (Moderado)
    {
        levelBricks: [
            "             ",
            "     1P1     ",
            "    1   1    ",
            "   1 3 3 1   ",
            "  1  333  1  ",
            " 1    3    1 ",
            "1    1 1    1",
            "     P P     ",
        ],
        levelPalette: {
            background: {
                type: 'waves',
                baseBackground: {
                    type: 'radial',
                    center: { x: 0.5, y: 0.5 },
                    radius: 1.0,
                    A1: '#660000', // Vermelho escuro
                    A2: '#FF0000', // Vermelho intenso
                    B1: '#990000', // Vermelho Médio
                    B2: '#330000'  // Vermelho Muito escuro
                },
                color: '#FFFFFF',     // Branco para as ondas
                frequency: 3,         // Mais ondas
                speed: 0.3,         // Movimento rápido
                amplitude: 0.08,      // Ondas mais pronunciadas
                waveCount: 9,        // Número de ondas
                glowIntensity: 0.7   // Adiciona brilho às ondas
            },
            paddleColor: '#FFFFFF', // Branco
            brickColor: '#FFFFFF',  // Branco
            ballColor: '#FFFFFF'    // Branco
        }
    },
    // Level 4 - Peixe (Moderado)
    {
        levelBricks: [
            "            ",
            "     P      ",
            "    2 2     ",
            "   U   U    ",
            "  1  3  1   ",
            " P11111111P ",
            "  1  3  1   ",
            "   U   U    ",
            "    2 2     ",
            "     P      ",
        ],
        levelPalette: {
            background: {
                type: 'animatedCheckerboard',
                color1: '#000000',  // Preto
                color2: '#000030',  // Azul Bem Escuro
                strokeWidth: 0.003,
                animationSpeed: 0.15, // Nova propriedade para animação
                pulseSize: true,    // Nova propriedade para pulsar tamanho
                fadeColors: true    // Nova propriedade para transição de cores
            },
            paddleColor: '#FFFF00', // Amarelo
            brickColor: '#FFFF00',  // Amarelo
            ballColor: '#FFFF00'    // Amarelo
        }
    },
    // Level 5 - Planeta com Anéis (Moderado)
    {
        levelBricks: [
            "           ",
            "     P     ",
            "    121    ",
            "   12P21   ",
            "  1222221  ",
            " P222P222P ",
            "  1222221  ",
            "   12P21   ",
            "    121    ",
            "     P     ",
        ],
        levelPalette: {
            background: {
                type: 'waveCircles', // Novo tipo combinado
                baseBackground: {
                    type: 'radial',
                    center: { x: 0.5, y: 0.5 },
                    radius: 0.9,
                    A1: '#1E90FF', // Dodger Blue
                    A2: '#87CEFA', // Light Sky Blue
                    B1: '#00BFFF', // Deep Sky Blue
                    B2: '#87CEEB'  // Sky Blue
                },
                circleColors: ['#FFD700', '#FFA500', '#FFFFFF'], // Ouro, Laranja, Branco
                waveColor: '#FFFFFF',     // Ondas brancas
                circleSpacing: 0.08,      // Espaçamento dos círculos
                waveFrequency: 2,         // Frequência das ondas
                waveAmplitude: 0.05,      // Amplitude das ondas
                rotationSpeed: 0.0003,       // Velocidade de rotação
                pulseIntensity: 0.1       // Intensidade da pulsação
            },
            paddleColor: '#FFD700', // Ouro
            brickColor: '#FFA500',  // Laranja
            ballColor: '#FFFFFF'    // Branco
        }
    },
    // Level 6 - Coração (Moderado)
    {
        levelBricks: [
            "               ",   
            "               ",   
            "    P     P    ",
            "   313   313   ",
            "  P1113 3111P  ",
            "   311131113   ",
            "    3111113    ",
            "     31113     ",
            "      313      ",
            "       P       ",
        ],
        levelPalette: {
            background: {
                type: 'concentricCircles',
                baseBackground: {
                    type: 'radial',
                    center: { x: 0.5, y: 0.5 },
                    radius: 0.8,
                    A1: '#FF69B4', // Rosa Profundo
                    A2: '#FFC0CB', // Rosa
                    B1: '#FFB6C1', // Light Pink
                    B2: '#FF1493'  // Deep Pink
                },
                colors: ['#FFB6C1', '#FFC0CB', '#FF69B4', '#FF1493'], // Rosa Claro a Rosa Profundo
                speed: 0.3,
                spacing: 0.06,
            },
            paddleColor: '#FFFFFF', // Branco
            brickColor: '#FFFFFF',  // Branco
            ballColor: '#FFFFFF'    // Branco
        }
    },
    // Level 7 - Símbolo de Energia (Fácil)
    {
        levelBricks: [
            "             ",
            "      P      ",
            "      P      ",
            "     3P3     ",
            "    32U23    ",
            "   321U123   ",
            "  3211U1123  ",
            "      U      ",
            "      U      ",
        ],
        levelPalette: {
            background: {
                type: 'waves',
                baseBackground: {
                    type: 'linear',
                    direction: 'vertical',
                    A1: '#000033', // Azul Muito Escuro
                    A2: '#000066', // Azul Escuro
                    B1: '#000099', // Azul Médio
                    B2: '#0000CC'  // Azul
                },
                color: '#FFFF00',     // Amarelo (ondas)
                frequency: 2,
                speed: 0.2
            },
            paddleColor: '#FFFF00', // Amarelo
            brickColor: '#FFD700',  // Ouro
            ballColor: '#FFFFFF'    // Branco
        }
    },
    // Level 8 - Circuito (Difícil)
    {
        levelBricks: [
            "           ",
            "P 2 P 2 P 2",
            " 222 222 22",
            "  P   P   P",
            " 222 222 22",
            "2 2 2 2 2 2",
            " U  U  U  U",
            "P 2 P 2 P 2",
        ],
        levelPalette: {
            background: {
                type: 'checkerboard',
                baseBackground: {
                    type: 'linear',
                    direction: 'horizontal',
                    A1: '#222222', // Cinza Escuro
                    A2: '#333333', // Cinza Médio
                    B1: '#222222',
                    B2: '#333333'
                },
                color1: '#0D0D0D', // Cinza Muito Escuro
                color2: '#1A1A1A', // Cinza Escuro
                strokeWidth: 0.005,
            },
            paddleColor: '#00FF00', // Verde Limão
            brickColor: '#7CFC00',  // Verde Grama
            ballColor: '#ADFF2F'    // Amarelo-Verde
        }
    },
    // Level 9 - Robô (Difícil)
    {
        levelBricks: [
            "                ",
            "                ",
            "      3333      ",
            "    3 P  P 3    ",
            "   3333333333   ",
            "  3   UUUU   3  ",
            "  3  3    3  3  ",
            "     P    P     ",
            "     3    3     ",
        ],
        levelPalette: {
            background: {
                type: 'polygonTunnel',
                baseBackground: {
                    type: 'radial',
                    center: { x: 0.5, y: 0.5 },
                    radius: 0.9,
                    A1: '#1E90FF', // Dodger Blue
                    A2: '#00BFFF', // Deep Sky Blue
                    B1: '#87CEFA', // Light Sky Blue
                    B2: '#00CED1'  // Turquesa Escuro
                },
                color: '#1E90FF',     // Dodger Blue
                numSides: 6,          // Hexágonos
                speed: 0.1
            },
            paddleColor: '#FFD700', // Dourado
            brickColor: '#FF4500',  // Orange Red
            ballColor: '#FFFF00'    // Yellow
        }
    },
    // Level 10 - Portal (Difícil)
    {
        levelBricks: [
            "           ",
            "    UUUU   ",
            "  UU    33 ",
            " 33 P3  33 ",
            " 33 3P  33 ",
            " P3    3P ",
            "  UU  UU  ",
            "   UUUU   ",
        ],
        levelPalette: {
            background: {
                type: 'triangleTunnel',
                baseBackground: {
                    type: 'radial',
                    center: { x: 0.5, y: 0.5 },
                    radius: 1.0,
                    A1: '#000000', // Preto
                    A2: '#000033', // Azul Muito Escuro
                    B1: '#000033', // Azul Muito Escuro
                    B2: '#000000'  // Preto
                },
                color: '#BA55D3',     // Orquídea Média (Triângulos)
                speed: 0.1,
                radius: 0.2
            },
            paddleColor: '#FFFFFF', // Branco
            brickColor: '#FFFF00',  // Amarelo
            ballColor: '#ADFF2F'    // Amarelo-Verde
        }
    },
    // Level 11 - Alienígena (Difícil)
    {
        levelBricks: [
            "               ",
            "     UUUU      ",
            "    3    3     ",
            "   2 UUUU 2    ",
            "  2 2  2  2 2  ",
            " P  2  2  2  P ",
            "     2  2      ",
            "    P    P     ",
        ],
        levelPalette: {
            background: {
                type: 'rotatingStars',
                baseBackground: {
                    type: 'radial',
                    center: { x: 0.5, y: 0.5 },
                    radius: 0.8,
                    A1: '#001A00', // Verde Muito Escuro
                    A2: '#003300', // Verde Escuro
                    B1: '#004D00', // Verde Médio Escuro
                    B2: '#006600'  // Verde
                },
                starColor: '#FF00FF',     // Magenta
                numStars: 75,
                size: 0.003,
                rotationSpeed: 0.2
            },
            paddleColor: '#FF00FF', // Magenta
            brickColor: '#FF1493',  // Rosa Profundo
            ballColor: '#FFFF00'    // Amarelo
        }
    },
    // Level 12 - Foguete (Difícil)
    {
        levelBricks: [
            "             ",
            "      3      ",
            "      3      ",
            "  P   3   P  ",
            "   3  3  3   ",
            "    3 3 3    ",
            "     333     ",
            "      3      ",
            "      P      ",
        ],
        levelPalette: {
            background: {
                type: 'spiralGalaxy',
                baseBackground: {
                    type: 'radial',
                    center: { x: 0.5, y: 0.5 },
                    radius: 0.9,
                    A1: '#000000', // Preto
                    A2: '#0D0D0D', // Cinza Muito Escuro
                    B1: '#1A1A1A', // Cinza Escuro
                    B2: '#262626'  // Cinza Médio
                },
                spiralColor: '#FF4500',   // Laranja Vermelho
                arms: 4,
                rotationSpeed: 0.1,
            },
            paddleColor: '#FFFFFF', // Branco
            brickColor: '#FF4500',  // Laranja Vermelho
            ballColor: '#FFFF00'    // Amarelo
        }
    },
    // Level 13 - Satélite (Muito Difícil)
    {
        levelBricks: [
            "             ",
            "             ",
            "1 1       1 1",
            " 2 2     2 2 ",
            "  3 3   3 3  ",
            "   UPUPUPU   ",
            "  3 3   3 3  ",
            " 2 2     2 2 ",
            "1 1       1 1",
        ],
        levelPalette: {
            background: {
                type: 'animatedDots',
                baseBackground: {
                    type: 'linear',
                    direction: 'diagonal2',
                    A1: '#000033', // Azul Muito Escuro
                    A2: '#000066', // Azul Escuro
                    B1: '#000099', // Azul Médio
                    B2: '#0000CC'  // Azul
                },
                color: '#00BFFF',   // Azul Deep Sky
                density: 0.0001,
                speed: 50
            },
            paddleColor: '#FFFFFF', // Branco
            brickColor: '#00BFFF',  // Azul Deep Sky
            ballColor: '#00FFFF'    // Água
        }
    },
    // Level 14 - Buraco Negro (Difícil)
    {
        levelBricks: [
            "             ",
            "    11111    ",
            "   PU1U1UP   ",
            "  2222P2222  ",
            " 3P333P333P3 ",
            " 3P333P333P3 ",
            "  2222P2222  ",
            "   PU1U1UP   ",
            "    11111    ",
        ],
        levelPalette: {
            background: {
                type: 'spiralGalaxy',
                baseBackground: {
                    type: 'radial',
                    center: { x: 0.5, y: 0.5 },
                    radius: 1.0,
                    A1: '#0D0D0D', // Muito Preto (centro do buraco negro)
                    A2: '#4B0082', // Índigo Escuro (horizonte de eventos)
                    B1: '#800080', // Roxo (disco de acreção)
                    B2: '#C71585'  // Rosa Médio-Violeta (emissão externa)
                },
                spiralColor: '#C71585', // Rosa Médio-Violeta (braços da galáxia)
                arms: 5,
                rotationSpeed: 0.2,
                glowEffect: true,
            },
            paddleColor: '#FFFFFF', // Branco (paddle)
            brickColor: '#FF69B4',  // Rosa Choque (bricks)
            ballColor: '#FFB6C1'    // Rosa Claro (bola)
        }
    },
    // Level 15 - DNA (Difícil)
    {
        levelBricks: [
            "             ",
            "             ",
            "1   P   P   2",
            " 1 2     1 2 ",
            "  12       12",
            "   U       U ",
            "  12       12",
            " 1 2     1 2 ",
            "1   P   P   2",
        ],
        levelPalette: {
            background: {
                type: 'spiralGalaxy',
                baseBackground: {
                    type: 'radial',
                    center: { x: 0.5, y: 0.5 },
                    radius: 0.8,
                    A1: '#002B36', // Azul Petróleo Muito Escuro
                    A2: '#073642', // Azul Petróleo Escuro
                    B1: '#268BD2', // Azul Ciano
                    B2: '#2AA198'  // Azul Ciano Claro
                },
                spiralColor: '#FFD700',   // Ouro
                arms: 2,
                rotationSpeed: 0.1,
            },
            paddleColor: '#FFFFFF', // Branco Neve
            brickColor: '#FFD700',  // Ouro
            ballColor: '#00CED1'    // Turquesa Escuro
        }
    },
    // Level 16 - Circuito Complexo (Extremo)
    {
        levelBricks: [
            "2 2 2 2 2 2 2 2",
            " UUU UUU UUU 22",
            "  P   P   P   P",
            " UUU UUU UUU 22",
            "P 2 P 2 P 2 P 2",
            "               ",
            "               ",
        ],
        levelPalette: {
            background: {
                type: 'concentricCircles',
                baseBackground: {
                    type: 'radial',
                    center: { x: 0.5, y: 0.5 },
                    radius: 0.9,
                    A1: '#000428', // Azul noturno profundo
                    A2: '#004e92', // Azul elétrico médio
                    B1: '#002244', // Azul tecnológico
                    B2: '#001133'  // Azul digital escuro
                },
                colors: ['#00ff88', '#00ffcc', '#33ffaa'], // Verde neon, Ciano digital, Verde tech
                speed: 0.3,
                spacing: 0.05 // Círculos mais próximos
            },
            paddleColor: '#00FF00', // Verde Limão
            brickColor: '#7CFC00',  // Verde Grama
            ballColor: '#ADFF2F'    // Amarelo-Verde
        }
    },
    // Level 17 - Planeta com Anéis Duplos (Extremo)
    {
        levelBricks: [
            "     UU     ",
            "    PUUP    ",
            "   33UU33   ",
            "  P33UU33P  ",
            " 3333UU3333 ",
            "P3333UU3333P",
            " 3333UU3333 ",
            "  P33UU33P  ",
            "   33UU33   ",
            "    PUUP    ",
            "     UU     ",
        ],
        levelPalette: {
            background: {
                type: 'squareTunnel',
                baseBackground: {
                    type: 'radial-dual',
                    center1: { x: 0.5, y: 0.5 },
                    radius1: 0.5,
                    colors1: ['#2F004F', '#000000'], // Roxo Escuro ao Preto
                    center2: { x: 0.5, y: 0.5 },
                    radius2: 1.0,
                    colors2: ['#000000', '#2F004F'], // Preto ao Roxo Escuro
                    pulse: true
                },
                color: '#FF0000',     // Vermelho (Quadrados)
                speed: 0.1
            },
            paddleColor: '#FFD700', // Ouro
            brickColor: '#FFA500',  // Laranja
            ballColor: '#FFFFFF'    // Branco
        }
    },
    // Level 18 - Olho Cibernético (Extremo)
    {
        levelBricks: [
            "             ",
            "    33333    ",
            "  UU     UU  ",
            " U   P1P   U ",
            "1   23332   1",
            "1   23331   1",
            " U   P1P   U ",
            "  UU     UU  ",
            "    33333    ",
        ],
        levelPalette: {
            background: {
                type: 'waves',
                baseBackground: {
                    type: 'radial',
                    center: { x: 0.5, y: 0.5 },
                    radius: 0.8,
                    A1: '#000000', // Preto
                    A2: '#1C1C1C', // Cinza Muito Escuro
                    B1: '#00FF00', // Verde
                    B2: '#008000'  // Verde Escuro
                },
                color: '#00FF00',     // Verde para as ondas
                frequency: 3,         // Mais ondas
                speed: 0.15,         // Movimento suave
                amplitude: 0.08,      // Ondas mais pronunciadas
                waveCount: 5,        // Número de ondas
                glowIntensity: 0.5   // Adiciona brilho às ondas
            },
            paddleColor: '#00FF00', // Verde
            brickColor: '#FFFFFF',  // Branco
            ballColor: '#FFFFFF'    // Branco
        }
    },
    // Level 19 - Mão Robótica (Extremo)
    {
        levelBricks: [
            "             ",
            "             ",
            "3  3  P  3  3",
            " 3 3  U  3 3 ",
            "  P   U   P  ",
            " U 3  U  3 U ",
            "3  3  U  3  3",
            "      U      ",
            "      P      ",
        ],
        levelPalette: {
            background: {
                type: 'polygonTunnel',
                baseBackground: {
                    type: 'radial-dual',
                    center1: { x: 0.5, y: 0.5 },
                    radius1: 0.5,
                    colors1: ['#000000', '#005555'], // Preto ao Ciano Escuro
                    center2: { x: 0.5, y: 0.5 },
                    radius2: 1.0,
                    colors2: ['#005555', '#000000'], // Ciano Escuro ao Preto
                    pulse: false
                },
                color: '#00CED1',     // Turquesa Escuro
                numSides: 8,          // Octógonos
                speed: 0.1
            },
            paddleColor: '#00FFFF', // Ciano
            brickColor: '#00CED1',  // Turquesa Escuro
            ballColor: '#7FFFD4'    // Água-marinha
        }
    },
    
    // Level 20 - Portal Final (Extremo)
    {
        levelBricks: [
            "             ",
            "U U U UU U U ",
            "3P 3  3  3 P3",
            "33P 33333 P33",
            "3P 3  3  3 P3",
            "PUU 3 3 3 UUP",
            "      3      ",
            "    U U U    ",
        ],
        levelPalette: {
            background: {
                type: 'waveCircles',
                baseBackground: {
                    type: 'radial',
                    center: { x: 0.5, y: 0.5 },
                    radius: 1.0,
                    A1: '#000000', // Preto (centro)
                    A2: '#0D0D0D', // Preto Muito Escuro
                    B1: '#000428', // Cinza Escuro
                    B2: '#004e92'  // Cinza Médio
                },
                circleColors: ['#00FFFF', '#FF00FF', '#FFFF00', '#FF4500'], // Neon Ciano, Neon Magenta, Neon Amarelo, Neon Laranja
                waveColor: '#FFFFFF',     // Branco (para as ondas)
                circleSpacing: 0.05,      // Espaçamento menor para mais círculos
                waveFrequency: 3,         // Frequência das ondas aumentada para efeito psicodélico
                waveAmplitude: 0.07,      // Amplitude das ondas para maior distorção
                rotationSpeed: 0.3,       // Velocidade de rotação aumentada
                pulseIntensity: 0.2       // Intensidade da pulsação
            },
            ballColor: '#FF4500',  // Neon Laranja
            brickColor: {
                0: '#FF00FF',  // Neon Magenta
                1: '#00FFFF',  // Neon Ciano
                2: '#00FFFF',  // Neon Ciano
                3: '#00FFFF'   // Neon Ciano
            },
            paddleColor: '#FFFF00'    // Neon Amarelo
        }
    },

    // Level 21 - Abóbora de Halloween (Moderado)
    {
        levelBricks: [
            "             ",
            "    33333    ",
            "   3     3   ",
            "  3  P P  3  ",
            "  3   P   3  ",
            "  3       3  ",
            "  3       3  ",
            "  3  PPP  3  ",
            "   3     3   ",
            "    33333    "
        ],
        levelPalette: {
            background: {
                type: 'spooky', // Fundo assustador
                baseBackground: {
                    type: 'solid',
                    color: '#000000' // Preto
                },
                ghostColor: '#FFFFFF', // Cor dos fantasmas
                ghostCount: 20
            },
            paddleColor: '#FFA500', // Laranja
            brickColor: '#FF7F00', // Laranja
            ballColor: '#FFFF00'    // Amarelo
        }
    },

    // Level 22 - Bandeira do Japão (Fácil)
    {
        levelBricks: [
            "                     ",
            "  33333333333333333  ",
            "  3               3  ",
            "  3      PPP      3  ",
            "  3     P222P     3  ",
            "  3    P22222P    3  ",
            "  3     P222P     3  ",
            "  3      PPP      3  ",
            "  3               3  ",
            "  33333333333333333  ",
            "                     ",
            "                     ",
        ],
        levelPalette: {
            background: {
                type: 'snowfall',
                baseBackground: {
                    type: 'radial',
                    center: { x: 0.5, y: 0.5 },
                    radius: 1.0,
                    A1: '#EBEAF0', // Azul noite profundo
                    A2: '#C0E7E8', // Azul noite
                    B1: '#86B8F1', // Azul céu noturno
                    B2: '#478AF7'  // Azul noite profundo
                },
                snowColor: '#A9636B', // Vermelho para contraste
                snowflakeCount: 50,
                fallSpeed: 0.5,
                snowflakeSize: {
                    min: 0.005,
                    max: 0.009
                },
                twinkleEffect: true
            },
            paddleColor: '#FFFFFF', // Branco vibrante para contraste
            brickColor: {
                0: '#FF0000', // Branco para power-ups (P)
                2: '#FF0000', // Vermelho para o círculo central
                3: '#FFFFFF'  // Branco para a moldura
            },
            ballColor: '#FF0000'    // Vermelho para combinar com o círculo
        }
    },

    // Level 23 - Cogumelo
    {
        levelBricks: [
            "        33P3        ",
            "      3P333333      ",
            "     33333333P3     ",
            "    3P3333P33333    ",
            "    333333333P33    ",
            "         22         ",
            "         22         ",
            "         22         ",
            "         22         ",
            "1 1 1 1 1 1 1 1 1 1 ",
            " 1 1 1 1 1 1 1 1 1 1",
        ],
        levelPalette: {
            background: {
                type: 'forestGlow',
                baseBackground: {
                    type: 'linear', 
                    direction: 'vertical',
                    A1: '#003300', // Verde Vibrante
                    A2: '#004400',  // Verde Escuro
                    B1: '#4B3621', // Marrom (terra)
                    B2: '#302807', // Marrom escuro (sombra)
                },
                glowColor: '#00FF00', // Verde vivo para brilhar
                glowIntensity: 0.3,   // Intensidade suave
                mistEffect: true,     // Névoa para simular floresta
            },
            paddleColor: '#FFFFFF', // Branco vibrante
            brickColor: {
                0: '#FFFFFF', // Branco vibrante (powerups)
                1: '#8B4513', // Marrom (terra)
                2: '#FFFFFF',  // Cinza (corpo do cogumelo)
                3: '#A82223', // Vermelho (chapéu do cogumelo)
            },
            ballColor: '#FFFF00'    // Amarelo brilhante
        }
    },

    // Level 24 - Homenagem ao Xbox Original (Moderado)
    {
        levelBricks: [
            "P           P",
            " 3         3 ",
            "  3       3  ",
            "   3     3   ",
            "    3 3 3    ",
            "     PPP     ",
            "    3 3 3    ",
            "   3     3   ",
            "  3       3  ",
            " 3         3 ",
            "P           P"
        ],
        levelPalette: {
            background: {
                type: 'radial',
                center: { x: 0.55, y: 0.375 },
                radius: 0.175,
                A1: '#FFFFFF', // Branco no centro
                A2: '#808080', // Cinza médio
                B1: '#000000', // Cinza escuro
                B2: '#000000'  // Preto nas bordas
            },
            paddleColor: '#00FF00', // Verde brilhante
            brickColor: '#00FF00', // Verde brilhante
            ballColor: '#00FF00' // Verde brilhante
        }
    },

    // Level 25 - Ondas do Oceano (Moderado)
    {
        levelBricks: [
            "    P   P   ",
            "  33U3U3U33 ",
            " 3322222233 ",
            "  2P2P2P2P2 ",
            " 2211111222 ",
            "  1P1111P1  ",
            " U11111111U ",
            "   P     P  "
        ],
        levelPalette: {
            background: {
                type: 'waves',
                baseBackground: {
                    type: 'linear', 
                    direction: 'vertical',
                    A1: '#87CEEB', // Azul céu claro
                    A2: '#B0E0E6', // Azul pó
                    B1: '#E0FFFF', // Ciano claro
                    B2: '#F0F8FF'  // Azul alice
                },
                color: '#1E90FF',
                frequency: 2,
                speed: 0.2
            },
            paddleColor: '#0000FF',
            brickColor: {
                0: '#00FFFF',  // Ciano brilhante (powerups como espuma do mar)
                1: '#00BFFF', // Azul Céu Profundo (ondas mais próximas)
                2: '#4169E1', // Azul Royal (ondas médias)
                3: '#000080'  // Azul Marinho (ondas distantes)
            },
            ballColor: '#000080'
        }
    },
    
    // Level 26 - Fortaleza Arkanoid (Difícil)
    {
        levelBricks: [
            "           ",
            "U  P111P  U",
            "3 222P222 3", 
            "3P2     2P3",
            "312     2P3",
            "321 U U 123",
            "3P2     213",
            "312     2P3",
            "3 222P222 3",
            "U  P111P  U"
        ],
        levelPalette: {
            background: {
                type: 'crystalCave',
                baseBackground: {
                    type: 'radial',
                    center: { x: 0.5, y: 0.5 },
                    radius: 0.9,
                    A1: '#000000', // Preto total
                    A2: '#0D0221', // Roxo muito escuro
                    B1: '#1A0F3C', // Roxo escuro
                    B2: '#28174D'  // Roxo médio escuro
                },
                crystalColor: '#DDA0DD', // Plum claro
                glowIntensity: 0.5
            },
            paddleColor: '#E6E6FA', // Lavender
            brickColor: {
                0: '#FFF0F5', // Lavender blush
                1: '#DDA0DD', // Plum 
                2: '#DA70D6', // Orchid
                3: '#BA55D3'  // Medium orchid
            },
            ballColor: '#E6E6FA' // Lavender
        }
    },

    // Level 27 - Árvore de Natal (Festivo)
    {
        levelBricks: [
            "        P        ",
            "       232       ",
            "      3P323      ",
            "     3232223     ",
            "    232P33P33    ",
            "   33P33333232   ",
            "  2323P232P3333  ",
            "        1        ",
            "        1        ",
            "        1        ",
        ],
        levelPalette: {
            background: {
                type: 'snowfall',
                baseBackground: {
                    type: 'radial',
                    center: { x: 0.5, y: 0.5 },
                    radius: 1.0,
                    A1: '#000000', // Azul noite profundo
                    A2: '#002D5E', // Azul noite
                    B1: '#000000', // Azul céu noturno
                    B2: '#001B3B'  // Azul noite profundo
                },
                snowColor: '#FFFFFF',
                snowflakeCount: 200,
                fallSpeed: 0.7,
                snowflakeSize: {
                    min: 0.002,
                    max: 0.004
                },
                twinkleEffect: true
            },
            paddleColor: '#ff0000', // Vermelho
            brickColor: {
                0: '#B59410',  // Luzes da árvore
                1: '#8B4513',  // Marrom (tronco)
                2: '#0F5F0F',  // Verde escuro (parte interna da árvore)
                3: '#0F5F0F'   // Verde escuro (parte externa da árvore)
            },
            ballColor: '#ff0000'    // Vermelho
        }
    },

    // Level 28 - Paredes Centrais (Moderado)
    {
        levelBricks: [
            "           ",
            "           ",
            "3P2 2P2 2P3",
            "312 212 213",
            "3P2 2P2 2P3",
            "312 212 213",
            "3P2 2P2 2P3",
            "312 212 213"
        ],
        levelPalette: {
            background: {
                type: 'squareTunnel',
                baseBackground: {
                    type: 'radial-dual',
                    center1: { x: 0.5, y: 0.5 },
                    radius1: 0.5,
                    colors1: ['#0D0221', '#180436'], // Manter as cores roxas escuras originais
                    center2: { x: 0.5, y: 0.5 },
                    radius2: 1.0,
                    colors2: ['#240645', '#2F0B54'], // Manter as cores roxas médias originais
                    pulse: true
                },
                color: '#9D4EDD',     // Roxo neon suave para os quadrados
                speed: 0.15,
                tunnelSize: 0.8,
                glowIntensity: 0.4
            },
            paddleColor: '#FFB800', // Laranja neon (contrasta bem com o fundo roxo)
            brickColor: {
                0: '#9D4EDD',  // Roxo neon (powerups como portais)
                1: '#23C9FF', // Azul ciano brilhante
                2: '#FFB800', // Amarelo âmbar
                3: '#FF3366'  // Rosa avermelhado
            },
            ballColor: '#FFFFFF'    // Branco para máxima visibilidade
        }
    },

    // Level 29 - Espiral (Difícil)
    {
        levelBricks: [
            "P33333333UUUP",
            "U           3",
            "U           3",
            "U  P22U22P  3",
            "U  1     1  3", 
            "U        1  3",
            "U22222222P  3",
            "            3",
            "            3",
            "   P333333333",
        ],
        levelPalette: {
            background: {
                type: 'spiral',
                baseBackground: {
                    type: 'radial',
                    center: { x: 0.5, y: 0.5 },
                    radius: 0.9,
                    A1: '#000428', // Azul profundo
                    A2: '#004e92', // Azul elétrico  
                    B1: '#00c6ff', // Ciano brilhante
                    B2: '#0072ff'  // Azul neon
                },
                spiralColor: '#00ff88', // Verde neon brilhante
                rotationSpeed: 0.15
            },
            paddleColor: '#00ffbb', // Turquesa neon
            brickColor: {
                0: '#ffffff',  // Branco brilhante (powerups como flashes de energia)
                1: '#00ff88', // Verde neon
                2: '#00ffcc', // Ciano brilhante
                3: '#00ddff'  // Azul celeste neon
            },
            ballColor: '#ffffff'    // Branco puro
        }
    },

    // Level 30 - Bandeira do Brasil (Difícil)
    {
        levelBricks: [
            "           ",
            "           ",
            " 222222222 ",
            " 223333322 ",
            " 233PPP332 ",
            " 33PPPPP33 ",
            " 233PPP332 ",
            " 222333222 ",
            " 222222222 "
        ],
        levelPalette: {
            background: {
                type: 'waveCircles',
                baseBackground: {
                    type: 'radial',
                    center: { x: 0.5, y: 0.5 },
                    radius: 0.9,
                    A1: '#000000', // Preto
                    A2: '#007A2E', // Verde mais escuro
                    B1: '#002776', // Azul Brasil
                    B2: '#000000'  // Preto
                },
                circleColors: ['#009C3B', '#002776', '#FFDF00'], // Verde, Azul e Amarelo
                waveColor: '#FFFFFF',     // Ondas brancas
                circleSpacing: 0.08,      
                waveFrequency: 2,         
                waveAmplitude: 0.05,      
                rotationSpeed: 0.1,       
                pulseIntensity: 0.2       
            },
            paddleColor: '#FFFFFF',
            brickColor: {
                0: '#FFFFFF',  // Branco (estrelas)
                1: '#002776',  // Azul Central
                2: '#009C3B',  // Verde
                3: '#FFDF00'   // Amarelo
            },
            ballColor: '#FFFFFF'
        }
    },

    // Level 31 - Pirâmide do Deserto (Fácil) 
    {
        levelBricks: [
            "                   ",
            "         P         ",
            "        1P1        ",
            "       12P21       ",
            "      122P221      ",
            "     1233P3321     ",
            "    12333P33321    ",
            "   123333P333321   ",
            "  1233333P3333321  ",
        ],
        levelPalette: {
            background: {
                type: 'triangleTunnel',
                baseBackground: {
                    type: 'radial',
                    center: { x: 0.5, y: 0.5 },
                    radius: 1.0,
                    A1: '#FFFFFF', // Branco
                    A2: '#FDFD96', // Amarelo quente
                    B1: '#DAA520', // Dourado escuro
                    B2: '#FFFF00'  // Amarelo
                },
                color: '#D2B48C',    // Marrom areia
                speed: 0.16,         // Movimento simulando calor com vento
                radius: 0.2,
                glowIntensity: 0.3   // Brilho suave
            },
            paddleColor: '#4B3621', // Marrom areia
            brickColor: {
                0: '#F0E68C', // Amarelo claro (areia)
                1: '#C1936B', // Marrom areia
                2: '#EEE8AA', // Marfim
                3: '#F0E68C' // Amarelo claro (areia)
            },
            ballColor: '#4B3621' // Marrom areia
        }
    },

    // Level 32 - Castelo Encantado (Moderado)
    {
        levelBricks: [
            "UUU     UUU",
            "U111   111U", 
            "U1U1   1U1U",
            "U1U1   1U1U",
            "U1U1   1U1U",
            "U1111P1111U",
            "U1U1U1U1U1U",
            "U1U1U1U1U1U",
            "U1U1U1U1U1U",
            "U1111P1111U",
            "U         U"
        ],
        levelPalette: {
            background: {
                type: 'animatedCheckerboard',
                color1: '#905000', // Marrom mais claro
                color2: '#aa6300', // Marrom amarelado
                animationSpeed: 0.1
            },
            paddleColor: '#4B3621', // Marrom escuro
            brickColor: {
                0: '#ffd700', // Dourado para power-ups
                1: '#fb4c0d'  // Laranja para o castelo
            },
            ballColor: '#ffcc00' // Amarelo dourado
        }
    },

    // Level 33 - Labirinto Mágico (Difícil)
    {
        levelBricks: [
            "221131P311121",
            "2   111 1   3",
            "1 2P   11 1 2",
            "1P2 111 1 111",
            "2 1 1P1 3 1 1",
            "1 3   P1 2 1 ",
            "2P1 1 1 1 311",
            "1   2 1P1   2",
            "311211P211131"
        ],
        levelPalette: {
            background: {
                type: 'crystalCave',
                baseBackground: {
                    type: 'radial',
                    center: { x: 0.5, y: 0.5 },
                    radius: 0.9,
                    A1: '#000033', // Azul noturno profundo
                    A2: '#001a4d', // Azul safira escuro
                    B1: '#002b80', // Azul real profundo
                    B2: '#003399'  // Azul safira médio
                },
                crystalColor: '#00ffff',    // Ciano brilhante (cristais de água)
                glowIntensity: 0.6         // Brilho mais intenso
            },
            paddleColor: '#4169E1', // Azul royal
            brickColor: '#00bfff', // Azul ciano brilhante
            ballColor: '#00ffff' // Ciano brilhante
        }
    },

    // Level 34 - Time Portal (Moderado)
    {
        levelBricks: [
            "           ",
            "           ",
            "  P  U  P  ",
            " 232 3 232 ",
            "23P32323P32",
            "2P3U212U3P2",
            "23P32323P32",
            " 232 3 232 ",
            "  P  U  P  "
        ],
        levelPalette: {
            background: {
                type: 'vortex',
                baseBackground: {
                    type: 'radial',
                    center: { x: 0.5, y: 0.5 },
                    radius: 0.9,
                    A1: '#0B0033', // Roxo escuro profundo
                    A2: '#1A0066', // Índigo profundo
                    B1: '#2E0080', // Roxo médio profundo
                    B2: '#4600B2'  // Roxo vibrante
                },
                vortexColor: '#9933FF', // Roxo neon brilhante
                rotationSpeed: 0.2,
                pulseRate: 0.5
            },
            paddleColor: '#FF00FF', // Magenta
            brickColor: {
                1: '#CC33FF', // Roxo claro
                2: '#9933FF', // Roxo médio
                3: '#6600CC'  // Roxo escuro
            },
            ballColor: '#FF66FF' // Rosa brilhante
        }
    },

    // Level 35 - Prédio Noturno (Moderado)
    {
        levelBricks: [
            "       UUU       ", // Topo
            "      32223      ", // Andar superior
            "     32P2P23     ",
            "     3222223     ",
            "     32P2P23     ",
            "     3222223     ",
            "     32P2P23     ",
            "     3222223     ", // Térreo
            "  P  32P2P23  P  ", // Base
            "  U  3222223  U  ",
            "11111333333311111"  // Calçada"

        ],
        levelPalette: {
            background: {
                type: 'rotatingStars',
                baseBackground: {
                    type: 'linear',
                    direction: 'diagonal',
                    A1: '#0000CC', // Azul claro
                    A2: '#2b2b80', // Azul Acinzentado
                    B1: '#000099', // Azul
                    B2: '#000066'  // Azul escuro
                },
                starColor: '#FFFFFF', // Estrelas brancas
                numStars: 50,        // Mais estrelas
                size: 0.002,         // Estrelas bem pequenas
                rotationSpeed: 0.02   // Rotação lenta
            },
            paddleColor: '#E6E6FA',   // Lavanda
            brickColor: {
                0: '#FFFF00',  // Dourado para powerups
                1: '#999999',  // Cinza para calçada
                2: '#2F4F4F',  // Cinza ardósia escuro para estrutura
                3: '#2F4F4F'   // Cinza ardósia escuro para estrutura
            },
            ballColor: '#E6E6FA'      // Lavanda
        }
    }

];