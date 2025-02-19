class Agent {
  constructor(position, group) {
    this.position = position.copy();
    this.group = group;
    this.vel = p5.Vector.random2D();
    this.acc = createVector(0, 0);
    this.maxSpeed = 1;
    this.maxForce = 0.025;
    this.active = true;
    this.size = 0;
  }
  
  applyForce(force, m = 1) {
    force.mult(m);
    this.acc.add(force);
  }
  
  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.position.add(this.vel);
    this.acc.mult(0);
    this.vel.mult(0.95);
    if (this.vel.mag() < 0.001) {
      this.active = false;
      this.vel.mult(0);
    }
  }
  
  separation(agents) {
    let steer = createVector(0, 0);
    let count = 0;
    for (let other of agents) {
      if (other !== this) {
        let d = p5.Vector.dist(this.position, other.position);
        if (d < this.size) { //THIS HAS BEEN CHANGED
          let diff = p5.Vector.sub(this.position, other.position);
          diff.normalize();
          diff.div(d);
          steer.add(diff);
          count++;
        }
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
}
