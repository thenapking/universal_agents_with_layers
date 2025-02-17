class DifferentialGroup extends Group{
    constructor(n, center, radius, boundaries, boundary_factor, options = {}){
        super(n, center, radius, boundaries, boundary_factor);
    }

    initialize() {
        for (let i = 0; i < this.n; i++) {
            let angle = map(i, 0, this.n, 0, TWO_PI);
            let x = this.center.x + radius * cos(angle);
            let y = this.center.y + radius * sin(angle);
            this.agents.push(new DifferentialAgent(createVector(x, y), this));
        }
    }

    draw(){
        beginShape();
            for(let agent of this.agents){
                vertex(agent.pos.x, agent.pos.y);
            }
        endShape(CLOSE);
    }
}

class DifferentialAgent extends Agent{
    constructor(pos, group) {
        super(pos, group);    
    }

    applyForce(force, factor){
        let f = force.copy();
        f.mult(factor).limit(stepSize);
        this.pos.add(f);
    }

    attraction(){
        let forceAttraction = createVector(0, 0);
        let dist_left = p5.Vector.dist(this.pos, this.left);
        let dist_right = p5.Vector.dist(this.pos, this.right);
        
        if (dist_left > desiredDistance) {
          let attract = p5.Vector.sub(this.left, this.pos)
          forceAttraction.add(attract);
        }
      
        if (dist_right > desiredDistance) {
          let attract = p5.Vector.sub(this.right, this.pos)
          forceAttraction.add(attract);
        }
      
        return forceAttraction;
      }
      
    alignment(){
        let midpoint = p5.Vector.add(this.left, this.right).div(2);
        let forceAlignment = p5.Vector.sub(midpoint, this.pos)
        return forceAlignment;
      }
      
    repulsion(){
        let forceRepulsion = createVector(0, 0);
        for (let other of this.group.agents){
          if(other === this || other === left || other === right) continue;
          
          let d = p5.Vector.dist(this.pos, other.pos);
          if (d < repulsionRadius && d > 0) {
            let repulse = p5.Vector.sub(this.pos, other.pos)
              .normalize()
              .mult((repulsionRadius - d) / repulsionRadius);
            forceRepulsion.add(repulse);
          }
        }
      
        return forceRepulsion;
    }

}
    