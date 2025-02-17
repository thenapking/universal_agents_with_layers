let groups = [];
let boundaries = [];
let numGroups = 5;
let minSize = 20;
let maxSize = 35;
let minSize_c = 1;
let maxSize_c = 40;
let noiseScale = 0.025;
let NUM_SEEDS = 1200

const CIRCLE_SPACING = 1.4;

let plants=[];

let W = 1000;
let H = 1200;
let CELL_SIZE = 50

let palette_names, palette_name = "Pumpkin", palette;
let attractors, repellers;
let layers = [];
let flower_layer, slime_mould_layer;
let sm;
let t = 0;

function setup() {
  createCanvas(W, H);

  pixelDensity(2);
  createBoundaries();
  create_brain_layer()

  attractors = createAttractors();
  repellers = createRepellers();

  create_flower_layer()
  create_slime_layer()


  palette_names = Object.keys(palettes)
  palette = palettes[palette_name];
}

function create_slime_layer(){
  let layer = new Layer(2)

  let num_bounds = 1;
  let num_groups = 1;
  let radius = 100;
  
  let num_fronds = random([12,24,48]);
  let straightness = 100;

  for(let boundary of boundaries){
    let outer_radius = 700
    let trail_style = "line_and_circle"
    num_fronds = random([4,5,6])
    let max_time = 10000;
    let options = {center: boundary.center, 
      inner_radius: boundary.radius, 
      outer_radius: outer_radius, 
      num_fronds: num_fronds, 
      straightness: straightness, 
      trail_style: trail_style,
      hide_bg: false,
      distinct: false
    }

    let slim = new SlimeMould(layer, num_bounds, num_groups, radius, attractors, repellers, max_time, options)

    slim.initialize();
    layer.objects.push(slim);
    layers.push(layer)
  }
}

function create_brain_layer(){
  let layer = new Layer(1)
  let count = 0
  let center = createVector(random(width), random(height))
  let radius = random(100, 200)
  let max_time = 200;
  let num_bounds = 1;
  let num_groups = 1
  
  
  for(let i = 0; i < 100; i++){
    let options = {center: center,
      distinct: true,
      hide_bg: true, 
      desiredDistance: random([20,30,40]),
      minSegmentLength: 5, 
      maxSegmentLength: 15,
      repulsionRadius: 40, 
      attractionFactor: 0.5, 
      alignmentFactor: 0.02, 
      repulsionFactor: 1.2, 
      stepSize: 20
    }

    let brain = new BrainCoral(layer, num_bounds, num_groups, radius, max_time, options)
    brain.initialize()
    if(brain.state === STATE_UPDATE) {
      layer.objects.push(brain);
      count++;
      if(count > 4) { break; }
    }
  }
  layers.push(layer)
}

function create_flower_layer(){
  let layer = new Layer(0)

  let num_bounds = 1;
  let num_groups = 1;
  let radius = 100;
  
  let num_fronds = random([12,24,48]);
  let straightness = 100;
  let count = 0

  for(let i = 0; i < 100; i++){
    let outer_radius = random(100,200);
    let inner_radius = outer_radius * 0.1
    let trail_style = random(["line", "line_and_circle"])
    num_fronds = trail_style=="line" ? random([36,48,60]) : random([18,24,30])
    let center = createVector(random(W), random(H));
    let max_time = 2000;
    let options = {center: center, 
      inner_radius: inner_radius, 
      outer_radius: outer_radius, 
      num_fronds: num_fronds, 
      straightness: straightness, 
      trail_style: trail_style
    }

    let c = new CircularFlower(layer, num_bounds, num_groups, radius, attractors, repellers, max_time, options)

    c.initialize();
    if(c.state === STATE_UPDATE) {
      layer.objects.push(c);
      count++;
      if(count > 5) { break; }
    }
  }

  layers.push(layer)
  flower_layer = layer
}

function draw() {
  background(palette.bg);
  stroke(palette.pen);
  fill(palette.bg);
  strokeWeight(1.5);

  for(let a of attractors){
    stroke(0)
    a.draw();
  }

  for(let r of repellers){
    stroke(255)
    r.draw();
  }

  for(let layer of layers){
    if(layer.depth == 2){
      layer.update();
      for(let object of layer.objects){
        if(!object.active){
          object.reinitialize();  
        }
      }
    }

    if(layer.depth < 2){
      layer.update();
      layer.draw();
    }
    
  }

  

  t++
}

function createAttractors(){
  let arr = [];
  for(let i = 0; i < 500; i++){
    let x = random(W);
    let y = random(H);
    let a = new Attractor(x, y);
    arr.push(a);
  }
  return arr
}

function createRepellers(){
  let arr = [];
  for(let boundary of boundaries){
    for(let i = 0; i < 200; i++){
      let x = boundary.center.x + random(-boundary.radius, boundary.radius);
      let y = boundary.center.y + random(-boundary.radius, boundary.radius);
      let a = new Attractor(x, y);
      arr.push(a);
    }
  }
  return arr
}

function keyPressed(){
  if(key == 's'){
    save("slime.png");
  }
  
  if (key.toLowerCase() === "-" || key.toLowerCase() === "=") {  
    change_palette(key)
  } 
}
