const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Trạng thái game
let gameState = "start"; // "start", "playing", "gameover"

// Tàu vũ trụ
const player = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    width: 40,
    height: 40,
    speed: 3,
    dx: 0
};

// Đạn
const bullets = [];
const bulletSpeed = -5;

// Thiên thạch
const asteroids = [];
const asteroidSpeed = 1.5;

// Ngôi sao (nền)
const stars = [];
for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2
    });
}

// Điều khiển
let rightPressed = false;
let leftPressed = false;
let spacePressed = false;

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
    if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
    if (e.key === " ") spacePressed = true;
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
    if (e.key === " ") spacePressed = false;
}

// Vẽ nền không gian với sao
function drawBackground() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Vẽ tàu vũ trụ
function drawPlayer() {
    ctx.fillStyle = "silver";
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x - player.width / 2, player.y + player.height);
    ctx.lineTo(player.x + player.width / 2, player.y + player.height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "orange";
    ctx.fillRect(player.x - 5, player.y + player.height, 10, 10);
}

// Vẽ đạn
function drawBullets() {
    ctx.fillStyle = "yellow";
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Vẽ thiên thạch
function drawAsteroids() {
    asteroids.forEach(asteroid => {
        ctx.fillStyle = "gray";
        ctx.beginPath();
        ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "darkgray";
        ctx.beginPath();
        ctx.arc(asteroid.x, asteroid.y, asteroid.radius * 0.8, 0, Math.PI * 2);
        ctx.stroke();
    });
}

// Giao diện bắt đầu
function drawStartScreen() {
    drawBackground();
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Space Ship Game", canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = "20px Arial";
    ctx.fillText("Click to Start", canvas.width / 2, canvas.height / 2 + 20);
}

// Giao diện game over
function drawGameOverScreen() {
    drawBackground();
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = "20px Arial";
    ctx.fillText("Click to Play Again", canvas.width / 2, canvas.height / 2 + 20);
}

// Di chuyển tàu
function movePlayer() {
    player.dx = 0;
    if (rightPressed && player.x + player.width / 2 < canvas.width) player.dx = player.speed;
    if (leftPressed && player.x - player.width / 2 > 0) player.dx = -player.speed;
    player.x += player.dx;
}

// Tạo đạn
function shootBullet() {
    if (spacePressed) {
        bullets.push({ x: player.x, y: player.y - 10 });
        spacePressed = false;
    }
}

// Di chuyển đạn
function moveBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y += bulletSpeed;
        if (bullet.y < 0) bullets.splice(index, 1);
    });
}

// Tạo thiên thạch (giảm xác suất từ 0.03 xuống 0.01)
function spawnAsteroid() {
    if (Math.random() < 0.01) { // Giảm số lượng thiên thạch
        const radius = 20 + Math.random() * 20;
        asteroids.push({
            x: Math.random() * (canvas.width - radius * 2) + radius,
            y: -radius,
            radius: radius
        });
    }
}

// Di chuyển thiên thạch
function moveAsteroids() {
    asteroids.forEach((asteroid, index) => {
        asteroid.y += asteroidSpeed;
        if (asteroid.y - asteroid.radius > canvas.height) asteroids.splice(index, 1);
    });
}

// Kiểm tra va chạm
function checkCollisions() {
    asteroids.forEach((asteroid, aIndex) => {
        bullets.forEach((bullet, bIndex) => {
            const dist = Math.hypot(bullet.x - asteroid.x, bullet.y - asteroid.y);
            if (dist < asteroid.radius) {
                asteroids.splice(aIndex, 1);
                bullets.splice(bIndex, 1);
            }
        });

        const dist = Math.hypot(player.x - asteroid.x, player.y - asteroid.y);
        if (dist < asteroid.radius + player.width / 2) {
            gameState = "gameover";
        }
    });
}

// Reset game
function resetGame() {
    player.x = canvas.width / 2;
    bullets.length = 0;
    asteroids.length = 0;
    gameState = "playing";
}

// Xử lý click
canvas.addEventListener("click", () => {
    if (gameState === "start" || gameState === "gameover") {
        resetGame();
    }
});

// Vòng lặp game
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === "start") {
        drawStartScreen();
    } else if (gameState === "playing") {
        drawBackground();
        drawPlayer();
        drawBullets();
        drawAsteroids();

        movePlayer();
        shootBullet();
        moveBullets();
        spawnAsteroid();
        moveAsteroids();
        checkCollisions();
    } else if (gameState === "gameover") {
        drawGameOverScreen();
    }

    requestAnimationFrame(update);
}

update();