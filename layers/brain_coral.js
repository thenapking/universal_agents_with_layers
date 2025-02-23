class BrainCoral extends LayerObject {
    constructor(layer, num_bounds = 1, num_groups, radius, max_time, options = {})
    {
      super(layer, num_bounds, num_groups, radius, attractors = [], repellers = [], max_time, options);
      this.center = options.center;
      
    }
  
    initialize(){
      super.initialize();
    }

    new_boundary(){
      return new Boundary("circle", {center: this.options.center, radius: this.options.radius, mode: "contain"});
    }

    new_group(boundary){
        return new DifferentialGroup(10, boundary.center, boundary.radius/6, [boundary], this.options)
    }
}
