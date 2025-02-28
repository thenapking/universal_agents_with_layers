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
let current_layer = 0
const NUM_FLOWER_LAYER = 2
const NUM_BRAIN_LAYER = 3
const NUM_PIP_LAYER = 1

function setup() {
  let random_seed = Math.floor(random(1000000));
  // random_seed = 119994
  console.log(random_seed)
  randomSeed(random_seed);
  noiseSeed(random_seed);

  createCanvas(W, H);

  pixelDensity(2);
  createBoundaries();

  // attractors = createAttractors();
  // repellers = createRepellers();

  create_next_layer();
  
  
  palette_names = Object.keys(palettes)
  palette = palettes[palette_name];
  current_state = STATE_UPDATE
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

      if(current_layer > MAX_LAYERS) { 
        current_state = STATE_FINISHED; 
      } else {
        create_next_layer();
        current_state = STATE_UPDATE;
      }
      break;
  }
}

const MAX_LAYERS = 4

function create_next_layer(){
  switch(current_layer){
    case 0:
      create_obstacle_layer()
      break;
    case 1:
      create_pip_layer_around_obstactles(layers[0])
      break;
    case 2:
      create_slime_layer_around_obstactles(layers[1], layers[0])
      break;
    case 3:
      create_pip_layer_around_obstactles(layers[0])
      break;
    case 4:
      create_slime_layer_around_obstactles(layers[1], layers[0])
      break; 
    case 5:
      create_brain_layer()
      break;
  }
}

function draw_layers(){
  for(let current_depth = 0; current_depth < 4; current_depth++){
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
