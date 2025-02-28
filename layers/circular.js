class Circular extends SpaceFilling {
  new_group(boundary){
    let options =  {minSize: 5, maxSize: 50, noiseScale: 0.01, style: this.style}

    return new CircularGroup(120, boundary.center, boundary.radius, [boundary], 1, options)
  }
}
