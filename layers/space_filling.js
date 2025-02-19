class SpaceFilling extends LayerObject {
  constructor(layer, num_bounds = 1, num_groups, radius, attractors, repellers, max_time, options = {})
  {
    super(layer, num_bounds, num_groups, radius, attractors, repellers, max_time, {hide_bg: false, distinct: true});
    this.center = options.center;
    this.inner_radius = options.inner_radius;
    this.outer_radius = options.outer_radius;
    this.active
    
  }

  initialize(){
    super.initialize();
    this.create_repellers();
  }

  create_repellers(){
    for(let attractor of this.attractors){
      if(attractor.type === "poop")  { 
        let road_boundary = new Attractor(attractor.position.x, attractor.position.y, "road_boundary")
        this.repellers.push(road_boundary) 
      }
    }
  }

  new_boundary(){
    return new Boundary("circle", {center: this.center, radius: this.outer_radius, mode: "contain"});
  }
  
  new_group(boundary){
    let options = {noiseScale: 0.01, minSize: 10, maxSize: 50, repellers: this.repellers}
    return new SpaceFillingGroup(10, boundary.center, boundary.radius, [boundary], 0.1, options)
  }
}
