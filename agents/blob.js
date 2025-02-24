class BlobGroup extends CircularGroup {
  initialize() {
    for (let i = 0; i < this.n; i++) {
      let x = random(0, W)
      let y = random(0, H)
      let size = random(this.minSize, this.maxSize);

      this.agents.push(new BlobAgent(createVector(x, y), this, size, []));
    }
  }

  update(){
    let active = 0;
    for (let agent of this.agents) {
      this.enforce_boundaries(agent);
      let sep = agent.separation(this.agents, 2);
      agent.set_size();
      agent.applyForce(sep);
      agent.update();
      if (agent.active) active++;
    }
    return active;
  }

  create_blobs(){
    for (let agent of this.agents) {
      let points = this.create_vertices(agent.size);
      agent.points = points;
      agent.n = points.length;
    }
  }
}


class BlobAgent extends CircularAgent {
  constructor(position, group, size, points) {
      super(position, group);
      this.size = size*2 // 
      this.points = points;
      this.n = points.length;
      this.separation_radius = this.size * 1.75 // give it a bit of a margin
  }

  draw() {
    if(this.points.length > 3) {
      this.draw_blob();
    } else {
      this.draw_circle();
    } 
  }

  draw_circle() {
    push()
      translate(this.position.x, this.position.y);
      noFill();
      stroke(palette.pen)
      strokeWeight(2);

      circle(0, 0, this.size);
    pop()
  }
   
  draw_blob() {
    push()
      translate(this.position.x, this.position.y);
      noFill();
      stroke(palette.pen)
      strokeWeight(2);

      beginShape();
        curveVertex(this.points[this.n - 1].x, this.points[this.n - 1].y);
        
        for (let p of this.points) {
            curveVertex(p.x, p.y);
        }

        curveVertex(this.points[0].x, this.points[0].y);
        curveVertex(this.points[1].x, this.points[1].y);
      endShape();
    pop()
  }

  draw_html(){
    drawingContext.moveTo(this.position.x + this.size, this.position.y);
    drawingContext.arc(this.position.x, this.position.y, this.size/2, 0, TWO_PI, true);
  }

  draw_html_blob(){
    let last = this.points[this.n - 1];
    let first = this.points[0];
    let midX = (last.x + first.x) / 2;
    let midY = (last.y + first.y) / 2;

    drawingContext.translate(this.position.x, this.position.y);
    drawingContext.moveTo(midX, midY);
    
    for (let i = 0; i < this.n; i++) {
      let next = this.points[(i + 1) % this.n];
      let curr = this.points[i];
      let midX = (next.x + curr.x) / 2;
      let midY = (next.y + curr.y) / 2;
      drawingContext.quadraticCurveTo(curr.x, curr.y, midX, midY);
    }

    
    
    drawingContext.translate(-this.position.x, -this.position.y);
  }
    
}
