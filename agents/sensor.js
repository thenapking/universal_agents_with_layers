class SensorGroup extends Group {
  constructor(n, center, radius, boundaries, boundary_factor, options = {}){
 
    super(n, center, radius, boundaries, boundary_factor);
    this.sensor_angle = options.sensor_angle;
    this.rotation_angle = options.rotation_angle;
    this.sensorDist = options.sensorDist;
    this.killDist = options.killDist;
    this.maxSpeed = options.maxSpeed;
    this.poopInterval = options.poopInterval;
    this.attractors = options.attractors;
    this.repellers = options.repellers;
    this.active = true;
    this.inner_radius = options.inner_radius;
    this.straightness = options.straightness;
    this.trail_style = options.trail_style;
  }
  
  initialize() {
    for (let i = 0; i < this.n; i++) {
      let a = TWO_PI * i / this.n
      let r = this.inner_radius
      let x = r*cos(a)
      let y = r*sin(a)
      let offset = i%2==0 ? createVector(0, 0) : createVector(x*0.1, y*0.1)
      let xc = x + this.center.x + offset.x
      let yc = y + this.center.y + offset.y
      this.agents.push(new SensorAgent(this, createVector(xc, yc), createVector(x, y), this.trail_style));
    }
  }

  update(){
    let active = 0;
    for (let agent of this.agents) {
      this.enforce_boundaries(agent);
      if (agent.active) {
        active++;
        agent.prevPos = agent.pos.copy();
        agent.update();
        agent.update_rotation();
        let forage = agent.forage(this.attractors, 2);
        agent.applyForce(forage);
        let repel = agent.forage(this.repellers, -2);
        agent.applyForce(repel);
        let sep = agent.separation(this.agents);
        agent.applyForce(sep.mult(this.straightness));

        agent.remove_attractors(this.attractors);
        agent.remove_attractors(this.repellers);
        agent.add_attractor();
      }
    }
    if (active === 0) { this.active = false; }
  }

  enforce_boundaries(agent){
    for(let boundary of this.boundaries){
      if (!boundary.contains(agent.pos)) { agent.active = false; }
    }
  }
}

class SensorAgent extends Agent {
  constructor(group, location, velocity, trail_style = "line") {
    super(location); 
    this.vel = velocity
    this.group = group;
    this.attractors = this.group.attractors; 
    this.boundary = this.group.boundaries[0];
    this.prevPos = this.pos.copy();
    this.rotation = 0;
    this.sensor_angle = this.group.sensor_angle;
    this.rotation_angle = this.group.rotation_angle;
    this.sensorDist = this.group.sensorDist;
    this.killDist = this.group.killDist;
    this.maxSpeed = this.group.maxSpeed;
    this.previousPositions = [];
    this.trail = [];
    this.poopInterval = this.group.poopInterval;
    this.trailStyle = trail_style
  }
    
  computeSensor(angleOffset, attractors, strength) {
    let x = this.sensorDist * cos(this.rotation + angleOffset);
    let y = this.sensorDist * sin(this.rotation + angleOffset);
    let sensorPos = p5.Vector.add(this.pos, createVector(x, y));      
    let total = 0;
    let count = 0;
    for (let attractor of attractors) {
      let d = p5.Vector.dist(sensorPos, attractor.position);
      if (d < this.sensorDist) {
        let weight = strength / (d + 1);
        total += weight;
        count++;
      }
    }
    if (count > 0) {
      total /= count;
    }
    return total;
  }

  forage(attractors, strength) {
    let sensorCenter = this.computeSensor(0, attractors, strength);
    let sensorLeft   = this.computeSensor(this.sensor_angle, attractors, strength);
    let sensorRight  = this.computeSensor(-this.sensor_angle, attractors, strength);
    let force = p5.Vector.sub(this.pos, this.prevPos);
    if (sensorCenter > sensorLeft && sensorCenter > sensorRight) {
    } else if (sensorLeft > sensorCenter && sensorLeft > sensorRight) {
      force.rotate(this.rotation_angle);
    } else if (sensorRight > sensorCenter && sensorRight > sensorLeft) {
      force.rotate(-this.rotation_angle);
    }
    return force;
  }

  remove_attractors(attractors){
    for (let i = attractors.length - 1; i >= 0; i--) {
      let attractor = attractors[i];
      if (p5.Vector.dist(this.pos, attractor.position) < this.killDist) {
        attractors.splice(i, 1);
      }
    }
  }

  add_attractor(){
    this.previousPositions.push(this.pos.copy());
    if (this.previousPositions.length % this.poopInterval === 0 && this.previousPositions.length > this.poopInterval) {
      let pos = this.previousPositions[this.previousPositions.length - this.poopInterval];
      this.trail.push(pos);

      let minDistance = 5 //this.maxSpeed + 2;
      let tooNear = false;
      for (let attractor of this.attractors) {
        if (p5.Vector.dist(pos, attractor.position) < minDistance) {
          tooNear = true;
          break;
        }
      }
      if (!tooNear) {
        this.attractors.push(new Attractor(pos.x, pos.y, "poop"));
      }
    }
  }
  
    
  update_rotation() {
    let current = p5.Vector.sub(this.pos, this.prevPos);
    this.rotation = current.heading();
    return this;
  }
    
  draw() {
    stroke(0,0,255)
    switch(this.trailStyle){
      case "line":
        this.draw_line_trail();
        break;
      case "circle":
        this.draw_trail();
        break;
      case "line_and_circle":
        this.draw_line_trail();
        this.draw_trail();
        break;
    }
  }

  draw_trail() {
    push();
    noStroke()
    fill(palette.pen)

    for(let p of this.trail){
      circle(p.x, p.y, 10)
    }
    pop();
  }

  draw_line_trail() {
    push();

    stroke(palette.pen)
    strokeWeight(2)
    noFill()

    beginShape();
      for(let p of this.trail){
        vertex(p.x, p.y);
      }
    endShape();
    pop();
  }
}
