const STATE_INIT = 0;
const STATE_UPDATE = 1;
const STATE_DONE = 2;

class Layer {
  constructor(level_id, num_bounds = 1, num_groups, radius, attractors, repellers) {
    this.level_id = level_id;
    this.boundaries = [];
    this.groups = [];
    this.state = null;
    this.nb = num_bounds;
    this.n = num_groups;
    this.radius = radius;
    this.attractors = attractors;
    this.repellers = repellers;
    this.active = true;
  }

  initialize(){
    this.state = STATE_INIT;
    this.create_boundaries();
    this.create_groups();
    this.state = STATE_UPDATE
  }

  create_boundaries(){
    for(let i = 0; i < this.nb; i++){
      let x = random(W);
      let y = random(H);
      
      let boundary = this.new_boundary(x, y, this.radius);
      this.boundaries.push(boundary);
    }
  }

  create_groups(){
    for(let boundary of this.boundaries){
      let group = this.new_group(boundary);
      group.initialize();
      this.groups.push(group);
    }
  }

  new_boundary(x, y, r){
    let center = createVector(x, y);
    return new Boundary("circle", {center: center, radius: r, mode: "contain"});
  }

  new_group(boundary){
    //
  }

  update(){
    // let active = 0
    for (let group of this.groups) {
        group.update();
        // if(group.active) active++;
    }
    // if (active == 0) {
    //     this.active = false;
    // }
  }

  draw(){
    for (let group of this.groups) {
        group.draw();
    }
  }

  change_state(){
    if(!this.active){
        this.state = STATE_DONE
    }
  }
}