class Grid {
  constructor() {
    this.cols = W/CELL_SIZE;
    this.rows = H/CELL_SIZE;
    this.cells = [];

    for (let i = -this.cols*2; i < this.cols*2; i++) {
      this.cells[i] = [];
      for (let j = -this.rows*2; j < this.rows*2; j++) {
        this.cells[i][j] = [];
      }
    }
  }

  add(item) {
    let col = Math.floor(item.position.x / CELL_SIZE);
    let row = Math.floor(item.position.y / CELL_SIZE);
    col = constrain(col, 1-this.cols*2, 2*this.cols - 1);
    row = constrain(row, 1-this.rows*2, 2*this.rows - 1);
    
    this.cells[col][row].push(item);
  }

  getNeighboursInCell(col, row) {
    if ( col >= 0 && col < this.cols 
      && row >= 0 && row < this.rows) {
      return this.cells[col][row];
    } else {
      return [];
    }
  }

  getNeighbours(col, row) {
    let items = [];
    for (let i = -1; i < 2; i++){
      for (let j = -1; j < 2; j++){
        items = items.concat(this.getNeighboursInCell(col + i, row + j));
      }
    }
    return items;
  }
}
