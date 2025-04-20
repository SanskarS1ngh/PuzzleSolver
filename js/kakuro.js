class KakuroGame {
    constructor() {
        const puzzle = [
            [{type:"block"},{type:"clue",sumvert:5},{type:"clue",sumvert:19},{type:"block"}],
            [{type:"clue",sumhori:13},{type:"empty",value:null},{type:"empty",value:null},{type:"clue",sumvert:4}],
            [{type:"clue",sumhori:12},{type:"empty",value:null},{type:"empty",value:null},{type:"empty",value:null}],
            [{type:"block"},{type:"clue",sumhori:3},{type:"empty",value:null},{type:"empty",value:null}]
        ];
        const sol = [
            [{type:"block"},{type:"clue",sumvert:5},{type:"clue",sumvert:19},{type:"block"}],
            [{type:"clue",sumhori:13},{type:"empty",value:4},{type:"empty",value:9},{type:"clue",sumvert:4}],
            [{type:"clue",sumhori:12},{type:"empty",value:1},{type:"empty",value:8},{type:"empty",value:3}],
            [{type:"block"},{type:"clue",sumhori:3},{type:"empty",value:2},{type:"empty",value:1}]
        ];
        this.grid = puzzle.map(row => [...row]);
        this.solution = sol.map(row => [...row]);
    }


    isValid(num, pos, board) {
        const [row, col] = pos;
        var horitarget = 0;
        var horisummin = num;
        var horisummax = num;
        for (let i=0;i<4;i++) {
            if (i==col) continue;
            if (board[row][i].type=="clue" && board[row][i].sumhori) {
                horitarget = board[row][i].sumhori;
            }
            if (board[row][i].type=="empty") {
                if (board[row][i].value) {
                    if (board[row][i].value==num) return false;
                    horisummin += board[row][i].value;
                    horisummax += board[row][i].value;
                }
                else {
                    horisummin += 1;
                    horisummax += 9;
                }
            }
        }
        if (horitarget!=0 && (horisummax<horitarget || horisummin>horitarget)) return false;
        var verttarget = 0;
        var vertsummin = num;
        var vertsummax = num;
        for (let i=0;i<4;i++) {
            if (i==row) continue;
            if (board[i][col].type=="clue" && board[i][col].sumvert) {
                verttarget = board[i][col].sumvert;
            }
            if (board[i][col].type=="empty") {
                if (board[i][col].value) {
                    if (board[i][col].value==num) return false;
                    vertsummin += board[i][col].value;
                    vertsummax += board[i][col].value;
                }
                else {
                    vertsummin += 1;
                    vertsummax += 9;
                }
            }
        }
        if (verttarget!=0 && (vertsummax<verttarget || vertsummin>verttarget)) return false;
        return true;
    }

    findEmpty(board) {
        for(let i = 0; i < 4; i++) {
            for(let j = 0; j < 4; j++) {
                if(board[i][j].type == "empty" && board[i][j].value == null) {
                    return [i, j];
                }
            }
        }
        return null;
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
        for(let i = 0; i < 4; i++) {
            for(let j = 0; j < 4; j++) {
                if(this.grid[i][j].type=="empty" && this.grid[i][j].value != this.solution[i][j].value) {
                    return false;
                }
            }
        }
        return true;
    }
}

class KakuroUI {
    constructor() {
        this.game = new KakuroGame();
        this.cells = Array(4).fill().map(() => Array(4));
        this.initializeUI();
    }

    initializeUI() {
        const table = document.getElementById('kakuro');

        for(let i = 0; i < 4; i++) {
            const row = table.insertRow();
            for(let j = 0; j < 4; j++) {
                const cell = row.insertCell();
                cell.className = 'cell';

                const cellval = this.game.grid[i][j];
                if(cellval.type == "block") {
                    cell.textContent = null;
                    cell.classList.add('blocked');
                } 
                else if (cellval.type == "clue") {
                    cell.classList.add('clue');
                    if (cellval.sumhori) {
                        cell.textContent = cellval.sumhori;
                        cell.classList.add('sum-horizontal');
                    }
                    else if (cellval.sumvert) {
                        cell.textContent = cellval.sumvert;
                        cell.classList.add('sum-vertical');
                    }
                }
                else {
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
                            this.game.grid[i][j].value = null;
                            this.updateAllValidNumbers();
                            return;
                        }

                        if(!this.game.isValid(num, [i, j], this.game.grid)) {
                            alert('Not valid!');
                            e.target.value = '';
                            this.game.grid[i][j].value = null;
                            this.updateAllValidNumbers();
                            return;
                        }

                        this.game.grid[i][j].value = num;
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
        for(let i = 0; i < 4; i++) {
            for(let j = 0; j < 4; j++) {
                if(this.cells[i][j]) { // If it's an empty cell
                    const validNums = this.game.getValidNumbers(i, j);
                    this.cells[i][j].validNumbers.textContent = `Valid: ${validNums.join(', ')}`;
                }
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new KakuroUI();
});