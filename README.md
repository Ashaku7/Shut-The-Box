# Shut the Box Game

## Overview
Shut the Box is a classic dice and number tile game implemented as a web-based 3D game. This project features a home page with login information and options to play either a single player or two player game. The game uses Three.js for 3D rendering and Cannon.js for physics simulation of dice rolling.

## Home Page
The home page serves as the entry point to the game. It displays the game title, a preview of the number tiles (1 to 9), and buttons to select the game mode:
- **Single Player**: Starts the single player 3D game.
- **Two Player**: Starts the two player 3D game.
- **Play vs Bot**: This mode is currently under development and not yet available.

## Single Player Game
In the single player mode, the player rolls two dice and selects tiles that sum to the dice roll. The goal is to "shut" all the tiles by selecting valid combinations. The game features:
- A 3D wooden board with numbered tiles.
- Realistic dice rolling physics.
- Tile selection and shutting animations.
- Game status messages and score tracking.
- Buttons to roll dice, end turn, and start a new game.

## Two Player Game
The two player mode extends the single player gameplay to support two players taking turns. Features include:
- Separate tiles and scores for Player 1 and Player 2.
- Turn-based gameplay with dice rolling and tile selection.
- Tracking of blocked players who cannot make valid moves.
- Determination of the winner based on who shuts all tiles first or has the highest score.
- Visual differentiation of tiles shut by each player using colors.
- Game status messages indicating current player and game progress.

## Play vs Bot
The "Play vs Bot" mode is planned but currently under development. Selecting this option on the home page will show a "Coming Soon" modal.

## How to Run
1. Open `home_page.html` in a modern web browser to access the game selection page.
2. Click on "Single Player" to start the single player game (`1-player.html`).
3. Click on "Two Player" to start the two player game (`game.html`).
4. The "Play vs Bot" option is not yet available.

## Technologies Used
- [Three.js](https://threejs.org/) for 3D rendering.
- [Cannon.js](https://schteppe.github.io/cannon.js/) for physics simulation.
- HTML, CSS, and JavaScript for UI and game logic.

## Current Progress and To-Do
- Opening page and game modes implemented.
- 3D models and physics-based dice rolling for single and two player games.
- Reset logic adjustment needed for two player game.
- 10-second dice roll timeout constraint to be added for single player game.
- Bot version of the game to be developed.

Enjoy playing Shut the Box!
