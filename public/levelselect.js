const level_menu = document.getElementById("level_menu");
const level_one = document.getElementById("to_level_one");
const level_two = document.getElementById("to_level_two");
const level_three = document.getElementById("to_level_three");
const login_button = document.getElementById("login_button");
const main_menu = document.getElementById("main_menu");

level_one.addEventListener("click", () =>{
    window.location.href = "/game?level=0";
})

level_two.addEventListener("click", () =>{
    window.location.href = "/game?level=1";
})

level_three.addEventListener("click", () =>{
    window.location.href = "/game?level=2";
})

main_menu.addEventListener("click", () => {
    window.location.href = "/";
})

fetch('/api/auth-status')
    .then(r => r.json())
    .then(({ authenticated }) => {
      if (authenticated) {
        if (login_button) 
          login_button.style.display = 'none'
      } else {
        if (login_button) 
          login_button.style.display = 'inline-block'
        }
    })

// If logged in, mark any completed levels with a green ring
fetch("/api/completed-levels")
  .then((r) => r.json())
  .then(({ authenticated, completedLevels }) => {
    if (!authenticated || !Array.isArray(completedLevels)) return;

    const levelButtonsByIndex = {
      0: level_one,
      1: level_two,
      2: level_three
    };

    completedLevels.forEach((idx) => {
      const btn = levelButtonsByIndex[idx];
      if (btn) {
        btn.classList.add("completed-level");
      }
    });
  })
  .catch(() => {
  });

login_button.addEventListener("click", () => {
    window.location.href = "/login";
})
