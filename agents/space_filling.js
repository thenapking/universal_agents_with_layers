class SpaceFillingGroup extends Group {
  constructor(n, center, radius, boundaries, boundary_factor, options = {}){
    super(n, center, radius, boundaries, boundary_factor);
    this.minSize = options.minSize;
    this.maxSize = options.maxSize;
    this.repellers = options.repellers;
    this.potential_agents = []; 
    this.grid = new Grid();
    this.spawning = true;
    // this.style = random(["ellipse", "rectangle", "line"])
    this.style = "rectangle"
  }

  initialize() {
    for (let i = 0; i < this.n; i++) {
      let x = random(this.center.x*0.2, this.center.x*1.8)
      let y = random(this.center.y*0.2, this.center.y*1.8)
      this.agents.push(new SpaceFillingAgent(createVector(x, y), this));
    }
  }

  spawn_agents(){
    if(!this.spawning) { return; }
    let new_grid = new Grid();
  
    for (let agent of this.agents) {
      agent.spawn();
      this.add_to_grid(new_grid, agent);
    }  
    this.grid = new_grid;
  }

  update(){
    let active = 0;

    for (let agent of this.agents) {
      this.enforce_boundaries(agent);
      if (agent.active && !agent.finished) {
        let sep = agent.separation(this.agents);
        let repel = agent.repell(this.repellers);
        let aliDelta = agent.align(this.grid);
        agent.applyForce(repel, 4);
        agent.applyForce(sep, 9);
        agent.applyAlignment(aliDelta);
        agent.update();
        active++;
        // if(agent.vel.mag() < 0.1) { agent.inactive_ticks++; } else { agent.inactive_ticks = 0; }
        // if(agent.inactive_ticks > 50) { agent.finished = true; }
      } 
    }

    this.spawn_agents()
    this.check_and_add_agents()
    this.active = active;
    return active;
  }

  check_and_add_agents(max = 500){
    let counter = 0
  
    while(counter < max && this.potential_agents.length > 0){
      let agent = this.potential_agents.pop()
      
      this.check_boundaries(agent);
      if(!agent.active) { continue; }

      let intersecting = agent.intersecting(this.grid)
      if(intersecting ) { continue; }

      let valid_agent = this.add_to_grid(this.grid, agent);
      if(valid_agent) { this.agents.push(agent); }
  
      counter++
    }

    this.spawning = counter > 0
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
      this.agents.splice(index, 1);
    }
  }

  check_boundaries(agent){
    for(let boundary of this.boundaries){
      if(boundary.mode == "contain" && !boundary.contains(agent.position)) { agent.active = false; }
      if(boundary.mode == "exclude" && boundary.contains(agent.position)) { agent.active = false; }
    }
  }
}

class SpaceFillingAgent extends Agent {
  constructor(position, group, n =6) {
    super(position, group);
    this.minSize = group.minSize;
    this.maxSize = group.maxSize;
    this.size = 15;
    this.style = this.group.style
    // this.width = this.style == "line" ? this.size / 3 : this.size / 2;
    // this.height = this.style == "line" ? this.size / 3 : this.size;
    this.width = this.size;
    this.height = this.size*0.35;
    this.spawned = false;
    this.number_to_spawn = n;
    this.active = true;
    this.angle = random(-PI, PI);
    this.alignmentFactor = 0.5;
    this.inactive_ticks = 0;
    this.finished = false;  
    this.repeller_radius = this.size * 1.2;
    this.separation_radius = this.size
  }

  applyAlignment(delta) {
    this.angle += delta;
    this.angle = constrain(this.angle, -PI, PI);
  }
  
