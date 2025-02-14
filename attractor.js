class Attractor {
  constructor(x = random(width), y=random(height-200)) {
    this.position = createVector(x, y);
    this.x = this.position.x;
    this.y = this.position.y;
    this.active = true;
    this.segments = [];
  }

  draw() {
    ellipse(this.position.x, this.position.y, 4);
  }
}
