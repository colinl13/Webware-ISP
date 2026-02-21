const level_menu = document.getElementById("level_menu");
const level_one = document.getElementById("to_level_one");
const level_two = document.getElementById("to_level_two");
const level_three = document.getElementById("to_level_three");
const login_button = document.getElementById("login_button");
const main_menu = document.getElementById("main_menu");

level_one.addEventListener("click", () =>{
    window.location.href = "/levelone";
})

level_two.addEventListener("click", () =>{
    window.location.href = "/leveltwo";
})

main_menu.addEventListener("click", () => {
    window.location.href = "/";
    }
)

// Uncomment when level is ready
// level_three.addEventListener("click", () =>{
//     window.location.href = "/levelthree";
// })


