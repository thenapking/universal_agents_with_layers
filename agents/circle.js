class CircularGroup extends Group {
  constructor(n, center, radius, boundaries, boundary_factor, options = {}){
    super(n, center, radius, boundaries, boundary_factor);
    this.noiseScale = options.noiseScale;
    this.minSize = options.minSize;
    this.maxSize = options.maxSize;
  }

  initialize() {
    for (let i = 0; i < this.n; i++) {
      let x = random(this.center.x*0.2, this.center.x*1.8)
      let y = random(this.center.y*0.2, this.center.y*1.8)
      this.agents.push(new CircularAgent(createVector(x, y), this));
    }
  }

  update(){
    let active = 0;
    for (let agent of this.agents) {
      this.enforce_boundaries(agent);
      let sep = agent.separation(this.agents);
      agent.set_size();
      agent.applyForce(sep);
      agent.update();
      if (agent.active) active++;
    }
    return active;
  }
}

class CircularAgent extends Agent {
  constructor(position, group) {
    super(position, group);
    this.noiseScale = group.noiseScale;
    this.minSize = group.minSize;
    this.maxSize = group.maxSize;
  }

  set_size() {
    let nz = noise(this.position.x * this.noiseScale, this.position.y * this.noiseScale);
    this.size = lerp(this.minSize, this.maxSize, nz);
  }

  draw() {
    ellipse(this.position.x, this.position.y, this.size, this.size);
  }
}

let circular_group;

function createCircularGroups(){
  let boundsArr = [];
  for(let bound of boundaries){
    let center = bound.center.copy();
    let radius = bound.radius*CIRCLE_SPACING;
    let boundary = new Boundary("circle", {center: center, radius: radius, mode: "exclude"});
    boundsArr.push(boundary);
  }
  let center = createVector(width/2, height/2);
  let boundary_factor = 0.1
  circular_group = new CircularGroup(NUM_SEEDS, center, 0, boundsArr, boundary_factor);
  circular_group.initialize();
  groups.push(circular_group);
}

