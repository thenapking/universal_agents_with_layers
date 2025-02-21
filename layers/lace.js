class Lace extends LayerObject {
  constructor(layer, num_bounds = 1, num_groups, radius, attractors, repellers, max_time, options = {})
  {
    super(layer, num_bounds, num_groups, radius, attractors, repellers, max_time, {hide_bg: false, distinct: true});
    this.center = options.center;
    this.outer_radius = options.outer_radius;
    this.active
    
  }

  new_boundary(){
    return new Boundary("circle", {center: this.center, radius: this.outer_radius, mode: "contain"});
  }
  
  new_group(boundary){
    let options = {minSize: 50, maxSize: 100, noiseScale: 0.01}
    return new BlobGroup(10, boundary.center, boundary.radius, [boundary], 1, options)
  }
}
  