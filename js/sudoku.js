class SudokuGame {
    constructor() {
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.initializeGame();
    }

    generateRandomComplete() {
        const board = Array(9).fill().map(() => Array(9).fill(0));

        // Fill diagonal 3x3 boxes first (they are independent)
        for(let box = 0; box < 9; box += 3) {
            const nums = [1,2,3,4,5,6,7,8,9];
            for(let i = 0; i < 3; i++) {
                for(let j = 0; j < 3; j++) {
                    const randomIndex = Math.floor(Math.random() * nums.length);
                    board[box + i][box + j] = nums[randomIndex];
                    nums.splice(randomIndex, 1);
                }
            }
        }

        // Solve the rest
        this.solveSudoku(board);
        return board;
    }

    createPuzzle(completeBoard, difficulty = 40) {
        const puzzle = completeBoard.map(row => [...row]);
        const positions = [];

        for(let i = 0; i < 9; i++) {
            for(let j = 0; j < 9; j++) {
                positions.push([i, j]);
            }
        }

        while(positions.length > 0 && difficulty > 0) {
            const randomIndex = Math.floor(Math.random() * positions.length);
            const [row, col] = positions[randomIndex];
            positions.splice(randomIndex, 1);

            const temp = puzzle[row][col];
            puzzle[row][col] = 0;

            const boardCopy = puzzle.map(row => [...row]);

            if(!this.hasUniqueSolution(boardCopy)) {
                puzzle[row][col] = temp;
            } else {
                difficulty--;
            }
        }

        return puzzle;
    }

    hasUniqueSolution(board) {
        let solutions = 0;

        const solve = (board) => {
            if(solutions > 1) return;

            let find = this.findEmpty(board);
            if(!find) {
                solutions++;
                return;
            }

            const [row, col] = find;
            for(let num = 1; num <= 9; num++) {
                if(this.isValid(num, [row, col], board)) {
                    board[row][col] = num;
                    solve(board);
                    board[row][col] = 0;
                }
            }
        }

        solve(board);
        return solutions === 1;
    }

    initializeGame() {
        const completeBoard = this.generateRandomComplete();
        const puzzle = this.createPuzzle(completeBoard);
        this.grid = puzzle.map(row => [...row]);
        this.solution = completeBoard;
    }

    isValid(num, pos, board) {
        const [row, col] = pos;

        for(let x = 0; x < 9; x++) {
            if(board[row][x] === num && x !== col) {
                return false;
            }
        }

        for(let x = 0; x < 9; x++) {
            if(board[x][col] === num && x !== row) {
                return false;
            }
        }

        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;

        for(let i = boxRow; i < boxRow + 3; i++) {
            for(let j = boxCol; j < boxCol + 3; j++) {
                if(board[i][j] === num && (i !== row || j !== col)) {
                    return false;
                }
            }
        }

        return true;
    }

    findEmpty(board) {
        for(let i = 0; i < 9; i++) {
            for(let j = 0; j < 9; j++) {
                if(board[i][j] === 0) {
                    return [i, j];
                }
            }
        }
        return null;
    }

    solveSudoku(board) {
        let find = this.findEmpty(board);
        if(!find) {
            return board;
        }

        const [row, col] = find;

        for(let num = 1; num <= 9; num++) {
            if(this.isValid(num, [row, col], board)) {
                board[row][col] = num;

                if(this.solveSudoku(board)) {
                    return board;
                }

                board[row][col] = 0;
            }
        }

        return false;
    }

    getValidNumbers(row, col) {
        const validNums = [];
        for(let num = 1; num <= 9; num++) {
            if(this.isValid(num, [row, col], this.grid)) {
                validNums.push(num);
            }
        }
        return validNums;
    }

    isComplete() {
        for(let i = 0; i < 9; i++) {
            for(let j = 0; j < 9; j++) {
                if(this.grid[i][j] !== this.solution[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }
}

class SudokuUI {
    constructor() {
        this.game = new SudokuGame();
        this.cells = Array(9).fill().map(() => Array(9));
        this.initializeUI();
    }

    initializeUI() {
        const table = document.getElementById('sudoku');

        for(let i = 0; i < 9; i++) {
            const row = table.insertRow();
            for(let j = 0; j < 9; j++) {
                const cell = row.insertCell();
                cell.className = 'cell';

                if(j === 2 || j === 5) {
                    cell.classList.add('block-border-right');
                }
                if(i === 2 || i === 5) {
                    cell.classList.add('block-border-bottom');
                }

                const value = this.game.grid[i][j];
                if(value !== 0) {
                    cell.textContent = value;
                    cell.classList.add('prefilled');
                } else {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'cell-input';
                    input.maxLength = 1;

                    const validNumbers = document.createElement('div');
                    validNumbers.className = 'valid-numbers';
                    validNumbers.textContent = `Valid: ${this.game.getValidNumbers(i, j).join(', ')}`;

                    cell.appendChild(input);
                    cell.appendChild(validNumbers);

                    // Storing the reference to the cell for easy access
                    this.cells[i][j] = {
                        input,
                        validNumbers
                    };

                    input.addEventListener('input', (e) => {
                        const num = parseInt(e.target.value);
                        if(isNaN(num)) {
                            e.target.value = '';
                            this.game.grid[i][j] = 0;
                            this.updateAllValidNumbers();
                            return;
                        }

                        if(!this.game.isValid(num, [i, j], this.game.grid)) {
                            alert('Not valid!');
                            e.target.value = '';
                            this.game.grid[i][j] = 0;
                            this.updateAllValidNumbers();
                            return;
                        }

                        this.game.grid[i][j] = num;
                        this.updateAllValidNumbers();

                        if(this.game.isComplete()) {
                            alert('Congratulations! You solved the puzzle!');
                        }
                    });
                }
            }
        }
    }

    updateAllValidNumbers() {
        for(let i = 0; i < 9; i++) {
            for(let j = 0; j < 9; j++) {
                if(this.cells[i][j]) { // If it's an empty cell
                    const validNums = this.game.getValidNumbers(i, j);
                    this.cells[i][j].validNumbers.textContent = `Valid: ${validNums.join(', ')}`;
                }
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SudokuUI();
});