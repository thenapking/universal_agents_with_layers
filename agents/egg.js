class EggGroup extends CircularGroup {
  constructor(n, center, radius, boundaries, boundary_factor, options = {}){
    super(n, center, radius, boundaries, boundary_factor, options);
    this.angle = 0;
    this.counter = 0
  }
  initialize() {
    this.agents.push(new EggAgent(this.center, this));
  }

  update(){
    this.new_grid();
    let active = 0;

    for (let agent of this.agents) {
      this.enforce_boundaries(agent, 0.001);
      let sep = agent.separation(this.grid);
      let coh = agent.cohesion(this.agents);

      agent.applyForce(coh, 0.05);
      agent.applyForce(sep, 0.3);
      agent.update();
      if (agent.active) active++;
    }

    if(this.agents.length < this.n) {
      this.spawn()
      this.spawn()
      this.spawn()
    }
    return active;
  }

  spawn() {
    let a = 0
    let b = 3
    let r = a + b * this.angle;
    let x = this.center.x + r * cos(this.angle);
    let y = this.center.y + r * sin(this.angle);
    let position = createVector(x, y);
    let agent = new EggAgent(position, this);
    agent.size = 20
    agent.separation_radius = agent.size * 1;
    this.agents.push(agent);
    this.angle += 0.2;    // adjust for desired spacing
  }
}

class EggAgent extends CircularAgent {
  constructor(position, group, separation_radius) {
    super(position, group, separation_radius);
    this.vel = createVector(0, 0);
  }

  draw() {
    push();
      ellipse(this.position.x, this.position.y, this.size, this.size);
    pop();
  }
}
