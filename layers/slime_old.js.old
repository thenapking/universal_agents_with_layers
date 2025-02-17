class SlimeMould extends LayerObject {
    constructor(layer, attractors, repellers,
    ) {
      super(layer, num_bounds, num_groups, radius, attractors, repellers);
  
      this.center = createVector(W/2, H/2);

      this.speed = 8;
      this.sensor_angle = 0.3; 
      this.rotation_angle = 0.18;
      this.sensor_dist = 60;
      this.kill_dist = this.speed*0.5 - 0.01;
      this.poop_interval = 2;
      this.active
      this.trail_style = "circle"

    }

    new_boundary(){
      return new Boundary("circle", {center: this.center, radius: this.outer_radius, mode: "contain"});
    }
    
    new_group(boundary){
      return new SensorGroup(this.num_fronds, boundary.center, boundary.radius, [boundary], 
        this.attractors, this.repellers, this.sensor_angle, this.rotation_angle, 
        this.sensor_dist, this.kill_dist, this.speed, this.poop_interval, this.inner_radius, this.straightness, this.trail_style
      )
    }

    enforce_boundaries(agent){
        for(let boundary of this.boundaries){
            if(boundary.mode === "contain"){
                if (!boundary.contains(agent.pos)) { agent.active = false; }
            }
        }
    }
  }