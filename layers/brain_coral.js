class BrainCoral extends LayerObject {
    constructor(layer, num_bounds = 1, num_groups, radius, max_time, options = {})
    {
      super(layer, num_bounds, num_groups, radius, attractors = [], repellers = [], max_time, options);
      this.center = options.center;
      
    }
  
    initialize(){
      super.initialize();
    }

    new_group(boundary){
        return new DifferentialGroup(10, boundary.center, boundary.radius, [boundary], this.options)
    }
}