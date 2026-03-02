// Game elements
const player = document.getElementById("player");
const door = document.getElementById("door");
const victoryScreen = document.getElementById("victory_screen");

// Level information
const playerHeight = 30;
const groundHeight = 50;
const windowHeight = window.innerHeight;
const windowWidth = window.innerWidth;

const levels = [
  // LEVEL ONE
  {
    playerStart: { x: 0, y: windowHeight - groundHeight - playerHeight },
    door: { x: windowWidth - 200, y: 50 },
    platforms: [
      { x: 0, y: windowHeight - groundHeight, width: windowWidth, height: groundHeight },
      { x: 150, y: windowHeight - 150, width: 150, height: 20 },
      { x: 350, y: windowHeight - 250, width: 120, height: 20 },
      { x: 200, y: windowHeight - 350, width: 120, height: 20 },
      { x: 400, y: windowHeight - 450, width: 120, height: 20 },
      { x: 700, y: windowHeight - 370, width: 120, height: 20 },
      { x: 850, y: windowHeight - 450, width: 120, height: 20 },
      { x: 1000, y: windowHeight - 550, width: 120, height: 20 },
      { x: windowWidth - 250, y: 50 + 45, width: 250, height: 20 }
    ]
  },
  // LEVEL TWO
  {
    playerStart: { x: 0, y: windowHeight - groundHeight - playerHeight },
    door: { x: windowWidth - 200, y: 50 },
    platforms: [
      { x: 0, y: windowHeight - groundHeight, width: windowWidth, height: groundHeight },
      { x: 200, y: windowHeight - 150, width: 150, height: 20 },
      { x: 350, y: windowHeight - 250, width: 120, height: 20 },
      { x: 200, y: windowHeight - 350, width: 120, height: 20 },
      { x: 400, y: windowHeight - 450, width: 120, height: 20 },
      { x: 700, y: windowHeight - 370, width: 120, height: 20 }, 
      { x: 850, y: windowHeight - 450, width: 120, height: 20 },
      { x: 1000, y: windowHeight - 600, width: 120, height: 20 },
      { x: windowWidth - 250, y: 50 + 45, width: 250, height: 20 }
    ],
    
    lever: { x: 250, y: windowHeight - groundHeight - 70, width: 30, height: 50 },
    // Change this variable to change which platform gets disappeared
    leverPlatformIndex: 4
  }
];

// Helper to read the level index from the URL query string
const parseLevelFromQuery = () => {
  const params = new URLSearchParams(window.location.search);
  const levelParam = parseInt(params.get("level") || "0", 10);
  return Number.isNaN(levelParam) || levelParam < 0 ? 0 : levelParam;
};

