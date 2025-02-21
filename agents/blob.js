class BlobGroup extends CircularGroup {
    constructor(n, center, radius, boundaries, boundary_factor, options = {}){
        super(n, center, radius, boundaries, boundary_factor, options);
    }

    initialize() {
        for (let i = 0; i < this.n; i++) {
          let x = random(this.center.x - this.radius, this.center.x + this.radius)
          let y = random(this.center.y - this.radius, this.center.y + this.radius)
          let points = this.create_vertices(x, y);

          this.agents.push(new BlobAgent(createVector(x, y), this, points));
        }
    }

    create_vertices(x0, y0) {
        let points = [];
        let n = int(random(5, 8))
        let base = random(this.minSize, this.maxSize);
        let desired = base * 0.3

        for (let i = 0; i < n; i++) {
          let angle = i*TWO_PI/n;

          let nz = noise(x0 * 0.01 + cos(angle) * 10, y0 * 0.01 + sin(angle) * 10, i);
          let r = base + map(nz, 0, 1, -desired, desired);
          r = constrain(r, this.minSize, this.maxSize);
          let x = x0 + r * cos(angle);
          let y = y0 + r * sin(angle);


          points.push(createVector(x, y));
        }
        return points;
    }
}


class BlobAgent extends CircularAgent {
    constructor(position, group, points) {
        super(position, group);
        this.points = points;
        this.n = points.length;
    }
   
    draw() {
        noFill();
        stroke(palette.pen)
        strokeWeight(2);

        beginShape();
            curveVertex(this.points[this.n - 1].x, this.points[this.n - 1].y);
            
            for (let p of this.points) {
                curveVertex(p.x, p.y);
            }

            curveVertex(this.points[0].x, this.points[0].y);
            curveVertex(this.points[1].x, this.points[1].y);
        endShape();
    }
}