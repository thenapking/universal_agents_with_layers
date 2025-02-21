class BlobGroup extends CircularGroup {
    initialize() {
        for (let i = 0; i < this.n; i++) {
          let x = random(this.center.x, this.center.x)
          let y = random(this.center.y, this.center.y)
          let size = random(this.minSize, this.maxSize);
          let points = this.create_vertices(size);

          this.agents.push(new BlobAgent(createVector(x, y), this, size, points));
        }
    }

    create_vertices(base) {
        let points = [];
        let n = int(random(5, 8))
        let desired = base * 0.3

        for (let i = 0; i < n; i++) {
          let angle = i*TWO_PI/n;

          let nz = noise(cos(angle) * 10, sin(angle) * 10, i);
          let r = base + map(nz, 0, 1, -desired, desired);
          r = constrain(r, this.minSize, this.maxSize);
          let x = r * cos(angle);
          let y = r * sin(angle);


          points.push(createVector(x, y));
        }
        return points;
    }
}


class BlobAgent extends CircularAgent {
    constructor(position, group, size, points) {
        super(position, group);
        this.size = size*2 // 
        this.points = points;
        this.n = points.length;
        this.separation_radius = this.size * 1.2 // give it a bit of a margin
    }
   
    draw() {
        push()
            translate(this.position.x, this.position.y);
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
        pop()
    }
}