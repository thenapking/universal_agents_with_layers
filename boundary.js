function createBoundaries(){
    let spacingFactor = 1.05;
    let attempts = 0;
  
    while(boundaries.length < numGroups && attempts < 20 * numGroups){
      let center = createVector(random(W*0.2, W*0.8), random(H*0.2, H*0.8));
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
        let boundary = {center: center, radius: radius}
  
        boundaries.push(boundary);
      }
      attempts++;
    }
}

class Boundary {
    constructor(type, params) {
      this.type = type;
      this.mode = params.mode || "contain";
      if (this.type === "circle") {
        this.center = params.center.copy();
        this.radius = params.radius;
      } else if (this.type === "rectangle") {
        this.x = params.x;
        this.y = params.y;
        this.w = params.w;
        this.h = params.h;
      }
    }
    
    contains(pos) {
      if (this.type === "circle") {
        return p5.Vector.dist(pos, this.center) <= this.radius;
      } else if (this.type === "rectangle") {
        return (pos.x >= this.x && pos.x <= this.x + this.w && pos.y >= this.y && pos.y <= this.y + this.h);
      }
      return false;
    }
  
    circular(a, b){
      let desired = p5.Vector.sub(a, b);
      return desired;
    }
  
    rectangular(polarity = 1){
      let left = agent.pos.x - this.x;
      let right = (this.x + this.w) - agent.pos.x;
      let top = agent.pos.y - this.y;
      let bottom = (this.y + this.h) - agent.pos.y;
  
      let m = min(left, right, top, bottom);
      let desired = createVector(0, 0);
  
      if (m === left) desired.x = polarity * agent.maxSpeed;
      else if (m === right) desired.x = -polarity * agent.maxSpeed;
      else if (m === top) desired.y = polarity * agent.maxSpeed;
      else if (m === bottom) desired.y = -polarity * agent.maxSpeed;
  
      return desired;
    }
    
    contain(agent){
      if (this.contains(agent.pos)) return createVector(0, 0);
  
      let desired;
      if (this.type === "circle") {
        desired = this.circular(this.center, agent.pos);
      } else if (this.type === "rectangle") {
        desired = this.rectangular(1);
      }
  
      return desired;
    }
  
    exclude(agent){
      if (!this.contains(agent.pos)) return createVector(0, 0);
      let desired;
  
      if (this.type === "circle") {
        desired = this.circular(agent.pos, this.center);
      } else if (this.type === "rectangle") {
        desired = this.rectangular(-1);
      }
      
      return desired;
    }
  
    steer(agent) {
      let desired;
      if (this.mode === "contain") {
        desired = this.contain(agent);
      } else if (this.mode === "exclude") {
        desired = this.exclude(agent);
      } else {
        desired = createVector(0, 0);
      }
  
      if(desired.mag() > 0){
        desired.normalize();
        desired.mult(agent.maxSpeed);
        let steer = p5.Vector.sub(desired, agent.vel);
        steer.limit(agent.maxForce);
      }
  
      return desired;
    }

    intersects(other) {
      if (this.type === "circle" && other.type === "circle") {
        return p5.Vector.dist(this.center, other.center) <= (this.radius + other.radius);
      } else if (this.type === "rectangle" && other.type === "rectangle") {
        return !(this.x + this.w < other.x || this.x > other.x + other.w ||
                 this.y + this.h < other.y || this.y > other.y + other.h);
      } else if (this.type === "circle" && other.type === "rectangle") {
        let cx = this.center.x, cy = this.center.y;
        let rx = other.x, ry = other.y, rw = other.w, rh = other.h;
        let closestX = constrain(cx, rx, rx + rw);
        let closestY = constrain(cy, ry, ry + rh);
        let dx = cx - closestX, dy = cy - closestY;
        return (dx * dx + dy * dy) <= (this.radius * this.radius);
      } else if (this.type === "rectangle" && other.type === "circle") {
        let cx = other.center.x, cy = other.center.y;
        let rx = this.x, ry = this.y, rw = this.w, rh = this.h;
        let closestX = constrain(cx, rx, rx + rw);
        let closestY = constrain(cy, ry, ry + rh);
        let dx = cx - closestX, dy = cy - closestY;
        return (dx * dx + dy * dy) <= (other.radius * other.radius);
      }
      return false;
    }

    draw(){
      if(this.type == "circle"){
        circle(this.center.x, this.center.y, this.radius*2)
      } else if (this.type == "rectangle"){
        rect(this.x, this.y, this.w, this.h)
      }
    }
}
  