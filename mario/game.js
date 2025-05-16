// Game canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const levelDisplay = document.getElementById('levelDisplay');
const scoreDisplay = document.getElementById('scoreDisplay');
const livesDisplay = document.getElementById('livesDisplay');

// Game variables
const gravity = 0.5;
const friction = 0.9;
let score = 0;
let lives = 3;
let currentLevel = 1;
let gameComplete = false;
let gameOver = false;
let invulnerable = false;
let invulnerableTimer = 0;
const keys = {
    right: false,
    left: false,
    up: false
};

// Player object
const player = {
    x: 50,
    y: 300,
    width: 40,
    height: 60,
    velX: 0,
    velY: 0,
    speed: 5,
    jumping: false,
    color: '#e52521',
    draw() {
        // Flash when invulnerable
        if (invulnerable && Math.floor(invulnerableTimer / 5) % 2 === 0) {
            ctx.fillStyle = '#ffffff';
        } else {
            ctx.fillStyle = this.color;
        }
        
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw face (simple)
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 10, this.y + 10, 5, 5); // eye
        ctx.fillRect(this.x + 25, this.y + 10, 5, 5); // eye
        ctx.fillRect(this.x + 15, this.y + 25, 10, 5); // mouth
    },
    update() {
        // Apply friction
        this.velX *= friction;
        
        // Apply gravity
        this.velY += gravity;
        
        // Handle key presses
        if (keys.right) this.velX = this.speed;
        if (keys.left) this.velX = -this.speed;
        if (keys.up && !this.jumping) {
            this.velY = -12;
            this.jumping = true;
        }
        
        // Update position
        this.x += this.velX;
        this.y += this.velY;
        
        // Boundary checks
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) {
            // Check if player reached the end of the level
            if (allCoinsCollected()) {
                nextLevel();
            } else {
                this.x = canvas.width - this.width;
            }
        }
        
        // Ground check
        if (this.y + this.height > canvas.height - 50) {
            this.y = canvas.height - 50 - this.height;
            this.jumping = false;
        }
        
        // Check if player fell off the screen
        if (this.y > canvas.height) {
            playerDie();
        }
    }
};

// Enemy object
class Enemy {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.direction = 1;
        this.color = '#00aa00';
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Simple eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 5, this.y + 5, 5, 5);
        ctx.fillRect(this.x + this.width - 10, this.y + 5, 5, 5);
    }
    
    update() {
        this.x += this.speed * this.direction;
        
        // Change direction if hitting platform edge
        let onPlatform = false;
        platforms.forEach(platform => {
            if (this.y + this.height >= platform.y && 
                this.y + this.height <= platform.y + 10 &&
                this.x + this.width > platform.x && 
                this.x < platform.x + platform.width) {
                
                onPlatform = true;
                
                if ((this.x <= platform.x && this.direction < 0) || 
                    (this.x + this.width >= platform.x + platform.width && this.direction > 0)) {
                    this.direction *= -1;
                }
            }
        });
        
        // Fall if not on platform
        if (!onPlatform && this.y + this.height < canvas.height - 50) {
            this.y += gravity;
        }
    }
}

