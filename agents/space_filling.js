class SpaceFillingGroup extends Group {
  constructor(n, center, radius, boundaries, boundary_factor, options = {}){
    super(n, center, radius, boundaries, boundary_factor);
    this.minSize = options.minSize;
    this.maxSize = options.maxSize;
    this.repellers = options.repellers;
    this.potential_agents = []; 
    this.grid = new Grid();
    this.spawning = true;
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
      if (agent.active){
        let sep = agent.separation(this.agents);
        let repel = agent.repell(this.repellers);
        agent.applyForce(repel, 2.6);
        agent.applyForce(sep, 2.6);
        agent.update();
        active++;
      } else {
        this.remove(agent);
      }
    }

    this.spawn_agents()
    this.check_and_add_agents()
    return active;
  }

  check_and_add_agents(max = 500){
    let counter = 0
  
    while(counter < max && this.potential_agents.length > 0){
      let agent = this.potential_agents.pop()
      
      this.enforce_boundaries(agent);
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

  enforce_boundaries(agent){
    for(let boundary of this.boundaries){
      if(boundary.mode == "contain" && !boundary.contains(agent.position)) { agent.active = false; }
      if(boundary.mode == "exclude" && boundary.contains(agent.position)) { agent.active = false; }
    }
  }
}

class SpaceFillingAgent extends Agent {
  constructor(position, group, n = 6) {
    super(position, group);
    this.minSize = group.minSize;
    this.maxSize = group.maxSize;
    this.size = 20
    this.spawned = false;
    this.number_to_spawn = n
    this.active = true;
  }

  repell(repellers){
    let steer = createVector(0, 0);
    let count = 0;
    for (let repeller of repellers) {
      let d = p5.Vector.dist(this.position, repeller.position);
      if (d < 20) { 
        let diff = p5.Vector.sub(this.position, repeller.position);
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

  spawn(){
    if(this.spawned) { return; }
    for(let i=0; i< this.number_to_spawn+1; i++){
      let a = i*TWO_PI/this.number_to_spawn + random(-1,1)
      let d = this.size * (1 + i*0.02)


      let x = Math.round(this.position.x + d*cos(a))
      let y = Math.round(this.position.y + d*sin(a))
      
      
      let new_agent = new SpaceFillingAgent(createVector(x, y), this.group, this.number_to_spawn)
      this.group.potential_agents.push(new_agent)
    }

    this.spawned = true
  }

  neighbours(grid){
    let col = Math.floor((this.position.x) / CELL_SIZE);
    let row = Math.floor((this.position.y) / CELL_SIZE);
    return grid.getNeighboursInCell(col, row);
  }

  intersecting(grid){
    let others = this.neighbours(grid)
    let intersects = false
    let min_distance = Infinity
    for(let other of others){
      if(other == this) { continue; }
      let d = this.distance(other)
      let radii = this.size
      if(d < radii){ intersects = true }
      if((d < radii) && (radii - d) < min_distance) { min_distance = (radii - d); }
    }

    return intersects
  }

  intersects(other) {
    let d = this.distance(other)
    let radii = this.size
    return d < radii
  }

  distance(other){
    return Math.round(dist(this.position.x, this.position.y, other.position.x, other.position.y));
  }

  draw() {
    ellipse(this.position.x, this.position.y, this.size, this.size);
  }
}

