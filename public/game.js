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
    door: { x: windowWidth - 200, y: 80 },
    platforms: [
      { x: 0, y: windowHeight - groundHeight, width: windowWidth, height: groundHeight },
      { x: 150, y: windowHeight - 150, width: 150, height: 20 },
      { x: 350, y: windowHeight - 250, width: 120, height: 20 },
      { x: 200, y: windowHeight - 350, width: 120, height: 20 },
      { x: 400, y: windowHeight - 450, width: 120, height: 20 },
      { x: 700, y: windowHeight - 370, width: 120, height: 20 },
      { x: 850, y: windowHeight - 450, width: 120, height: 20 },
      { x: 1000, y: windowHeight - 550, width: 120, height: 20 },
      { x: windowWidth - 250, y: 80 + 45, width: 250, height: 20 }
    ]
  },
  
  // LEVEL TWO
  {
    playerStart: { x: 0, y: windowHeight - groundHeight - playerHeight },
    door: { x: windowWidth - 200, y: 50 },
    platforms: [
      { x: 0, y: windowHeight - groundHeight, width: windowWidth, height: groundHeight },
      { x: 500, y: windowHeight - 150, width: 150, height: 20 },
      { x: 350, y: windowHeight - 250, width: 120, height: 20 },
      { x: 200, y: windowHeight - 350, width: 120, height: 20 },
      { x: 500, y: windowHeight - 300, width: 120, height: 20 }, // lever makes this platform appear
      { x: 700, y: windowHeight - 370, width: 120, height: 20 }, 
      { x: 850, y: windowHeight - 450, width: 120, height: 20 },
      { x: 1000, y: windowHeight - 550, width: 120, height: 20 },
      { x: windowWidth - 250, y: 95, width: 250, height: 20 }
    ],
    lever: { x: 250, y: windowHeight - groundHeight - 50, width: 30, height: 50 },
    leverPlatformIndex: 4,
    spikes: (() => {
      const arr = [];
      const startX = Math.floor(windowWidth / 2);
      const spikeW = 30;
      const spikeH = 35;
      const spikeY = windowHeight - groundHeight - spikeH;
      for (let sx = startX; sx < windowWidth - spikeW; sx += 50) {
        arr.push({ x: sx, y: spikeY, width: spikeW, height: spikeH });
      }
      return arr;
    })()
  },
  // LEVEL THREE
  {
    playerStart: { x: 0, y: windowHeight - groundHeight - playerHeight },
    door: { x: windowWidth - 200, y: 50 },
    platforms: [
      { x: 0, y: windowHeight - groundHeight, width: windowWidth, height: groundHeight },
      { x: 250, y: windowHeight - 150, width: 150, height: 20 },
      { x: 450, y: windowHeight - 250, width: 200, height: 20 },
      { x: 180, y: windowHeight - 350, width: 220, height: 20 },
      // { x: 400, y: windowHeight - 450, width: 120, height: 20 },        
      { x: Math.floor(windowWidth / 2) + 25, y: windowHeight - groundHeight - 80, width: 150, height: 20 }, // lever makes this platform appear
      { x: 200, y: windowHeight - 600, width: 120, height: 20 }, // lever2 makes this platform disappear
      { x: 700, y: windowHeight - 370, width: 120, height: 20 }, 
      { x: 850, y: windowHeight - 450, width: 120, height: 20 },
      { x: 1000, y: windowHeight - 550, width: 120, height: 20 },
      { x: windowWidth - 250, y: 95, width: 250, height: 20 } // platform for door
    ],
    lever: {x: 250, y: windowHeight - groundHeight - 70, width: 30, height: 50},
    lever2: { x: windowWidth - 320, y: windowHeight - groundHeight - 70, width: 30, height: 50 },
    leverPlatformIndex: 4,
    lever2PlatformIndex: 5,
    box: { x: 200 + (120 - 35) / 2, y: windowHeight - 600 - 35, width: 35, height: 35 },
    spikes: (() => {
      const arr = [];
      const startX = Math.floor(windowWidth / 2);
      const spikeW = 30;
      const spikeH = 35;
      const spikeY = windowHeight - groundHeight - spikeH;
      for (let sx = startX; sx < windowWidth - spikeW - 550; sx += 50) {
        arr.push({ x: sx, y: spikeY, width: spikeW, height: spikeH });
      }
      return arr;
    })()
    
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
  let lever2Pulled = false;
  let leverElement = null;
  let lever2Element = null;
  let eKeyWasDownLever1 = false;
  let eKeyWasDownLever2 = false;
  let boxesState = [];

  // Load the requested level index into the game
  function loadLevel(index) {
    currentLevelIndex = index;
    currentLevel = levels[currentLevelIndex];
    leverPulled = false;
    lever2Pulled = false;

    document.querySelectorAll(".platform").forEach((p) => p.remove());
    document.querySelectorAll(".spike").forEach((s) => s.remove());
    document.querySelectorAll(".pushable_box").forEach((b) => b.remove());
    const oldLever = document.getElementById("lever");
    if (oldLever) oldLever.remove();
    const oldLever2 = document.getElementById("lever2");
    if (oldLever2) oldLever2.remove();

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

    if (currentLevel.spikes) {
      currentLevel.spikes.forEach((s) => {
        const spikeDiv = document.createElement("div");
        spikeDiv.classList.add("spike");
        spikeDiv.style.left = `${s.x}px`;
        spikeDiv.style.top = `${s.y}px`;
        spikeDiv.style.width = `${s.width}px`;
        spikeDiv.style.height = `${s.height}px`;
        document.body.appendChild(spikeDiv);
      });
    }

    if (currentLevel.lever) {
      leverElement = document.createElement("div");
      leverElement.id = "lever";
      leverElement.classList.add("lever");
      leverElement.style.left = `${currentLevel.lever.x}px`;
      leverElement.style.top = `${currentLevel.lever.y - 400}px`;
      leverElement.style.width = `${currentLevel.lever.width}px`;
      leverElement.style.height = `${currentLevel.lever.height}px`;
      document.body.appendChild(leverElement);
    } else {
      leverElement = null;
    }

    if (currentLevel.lever2) {
      lever2Element = document.createElement("div");
      lever2Element.id = "lever2";
      lever2Element.classList.add("lever");
      lever2Element.style.left = `${currentLevel.lever2.x}px`;
      lever2Element.style.top = `${currentLevel.lever2.y}px`;
      lever2Element.style.width = `${currentLevel.lever2.width}px`;
      lever2Element.style.height = `${currentLevel.lever2.height}px`;
      document.body.appendChild(lever2Element);
    } else {
      lever2Element = null;
    }

    boxesState = [];
    if (currentLevel.box) {
      const b = currentLevel.box;
      const boxDiv = document.createElement("div");
      boxDiv.classList.add("pushable_box");
      boxDiv.style.position = "absolute";
      boxDiv.style.left = `${b.x}px`;
      boxDiv.style.top = `${b.y}px`;
      boxDiv.style.width = `${b.width}px`;
      boxDiv.style.height = `${b.height}px`;
      document.body.appendChild(boxDiv);
      boxesState.push({
        element: boxDiv,
        x: b.x,
        y: b.y,
        velX: 0,
        velY: 0,
        width: b.width,
        height: b.height
      });
    }
  }

  function getActivePlatforms() {
    let platforms = currentLevel.platforms;

    if (currentLevel.lever && currentLevel.hasOwnProperty("leverPlatformIndex")) {
      if (!leverPulled) {
        platforms = platforms.filter((_, i) => i !== currentLevel.leverPlatformIndex);
      }
    }

    if (currentLevel.lever2 && currentLevel.hasOwnProperty("lever2PlatformIndex")) {
      if (lever2Pulled) {
        platforms = platforms.filter((_, i) => i !== currentLevel.lever2PlatformIndex);
      }
    }

    return platforms;
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

    // Record level completion for logged-in users
    fetch("/api/auth-status")
      .then((r) => r.json())
      .then(({ authenticated }) => {
        if (!authenticated) return;

        fetch("/api/level-complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ levelIndex: currentLevelIndex })
        }).catch(() => {
        });
      })
      .catch(() => {
      });

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
        x: leverElement.offsetLeft,
        y: leverElement.offsetTop,
        width: leverElement.offsetWidth,
        height: leverElement.offsetHeight
      };
      const playerRect = { x, y, width: player.offsetWidth, height: player.offsetHeight };
      const atLever = overlaps(playerRect, leverRect);
      if (atLever && keys["e"]) {
        if (!eKeyWasDownLever1) {
          // toggles lever on and off
          leverPulled = !leverPulled;
          const platformDiv = document.querySelector(
            `.platform[data-platform-index="${currentLevel.leverPlatformIndex}"]`
          );
          if (platformDiv) platformDiv.style.display = leverPulled ? "block" : "none";
        }
        eKeyWasDownLever1 = true;
      } else {
        eKeyWasDownLever1 = false;
      }
    }

    if (currentLevel.lever2 && lever2Element) {
      const lever2Rect = {
        x: lever2Element.offsetLeft,
        y: lever2Element.offsetTop,
        width: lever2Element.offsetWidth,
        height: lever2Element.offsetHeight
      };
      const playerRect = { x, y, width: player.offsetWidth, height: player.offsetHeight };
      const atLever2 = overlaps(playerRect, lever2Rect);
      if (atLever2 && keys["e"]) {
        if (!eKeyWasDownLever2) {
          // toggles lever2 on and off
          lever2Pulled = !lever2Pulled;
          const platformDiv2 = document.querySelector(
            `.platform[data-platform-index="${currentLevel.lever2PlatformIndex}"]`
          );
          if (platformDiv2) platformDiv2.style.display = lever2Pulled ? "none" : "block";
        }
        eKeyWasDownLever2 = true;
      } else {
        eKeyWasDownLever2 = false;
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

    // Player pushes boxes horizontally
    boxesState.forEach((box) => {
      const playerRight = x + player.offsetWidth;
      const playerLeft = x;
      const boxRight = box.x + box.width;
      const boxLeft = box.x;
      const overlapY = y + player.offsetHeight > box.y && y < box.y + box.height;
      const overlapX = playerRight > boxLeft && playerLeft < boxRight;

      if (overlapX && overlapY) {
        if (velX > 0 && playerLeft < boxLeft) {
          box.velX = Math.min(box.velX + 3, speed);
          x = boxLeft - player.offsetWidth;
        }
        if (velX < 0 && playerRight > boxRight) {
          box.velX = Math.max(box.velX - 3, -speed);
          x = boxRight;
        }
      }
    });

    // Box horizontal movement and collision
    boxesState.forEach((box) => {
      box.x += box.velX;
      box.velX *= 0.85;

      activePlatforms.forEach((p) => {
        const overlapY = box.y + box.height > p.y && box.y < p.y + p.height;
        if (overlapY) {
          if (box.velX > 0 && box.x + box.width > p.x && box.x < p.x) {
            box.x = p.x - box.width;
            box.velX = 0;
          }
          if (box.velX < 0 && box.x < p.x + p.width && box.x + box.width > p.x + p.width) {
            box.x = p.x + p.width;
            box.velX = 0;
          }
        }
      });

      if (box.x < 0) { box.x = 0; box.velX = 0; }
      if (box.x + box.width > window.innerWidth) { box.x = window.innerWidth - box.width; box.velX = 0; }
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

    boxesState.forEach((box) => {
      const playerBottom = y + player.offsetHeight;
      const playerTop = y;
      const boxTop = box.y;
      const boxBottom = box.y + box.height;
      const overlapX = x + player.offsetWidth > box.x && x < box.x + box.width;

      if (overlapX) {
        if (velY > 0 && playerBottom > boxTop && playerTop < boxTop) {
          y = boxTop - player.offsetHeight;
          velY = 0;
          onGround = true;
        }
        if (velY < 0 && playerTop < boxBottom && playerBottom > boxBottom) {
          y = boxBottom;
          velY = 0;
        }
      }
    });

    // Box vertical movement and collision
    boxesState.forEach((box) => {
      box.velY += gravity;
      box.y += box.velY;

      activePlatforms.forEach((p) => {
        const overlapX = box.x + box.width > p.x && box.x < p.x + p.width;
        if (overlapX) {
          if (box.velY > 0 && box.y + box.height > p.y && box.y < p.y) {
            box.y = p.y - box.height;
            box.velY = 0;
          }
          if (box.velY < 0 && box.y < p.y + p.height && box.y + box.height > p.y + p.height) {
            box.y = p.y + p.height;
            box.velY = 0;
          }
        }
      });

      if (box.y + box.height > window.innerHeight) {
        box.y = window.innerHeight - box.height;
        box.velY = 0;
      }

      box.element.style.left = `${box.x}px`;
      box.element.style.top = `${box.y}px`;
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

    if (currentLevel.spikes) {
      for (const spike of currentLevel.spikes) {
        if (overlaps(playerRect, spike)) {
          loadLevel(currentLevelIndex);
          // return;
        }
      }
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