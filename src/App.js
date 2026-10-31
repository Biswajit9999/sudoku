import { useState } from "react";
import "./App.css";

const emptyBoard = () =>
  Array.from({ length: 9 }, () => Array(9).fill(""));

// Collect every cell that shares a value with another cell in the same unit
const findConflicts = (board) => {
  const conflicts = new Set();

  const checkUnit = (cells) => {
    const seen = new Map(); // value -> [ "r-c", ... ]
    for (const [r, c] of cells) {
      const value = board[r][c];
      if (!value) continue; // ignore empty cells
      if (!seen.has(value)) seen.set(value, []);
      seen.get(value).push(`${r}-${c}`);
    }
    for (const positions of seen.values()) {
      if (positions.length > 1) {
        positions.forEach((p) => conflicts.add(p));
      }
    }
  };

  for (let i = 0; i < 9; i++) {
    // row i
    checkUnit(Array.from({ length: 9 }, (_, c) => [i, c]));
    // column i
    checkUnit(Array.from({ length: 9 }, (_, r) => [r, i]));
  }

  // 3x3 boxes
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const cells = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          cells.push([boxRow * 3 + r, boxCol * 3 + c]);
        }
      }
      checkUnit(cells);
    }
  }

  return conflicts;
};

function App() {
  const [board, setBoard] = useState(emptyBoard);
  const [conflictingCells, setConflictingCells] = useState(new Set());
  const [message, setMessage] = useState("");
  const [isValid, setIsValid] = useState(null);

  const clearFeedback = () => {
    setConflictingCells(new Set());
    setMessage("");
    setIsValid(null);
  };

  const handleChange = (row, col, raw) => {
    // allow only a single digit 1-9, or empty
    if (raw !== "" && !/^[1-9]$/.test(raw)) return;

    setBoard((prev) =>
      prev.map((r, ri) =>
        ri === row ? r.map((v, ci) => (ci === col ? raw : v)) : r
      )
    );
    clearFeedback();
  };

  const handleValidate = () => {
    const conflicts = findConflicts(board);
    setConflictingCells(conflicts);

    if (conflicts.size > 0) {
      setIsValid(false);
      setMessage("Invalid Sudoku! Conflicts found.");
    } else {
      setIsValid(true);
      setMessage("Sudoku is valid so far!");
    }
  };

  const handleClear = () => {
    setBoard(emptyBoard());
    clearFeedback();
  };

  return (
    <div className="page">
      <div className="card">
        <h1>Sudoku Validator</h1>
        <p className="subtitle">Enter numbers 1–9 and validate the board.</p>

        <div className="board">
          {board.map((row, r) =>
            row.map((value, c) => (
              <input
                key={`${r}-${c}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className={`cell ${
                  conflictingCells.has(`${r}-${c}`) ? "invalid" : ""
                }`}
                value={value}
                onChange={(e) => handleChange(r, c, e.target.value)}
                aria-label={`Row ${r + 1} Column ${c + 1}`}
              />
            ))
          )}
        </div>

        <div className="actions">
          <button type="button" className="btn validate" onClick={handleValidate}>
            Validate
          </button>
          <button type="button" className="btn clear" onClick={handleClear}>
            Clear
          </button>
        </div>

        {message && (
          <p className="message">
            <span className="icon" aria-hidden="true">
              {isValid ? "✅" : "❌"}
            </span>
            <span>{message}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default App;