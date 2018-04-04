(function() {

    const KEY_SPACEBAR = 32;

    const GAME_SIZE_WIDTH = 640;
    const GAME_SIZE_HEIGHT = 480;

    const PLAYER_POS_X = 50;
    const PLAYER_POS_Y = 310;
    const PLAYER_SIZE_WIDTH = 43;
    const PLAYER_SIZE_HEIGHT = 94;
    const PLAYER_JUMP_SPEED = 4;
    const PLAYER_MIDPOINT = PLAYER_POS_X + (PLAYER_SIZE_WIDTH / 2)

    const OBSTACLE_STARTING_POS_X = 680;
    const OBSTACLE_STARTING_POS_Y = 375;
    const OBSTACLE_SIZE_WIDTH = 32;
    const OBSTACLE_SIZE_HEIGHT = 33;
    const OBSTACLE_MOVE_SPEED = 3.25;

    const MAX_FLOAT_TIME = 450;
    const MAX_JUMP_HEIGHT = 260;
    const MAX_OBSTACLES = 4;
    const MIN_OBSTACLE_DISTANCE = GAME_SIZE_WIDTH - 100;

    const canvas = document.getElementById('game-surface');
    const context = canvas.getContext("2d");

    const SPRITE_SPENSAUR = document.getElementById('spensaur');
    const SPRITE_OBSTACLE = document.getElementById('obstacle');

    var obstacles = [];

    var isGameFinished = false;
    var isPlayerJumping = false;

    var isKeyPressed = false;
    var currentPlayerPositionY = PLAYER_POS_Y;
    var playerScore = 0;

    function startGame() {
        registerControls();
        requestAnimationFrame(doFrameRender);
    };

    function registerControls() {
        var timeLock = null;
        window.onkeydown = function(e) {
            if (isKeyPressed || !isSpacebarEvent(e)) {
                return;
            }

            isPlayerJumping = true;
            isKeyPressed = true;

            clearTimeout(timeLock);
            timeLock = setTimeout(function() {
                isPlayerJumping = false;
            }, MAX_FLOAT_TIME);
        };
    };

    function isSpacebarEvent(e) {
        let key = e.keyCode ? e.keyCode : e.which;
        return KEY_SPACEBAR == key;
    };

    function doFrameRender() {
        if (isGameFinished) {
            canvas.className = "side-scrolling-bg";
            return;
        }

        updateState();
        renderCanvas();
        requestAnimationFrame(doFrameRender);
    };

    function updateState() {
        if (playerHasCollision()) {
            isGameFinished = true;
            return;
        }

        updateJumpSpeed();
        moveObstacles();
        clearInactiveObstacles();

        if (isReadyForNextObstacle()) {
            addObstacle();
        }

        playerScore += 1;
    };

    function playerHasCollision() {
        for (let index=0; index < obstacles.length; index++) {
            if (isCollision(obstacles[index])) {
                return true;
            }
        }
        return false;
    };

    function isCollision(obstacle) {
        return isNearObstacle(obstacle) && !isAboveObstacle(obstacle);
    };

    function isNearObstacle(obstacle) {
        return PLAYER_MIDPOINT <= (obstacle.x + OBSTACLE_SIZE_WIDTH) && PLAYER_MIDPOINT >= obstacle.x;
    };

    function isAboveObstacle(obstacle) {
        return (currentPlayerPositionY + PLAYER_SIZE_HEIGHT) <= obstacle.y;
    };

    function updateJumpSpeed() {
        if (isPlayerJumping && currentPlayerPositionY > MAX_JUMP_HEIGHT) {
            currentPlayerPositionY -= PLAYER_JUMP_SPEED;
        } else if (currentPlayerPositionY <= PLAYER_POS_Y) {
            currentPlayerPositionY += PLAYER_JUMP_SPEED;
        } else {
            isKeyPressed = false;
        }
    };

    function moveObstacles() {
        for (var index=0; index < obstacles.length; index++) {
            obstacles[index].x -= OBSTACLE_MOVE_SPEED;
        }
    };

    function clearInactiveObstacles() {
        if (!obstacles.length) {
            return;
        }

        let firstObstacle = obstacles.shift();
        if (firstObstacle.x + OBSTACLE_SIZE_WIDTH >= 0) {
            obstacles.unshift(firstObstacle);
        }
    };

    function isReadyForNextObstacle() {
        let randomNumber = Math.floor(Math.random() * 100);
        let lastObstacleDistance = MIN_OBSTACLE_DISTANCE;
        if (obstacles.length > 0) {
            lastObstacleDistance = obstacles[obstacles.length - 1].x;
        }

        if (randomNumber < 4 && lastObstacleDistance <= MIN_OBSTACLE_DISTANCE) {
            return true;
        }
        return false;
    };

    function addObstacle() {
        if (obstacles.length >= MAX_OBSTACLES) {
            return;
        }

        obstacles.push({
            x: OBSTACLE_STARTING_POS_X,
            y: OBSTACLE_STARTING_POS_Y
        });
    };

    function renderCanvas() {
        context.clearRect(0, 0, GAME_SIZE_WIDTH, GAME_SIZE_HEIGHT);

        context.font = "30px Arial";
        context.fillText(playerScore, 20, 40);

        context.drawImage(SPRITE_SPENSAUR, PLAYER_POS_X, currentPlayerPositionY, PLAYER_SIZE_WIDTH, PLAYER_SIZE_HEIGHT);

        for (var index=0; index < obstacles.length; index++) {
            context.drawImage(SPRITE_OBSTACLE, obstacles[index].x, obstacles[index].y, OBSTACLE_SIZE_WIDTH, OBSTACLE_SIZE_HEIGHT);
        }
    };

    window.onload = function() {
        startGame();
    };

})();
