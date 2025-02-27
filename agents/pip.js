class PipGroup extends CircularGroup {
  initialize() {
    for (let i = 0; i < this.n; i++) {
      let x = random(this.center.x*0.75, this.center.x*1.25)
      let y = random(this.center.y*0.75, this.center.y*1.25)
      this.agents.push(new PipAgent(createVector(x, y), this));
    }
  }
}

class PipAgent extends CircularAgent {
  set_size() {
    let nz = noise(this.position.x * this.noiseScale, this.position.y * this.noiseScale);
    this.size = lerp(this.minSize, this.maxSize, nz);
    this.separation_radius = this.size * 1.5;
  }

  draw() {
    push();

      noStroke();
      fill(palette.pen);
      
      if(this.group.style == "bg") {
        fill(palette.bg);
      }
      
      ellipse(this.position.x, this.position.y, this.size, this.size);
    pop();
  }
}
