class CircularFlower extends LayerObject {
  constructor(layer, num_bounds = 1, num_groups, radius, attractors, repellers, max_time, options = {})
  {
    super(layer, num_bounds, num_groups, radius, attractors, repellers, max_time);
    this.center = options.center;
    this.inner_radius = options.inner_radius;
    this.outer_radius = options.outer_radius;
    this.num_fronds = options.num_fronds;
    this.straightness = options.straightness; // Separation factor
    this.speed = 8;
    this.sensor_angle = 0.01; 
    this.rotation_angle = 0.18;
    this.sensor_dist = 60;
    this.kill_dist = this.speed*0.5 - 0.01;
    this.poop_interval = 2;
    this.trail_style = options.trail_style;
  }

  initialize(){
    super.initialize();
    this.create_inner_group()
  }

  create_inner_group(){
    let inner_boundary = new Boundary("circle", {center: this.center, radius: this.inner_radius, mode: "contain"});
    let inner_options = {noiseScale: 0.1, minSize: 10, maxSize: 20}
    let n = int(this.inner_radius*0.66);
    let boundary_factor = 0.05
    let inner_group = new CircularGroup(n, this.center, this.inner_radius, [inner_boundary], boundary_factor, inner_options)
    inner_group.initialize();
    this.groups.push(inner_group);
  }

  new_boundary(){
    return new Boundary("circle", {center: this.center, radius: this.outer_radius, mode: "contain"});
  }
  
  new_group(boundary){
    return new SensorGroup(this.num_fronds, boundary.center, boundary.radius, [boundary], 1, this.formatted_options())
  }

  formatted_options(){
    return { attractors: attractors, repellers: repellers, sensor_angle: this.sensor_angle, rotation_angle: this.rotation_angle,
      sensorDist: this.sensor_dist, killDist: this.kill_dist, maxSpeed: this.speed, poopInterval: this.poop_interval,
      center: this.center, inner_radius: this.inner_radius, outer_radius: this.outer_radius, 
      num_fronds: this.num_fronds, straightness: this.straightness, trail_style: this.trail_style}
  }
}
