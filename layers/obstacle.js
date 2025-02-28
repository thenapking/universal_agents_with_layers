class Obstacle extends SpaceFilling {
  new_group(boundary){
    let options = {noiseScale: 0.01, minSize: 40, maxSize: 80, repellers: this.repellers, style: this.style}
    return new ObstacleGroup(10, boundary.center, boundary.radius, [boundary], 0.1, options)
  }

}
