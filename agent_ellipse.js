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
  
  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    ellipse(0, 0, this.size, this.size * 0.5);
    pop();
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


