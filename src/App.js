import { useState } from 'react';

function Square({ value, onSquareClick, classNames }) {
  return <button className={classNames} onClick={onSquareClick}>{value}</button>;
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [reverseMoveOrder, setReverseMoveOrder] = useState(false);
  const currentSquares = history[currentMove];
  const xIsNext = currentMove % 2 === 0;

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length-1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((squares, move) => {
    let element;
    let description;

    if (currentMove === 0 && move === 0) {
      return;
    }
    
    if (move !== currentMove) {
      if (move > 0) {
        description = "Go to move #" + move;
      } else {
        description = "Go to game start";
      }
      element = <button onClick={() => jumpTo(move)}>{description}</button>;
    } else {
      element = <span>You are at move #{move}</span>
    }

    return (
      <li key={move}>
        { element }
      </li>
    );
  });

  function onToggleClick() {
    setReverseMoveOrder(!reverseMoveOrder);
  }

  const orderedMoves = reverseMoveOrder ? [...moves].reverse() : [...moves];

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} currentMove={currentMove}/>
      </div>
      <div className="game-info">
        <button className="toggle" onClick={ onToggleClick }>Toggle move order</button>
        <ul>{orderedMoves}</ul>
      </div>
    </div>
  );
}

function Board({xIsNext,squares,onPlay, currentMove}) {
  function handleClick(i) {
    if (squares[i] || calculateWinner(squares)) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    onPlay(nextSquares);
  }
  const winnerData = calculateWinner(squares);
  const winner = winnerData?.winner;
  const winningSquares = winnerData?.winningSquares ?? [];
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else {
    if (currentMove === 9) {
      status = "Game over, it's a draw"
    } else {
      status = "Next player: " + (xIsNext ? "X" : "O");
    }
  }

  let boardCols = Array(9).fill(null).map((cols, i) => {
    let squareClassNames = ["square"];
    if (winningSquares.includes(i)) {
      squareClassNames.push("winner");
    }
    return <Square key={i} classNames={squareClassNames.join(" ")}  value={squares[i]} onSquareClick={() => {handleClick(i)}}/>
  });

  let boardRows = [];
  for (let i = 0; i < 12; i+=3) {
    let thisRowsCols = boardCols.slice(i,i+3);
    boardRows.push(<div key={i} className="board-row">{thisRowsCols}</div>);
  }

  return (
    <>
      <div className="status">{status}</div>
      {boardRows}
    </>
  ); 

  /* Slightly more elegant method that only uses one loop, provided by AI. Provided here for reference. The idea of using a function to generate the JSX code for each square didn't occur to me but is clever. Using '_' as a variable name is done to show that the variable is intentionally unused.

  const renderSquare = (i) => (
    <Square key={i} value={squares[i]} onSquareClick={() => handleClick(i)} />
  );

  const boardRows = Array.from({ length: 3 }, (_, rowIndex) => {
    const start = rowIndex * 3;
    const squaresInRow = Array.from({ length: 3 }, (_, colIndex) => renderSquare(start + colIndex));
    
    return (
      <div key={rowIndex} className="board-row">
        {squaresInRow}
      </div>
    );
  });

  return (
    <>
      <div className="status">{status}</div>
      {boardRows}
    </>
  );
  */
}

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
      return {
        winner: squares[a],
        winningSquares: lines[i]
      }
    }
  }
  return null;
}