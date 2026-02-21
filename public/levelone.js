const initGame = function () {
    victory_screen.style.display = "none"
    player.style.display = "block";
    door.style.display = "block";

    // Constants for moving
    const gravity = 0.6
    const jumpStrength = 12
    const speed = 5

    // Position and movement variables
    let x = 0
    let y = 0
    let velX = 0
    let velY = 0
    let onGround = false

    const keys = {}

    // Level information which has platforms
    const playerHeight = 30;
    const groundHeight = 50;
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    const levels = [
        // LEVEL 1
        {
            playerStart: {x: 0, y: windowHeight - groundHeight - playerHeight},
            door: {x: windowWidth - 200, y: 50},
            platforms: [
                {x: 0, y: windowHeight - groundHeight, width: windowWidth, height: groundHeight}, //ground
                {x: 150, y: windowHeight - 150, width: 150, height: 20},
                {x: 350, y: windowHeight - 250, width: 120, height: 20},
                {x: 200, y: windowHeight - 350, width: 120, height: 20},
                {x: 400, y: windowHeight - 450, width: 120, height: 20},
                {x: 700, y: windowHeight - 370, width: 120, height: 20},
                {x: 850, y: windowHeight - 450, width: 120, height: 20},
                {x: 1000, y: windowHeight - 550, width: 120, height: 20},
                {x: windowWidth - 250, y: 50 + 45, width: 250, height: 20}
            ]
        }
    ]

    let currentLevel = null

    function loadLevel(level) {
        currentLevel = levels[0]; // Keep levels as a list to keep same js logic

        document.querySelectorAll('.platform').forEach(p => p.remove()) // Clear existing platforms

        // Set player start position and reset velocity
        x = currentLevel.playerStart.x
        y = currentLevel.playerStart.y
        velX = 0
        velY = 0

        // Create door
        door.style.left = `${currentLevel.door.x}px`
        door.style.top = `${currentLevel.door.y}px`

        // Create platforms
        currentLevel.platforms.forEach(p => {
            const platformDiv = document.createElement('div');
            platformDiv.classList.add('platform');
            platformDiv.style.position = 'absolute';
            platformDiv.style.left = `${p.x}px`;
            platformDiv.style.top = `${p.y}px`;
            platformDiv.style.width = `${p.width}px`;
            platformDiv.style.height = `${p.height}px`;
            document.body.appendChild(platformDiv);
        })
    }

    // Listen for key inputs
    window.addEventListener("keydown", (e) => {
        keys[e.key] = true
    })

    window.addEventListener("keyup", (e) => {
        keys[e.key] = false
    })

    // Check if two elements are overlapping, used for doors
    function overlaps(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        )
    }

    const showVictoryScreen = function() {
        victory_screen.style.display = "flex"

        const nextLevelButton = document.getElementById("next_level_button")
        const mainMenuButton = document.getElementById("main_menu_button")

        nextLevelButton.addEventListener("click", () => {
            victoryScreen.style.display = "none"

            const nextLevel = (levels.indexOf(currentLevel) + 1);
            loadLevel(nextLevel)
            
            update()
        })

        mainMenuButton.addEventListener("click", () => {
            window.location.href = "/";
        })
    }
    // Constantly updates game state 
    const update = function () {
        // Left and right movement
        if (keys["ArrowLeft"]) {
            velX = -speed
        } else if (keys["ArrowRight"]) {
            velX = speed
        } else {
            velX = 0
        }

        // Move character up
        if (keys["ArrowUp"] && onGround) {
            velY = -jumpStrength
            onGround = false
        }

        // Apply gravity
        velY += gravity

        // Apply velocity
        x += velX

        currentLevel.platforms.forEach(p => { 
            const playerRight = x + player.offsetWidth 
            const playerLeft = x 
            const platformRight = p.x + p.width 
            const platformLeft = p.x 

            // Check if player is overlapping vertically with platform to handle horizontal collisions
            const overlapY = y + player.offsetHeight > p.y && y < p.y + p.height 
            
            // Checks for horizontal collisions with platforms and updated player position accordingly
            if (overlapY) {
                // Hitting left side of platform
                if (velX > 0 && playerRight > platformLeft && playerLeft < platformLeft) { 
                    x = platformLeft - player.offsetWidth
                } 
                
                // Hitting right side of platform
                if (velX < 0 && playerLeft < platformRight && playerRight > platformRight) { 
                    x = platformRight 
                } 
            }
        })

        y += velY
        onGround = false

        currentLevel.platforms.forEach(p => { 
            const playerBottom = y + player.offsetHeight 
            const playerTop = y 
            const platformTop = p.y
            const platformBottom = p.y + p.height

            // Check if player is overlapping horizontally with platform to handle vertical collisions
            const overlapX = x + player.offsetWidth > p.x && x < p.x + p.width 
            
            // Checks for vertical collisions with platforms and updated player position and velocity accordingly
            if (overlapX) { 
                // Landing on top of platform
                if (velY > 0 && playerBottom > platformTop && playerTop < platformTop) { 
                    y = platformTop - player.offsetHeight 
                    velY = 0 
                    onGround = true 
                } 
                
                // Hitting bottom of platform
                if (velY < 0 && playerTop < platformBottom && playerBottom > platformBottom) { 
                    y = platformBottom 
                    velY = 0 
                } 
            } 
        })


        // Check for collisions with window bounds
        if (x < 0) {
            x = 0
        }

        if (x + player.offsetWidth > window.innerWidth) {
            x = window.innerWidth - player.offsetWidth
        }

        // Render player
        player.style.left = `${x}px`
        player.style.top = `${y}px`

        // Get player coords
        const playerRect = {
            x: x,
            y: y,
            width: player.offsetWidth,
            height: player.offsetHeight
        }

        // Get door coords
        const doorRect = {
            x: door.offsetLeft,
            y: door.offsetTop,
            width: door.offsetWidth,
            height: door.offsetHeight
        }

        // Check if colliding and set door color accordingly
        if (overlaps(playerRect, doorRect)) {
            door.style.backgroundColor = "red"

            showVictoryScreen()
            
            return
        } else {
            door.style.backgroundColor = "black"
        }

        requestAnimationFrame(update)
    }
    
    loadLevel(0)
    update()
}

window.onload = function () {
    // Show game on load
    initGame()
}