  align(grid) {
    let others = this.neighbours(grid);
    let sumAngle = 0;
    let count = 0;
    for (let other of others) {
      if (other !== this) {
        let d = p5.Vector.dist(this.position, other.position);
        if (d < this.size * 2) {
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

  repell(repellers) {
    let steer = createVector(0, 0);
    let count = 0;
    for (let repeller of repellers) {
      let d = p5.Vector.dist(this.position, repeller.position);
      if (d < this.repeller_radius) { 
        let diff = p5.Vector.sub(this.position, repeller.position);
        diff.normalize();
        if (d > 1) { diff.div(d); }
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

  spawn() {
    if (this.spawned) { return; }
    for (let i = 0; i < this.number_to_spawn + 1; i++) {
      let a = i * TWO_PI / this.number_to_spawn + random(-1, 1);
      let d = this.size * (1 + i * 0.02);
      let x = Math.round(this.position.x + d * cos(a));
      let y = Math.round(this.position.y + d * sin(a));
      let new_agent = new SpaceFillingAgent(createVector(x, y), this.group, this.number_to_spawn);
      this.group.potential_agents.push(new_agent);
    }
    this.spawned = true;
  }

  neighbours(grid) {
    let col = Math.floor(this.position.x / CELL_SIZE);
    let row = Math.floor(this.position.y / CELL_SIZE);
    return grid.getNeighboursInCell(col, row);
  }

  intersecting(grid) {
    let others = this.neighbours(grid);
    for (let other of others) {
      if (other === this) { continue; }
      if (this.intersects(other)) {
        return true;
      }
    }
    return false;
  }

  intersects(other) {
    let cornersA = this.getCorners();
    let cornersB = other.getCorners();
    
    let axes = [];
    axes.push(p5.Vector.sub(cornersA[1], cornersA[0]).normalize());
    axes.push(p5.Vector.sub(cornersA[3], cornersA[0]).normalize());
    axes.push(p5.Vector.sub(cornersB[1], cornersB[0]).normalize());
    axes.push(p5.Vector.sub(cornersB[3], cornersB[0]).normalize());
    
    for (let axis of axes) {
      let [minA, maxA] = projectPolygon(cornersA, axis);
      let [minB, maxB] = projectPolygon(cornersB, axis);
      if (maxA < minB || maxB < minA) {
        return false;
      }
    }
    return true;
  }

  getCorners() {
    let half_w = this.width / 2;
    let half_h = this.height / 2;
    let localCorners = [
      createVector(-half_w, -half_h),
      createVector(half_w, -half_h),
      createVector(half_w, half_h),
      createVector(-half_w, half_h)
    ];
    let corners = [];
    for (let pt of localCorners) {
      let rotated = createVector(
        pt.x * cos(this.angle) - pt.y * sin(this.angle),
        pt.x * sin(this.angle) + pt.y * cos(this.angle)
      );
      rotated.add(this.position);
      corners.push(rotated);
    }
    return corners;
  }

  distance(other) {
    return Math.round(dist(this.position.x, this.position.y, other.position.x, other.position.y));
  }

  draw() {
    push();
      translate(this.position.x, this.position.y);
      rotate(this.angle);
      switch(this.style){
        case "ellipse":
          ellipse(0, 0, this.width, this.height);
          break;
        case "rectangle":
          // rectMode(CENTER);
          // rect(0, 0, this.height * 0.8, this.width);
          fill(palette.pen)
          ellipse(-2, 2, this.width * 0.8, this.height*0.9)
          fill(palette.bg)
          ellipse(0, 0, this.width * 0.8, this.height*0.9);
          
          break;
        case "line":
          line(0,  0, this.width,  0);
          break;
        case "multiline":
          let a = this.height * 0.85;
          let b = this.width  * 0.75;
          line(0, -a, b, -a);
          line(0,  0, b,  0);
          line(0,  a, b,  a);
          break;
      }
    pop();
  }
}

function projectPolygon(points, axis) {
  let projection = p5.Vector.dot(points[0], axis);
  let min = projection;
  let max = projection;
  for (let i = 1; i < points.length; i++) {
    projection = p5.Vector.dot(points[i], axis);
    if (projection < min) {
      min = projection;
    } else if (projection > max) {
      max = projection;
    }
  }
  return [min, max];
}


