const WIDTH = 600;
const HEIGHT = 500;
const CELL_SIZE = 10;

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

class Board {
  grid: number[][];

  constructor(width: number, height: number) {
    const grid = new Array(width);
    for (let i = 0; i < grid.length; i++) {
      grid[i] = new Array(height);
    }
    this.grid = grid;
  }

  addFruit(snake: Snake): void {
    let x = Math.floor(Math.random() * X_CELLS);
    let y = Math.floor(Math.random() * Y_CELLS);

    let collision = false;
    for (let i = 0; i < snake.body.length; i++) {
      let [piece_x, piece_y] = snake.body[i];
      if (piece_x === x && piece_y === y) {
        collision = true;
        // Keep trying?
      }
    }

    if (!collision) {
      this.grid[x][y] = CellType.Food;
    }
  }

  updateSnake(snake: Snake, direction: Direction): GameError | null {
    let error = snake.moveSnake(this, direction);
    // Set the pieces (We can do self collision here)
    snake.body.forEach((piece, idx) => {
      let [piece_x, piece_y] = piece;
      if (this.grid[piece_x][piece_y] === CellType.Food) {
        snake.setOnMove(true);
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

  renderBoard(ctx: CanvasRenderingContext2D): void {
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

  clear(): void {
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
}

class Snake {
  body: Array<[number, number]>;
  growOnMove: boolean;

  constructor(snake: Array<[number, number]>) {
    this.body = snake;
    this.growOnMove = false;
  }

  getHead(): [number, number] {
    return this.body[0];
  }

  moveSnake(board: Board, direction: Direction): GameError | null {
    let error = null;
    let newPiece: [number, number];
    let [headX, headY] = this.getHead();
    switch (direction) {
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
  let board = new Board(X_CELLS, Y_CELLS);
  let direction = Direction.Right;

  // Create snake
  let snake = new Snake([[3, 10], [2, 10], [1, 10]]);

  document.addEventListener('keypress', event => {
    const { keyCode } = event;
    switch (keyCode) {
      case 37:
        if (direction === Direction.Right) { break; }
        direction = Direction.Left;
        break;
      case 38:
        if (direction === Direction.Down) { break; }
        direction = Direction.Up;
        break;
      case 39:
        if (direction === Direction.Left) { break; }
        direction = Direction.Right;
        break;
      case 40:
        if (direction === Direction.Up) { break; }
        direction = Direction.Down;
        break;
    }
  });

  _intervalRef = setInterval(() => {
    // Delete
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    board.clear();

    // Update the snake
    let gameError = board.updateSnake(snake, direction);
    if (gameError != null) {
      // Draw one more tick for User Experience purposes
      // TODO: Draw Collision?
      if (gameError.kind == GameErrorType.GameOver) {
        if (Math.random() < 0.1) {
          board.addFruit(snake);
        }
        board.renderBoard(ctx);
      }
      alert("Game Over!");
      STOP();
    }

    if (Math.random() < 0.1) {
      board.addFruit(snake);
    }
    board.renderBoard(ctx);
    // Draw
  }, 1000/6);

}


function STOP() {
  clearInterval(_intervalRef);
}
