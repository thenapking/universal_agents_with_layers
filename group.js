class Group {
    constructor(n, center, radius, boundaries, boundary_factor = 1){
      this.center = center.copy();
      this.radius = radius;
      this.n = n;
      this.agents = [];
      this.boundaries = boundaries || [];
      this.boundary_factor = boundary_factor;
      this.active = true;
    }
    
    initialize() {
      for (let i = 0; i < this.n; i++) {
        this.agents.push(new Agent(this.center.copy(), this));
      }
    }
    
    // An exclusion force is not being applied
    enforce_boundaries(agent){
      let force = createVector(0, 0);
      for(let boundary of this.boundaries){
        if(boundary.mode === "exclude"){
          force.add(boundary.steer(agent));
        }
      }
      force.mult(10000);
      agent.applyForce(force);
    }

    draw(){
      for (let agent of this.agents){
        agent.draw();
      }
    }
}
