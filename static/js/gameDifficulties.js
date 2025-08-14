let gameDifficulties = [
    {
        difficultyName: "Relax", // Easy
        initialLives: 3,
        speedMultiplier: 0.9,
        speedIncreaseRate: 0.001, // 0,1%
        speedIncreaseInterval: 10000, // segundos
        speedMaxMultiplier: 1,
        scoreMultiplier: 0.5,
        ballSizeMultiplier: 1.2,
        padSizeMultiplier: 1.25,
    },
    {
        difficultyName: "Normal", // Normal
        initialLives: 2,
        speedMultiplier: 1.15,
        speedIncreaseRate: 0.1, // 10%
        speedIncreaseInterval: 60, // segundos
        speedMaxMultiplier: 1.5,
        scoreMultiplier: 1,
        ballSizeMultiplier: 1.1,
        padSizeMultiplier: 1.1,
    },
    {
        difficultyName: "Hard", // Hard
        initialLives: 1,
        speedMultiplier: 1.65,
        speedIncreaseRate: 0.1, // 10%
        speedIncreaseInterval: 60, // segundos
        speedMaxMultiplier: 2,
        scoreMultiplier: 2.5,
        ballSizeMultiplier: 1,
        padSizeMultiplier: 1,
    },
    {
        difficultyName: "Insane", // Legendary
        initialLives: 0,
        speedMultiplier: 2,
        speedIncreaseRate: 0.20, // %
        speedIncreaseInterval: 30, // segundos
        speedMaxMultiplier: 3,
        scoreMultiplier: 5,
        ballSizeMultiplier: 0.8,
        padSizeMultiplier: 0.8,
    }
];
let difficultyConfig = gameDifficulties[0];