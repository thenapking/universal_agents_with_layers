class Group {
  constructor(n, center, radius, boundaries, boundary_factor = 1){
    this.center = center.copy();
    this.radius = radius;
    this.n = n;
    this.agents = [];
    this.boundaries = boundaries || [];
    this.boundary_factor = boundary_factor;
    this.active = true;
    this.grid = new Grid();
  }
  
  initialize() {
    for (let i = 0; i < this.n; i++) {
      this.agents.push(new Agent(this.center.copy(), this));
    }
  }
  
  enforce_boundaries(agent, strength = 4){
    let force = createVector(0, 0);
    for(let boundary of this.boundaries){
      force.add(boundary.steer(agent));
    }
    agent.applyForce(force, strength);
  }
  
  new_grid(){
    let grid = new Grid();
    for (let agent of this.agents) {
      grid.add(agent);
    }
    this.grid = grid;
    return grid;
  }

  add_to_grid(grid, new_agent){
    try {
      grid.add(new_agent);
    } catch (error) {
      this.remove(new_agent);
      return false
    }
    return true
  }

  remove(agent){
    let index = this.agents.indexOf(agent);
    if (index !== -1) {
      this.agents = this.agents.splice(index, 1);
    }
  }

  draw(){
    for (let agent of this.agents){
      agent.draw();
    }
  }

  create_vertices(base) {
    let points = [];
    let n = int(random(5, 8))
    let desired = base * 0.15

    for (let i = 0; i < n; i++) {
      let angle = i*TWO_PI/n;

      let nz = noise(cos(angle) * 10, sin(angle) * 10, i);
      let r = base*0.5 + map(nz, 0, 1, -desired, desired);
      // r = constrain(r, this.minSize*0.5, this.maxSize * 0.75);
      let x = r * cos(angle);
      let y = r * sin(angle);


      points.push(createVector(x, y));
    }
    return points;
  }
}
