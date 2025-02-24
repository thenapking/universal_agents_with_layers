class SpaceFilling extends LayerObject {
  constructor(layer, num_bounds = 1, num_groups, radius, attractors, repellers, max_time, options = {})
  {
    super(layer, num_bounds, num_groups, radius, attractors, repellers, max_time, options);
    this.center = options.center;
    this.active
    this.style = options.style;
  }

  initialize(){
    super.initialize();
  }

  new_boundary(){
    return new Boundary("circle", {center: this.center, radius: this.radius, mode: "contain"});
  }
  
  new_group(boundary){
    let options = {noiseScale: 0.01, minSize: 10, maxSize: 50, repellers: this.repellers, style: this.style}
    return new SpaceFillingGroup(10, boundary.center, boundary.radius, [boundary], 0.1, options)
  }

  finish(){
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
    super.finish();
  }
}
