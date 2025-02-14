class CircularFlower extends LayerObject {
  constructor(level_id, num_bounds = 1, num_groups, radius, attractors, repellers,
    center, inner_radius, outer_radius, num_fronds, straightness, trail_style
  ) {
    super(level_id, num_bounds, num_groups, radius, attractors, repellers);

    this.center = center;
    this.inner_radius = inner_radius;
    this.outer_radius = outer_radius;
    this.num_fronds = num_fronds;
    this.straightness = straightness; // Separation factor
    // this.separation_distance = separation_distance;
    // this.max_time = max_time;
    this.speed = 8;
    this.sensor_angle = 0.01; 
    this.rotation_angle = 0.18;
    this.sensor_dist = 60;
    this.kill_dist = this.speed*0.5 - 0.01;
    this.poop_interval = 2;
    this.active
    this.trail_style = trail_style;
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
}