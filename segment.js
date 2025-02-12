class Segment {
  constructor(x, y, direction, length, parent, plant){
    this.position = createVector(x, y)
    this.x = this.position.x
    this.y = this.position.y
    this.direction = direction
    this.original_direction = this.direction.copy()
    this.length = length
    this.parent = parent
    this.count = 0;
    this.thickness = 1
    this.type = "stick"
    this.branch_id = null;
    this.growing = true
    this.plant = plant
    this.attractors = []
    this.children = []
    this.drawn = false
    this.processed = false
  }

  reset(){
    this.direction = this.original_direction.copy()
    this.attractors = []
    this.count = 0
  }
  
  draw_branches(){
    fill(0)
    stroke(255)
    if(this.parent != null){
      let minThickness = 1;
      let thicknessVal = max(this.thickness, minThickness);
    
      let rad = map(thicknessVal, 1, 3, 0.1, 1);  
      let radius = 100 * rad ** 2

      if (radius < this.length*2) { 
        line(this.x, this.y, this.parent.x, this.parent.y);
      }
    }
  }

  draw_trunks(){
    fill(0)
    stroke(255)
    if(this.parent != null){
      let minThickness = 1;
      let thicknessVal = max(this.thickness, minThickness);
    
      let rad = map(thicknessVal, 1, 3, 0.1, 1);  
      let radius = 100 * rad ** 2


      let n_circles = 1

      if(radius < 10 && radius > 0) {
        n_circles = ceil(this.length / radius);
        n_circles = constrain(n_circles, 1, 10);
      }

      for (let i = 0; i < n_circles; i++) {
        let t = i / n_circles; 
        let x = lerp(this.parent.x, this.x, t);
        let y = lerp(this.parent.y, this.y, t);
        circle(x, y, radius);
      }
    }

  }

  next(){
    let nx = constrain(this.direction.x, this.original_direction.x-max_a, this.original_direction.x + max_a)
    let ny = constrain(this.direction.y, this.original_direction.y-max_a, this.original_direction.y + max_a)
    let next_direction  = createVector(nx, ny).normalize().mult(this.length)
    
    let next_position = p5.Vector.add(this.position, next_direction)

    return new Segment(next_position.x, next_position.y, this.direction, this.length, this, this.plant)
  }

  offset(thk=5){
    let a = this.direction.heading() + PI/2
    return createVector(cos(a), sin(a)).mult(this.thickness*thk)
  }

  thicken(){
    let current = this
    
    let thickness_ratio = 0.07
    let accretion = 0.01

    while(current.parent != null){
      if(current.parent.thickness < current.thickness + thickness_ratio){
        current.parent.thickness = current.thickness + accretion
      }
      current = current.parent
    }
  }
}
