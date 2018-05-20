const WIDTH = 510;
const HEIGHT = 405;
const CELL_SIZE = 15;

// Calculated Constants
const X_CELLS = WIDTH/CELL_SIZE;
const Y_CELLS = HEIGHT/CELL_SIZE;
let _intervalRef: any;

enum Direction {
  Left,
  Up,
  Right,
  Down
}

enum CellType {
  SnakeHead,
  SnakeBody,
  SnakeTail,
  Food,
  Collision
}

enum GameErrorType {
  GameOver,
  Fatal
}

class GameError extends Error {
  kind: GameErrorType;

  constructor(m: string, kind: GameErrorType) {
    super(m);

    this.kind = kind;
  }
}

class Game {
  grid: number[][];
  snake: Snake;
  score: number;
  private lastUsedDirection: Direction;

  constructor(width: number, height: number, snake: Snake) {
    const grid = new Array(width);
    for (let i = 0; i < grid.length; i++) {
      grid[i] = new Array(height);
    }
    this.grid = grid;
    this.snake = snake;
    this.score = 0;
    this.lastUsedDirection = snake.direction;
  }

  init(): void {
    this.addFruit();
    document.addEventListener('keypress', this.directionListener.bind(this));
  }

  addFruit(): void {
    const snake = this.snake;
    const x = Math.floor(Math.random() * X_CELLS);
    const y = Math.floor(Math.random() * Y_CELLS);

    let collision = false;
    for (let i = 0; i < snake.body.length; i++) {
      let [piece_x, piece_y] = snake.body[i];
      if (piece_x === x && piece_y === y) {
        console.warn('Fruit encountered a collision')
        collision = true;
        this.addFruit();
      }
    }

    if (!collision) {
      this.grid[x][y] = CellType.Food;
    }
  }

  updateSnake(): GameError | null {
    const snake = this.snake;
    this.lastUsedDirection = this.snake.direction;

    // Set the pieces (We can do self collision here)
    let error = snake.moveSnake();
    snake.body.forEach((piece, idx) => {
      let [piece_x, piece_y] = piece;
      if (this.grid[piece_x][piece_y] === CellType.Food) {
        snake.setOnMove(true);
        this.score++;
        this.addFruit();
      }

      if (error && idx === 0) {
        this.grid[piece_x][piece_y] = CellType.Collision;
      } else {
        // Make sure we don't draw over collisions :)
        if (this.grid[piece_x][piece_y] != CellType.Collision) {
          this.grid[piece_x][piece_y] = CellType.SnakeBody;
        }
      }
    });

    return error;
  }

  renderGrid(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#000000";
    for (let j = 0; j < this.grid.length; j++) {
      let column = this.grid[j];
      for (let i = 0; i < column.length; i++) {
        let cell = column[i];
        if (cell === CellType.SnakeBody) {
          ctx.fillStyle = "#00FF00"
          ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        } else if (cell === CellType.Food) {
          ctx.fillStyle = "#FFA500"
          ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        } else if (cell === CellType.Collision) {
          ctx.fillStyle = "#FF0000"
          ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }
  }

  clearGrid(): void {
    this.grid.forEach(column => {
      for (let i = 0; i < column.length; i++) {
        switch (column[i]) {
          case CellType.Food:
            break;
          default:
            column[i] = 0;
        }
      }
    })
  }

  private directionListener(event: any): void {
    const { keyCode } = event;
    switch (keyCode) {
      case 37:
        if (this.lastUsedDirection === Direction.Right) { break; }
        this.snake.direction = Direction.Left;
        break;
      case 38:
        if (this.lastUsedDirection === Direction.Down) { break; }
        this.snake.direction = Direction.Up;
        break;
      case 39:
        if (this.lastUsedDirection === Direction.Left) { break; }
        this.snake.direction = Direction.Right;
        break;
      case 40:
        if (this.lastUsedDirection === Direction.Up) { break; }
        this.snake.direction = Direction.Down;
        break;
    }
  }
}

class Snake {
  body: Array<[number, number]>;
  growOnMove: boolean;
  direction: Direction;

  constructor(snake: Array<[number, number]>) {
    this.body = snake;
    this.growOnMove = false;
    this.direction = Direction.Right;
  }

  getHead(): [number, number] {
    return this.body[0];
  }

  moveSnake(): GameError | null {
    const [headX, headY] = this.getHead();
    let error = null;
    let newPiece: [number, number];
    switch (this.direction) {
      case Direction.Up:
        let newHeadY = headY - 1;
        if (newHeadY < 0) {
          newHeadY = Y_CELLS - 1;
        }
        newPiece = [headX, newHeadY];
        break;
      case Direction.Right:
        let newHeadX = headX + 1;
        if (newHeadX > X_CELLS - 1) {
          newHeadX = 0;
        }
        newPiece = [newHeadX, headY];
        break;
      case Direction.Down:
        let _newHeadY = headY + 1;
        if (_newHeadY > Y_CELLS - 1) {
          _newHeadY = 0;
        }
        newPiece = [headX, _newHeadY];
        break;
      case Direction.Left:
        let _newHeadX = headX - 1;
        if (_newHeadX < 0) {
          _newHeadX = X_CELLS - 1;
        }
        newPiece = [_newHeadX, headY];
        break;
      default:
        throw new Error('Invalid direction');
    }

    let collision = false;
    for (let i = 0; i < this.body.length; i++) {
      let piece = this.body[i];
      let [newX, newY] = newPiece;
      let [checkX, checkY] = piece;
      if (newX === checkX && newY === checkY) {
        error = new GameError("Game Over - Classic", GameErrorType.GameOver);
      }
    }

    if (this.growOnMove) {
      this.body = [newPiece, ...this.body];
      this.growOnMove = false;
    } else {
      this.body = [newPiece, ...this.body.splice(0, this.body.length - 1)];
    }

    return error;
  }

  setOnMove(shouldMove: boolean) {
    this.growOnMove = shouldMove;
  }
}

window.onload = () => {
  const canvas: HTMLCanvasElement | null = document.getElementById("canvas") as HTMLCanvasElement | null;
  if (canvas == null) { throw new Error("Cannot find canvas element"); }
  start(canvas);
}

function start(canvas: HTMLCanvasElement): void {
  canvas.width = WIDTH; // 25
  canvas.height = HEIGHT; // 20

  const ctx = canvas.getContext('2d');
  if (ctx == null) { throw new Error("Null CTX") }

  // Create board
  let snake = new Snake([[3, 10], [2, 10], [1, 10]]);
  let game = new Game(X_CELLS, Y_CELLS, snake);
  game.init();

  _intervalRef = setInterval(() => {
    // Delete
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    game.clearGrid();

    // Update the snake
    let gameError = game.updateSnake();
    if (gameError != null) {
      // Draw one more tick for User Experience purposes
      if (gameError.kind == GameErrorType.GameOver) {
        if (Math.random() < 0.1) {
          game.addFruit();
        }
        game.renderGrid(ctx);
      }
      alert("Game Over!" + game.score);
      STOP();
    }

    if (Math.random() < 0.001) {
      game.addFruit();
    }
    game.renderGrid(ctx);
    // Draw
  }, 1000/6);

}


function STOP() {
  clearInterval(_intervalRef);
}
