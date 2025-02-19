class SpaceFillingGroup extends Group {
  constructor(n, center, radius, boundaries, boundary_factor, options = {}){
    super(n, center, radius, boundaries, boundary_factor);
    this.noiseScale = options.noiseScale;
    this.minSize = options.minSize;
    this.maxSize = options.maxSize;
    this.repellers = options.repellers;
  }

  initialize() {
    for (let i = 0; i < this.n; i++) {
      let x = random(this.center.x*0.2, this.center.x*1.8)
      let y = random(this.center.y*0.2, this.center.y*1.8)
      this.agents.push(new SpaceFillingAgent(createVector(x, y), this));
    }
  }

  update(){
    let active = 0;
    for (let agent of this.agents) {
      // this.enforce_boundaries(agent);
      let sep = agent.separation(this.agents);
      let repell = agent.repell(this.repellers);

      agent.applyForce(repell, 2.5);
      agent.applyForce(sep, 2.6);

      agent.update();
      if (agent.active) active++;
    }
    return active;
  }
}

class SpaceFillingAgent extends Agent {
  constructor(pos, group) {
    super(pos, group);
    this.noiseScale = group.noiseScale;
    this.minSize = group.minSize;
    this.maxSize = group.maxSize;
    this.size = 20
  }

  repell(repellers){
    let steer = createVector(0, 0);
    let count = 0;
    for (let repeller of repellers) {
      let d = p5.Vector.dist(this.pos, repeller.position);
      if (d < 20) { 
        let diff = p5.Vector.sub(this.pos, repeller.position);
        diff.normalize();
        if(d>1) { diff.div(d); }
        steer.add(diff);
        count++;
      }
    }
    if (count > 0) {
      steer.div(count);
      steer.setMag(this.maxSpeed);
      steer.sub(this.vel);
      steer.limit(this.maxForce);
      return steer;
    } else {
      let stop = this.vel.copy().mult(-1);
      stop.limit(this.maxForce);
      return stop;
    }
  }


  draw() {
    ellipse(this.pos.x, this.pos.y, this.size, this.size);
  }
}

