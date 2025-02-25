class SpaceFilling extends LayerObject {
  constructor(layer, num_bounds = 1, num_groups, radius, attractors, repellers, max_time, options = {})
  {
    super(layer, num_bounds, num_groups, radius, attractors, repellers, max_time, options);
    this.center = options.center;
    this.active
    this.style = options.style;
    this.exceed_bounds = options.exceed_bounds;
  }

  initialize(){
    super.initialize();
  }

  new_boundary(){
    return new Boundary("circle", {center: this.center, radius: this.radius, mode: "contain"});
  }
  
  new_group(boundary){
    if(this.style.substring(0, 13) == "packed_circle"){ 
      let n = 120
      let maxSize = 50
      let minSize = 5

      if(this.style.substring(0,17) == "packed_circle_pip") {
        maxSize = 10 
        n = 2000
      }

      if(this.style == "packed_circle_pip_small") {
        minSize = 2
        maxSize = 7
        n = 3000
      }

      let options =  {minSize: minSize, maxSize: maxSize, noiseScale: 0.01, style: this.style}

      return new CircularGroup(n, boundary.center, boundary.radius, [boundary], 1, options)
    } else if (this.style == "egg") {
      let options =  {minSize: 10, maxSize: 10, noiseScale: 0.01, style: this.style}
      let n = random(150, 200)
      return new EggGroup(n, boundary.center, boundary.radius, [boundary], 1, options)
    } else {
      let options = {noiseScale: 0.01, minSize: 10, maxSize: 50, repellers: this.repellers, style: this.style}
      return new SpaceFillingGroup(10, boundary.center, boundary.radius, [boundary], 0.1, options)
    }
  }

  finish(){
    if(!this.exceed_bounds){ 
      for(let group of this.groups){
        let new_agents = [];
        for(let agent of group.agents){
          let valid = true
          for(let boundary of this.boundaries){
            if(boundary.mode == "contain" && !boundary.contains(agent.position)) {
              valid = false;
              break;
            }
          }
          if(valid) { new_agents.push(agent); }
        }
        group.agents = new_agents;
      }
    }

    super.finish();
  }
}