// Hazard object
class Hazard {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = '#ff0000';
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Level designs
const levels = [
    { // Level 1
        platforms: [
            { x: 0, y: canvas.height - 50, width: canvas.width, height: 50, color: '#5c3317' },
            { x: 200, y: 250, width: 100, height: 20, color: '#5c3317' },
            { x: 400, y: 200, width: 100, height: 20, color: '#5c3317' },
            { x: 600, y: 150, width: 100, height: 20, color: '#5c3317' }
        ],
        coins: [
            { x: 250, y: 220, radius: 10, collected: false },
            { x: 450, y: 170, radius: 10, collected: false },
            { x: 650, y: 120, radius: 10, collected: false }
        ],
        enemies: [
            new Enemy(300, 230, 30, 30, 1.5)
        ],
        hazards: []
    },
    { // Level 2
        platforms: [
            { x: 0, y: canvas.height - 50, width: 150, height: 50, color: '#5c3317' },
            { x: 250, y: canvas.height - 100, width: 100, height: 20, color: '#5c3317' },
            { x: 400, y: canvas.height - 150, width: 100, height: 20, color: '#5c3317' },
            { x: 550, y: canvas.height - 200, width: 100, height: 20, color: '#5c3317' },
            { x: 700, y: canvas.height - 250, width: 100, height: 20, color: '#5c3317' }
        ],
        coins: [
            { x: 300, y: canvas.height - 130, radius: 10, collected: false },
            { x: 450, y: canvas.height - 180, radius: 10, collected: false },
            { x: 600, y: canvas.height - 230, radius: 10, collected: false },
            { x: 750, y: canvas.height - 280, radius: 10, collected: false }
        ],
        enemies: [
            new Enemy(350, canvas.height - 130, 30, 30, 2),
            new Enemy(600, canvas.height - 230, 30, 30, 1.5)
        ],
        hazards: [
            new Hazard(200, canvas.height - 60, 40, 10)
        ]
    },
    { // Level 3
        platforms: [
            { x: 0, y: canvas.height - 50, width: 100, height: 50, color: '#5c3317' },
            { x: 150, y: 300, width: 80, height: 20, color: '#5c3317' },
            { x: 300, y: 250, width: 80, height: 20, color: '#5c3317' },
            { x: 450, y: 200, width: 80, height: 20, color: '#5c3317' },
            { x: 600, y: 300, width: 80, height: 20, color: '#5c3317' },
            { x: 700, y: canvas.height - 50, width: 100, height: 50, color: '#5c3317' }
        ],
        coins: [
            { x: 190, y: 270, radius: 10, collected: false },
            { x: 340, y: 220, radius: 10, collected: false },
            { x: 490, y: 170, radius: 10, collected: false },
            { x: 640, y: 270, radius: 10, collected: false }
        ],
        enemies: [
            new Enemy(200, 270, 30, 30, 2),
            new Enemy(500, 170, 30, 30, 1.5),
            new Enemy(650, 270, 30, 30, 2)
        ],
        hazards: [
            new Hazard(400, 210, 80, 5),
            new Hazard(250, 320, 30, 30)
        ]
    }
];

let platforms = [...levels[0].platforms];
let coins = [...levels[0].coins];
let enemies = [...levels[0].enemies];
let hazards = [...levels[0].hazards];

// Check if all coins are collected
function allCoinsCollected() {
    return coins.every(coin => coin.collected);
}

// Draw platforms
function drawPlatforms() {
    platforms.forEach(platform => {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
}

// Check platform collisions
function checkPlatformCollisions() {
    player.jumping = true;
    
    platforms.forEach(platform => {
        if (player.velY > 0 && 
            player.y + player.height < platform.y + 10 && 
            player.y + player.height + player.velY > platform.y && 
            player.x + player.width > platform.x && 
            player.x < platform.x + platform.width) {
            
            player.y = platform.y - player.height;
            player.velY = 0;
            player.jumping = false;
        }
    });
}

// Draw coins
function drawCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.beginPath();
            ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#ffd700';
            ctx.fill();
            ctx.closePath();
        }
    });
}

// Check coin collisions
function checkCoinCollisions() {
    coins.forEach(coin => {
        if (!coin.collected && 
            player.x + player.width > coin.x - coin.radius && 
            player.x < coin.x + coin.radius && 
            player.y + player.height > coin.y - coin.radius && 
            player.y < coin.y + coin.radius) {
            
            coin.collected = true;
            score += 100;
            scoreDisplay.textContent = `Score: ${score}`;
        }
    });
}

// Draw enemies
function drawEnemies() {
    enemies.forEach(enemy => {
        enemy.draw();
    });
}

// Update enemies
function updateEnemies() {
    enemies.forEach(enemy => {
        enemy.update();
    });
}

// Draw hazards
function drawHazards() {
    hazards.forEach(hazard => {
        hazard.draw();
    });
}

