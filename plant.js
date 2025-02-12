class Plant {
  constructor() {
    this.attractors = []
    this.attractor_grid = new Grid()
    this.segment_grid = new Grid()
    this.segments = []
    this.branches = []
    this.trunks = []
    this.current = null
    this.min_branch_length = 10
    this.kill_dist = k
    this.orientations = []
  }

  initialize(x, y){
    let target = createVector(width/2, height/2)
    var dir = p5.Vector.sub(target, createVector(x, y))
    var root = new Segment(x, y, dir, r, null, this)
    this.segments.push(root)
    this.segment_grid.add(root)
    this.current = root
  }

  add_attractors(x, y, a, b){
    for (let i = 0; i < n; i++){
      let xa = x + random(-a, a)
      let ya = y + random(-b, b) - 250
      this.add_attractor(xa, ya)
    }
  }

  add_attractor(x,y){
    let a = new Attractor(x, y)
    this.attractors.push(a)
    this.attractor_grid.add(a)
  }

  draw_attractors(){
    for (let a of this.attractors){
      a.draw()
    }
  }

  draw_segments(branches = true){
    for (let i = this.segments.length-1; i > 0; i--){
      let s = this.segments[i]
      if(branches){
        s.draw_branches()
      } else {
        s.draw_trunks()
      }
    }
  }

  create_trunk(){
    // check to see if the current segment is close to an attractor
    var found = false
    while(!found){
      this.current.thicken()

      for(let a of this.attractors){
        var d = p5.Vector.dist(this.current.position, a.position)
        if(d < max_dist){
          found = true
          break
        }
      }
      
      // if it isn't, create a new segment
      if(!found){
        var next = this.current.next()
        this.current.children.push(next)
        this.segments.push(next)
        this.segment_grid.add(next)
        this.current.growing = false
        this.current = next
      }
    }
  }

  // each segment grows towards the closest attractor
  grow(){
    // for each attractor, move its closest segment towards it
    for (let i = 0; i < this.attractors.length; i++){
      let attractor = this.attractors[i]
      let closest_segment = this.get_closest_segment(attractor)
    
      // change the closest segment's direction towards the attractor
      if (closest_segment){ 
        closest_segment.attractors.push(attractor)   
      }
      
    }
    // make new branches from branches that are close to attractors
    this.grow_towards_attractor()
    this.remove_inactive_attractors()
  }

  get_closest_segment(attractor){
    let closest_segment = null
    let record = max_dist

    for(let j=0; j<this.segments.length; j++){
      let segment = this.segments[j]
      let d = p5.Vector.dist(attractor.position, segment.position)
      if (d < min_dist){
        attractor.segments.push(closest_segment)
        closest_segment = null // reset the closest_segment
        break;
      } else if (d < record){
        record = d
        closest_segment = segment
      }
    }

    return closest_segment
  }


  grow_towards_attractor(){
    for(let i = this.segments.length-1; i > 0; i--){
      let segment = this.segments[i]

      if(segment.attractors.length > 0){
        for(let attractor of segment.attractors){
          let new_direction = p5.Vector.sub(attractor.position, segment.position)
          new_direction.normalize()
          segment.direction.add(new_direction)
          segment.count++
        }
      }

      if (segment.count > 0){

        segment.direction.div(segment.count+1)
        let new_segment = segment.next()
        this.segments.push(new_segment)
        segment.children.push(new_segment)
        this.segment_grid.add(new_segment)
        segment.growing = false
        segment.reset()
        new_segment.thicken()

      }
    }
  }

  remove_inactive_attractors(){
    for(let i = this.attractors.length-1; i > 0; i--){
      let a = this.attractors[i]

      if(a.segments.length > 0){
        a.active = false
      }

      if(!a.active){
        this.attractors.splice(i, 1)
      } else {
        a.segments = []
      }
    }
  }
}


