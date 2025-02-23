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
let attractors_road = [];
let layers = [];
let flower_layer, slime_mould_layer;
let sm;
let t = 0;
let current_state = STATE_INIT
let current_layer = 1
const NUM_FLOWER_LAYER = 2
const NUM_BRAIN_LAYER = 2

function setup() {
  let random_seed = Math.floor(random(1000000));
  // random_seed = 119994
  console.log(random_seed)
  randomSeed(random_seed);
  noiseSeed(random_seed);

  createCanvas(W, H);

  pixelDensity(2);
  createBoundaries();

  attractors = createAttractors();
  repellers = createRepellers();

  create_next_layer();
  
  
  palette_names = Object.keys(palettes)
  palette = palettes[palette_name];
  current_state = STATE_UPDATE
}

function create_brain_layer(){
  let order = 1
  let depth = 1
  let layer = new Layer(order, depth)
  let count = 0
  let center = createVector(random(width), random(height))
  let radius = random(300, 400)
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

    let brain = new BrainCoral(layer, num_bounds, num_groups, radius, max_time + t, options)
    brain.initialize()
    if(brain.state === STATE_UPDATE) {
      layer.objects.push(brain);
      count++;
      if(count > NUM_BRAIN_LAYER) { break; }
    }
  }
  layers.push(layer)
}

function create_flower_layer(){
  let order = 0
  let depth = 0
  let layer = new Layer(depth, order)

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
    let max_time = 200;
    let options = {center: center, 
      inner_radius: inner_radius, 
      outer_radius: outer_radius, 
      num_fronds: num_fronds, 
      straightness: straightness, 
      separation_radius: 30,
      trail_style: trail_style
    }

    let c = new CircularFlower(layer, num_bounds, num_groups, radius, attractors, repellers, max_time + t, options)

    c.initialize();
    if(c.state === STATE_UPDATE) {
      layer.objects.push(c);
      count++;
      if(count > NUM_FLOWER_LAYER) { break; }
    }
  }

  layers.push(layer)
  flower_layer = layer
}

function create_slime_layer(){
  let order = 2
  let depth = 2
  let layer = new Layer(order, depth)

  let num_bounds = 1;
  let num_groups = 1;
  let radius = 100;
  
  let num_fronds = random([12,24,48]);
  let straightness = 100;

  for(let boundary of boundaries){
    let outer_radius = 700
    let trail_style = "road"
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
    if(layer.objects.length > 1) { break; }
    layer.objects.push(slim);
    layers.push(layer)
  }
}

let bg
let cg
let bd
let lc

function create_hole_layer(){
  let order = 0
  let depth = 2
  let layer = new Layer(order, depth)

  let num_bounds = 1;
  let num_groups = 1;
  let radius = W;
  let center = createVector(W/2, H/2);
  let max_time = 1000;

  let options = {center: center, 
    outer_radius: 350, 
    distinct: true
  }

  lc = new Lace(layer, num_bounds, num_groups, radius, attractors, [], max_time + t, options)
  lc.initialize();
  if(lc.state === STATE_UPDATE) {
    layer.objects.push(lc);
  }

  layers.push(layer)
}

function create_space_filling_layer(){
  let order = 3
  let depth = 3
  let layer = new Layer(order, depth)

  let num_bounds = 1;
  let num_groups = 1;
  let radius = 500;
  

  let outer_radius = 50;
  let max_time = 1000;

  let center = createVector(W/2, H/2);

  let options = {center: center, 
    outer_radius: outer_radius, 
  }
  
  let boundaries = []

  for(let b of lc.groups[0].agents) {
    let points = []
    for(let p of b.points){
      let x = p.x + b.position.x
      let y = p.y + b.position.y
      points.push(createVector(x, y))
    }
    let boundary = new Boundary("blob", {mode: "exclude", points: points})
    boundaries.push(boundary)
  }

  bd = boundaries
  let c = new SpaceFilling(layer, num_bounds, num_groups, radius, attractors, [], max_time + t, options)

  c.initialize();
  c.groups[0].boundaries = c.groups[0].boundaries.concat(boundaries)
  cg = c.groups[0]
  if(c.state === STATE_UPDATE) {
    layer.objects.push(c);

  }

 
  layers.push(layer)
}

function draw() {
  background(palette.bg);
  stroke(palette.pen);
  fill(palette.bg);
  strokeWeight(1.5);

  update_state()

  draw_layers()

  if(current_state == STATE_FINISHED){
    noLoop();
  } else {
    t++
  }
}

function update_state(){
  switch(current_state){
    case STATE_INIT:
      console.log("INIT")
      break;
    case STATE_UPDATE:
      for(let layer of layers){
        if(layer.order == current_layer){
          layer.update();
          if(!layer.active) { 
            console.log(current_layer, "DONE")
            current_state = STATE_DONE; 
          }
        }
      }
      break;
    case STATE_DONE:
      for(let layer of layers){
        if(layer.order == current_layer){
          layer.finish();
        }
      }

      current_layer++;

      if(current_layer > 3) { 
        current_state = STATE_FINISHED; 
      } else {

        create_next_layer();
        current_state = STATE_UPDATE;
      }
      break;
  }
}

function create_next_layer(){
  switch(current_layer){
    case 0:
      // create_flower_layer()
      break;
    case 1:
      create_brain_layer()
      break;
    case 2:
      // create_slime_layer()
      create_hole_layer()
      break; 
    case 3:
      create_space_filling_layer()
      break;
  }
}

function draw_layers(){
  for(let current_depth = 4; current_depth >= 0; current_depth--){
    for(let layer of layers){
      if(layer.depth == current_depth ){
        layer.draw();
      }
    }
  }
}

function draw_attractors_and_repellers(){
  for(let a of attractors){
    stroke(0)
    a.draw();
  }

  for(let r of repellers){
    stroke(255)
    r.draw();
  }
}

function createAttractors(){
  let arr = [];
  for(let i = 0; i < 100; i++){
    let x = random(W);
    let y = random(H);
    let a = new Attractor(x, y, "attractor");
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
      let a = new Attractor(x, y, "repeller");
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
