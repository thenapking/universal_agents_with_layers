class Attractor {
  constructor(x = random(width), y=random(height-200), obj) {
    this.position = createVector(x, y);
    this.x = this.position.x;
    this.y = this.position.y;
    this.active = true;
    this.segments = [];
    this.obj = obj;
  }

  neighbours() {
    return plant.attractor_grid.getNeighbours(Math.floor(this.position.x/cell_size), Math.floor(this.position.y/cell_size));
  }

  draw() {
    ellipse(this.position.x, this.position.y, 4);
  }
}
