// FRONT-END (CLIENT) JAVASCRIPT HERE

const startMenu = document.getElementById("start_menu")
// variable to determine whether start menu is shown or not
let showStartMenu = false

const initStartMenu = function() {
    // Start menu is shown
    showStartMenu = true

    // Get menu buttons
    const startButton = document.getElementById("start_button")
    const loginButton = document.getElementById("login_button")
    const logoutButton = document.getElementById("logout_button")

    // Start game through menu
    startButton.addEventListener("click", () => {
        window.location.href = '/levelselect';
    })

    // Determines whether to show login or logout button
    fetch('/api/auth-status')
    .then(r => r.json())
    .then(({ authenticated }) => {
      if (authenticated) {
        if (logoutButton) 
          logoutButton.style.display = 'inline-block'
        if (loginButton) 
          loginButton.style.display = 'none'
      } else {
        if (loginButton) 
          loginButton.style.display = 'inline-block'
        if (logoutButton) 
          logoutButton.style.display = 'none'
      }
    })

    if (loginButton) {
        loginButton.onclick = () => {
        window.location.href = '/login'
        }
    }
    if (logoutButton) {
        logoutButton.onclick = () => {
        window.location.href = '/logout'
        }
    }
}

window.onload = function () {
    // Show start menu on load
    initStartMenu()
}