class Lace extends LayerObject {
  constructor(layer, num_bounds = 1, num_groups, radius, attractors, repellers, max_time, options = {})
  {
    super(layer, num_bounds, num_groups, radius, attractors, repellers, max_time, {hide_bg: false, distinct: true});
    this.center = options.center;
    this.outer_radius = options.outer_radius;
    this.active
    
  }

  new_boundary(){
    return new Boundary("circle", {center: this.center, radius: this.radius, mode: "contain"});
  }
  
  new_group(boundary){
    let options = {minSize: 100, maxSize: 200, noiseScale: 0.01}
    return new BlobGroup(100, boundary.center, boundary.radius, [boundary], 1, options)
  }

  finish(){
    for(let group of this.groups){
      group.create_blobs();
    }
  }

  draw(){
    let group = this.groups[0]
    let outer_bounds = group.boundaries[0]
    fill(palette.pen)
    noStroke()

    push()
      drawingContext.save();
        drawingContext.beginPath();
        drawingContext.ellipse(outer_bounds.center.x, outer_bounds.center.y, outer_bounds.radius * 2, outer_bounds.radius * 2, 0, 0, TWO_PI);
        
        for(let agent of group.agents){
          if(agent.points.length > 3) {
            agent.draw_html_blob();
          } else {
            agent.draw_html();
          }
        }
        
        drawingContext.clip("evenodd");

        drawingContext.fillStyle = palette.pen;
        drawingContext.fill();
      drawingContext.restore();
    pop()
  }
}



  