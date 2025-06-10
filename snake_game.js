const readline = require('readline');

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  equals(other) {
    return this.x === other.x && this.y === other.y;
  }
}

const Direction = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT'
};

class FoodFactory {
  constructor(gridSize, snake) {
    this.gridSize = gridSize;
    this.snake = snake;
  }

  generateFood() {
    let x, y;
    do {
      x = Math.floor(Math.random() * this.gridSize);
      y = Math.floor(Math.random() * this.gridSize);
    } while (this.snake.isOccupying(new Point(x, y)));
    return new Point(x, y);
  }
}

class SnakeBuilder {
  constructor() {
    this.position = new Point(5, 5);
    this.length = 3;
    this.direction = Direction.RIGHT;
  }

  withPosition(x, y) {
    this.position = new Point(x, y);
    return this;
  }

  withLength(length) {
    this.length = length;
    return this;
  }

  withDirection(direction) {
    this.direction = direction;
    return this;
  }

  build() {
    const body = [];
    for (let i = 0; i < this.length; i++) {
      body.push(new Point(this.position.x - i, this.position.y));
    }
    return new Snake(body, this.direction);
  }
}

class Snake {
  constructor(body, direction) {
    this.body = body;
    this.direction = direction;
  }

  move(nextPosition) {
    this.body.unshift(nextPosition);
    this.body.pop();
  }

  grow(nextPosition) {
    this.body.unshift(nextPosition);
  }

  isOccupying(point) {
    return this.body.some(segment => segment.equals(point));
  }

  hasCollidedWithSelf() {
    const head = this.body[0];
    return this.body.slice(1).some(segment => segment.equals(head));
  }

  hasCollidedWithWall(gridSize) {
    const head = this.body[0];
    return head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize;
  }

  setDirection(direction) {
    if (
      (this.direction === Direction.UP && direction !== Direction.DOWN) ||
      (this.direction === Direction.DOWN && direction !== Direction.UP) ||
      (this.direction === Direction.LEFT && direction !== Direction.RIGHT) ||
      (this.direction === Direction.RIGHT && direction !== Direction.LEFT)
    ) {
      this.direction = direction;
    }
  }
}

class MoveStrategy {
  computeNextPosition(snake) {
    const head = snake.body[0];
    switch (snake.direction) {
      case Direction.UP:
        return new Point(head.x, head.y - 1);
      case Direction.DOWN:
        return new Point(head.x, head.y + 1);
      case Direction.LEFT:
        return new Point(head.x - 1, head.y);
      case Direction.RIGHT:
        return new Point(head.x + 1, head.y);
      default:
        return head;
    }
  }
}

class GameState {
  constructor(game) {
    this.game = game;
  }

  handleInput(input) {}
  update() {}
  render() {}
}

class MenuState extends GameState {
  handleInput(input) {
    if (input.toLowerCase() === 's') {
      this.game.setState(new RunningState(this.game));
    }
  }

  render() {
    console.clear();
    console.log('=== SNAKE GAME ===');
    console.log('Press S to start');
  }
}

class RunningState extends GameState {
  update() {
    const nextPosition = this.game.moveStrategy.computeNextPosition(this.game.snake);

    if (nextPosition.equals(this.game.food)) {
      this.game.snake.grow(nextPosition);
      this.game.food = this.game.foodFactory.generateFood();
      this.game.score += 1;
    } else {
      this.game.snake.move(nextPosition);
    }

    if (this.game.snake.hasCollidedWithSelf() || this.game.snake.hasCollidedWithWall(this.game.gridSize)) {
      this.game.setState(new GameOverState(this.game));
    }
  }

  handleInput(input) {
    const directionMap = {
      z: Direction.UP,
      s: Direction.DOWN,
      q: Direction.LEFT,
      d: Direction.RIGHT,
      '\u001b[A': Direction.UP,
      '\u001b[B': Direction.DOWN,
      '\u001b[D': Direction.LEFT,
      '\u001b[C': Direction.RIGHT
    };
    if (directionMap[input]) {
      this.game.snake.setDirection(directionMap[input]);
    }
  }

  render() {
    console.clear();
    const grid = Array.from({ length: this.game.gridSize }, () =>
      Array(this.game.gridSize).fill('.')
    );

    this.game.snake.body.forEach(segment => {
      if (segment.x >= 0 && segment.x < this.game.gridSize && segment.y >= 0 && segment.y < this.game.gridSize) {
        grid[segment.y][segment.x] = '*';
      }
    });

    if (this.game.food.x >= 0 && this.game.food.x < this.game.gridSize && this.game.food.y >= 0 && this.game.food.y < this.game.gridSize) {
      grid[this.game.food.y][this.game.food.x] = '@';
    }

    console.log(`Score: ${this.game.score}`);
    grid.forEach(row => console.log(row.join(' ')));
  }
}

class GameOverState extends GameState {
  handleInput(input) {
    if (input.toLowerCase() === 'r') {
      this.game.reset();
      this.game.setState(new MenuState(this.game));
    }
  }

  render() {
    console.clear();
    console.log('=== GAME OVER ===');
    console.log(`Final Score: ${this.game.score}`);
    console.log('Press R to restart');
  }
}

class Game {
  constructor() {
    this.gridSize = 10;
    this.snake = new SnakeBuilder().build();
    this.foodFactory = new FoodFactory(this.gridSize, this.snake);
    this.food = this.foodFactory.generateFood();
    this.moveStrategy = new MoveStrategy();
    this.state = new MenuState(this);
    this.score = 0;
    this.intervalId = null;
  }

  setState(state) {
    this.state = state;
    if (state instanceof RunningState) {
      this.startGameLoop();
    } else {
      this.stopGameLoop();
    }
  }

  reset() {
    this.snake = new SnakeBuilder().build();
    this.foodFactory = new FoodFactory(this.gridSize, this.snake);
    this.food = this.foodFactory.generateFood();
    this.score = 0;
  }

  startGameLoop() {
    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        if (this.state instanceof RunningState) {
          this.state.update();
          this.state.render();
        }
      }, 500);
    }
  }

  stopGameLoop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  start() {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (key) => {
      if (key === '\u0003') {
        this.stopGameLoop();
        process.exit();
      }
      this.state.handleInput(key);
      if (!(this.state instanceof RunningState)) {
        this.state.render();
      }
    });

    this.state.render();
  }
}

const game = new Game();
game.start();