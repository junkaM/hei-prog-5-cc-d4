# Snake Game

A console-based implementation of the classic Snake Game in JavaScript. The game runs with the snake moving automatically and direction changes applied instantly via keyboard input.

## Requirements
- Node.js (v14 or higher)

## How to Run
1. Save the code in a file named `snake_game.js`.
2. Open a terminal in the directory containing `snake_game.js`.
3. Run the game using:
   ```bash
   node snake_game.js
   ```
4. Follow the on-screen instructions:
   - Press `s` in the menu to start the game.
   - Use `z` (up), `q` (left), `s` (down), `d` (right) or arrow keys (up, down, left, right) to change the snake's direction.
   - Press `r` in the game over screen to restart.
   - Press `Ctrl+C` to exit the game.

## Game Features
- 10x10 grid
- Snake (`*`) moves automatically every 500ms
- Food (`@`) spawns randomly
- Score increases by 1 per food eaten
- Game ends on collision with walls or self
- States: Menu, Running, Game Over
- Real-time keyboard input for direction changes

## Controls
- `z` or Up Arrow: Move up
- `s` or Down Arrow: Move down
- `q` or Left Arrow: Move left
- `d` or Right Arrow: Move right
- `s`: Start game (from menu)
- `r`: Restart (from game over)
- `Ctrl+C`: Exit game

## Binome
- STD22087 - Allan