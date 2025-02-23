class DifferentialGroup extends Group {
  constructor(n, center, radius, boundaries, options = {}) {
    super(n, center, radius, boundaries);
    this.desiredDistance = options.desiredDistance || 20;
    this.maxSegmentLength = options.maxSegmentLength || 15;
    this.minSegmentLength = options.minSegmentLength || 5;
    this.repulsionRadius = options.repulsionRadius || 40;
    this.attractionFactor = options.attractionFactor || 0.5;
    this.alignmentFactor = options.alignmentFactor || 0.02;
    this.repulsionFactor = options.repulsionFactor || 1.2;
    this.stepSize = options.stepSize || 20;
  }

  initialize() {
    for (let i = 0; i < this.n; i++) {
      let angle = map(i, 0, this.n, 0, TWO_PI);
      let x = this.center.x + this.radius * cos(angle);
      let y = this.center.y + this.radius * sin(angle);
      this.agents.push(new DifferentialAgent(createVector(x, y), this));
    }
  }

  assignNeighbors() {
    for (let i = 0; i < this.agents.length; i++){
      let left = this.agents[(i - 1 + this.agents.length) % this.agents.length];
      let right = this.agents[(i + 1) % this.agents.length];
      this.agents[i].setNeighbors(left, right);
    }
  }

  update() {
    this.assignNeighbors();
    
    // Create and populate a grid for efficient neighbor lookup
    let grid = new Grid();
    for (let agent of this.agents) {
      grid.add(agent);
    }
    
    // Update each agent using the grid for repulsion calculations
    for (let agent of this.agents) {
      let forceAttraction = agent.attraction();
      let forceAlignment  = agent.alignment();
      let forceRepulsion  = agent.repulsion(grid);  // Pass grid here
      
      agent.applyForce(forceAttraction, this.attractionFactor);
      agent.applyForce(forceAlignment,  this.alignmentFactor);
      agent.applyForce(forceRepulsion,  this.repulsionFactor);

      this.enforce_boundary(agent);
    }

    this.add_agents();
    this.remove_agents();
  }

  enforce_boundary(agent) {
    for (let boundary of this.boundaries) {
      let dir = p5.Vector.sub(agent.position, boundary.center);
      let dist = dir.mag();
      
      if (dist > boundary.radius) {
        dir.setMag(boundary.radius); 
        agent.position.set(p5.Vector.add(boundary.center, dir));
      }
    }
  }

  add_agents() {
    let new_agents = [];
    for (let i = 0; i < this.agents.length; i++) {
      let current = this.agents[i];
      let right = this.agents[(i + 1) % this.agents.length];
      new_agents.push(current);

      let d = p5.Vector.dist(current.position, right.position);
      if (d > this.maxSegmentLength) {
        let mid = p5.Vector.add(current.position, right.position).mult(0.5);
        let new_agent = new DifferentialAgent(mid, this);
        new_agents.push(new_agent);
      }
    }
    this.agents = new_agents;
  }

  remove_agents() {
    let new_agents = [];
    for (let i = 0; i < this.agents.length; i++) {
      let current = this.agents[i];
      let right = this.agents[(i + 1) % this.agents.length];
      let d = p5.Vector.dist(current.position, right.position);
      if (d > this.minSegmentLength) {
        new_agents.push(current);
      }
    }
    this.agents = new_agents;
  }

  draw() {
    // this.draw_with_blobs();
    this.draw_with_lines();
  }

  draw_line(size = 2) {
    push();
      stroke(128, 128, 128);
      strokeWeight(size);
      beginShape();
        for (let agent of this.agents) {
          vertex(agent.position.x, agent.position.y);
        }
      endShape(CLOSE);
    pop();
  }

  draw_with_dots(size = 7) {
    push();
      noStroke();
      fill(palette.pen);
      for (let agent of this.agents) {
        circle(agent.position.x, agent.position.y, size);
      }
    pop();
  }

  draw_with_blobs() {
    this.draw_line(size * 0.75);

    for (let i = 0; i < this.agents.length - 1; i++) {
      let agent = this.agents[i];
      let next_agent = this.agents[i + 1];
      let tangent = p5.Vector.sub(next_agent.position, agent.position).normalize();
      let angle = tangent.heading();

      push();
        noStroke();
        fill(palette.pen);
        translate(agent.position.x, agent.position.y);
        rotate(angle);
        ellipse(0, 0, size/2, size);
      pop();
    }
  }

  draw_with_lines(size = 10) {
    this.draw_line(size*2);

    push();
      stroke(palette.pen);
      strokeWeight(2);
      for (let i = 0; i < this.agents.length - 1; i++) {
        let agent = this.agents[i];
        let next_agent = this.agents[i + 1];
        let tangent = p5.Vector.sub(next_agent.position, agent.position).normalize();
        let normal = createVector(-tangent.y, tangent.x).mult(size)
        let top = p5.Vector.add(agent.position, normal);
        let bottom = p5.Vector.sub(agent.position, normal);
        line(top.x, top.y, bottom.x, bottom.y);
      }
    pop();
  }
}

class DifferentialAgent extends Agent {
  constructor(position, group) {
    super(position, group);
    this.left = null;
    this.right = null;
    this.desiredDistance = this.group.desiredDistance;
    this.repulsionRadius = this.group.repulsionRadius;
    this.stepSize = this.group.stepSize;
  }

  setNeighbors(left, right) {
    this.left = left;
    this.right = right;
  }

  applyForce(force, factor) {
    let f = force.copy();
    f.mult(factor).limit(this.stepSize);
    this.position.add(f);
  }

  attraction() {
    let forceAttraction = createVector(0, 0);
    let dist_left =  p5.Vector.dist(this.position, this.left.position);
    let dist_right = p5.Vector.dist(this.position, this.right.position);
    
    if (dist_left > this.desiredDistance) {
      let attract = p5.Vector.sub(this.left.position, this.position);
      forceAttraction.add(attract);
    }
  
    if (dist_right > this.desiredDistance) {
      let attract = p5.Vector.sub(this.right.position, this.position);
      forceAttraction.add(attract);
    }
  
    return forceAttraction;
  }
  
  alignment() {
    let midpoint = p5.Vector.add(this.left.position, this.right.position).div(2);
    let forceAlignment = p5.Vector.sub(midpoint, this.position);
    return forceAlignment;
  }
  
  repulsion(grid) {
    let forceRepulsion = createVector(0, 0);
    let col = Math.floor(this.position.x / CELL_SIZE);
    let row = Math.floor(this.position.y / CELL_SIZE);
    
    let neighbors = grid.getNeighbours(col, row);
    for (let other of neighbors) {
      if (other === this || other === this.left || other === this.right) continue;
      let d = p5.Vector.dist(this.position, other.position);
      if (d < this.repulsionRadius && d > 0) {
        let repulse = p5.Vector.sub(this.position, other.position)
                        .normalize()
                        .mult((this.repulsionRadius - d) / this.repulsionRadius);
        forceRepulsion.add(repulse);
      }
    }
  
    return forceRepulsion;
  }
}
