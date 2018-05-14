const WIDTH = 500;
const HEIGHT = 400;

window.onload = () => {
  const canvas: HTMLCanvasElement | null = document.getElementById("canvas") as HTMLCanvasElement | null;
  if (canvas == null) { throw new Error("Cannot find canvas element"); }
  canvas.width = WIDTH; // 25
  canvas.height = HEIGHT; // 20

  const ctx = canvas.getContext('2d');
  if (ctx == null) { throw new Error("Null CTX") }

  // Create board
  let board = createBoard(25, 20);
  let direction = 3; // 0 - left, 1, up, etc

  // Create snake
  let snake = [[12, 10], [13, 10], [14, 10]];

  // Handle not allowing opposite directions
  document.addEventListener('keypress', event => {
    const { keyCode } = event;
    console.log(keyCode);
    switch (keyCode) {
      case 38:
        direction = 3;
        break;
      case 39:
        direction = 2;
        break;
      case 40:
        direction = 1;
        break;
      case 37:
        direction = 0;
        break;
    }
  });

  // Game
  setInterval(() => {
    // Delete
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    board = createBoard(25, 20);

    // Update
    let newPiece;
    switch (direction) {
        // TODO: Make this less... bad
      case 0:
        let x = snake[0][0] - 1;
        if (x < 0) {
          x = 24;
        }
        newPiece = [x, snake[0][1]];
        break;
      case 1:
        let y = snake[0][1] + 1;
        if (y > 19) {
          y = 0;
        }
        newPiece = [snake[0][0], y];
        break;
      case 2:
        let _x = snake[0][0] + 1;
        if (_x > 24) {
          _x = 0;
        }
        newPiece = [_x, snake[0][1]];
        break;
      case 3:
        let _y = snake[0][1] - 1;
        if (_y < 0) {
          _y = 19;
        }
        newPiece = [snake[0][0], _y];
        break;
      default:
        throw new Error('Invalid direction');
    }

    // Shift the head to the left
    snake = [newPiece, ...snake.splice(0, snake.length - 1)];
    // Set the pieces (We can do self collision here)
    snake.forEach(piece => {
      board[piece[0]][piece[1]] = 1;
    });

    // Draw
    for (let j = 0; j < board.length; j++) {
      let column = board[j];
      for (let i = 0; i < column.length; i++) {
        let cell = column[i];
        if (cell === 1) {
          //console.log(j, i);
          ctx.fillRect(j * 20, i * 20, 20, 20);
        }
      }
    }
  }, 1000/4);

}

function createBoard(width: number, height: number): Array<Array<Number>> {
  const board = new Array(width);
  for (let i = 0; i < board.length; i++) {
    board[i] = new Array(height);
  }
  return board;
}
