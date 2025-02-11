let groups = [];
let boundaries = [];
let numGroups = 5;
let minSize = 20;
let maxSize = 35;
let minSize_c = 3;
let maxSize_c = 40;
let noiseScale = 0.015;

function setup() {
  createCanvas(600, 600);
  createBoundaries();
  createEllipseGroups();
  createCircularGroups();
}

function draw() {
  background(255);
  let active = 0;
  for (let group of groups) {
    active += group.update();
  }
  if (active === 0) {
    console.log("All agents have come to rest.");
    noLoop();
  }
}

function createBoundaries(){
  let spacingFactor = 1.15;
  let attempts = 0;

  while(boundaries.length < numGroups && attempts < 20 * numGroups){
    let border = 0.2
    let x = random(width*border, width*(1-border));
    let y = random(height*border, height*(1-border));
    let center = createVector(x,y);
    let radius = random(60, 90);
    let valid = true;
    for (let other of boundaries) {
      let d = p5.Vector.dist(center, other.center);
      if (d < (radius + other.radius) * spacingFactor) {
        valid = false;
        break;
      }
    }
    if (valid) {
      let boundary = {center: center, radius: radius};
      boundaries.push(boundary);
    }
    attempts++;
  }
}

function createEllipseGroups(){
  for(let bound of boundaries){
    let center = bound.center.copy();
    let radius = bound.radius;
    let boundary = new Boundary("circle", {center: center, radius: radius, mode: "contain"});
    let group = new EllipseGroup(int(random(10, radius/3)), center, radius, [boundary]);
    group.initialize();
    groups.push(group);
  }
}

function createCircularGroups(){
  let boundsArr = [];
  for(let bound of boundaries){
    let center = bound.center.copy();
    let radius = bound.radius*1.25;
    let boundary = new Boundary("circle", {center: center, radius: radius, mode: "exclude"});
    boundsArr.push(boundary);
  }
  let center = createVector(width/2, height/2);
  let group = new CircularGroup(500, center, 0, boundsArr);
  group.initialize();
  groups.push(group);
}

class EllipseGroup extends Group {
  constructor(n, center, radius, boundaries) {
    super(n, center, radius, boundaries);
  }
  
  initialize() {
    for (let i = 0; i < this.n; i++) {
      this.agents.push(new EllipseAgent(this.center.copy()));
    }
  }

  update(){
    let active = 0;
    for (let agent of this.agents) {
      this.enforce_boundaries(agent);
      let sep = agent.separation(this.agents);
      let aliDelta = agent.align(this.agents);
      let radialDelta = agent.radialAlignment(this.center); 
      let align = aliDelta + radialDelta;
      agent.applyForce(sep);
      agent.applyAlignment(align);
      agent.update();
      agent.display();
      if (agent.active) active++;
    }
    return active;
  }
}

class CircularGroup extends Group {
  constructor(n, center, radius, boundaries) {
    super(n, center, radius, boundaries);
  }

  initialize() {
    for (let i = 0; i < this.n; i++) {
      this.agents.push(new CircularAgent(this.center.copy()));
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
      agent.display();
      if (agent.active) active++;
    }
    return active;
  }
}

class EllipseAgent extends Agent {
  constructor(pos) {
    super(pos);
    this.size = random(minSize, maxSize);
    this.angle = random(TWO_PI);
    this.alignmentFactor = 0.05;
    this.radialAlignmentFactor = 1;
  }
  
  applyAlignment(delta) {
    this.angle += delta;
    this.angle = constrain(this.angle, -PI, PI);
  }
  
  align(agents) {
    let neighborDist = 100;
    let sumAngle = 0;
    let count = 0;
    for (let other of agents) {
      if (other !== this) {
        let d = p5.Vector.dist(this.pos, other.pos);
        if (d < neighborDist) {
          sumAngle += other.angle;
          count++;
        }
      }
    }
    if (count > 0) {
      let desired = sumAngle / count;
      let dAngle = desired - this.angle;
      return this.alignmentFactor * dAngle;
    }
    return 0;
  }
  
  radialAlignment(center) {
    let desired = p5.Vector.sub(this.pos, center).heading();
    let dAngle = desired - this.angle;
    return this.radialAlignmentFactor * dAngle;
  }
  
  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    ellipse(0, 0, this.size, this.size * 0.5);
    pop();
  }
}

class CircularAgent extends Agent {
  constructor(pos) {
    super(pos);
  }

  set_size() {
    let nz = noise(this.pos.x * noiseScale, this.pos.y * noiseScale);
    this.size = lerp(minSize_c, maxSize_c, nz);
  }

  display() {
    ellipse(this.pos.x, this.pos.y, this.size, this.size);
  }
}


