let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 60;
let birdHeight = 70;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//cake
let cakeImg;
let cake = null;
let cakeWidth = 50;
let cakeHeight = 50;

//physics
let velocityX = -2;
let velocityY = 0;
let gravity = 0.3;

let gameOver = false;
let score = 0;
let pipesPassed = 0;

// sound
let eatSound;

window.onload = function () {
    const startButton = document.getElementById('start-button');
    const startScreen = document.getElementById('start-screen');
    const canvas = document.getElementById('board');

    startButton.addEventListener('click', function () {
        startScreen.style.display = 'none';
        startGame();
    });

    // Adjust canvas size based on window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Add touch event listeners
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);
};

function startGame() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Load images
    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    cakeImg = new Image();
    cakeImg.src = "./cake.png";

    // Load sound
    eatSound = new Audio("./eat.mp3");

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); // Place pipes every 1.5 seconds
    document.addEventListener("keydown", moveBird);

    // Reset game variables
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    pipesPassed = 0;
    cake = null;
    gameOver = false;
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // Bird
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0); // Apply gravity to bird.y, limit bird.y to top of canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    // Pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; // 0.5 because there are 2 pipes
            pipe.passed = true;
            pipesPassed++;

            // Show cake after passing 5 pipes
            if (pipesPassed%3 === 0) {
                let topPipe = pipeArray[pipeArray.length - 2];
                let bottomPipe = pipeArray[pipeArray.length - 1];
                let cakeY = (topPipe.y + topPipe.height + bottomPipe.y) / 2 - cakeHeight / 2;
                cake = {
                    x: boardWidth,
                    y: cakeY,
                    width: cakeWidth,
                    height: cakeHeight
                };
            }
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    // Clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); // Remove first element from the array
    }

    // Cake
    if (cake) {
        cake.x += velocityX;
        context.drawImage(cakeImg, cake.x, cake.y, cake.width, cake.height);

        if (detectCollision(bird, cake)) {
            score += 5; // Bonus score for eating the cake
            cake = null; // Remove cake after it is eaten
            eatSound.play(); // Play the eating sound
        }

        // Remove cake if it goes off screen
        if (cake && cake.x < -cakeWidth) {
            cake = null;
        }
    }

    // Score
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    // Generate random Y position for top pipe
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        // Jump
        jump();
    }
}

function handleTouchStart(event) {
    // Prevent default touch behavior
    event.preventDefault();
    
    // Jump when touch starts
    jump();
}

function handleTouchEnd(event) {
    // Prevent default touch behavior
    event.preventDefault();

    // Reset game if it's over
    if (gameOver) {
        resetGame();
    }
}

function jump() {
    // Jump
    velocityY = -5;

    // Reset game if it's over
    if (gameOver) {
        resetGame();
    }
}

function resetGame() {
    // Reset game variables
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    pipesPassed = 0;
    cake = null;
    gameOver = false;
}



function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}
