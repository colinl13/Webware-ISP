# Webware-ISP - Earthboy: Journey Through the Cave

Made by Colin Lemire and Isabel Cruz Rivera

https://webware-isp.onrender.com/
---

# Project Description

This project is a web application which allows the user to play a platformer video game. This application was made primarily using JavaScript on an Express server using the dotenv, Mime, Auth0, and MongoDB libraries as dependencies.

To play the game, the user will click 'Start Game' which will bring them to a level select menu. There are three levels to choose from, with the first level being available to all users, logged in or not. To save progress and progress past the first level, the user must log in to the site through Auth0, where they will be able to log in through Github, Gmail, or by signing up with a custom email and password. While logged in, levels will be unavailable to play until the user beats the prior level (for example you cannot play level two without beating one).

The controls are as follows: use the left and right arrow keys to move left and right respectively, the up arrow key to jump, and the 'e' key to interact with certain items throughout the level. The goal of each level is to work your way through increasingly difficult obstacles to reach a door at the end of the level which will bring you to the next level. To pass to the next level, press the up arrow while the door is open.

Our three biggest challenges while making this application were:

1 - Collision detection
Collision detection between the player and the door/box/ground was a very difficult process. While testing, we often dealt with textures overlapping, falling through floors, and buttons not working correctly because the application did not properly detect when a player was 'touching' another element on the page. We were able to resolve these problems by the end of the project, with our main detection of collision being to find the x and y coordinates of an object and to compare that to the coordinates of another object.

2 - Lever Functionality
The functionality of a single lever in level two was not too difficult all things considered, but we ran into several issues with making the second lever work on level three. There was issues with the positioning of the levers on level three, as one lever would activate from the incorrect location and/or activate the other lever without the player ever intentionally interacting with it. These issues were resolved by the end of our project.

3 - Styling
The styling for the project was difficult because of the scale of the project. There were many different elements in the game that were able to be interacted with by the user, and making sure that the proper texture was loaded was a difficult task. The styling for the text took especially long, as giving the gold texture and making sure the shadows looked proper was tedious. The styling for the game came together to have a cave diving and treasure hunting theme, and all textures are properly loaded now (flipping levers, door opens when near it).
