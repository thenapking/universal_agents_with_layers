class ObstacleGroup extends SpaceFillingGroup {
  initialize() {
    for (let i = 0; i < this.n; i++) {
      let x = random(this.center.x*0.9, this.center.x*1.1)
      let y = random(this.center.y*0.9, this.center.y*1.1)
      this.agents.push(new ObstacleAgent(createVector(x, y), this));
    }
  }

  update(){
    this.new_grid();
    let active = 0;

    for (let agent of this.agents) {
      this.enforce_boundaries(agent, 0.005);
      if (agent.active && !agent.finished) {
        let sep = agent.separation(this.grid);
        let aliDelta = agent.align(this.grid);
        agent.applyForce(sep, 12);
        agent.applyAlignment(aliDelta);
        agent.update();
        active++;
      } 
    }

    this.spawn_agents()
    this.check_and_add_agents()
    this.active = active;
    return active;
  }


}

class ObstacleAgent extends SpaceFillingAgent {
  constructor(position, group, n = 6) {
    super(position, group);
    this.minSize = group.minSize;
    this.maxSize = group.maxSize;
    this.style = this.group.style;
    this.spawned = false;
    this.number_to_spawn = n;
    this.active = true;
    this.angle = random(-PI, PI);
    this.alignmentFactor = .03;
    this.finished = false;  

    this.size = 50;
    this.width = this.size;
    this.height = this.size
    this.alignment_radius = this.size * 4
    this.repeller_radius = this.size * 1.2;
    this.separation_radius = this.size * 1.7


  }


  new_agent(position){
    return new ObstacleAgent(position, this.group, this.number_to_spawn);
  }

  draw() {
    push();
      translate(this.position.x, this.position.y);
      rotate(this.angle);
      stroke(palette.pen);  

      ellipse(0, 0, this.width*0.5, this.height);
    pop();
  }
}