const initGame = function (initialLevelIndex) {
  victoryScreen.style.display = "none";
  player.style.display = "block";
  door.style.display = "block";

  // Constants for moving
  const gravity = 0.6;
  const jumpStrength = 12;
  const speed = 5;

  // Position and movement variables
  let x = 0;
  let y = 0;
  let velX = 0;
  let velY = 0;
  let onGround = false;

  const keys = {};

  let currentLevelIndex = Math.min(
    Math.max(initialLevelIndex, 0),
    levels.length - 1
  );
  let currentLevel = null;
  let leverPulled = false;
  let leverElement = null;
  let eKeyWasDown = false;

  // Load the requested level index into the game
  function loadLevel(index) {
    currentLevelIndex = index;
    currentLevel = levels[currentLevelIndex];
    leverPulled = false;

    document.querySelectorAll(".platform").forEach((p) => p.remove());
    const oldLever = document.getElementById("lever");
    if (oldLever) oldLever.remove();

    x = currentLevel.playerStart.x;
    y = currentLevel.playerStart.y;
    velX = 0;
    velY = 0;

    door.style.left = `${currentLevel.door.x}px`;
    door.style.top = `${currentLevel.door.y}px`;

    currentLevel.platforms.forEach((p, i) => {
      const platformDiv = document.createElement("div");
      platformDiv.classList.add("platform");
      platformDiv.dataset.platformIndex = String(i);
      platformDiv.style.position = "absolute";
      platformDiv.style.left = `${p.x}px`;
      platformDiv.style.top = `${p.y}px`;
      platformDiv.style.width = `${p.width}px`;
      platformDiv.style.height = `${p.height}px`;
      if (currentLevel.lever && i === currentLevel.leverPlatformIndex) {
        platformDiv.style.display = "none";
      }
      document.body.appendChild(platformDiv);
    });

    if (currentLevel.lever) {
      leverElement = document.createElement("div");
      leverElement.id = "lever";
      leverElement.classList.add("lever");
      leverElement.style.left = `${currentLevel.lever.x}px`;
      leverElement.style.top = `${currentLevel.lever.y}px`;
      leverElement.style.width = `${currentLevel.lever.width}px`;
      leverElement.style.height = `${currentLevel.lever.height}px`;
      document.body.appendChild(leverElement);
    } else {
      leverElement = null;
    }
  }

  function getActivePlatforms() {
    if (!currentLevel.lever || !currentLevel.hasOwnProperty("leverPlatformIndex")) {
      return currentLevel.platforms;
    }
    if (!leverPulled) return currentLevel.platforms.filter((_, i) => i !== currentLevel.leverPlatformIndex);
    return currentLevel.platforms;
  }

  // Listen for key inputs
  window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
  });

  window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
  });

  // Check if two elements are overlapping
  function overlaps(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  // Show the victory screen
  const showVictoryScreen = function () {
    victoryScreen.style.display = "flex";

    const nextLevelButton = document.getElementById("next_level_button");
    const mainMenuButton = document.getElementById("main_menu_button");
    const levelSelectButton = document.getElementById("level_select_button");

    nextLevelButton.onclick = () => {
      const nextIndex = currentLevelIndex + 1;
      if (nextIndex < levels.length) {
        window.location.href = `/game?level=${nextIndex}`;
      } else {
        window.location.href = "/levelselect";
      }
    };

    mainMenuButton.onclick = () => {
      window.location.href = "/";
    };

    if (levelSelectButton) {
      levelSelectButton.onclick = () => {
        window.location.href = "/levelselect";
      };
    }
  };

  // Constantly updates game state
  const update = function () {
    const activePlatforms = getActivePlatforms();

    if (currentLevel.lever && leverElement) {
      const leverRect = {
        x: currentLevel.lever.x,
        y: currentLevel.lever.y,
        width: currentLevel.lever.width,
        height: currentLevel.lever.height
      };
      const playerRect = { x, y, width: player.offsetWidth, height: player.offsetHeight };
      const atLever = overlaps(playerRect, leverRect);
      if (atLever && keys["e"]) {
        if (!eKeyWasDown) {
          // toggles lever on and off
          leverPulled = !leverPulled;
          const platformDiv = document.querySelector(
            `.platform[data-platform-index="${currentLevel.leverPlatformIndex}"]`
          );
          if (platformDiv) platformDiv.style.display = leverPulled ? "block" : "none";
        }
        eKeyWasDown = true;
      } else {
        eKeyWasDown = false;
      }
    }

    if (keys["ArrowLeft"]) {
      velX = -speed;
    } else if (keys["ArrowRight"]) {
      velX = speed;
    } else {
      velX = 0;
    }

    if (keys["ArrowUp"] && onGround) {
      velY = -jumpStrength;
      onGround = false;
    }

    velY += gravity;

    x += velX;

    activePlatforms.forEach((p) => {
      const playerRight = x + player.offsetWidth;
      const playerLeft = x;
      const platformRight = p.x + p.width;
      const platformLeft = p.x;

      // Check if player is overlapping vertically with platform to handle horizontal collisions
      const overlapY =
        y + player.offsetHeight > p.y && y < p.y + p.height;

      if (overlapY) {
        // Hitting left side of platform
        if (velX > 0 && playerRight > platformLeft && playerLeft < platformLeft) {
          x = platformLeft - player.offsetWidth;
        }

        // Hitting right side of platform
        if (velX < 0 && playerLeft < platformRight && playerRight > platformRight) {
          x = platformRight;
        }
      }
    });

    y += velY;
    onGround = false;

    activePlatforms.forEach((p) => {
      const playerBottom = y + player.offsetHeight;
      const playerTop = y;
      const platformTop = p.y;
      const platformBottom = p.y + p.height;

      // Check if player is overlapping horizontally with platform to handle vertical collisions
      const overlapX =
        x + player.offsetWidth > p.x && x < p.x + p.width;

      if (overlapX) {
        // Landing on top of platform
        if (velY > 0 && playerBottom > platformTop && playerTop < platformTop) {
          y = platformTop - player.offsetHeight;
          velY = 0;
          onGround = true;
        }

        // Hitting bottom of platform
        if (velY < 0 && playerTop < platformBottom && playerBottom > platformBottom) {
          y = platformBottom;
          velY = 0;
        }
      }
    });

    // Check for collisions with window bounds
    if (x < 0) {
      x = 0;
    }

    if (x + player.offsetWidth > window.innerWidth) {
      x = window.innerWidth - player.offsetWidth;
    }

    player.style.left = `${x}px`;
    player.style.top = `${y}px`;

    // Get player coords
    const playerRect = {
      x: x,
      y: y,
      width: player.offsetWidth,
      height: player.offsetHeight
    };

    // Get door coords
    const doorRect = {
      x: door.offsetLeft,
      y: door.offsetTop,
      width: door.offsetWidth,
      height: door.offsetHeight
    };

    // Check if colliding and set door color accordingly
    if (overlaps(playerRect, doorRect)) {
      door.style.backgroundColor = "red";
      showVictoryScreen();
      return;
    } else {
      door.style.backgroundColor = "black";
    }

    requestAnimationFrame(update);
  };

  loadLevel(currentLevelIndex);
  update();
};

// On page load: level 1 is playable without login; other levels require auth
window.onload = function () {
  const levelIndex = parseLevelFromQuery();

  if (levelIndex === 0) {
    initGame(0);
    return;
  }

  fetch("/api/auth-status")
    .then((r) => r.json())
    .then(({ authenticated }) => {
      if (!authenticated) {
        window.location.href = "/";
        alert("You must be logged in to play this level");
      } else {
        initGame(levelIndex);
      }
    });
};