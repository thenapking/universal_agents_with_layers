const STATE_INIT = 0;
const STATE_UPDATE = 1;
const STATE_DONE = 2;
const STATE_SPACE_FILL = 3;

class Layer {
  constructor(depth = 0, objects = [], active = true){
    this.depth = depth;
    this.objects = objects;
    this.active = active;
  }

  update(){
    let active = 0
    for(let layer_object of this.objects){
        layer_object.update();
        if(layer_object.active) { active++; }
    }
    if(active == 0){
        this.active = false;
    }
  }

  draw(){
    for(let layer_object of this.objects){
        layer_object.draw();
    }
  }
}


class LayerObject {
  constructor(layer, num_bounds = 1, num_groups, radius, attractors, repellers, max_time, options = {hide_bg: true, distinct: true}) {
    this.layer = layer;
    this.boundaries = [];
    this.groups = [];
    this.state = null;
    this.nb = num_bounds;
    this.n = num_groups;
    this.radius = radius;
    this.attractors = attractors;
    this.repellers = repellers;
    this.active = true;
    this.max_time = max_time;
    this.hide_bg = options.hide_bg
    this.distinct = options.distinct
    this.options = options
  }

  initialize(){
    this.state = STATE_INIT;
    this.create_boundaries();
    this.active = this.check_intersection();

    if(this.active){
        this.create_groups();
        this.state = STATE_UPDATE
    } else {
        this.state = STATE_DONE
    }
  }

  check_intersection(){
    if(!this.distinct) { return true }

    let valid = true
    for(let other of this.layer.objects){
        for(let other_boundary of other.boundaries){
            for(let boundary of this.boundaries){
                if(boundary.intersects(other_boundary)){
                    console.log("invalid")
                    valid = false;
                }
            }
        }
    }
    return valid
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
    if(t > this.max_time){ return }
    let active = 0
    for (let group of this.groups) {
        group.update();
        if(group.active) active++;
    }
    if (active == 0 || t > this.max_time) {
        this.active = false;
    }
  }

  draw(){
    if(this.hide_bg){
        push();
            fill(palette.bg);
            for(let boundary of this.boundaries){
                boundary.draw();
            }
        pop()
    }

    for (let group of this.groups) {
        push();
            noFill();

            group.draw();
        pop();
    }
  }

  

  change_state(){
    if(!this.active){
        this.state = STATE_DONE
    }
  }
}
