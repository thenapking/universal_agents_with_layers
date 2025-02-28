class Pips extends SpaceFilling  {
  new_group(boundary){
    let n = 2500
    let maxSize = 10
    let minSize = 5

    if(this.style == "small") {
      minSize = 2
      maxSize = 7
      n = 5000
    }

    let options =  {minSize: minSize, maxSize: maxSize, noiseScale: 0.01, style: this.style}

    return new PipGroup(n, boundary.center, boundary.radius, [boundary], 1, options)
  }

 
}