// Check enemy and hazard collisions
function checkDeathCollisions() {
    if (invulnerable) return;
    
    // Check enemy collisions
    for (let enemy of enemies) {
        if (player.x + player.width > enemy.x && 
            player.x < enemy.x + enemy.width && 
            player.y + player.height > enemy.y && 
            player.y < enemy.y + enemy.height) {
            
            // Check if player is falling onto enemy (stomp)
            if (player.velY > 0 && player.y + player.height < enemy.y + 10) {
                // Stomp the enemy
                enemies = enemies.filter(e => e !== enemy);
                player.velY = -8; // Bounce
                score += 200;
                scoreDisplay.textContent = `Score: ${score}`;
            } else {
                playerDie();
            }
            return;
        }
    }
    
    // Check hazard collisions
    for (let hazard of hazards) {
        if (player.x + player.width > hazard.x && 
            player.x < hazard.x + hazard.width && 
            player.y + player.height > hazard.y && 
            player.y < hazard.y + hazard.height) {
            
            playerDie();
            return;
        }
    }
}

// Player death
function playerDie() {
    lives--;
    livesDisplay.textContent = `Lives: ${lives}`;
    
    if (lives <= 0) {
        gameOver = true;
    } else {
        // Make player invulnerable for a short time after death
        invulnerable = true;
        invulnerableTimer = 120; // 2 seconds at 60fps
        
        // Reset player position
        player.x = 50;
        player.y = 300;
        player.velX = 0;
        player.velY = 0;
    }
}

// Reset level (when player dies)
function resetLevel() {
    platforms = [...levels[currentLevel - 1].platforms];
    coins = [...levels[currentLevel - 1].coins];
    enemies = [...levels[currentLevel - 1].enemies];
    hazards = [...levels[currentLevel - 1].hazards];
    
    player.x = 50;
    player.y = 300;
    player.velX = 0;
    player.velY = 0;
    
    invulnerable = true;
    invulnerableTimer = 120;
}

// Advance to next level
function nextLevel() {
    currentLevel++;
    
    if (currentLevel <= levels.length) {
        levelDisplay.textContent = `Level: ${currentLevel}`;
        resetLevel();
    } else {
        // Game completed
        gameComplete = true;
        levelDisplay.textContent = "Game Complete!";
    }
}

// Draw game over screen
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width/2, canvas.height/2 - 50);
    ctx.font = '24px Arial';
    ctx.fillText(`Your score: ${score}`, canvas.width/2, canvas.height/2 + 20);
    ctx.fillText('Refresh to play again', canvas.width/2, canvas.height/2 + 60);
}

// Draw game complete screen
function drawGameComplete() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Congratulations!', canvas.width/2, canvas.height/2 - 50);
    ctx.font = '24px Arial';
    ctx.fillText(`You completed all levels with a score of ${score}!`, canvas.width/2, canvas.height/2 + 20);
    ctx.fillText('Refresh to play again', canvas.width/2, canvas.height/2 + 60);
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameOver) {
        drawGameOver();
    } else if (gameComplete) {
        drawGameComplete();
    } else {
        // Update invulnerability timer
        if (invulnerable) {
            invulnerableTimer--;
            if (invulnerableTimer <= 0) {
                invulnerable = false;
            }
        }
        
        // Update and draw
        player.update();
        updateEnemies();
        checkPlatformCollisions();
        checkCoinCollisions();
        checkDeathCollisions();
        
        drawPlatforms();
        drawCoins();
        drawEnemies();
        drawHazards();
        player.draw();
    }
    
    // Request next frame
    requestAnimationFrame(gameLoop);
}

// Event listeners for keyboard
window.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowRight':
            keys.right = true;
            break;
        case 'ArrowLeft':
            keys.left = true;
            break;
        case 'ArrowUp':
            keys.up = true;
            break;
    }
});

window.addEventListener('keyup', (e) => {
    switch(e.key) {
        case 'ArrowRight':
            keys.right = false;
            break;
        case 'ArrowLeft':
            keys.left = false;
            break;
        case 'ArrowUp':
            keys.up = false;
            break;
    }
});

// Start the game
gameLoop();