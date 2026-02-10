// FRONT-END (CLIENT) JAVASCRIPT HERE

const startMenu = document.getElementById("start_menu")

const initStartMenu = function() {
    
}

const initGame = function () {
    const player = document.getElementById("player");
    const door = document.getElementById("door");

    // Constants for moving
    const gravity = 0.6
    const jumpStrength = 12
    const speed = 5
    const floorY = 400

    // Position and movement variables
    let x = 100
    let y = floorY
    let velX = 0
    let velY = 0
    let onGround = true

    const keys = {}

    // Listen for key inputs
    window.addEventListener("keydown", (e) => {
        keys[e.key] = true
    })

    window.addEventListener("keyup", (e) => {
        keys[e.key] = false
    })

    // Check if two elements are colliding
    function isColliding(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        )
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
        y += velY

        // Check if back on floor
        if (y >= floorY) {
            y = floorY
            velY = 0
            onGround = true
        }

        // Render
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
        if (isColliding(playerRect, doorRect)) {
            door.style.backgroundColor = "red"
        } else {
            door.style.backgroundColor = "black"
        }

        requestAnimationFrame(update)
    }

    update()
}

window.onload = function () {
    initStartMenu()
    // initGame()
}