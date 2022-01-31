import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
function Square(props) {
  return (
    <button className="square" onClick={props.onClick} style={{backgroundColor: props.bgColor}} >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        bgColor = {this.props.bgColor[i]}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null)
        }
      ],
      stepNumber: 0,
      xIsNext: true,
      squareSelected: -1,
      bgColor: Array(9).fill("white")
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const after3Move = (this.state.stepNumber > 5);
    const squareSelected = this.state.squareSelected;
    const color = this.state.bgColor;
    // if winner exists, don't execute anything
    if (calculateWinner(squares)) {
      return;
    }
    // otherwise, check if it's after 3 moves
    if (after3Move){
      this.handle4thMoveOn(i);
      // console.log("square Selected: " + squareSelected);
      // console.log("bgColor: " + color);
      return;
    }
    //if it's not after3 moves, do the following
    if (squares[i]){
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  // case after3moves: 
  handle4thMoveOn(i){
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const player = (this.state.xIsNext ? "X" : "O")
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const squareSelected = this.state.squareSelected;
    const bgColor = this.state.bgColor;
    const middle = squares[4];
// case square has not been selected: 
    // player has to select a nonempty spot, meaning squares(i) == player
    if (squareSelected == -1){
      // can only select player's own squares
      if (squares[i] != player){
        return;
      }
      // if middle is occupied and player select a spot that is not middle and cannot win, return
      if (middle == player && i != 4 && this.moveWillNotWin(i)){
        return;
      }
      //else make the game remember selected square
      bgColor[i] = "yellow";
      this.setState({
        squareSelected: i,
        bgColor: bgColor,
      });
// else if player unclick the selected the square, he can choose another square
    } else if(i == squareSelected){
      bgColor[i] = "white";
      this.setState({
        squareSelected: -1,
        bgColor: bgColor,
      });
// case square is selected & player did not unclick:
    } else {
      // player must move the selected square to an empty place
      if (!areNeighbors(squareSelected, i) || squares[i] != null){
        return;
      }
      // if middle is occupied & selected is not middle square, directly return if next move cannot win
      if (middle == player && squareSelected != 4){
        var squareScenario = squares;
        squareScenario[i] = player;
        squareScenario[squareSelected] = null;
        if (calculateWinner(squareScenario) != player){
          return;
        }
      }
      // else player's choice is valid
      squares[i] = player;
      squares[squareSelected] = null;
      this.setState({
        history: history.concat([
          {
            squares: squares,
          }
        ]),
        stepNumber: history.length,
        xIsNext: !this.state.xIsNext,
        squareSelected: -1,
        bgColor: Array(9).fill("white"),
      });
    }  
  }

  moveWillNotWin(i){
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const player = (this.state.xIsNext ? "X" : "O");
    // check for each valid squares that ith piece can move to, if it can go to a spot where player wins, return false
    for (let j = 0; j < neighbor[i].length; j++){
      const attemptedMove = neighbor[i][j];
      if (squares[attemptedMove] == null){
        var squareScenario = squares;
        squareScenario[attemptedMove] = player;
        squareScenario[i] = null;
        if (calculateWinner(squareScenario) == player){
          return false;
        }
      }
    }
    return true;
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={i => this.handleClick(i)}
            bgColor={this.state.bgColor}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

const neighbor = {
  0: [1,3,4],
  1: [0,2,3,4,5],
  2: [1,4,5],
  3: [0,1,4,6,7],
  4: [0,1,2,3,5,6,7,8],
  5: [1,2,4,7,8],
  6: [3,4,7],
  7: [3,4,5,6,8],
  8: [4,5,7]
}

function areNeighbors(squareSelected, i){
  for (let j = 0; j < neighbor[squareSelected].length; j++){
    if (neighbor[squareSelected][j] == i){
      return true;
    }
  }
  return false;
}

