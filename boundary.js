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

      switch (this.type) {
        case "circle":
          this.center = params.center.copy();
          this.radius = params.radius;
          break;
        case "rectangle":
          this.x = params.x;
          this.y = params.y;
          this.w = params.w;
          this.h = params.h;
          break;
        case "blob":
          this.points = params.points;
          this.calculate_centroid();
          break;
      }
    }
    
    
    contains(position) {
      switch (this.type) {
        case "circle":
          return p5.Vector.dist(position, this.center) <= this.radius;
        case "rectangle":
          return (position.x >= this.x && position.x <= this.x + this.w && position.y >= this.y && position.y <= this.y + this.h);
        case "blob":
          return pointInPolygon(position.x, position.y, this.points);
      }

      return false;
    }

    contain(agent){
      let desired = createVector(0, 0);
      if (this.contains(agent.position)) return desired;
  
      if (this.type === "circle" || this.type === "blob") {
        desired = this.circular(this.center, agent.position);
      } else if (this.type === "rectangle") {
        desired = this.rectangular(agent.position, 1);
      }
  
      return desired;
    }
  
    exclude(agent){
      let desired = createVector(0, 0);
      if (!this.contains(agent.position)) return desired;
  
      if (this.type === "circle" || this.type === "blob") {
        desired = this.circular(agent.position, this.center);
      } else if (this.type === "rectangle") {
        desired = this.rectangular(agent.position, -1);
      }
      return desired
    }

    // Attraction or repulsion from a point
    circular(a, b){
      let desired = p5.Vector.sub(a, b);
      return desired;
    }
  
    rectangular(a, polarity = 1){
      let left = a.x - this.x;
      let right = (this.x + this.w) - a.x;
      let top = a.y - this.y;
      let bottom = (this.y + this.h) - a.y;
  
      let m = min(left, right, top, bottom);
      let desired = createVector(0, 0);
  
      if (m === left) desired.x = polarity * agent.maxSpeed;
      else if (m === right) desired.x = -polarity * agent.maxSpeed;
      else if (m === top) desired.y = polarity * agent.maxSpeed;
      else if (m === bottom) desired.y = -polarity * agent.maxSpeed;
  
      return desired;
    }
    
    steer(agent) {
      let desired = createVector(0, 0);
      if (this.mode === "contain") {
        desired = this.contain(agent);
      } else if (this.mode === "exclude") {
        desired = this.exclude(agent);
      } 

      if(desired.mag() > 0){
        desired.normalize();
        desired.mult(agent.maxSpeed);
        let steer = p5.Vector.sub(desired, agent.vel);
        steer.limit(agent.maxForce);
      }
  
      return desired;
    }

    // Only for rects/circles 
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

    calculate_centroid() {
      if (this.type !== "blob") return 
      
      this.center = calculate_centroid(this.points);
    }

    draw(){
      stroke(palette.pen)

      switch(this.type){
        case "circle":
          ellipse(this.center.x, this.center.y, this.radius*2, this.radius*2)
          break;
        case "rectangle":
          rect(this.x, this.y, this.w, this.h)
          break;
        case "blob":
          beginShape();
          for(let point of this.points){
            vertex(point.x, point.y);
          }
          endShape(CLOSE);
          break;
      }
    }
}

function pointInPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i].x, yi = polygon[i].y;
    let xj = polygon[j].x, yj = polygon[j].y;
    let intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function calculate_centroid(points) {
  if (points.length < 3) return

  let signedArea = 0;
  let Cx = 0;
  let Cy = 0;
  const n = points.length;
  
  for (let i = 0; i < n; i++) {
    const current = points[i];
    const next = points[(i + 1) % n];
    const a = current.x * next.y - next.x * current.y;
    signedArea += a;
    Cx += (current.x + next.x) * a;
    Cy += (current.y + next.y) * a;
  }
  
  signedArea *= 0.5;
  Cx /= (6 * signedArea);
  Cy /= (6 * signedArea);
  
  return createVector(Cx, Cy);
}
  