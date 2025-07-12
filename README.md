# Shut the Box Game

## Overview
Shut the Box is a classic dice and number tile game implemented as a web-based 3D game. This project features a beautiful, modern landing page and multiple game modes: single player, two player, online, and play vs bot. The game uses Three.js for 3D rendering and Cannon.js for physics simulation of dice rolling.

## Home Page
The home page is a visually stunning entry point to the game, featuring:
- A 3D animated Shut the Box board that responds to mouse movement
- Elegant title and tagline
- Mode selection panel (Online, Offline)
- An **Instructions** button in the top right corner that opens a detailed how-to-play modal

## Game Modes
- **Single Player**: Play against yourself, rolling dice and shutting tiles.
- **Two Player**: Local two-player mode, with clear player labels and score tracking.
- **Online 2 Player**: Play against another player online in real time.
- **Play vs Bot**: Play against a computer opponent (bot).

## How to Play
Click the **Instructions** button in the top right of any main page to view these rules in a popup at any time.

### Goal
Shut as many numbered tiles as possible by rolling dice and selecting tile combinations that match the roll.

### Steps
1. On your turn, roll the dice.
2. Add up the total of the dice.
3. Select any combination of open tiles that add up to the dice total.
4. Shut (close) those tiles.
5. If you can’t make a move, your turn ends.
6. The game ends when no more moves are possible or all tiles are shut.
7. The player with the lowest total of remaining tiles wins!

### Tips
- **Tip 1:** Try to shut higher numbers first for a better score.
- **Tip 2:** Any number of tiles can be shut at once (more than one tile can be shut at once).

## Features
- 3D wooden board and dice with realistic physics
- Animated, interactive UI
- Player labels ("You" and "Bot" or Player 1/2) for clarity
- Responsive design and beautiful wood/forest theme
- Instructions modal for new players
- Game status messages and score tracking
- Buttons to roll dice, end turn, and start a new game

## How to Run
1. Deploy or open `index.html` in a modern web browser to access the landing page.
2. Click on your desired mode (Online, Offline, Play vs Bot).
3. Use the **Instructions** button for help at any time.

## Technologies Used
- [Three.js](https://threejs.org/) for 3D rendering
- [Cannon.js](https://schteppe.github.io/cannon.js/) for physics simulation
- HTML, CSS, and JavaScript for UI and game logic

## Current Progress and To-Do
- All main game modes implemented and visually enhanced
- 3D models and physics-based dice rolling for all modes
- Instructions modal and improved onboarding for new players
- UI/UX improvements across all pages
- Online mode: verify real-time sync and add chat box in multiplayer (future)
- Add sound effects and more animations (future)

Enjoy playing Shut the Box!
