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

function setup() {
  createCanvas(W, H);

  pixelDensity(2);
  createBoundaries();
  attractors = createAttractors();
  repellers = createRepellers();

  create_flower_layer()

  palette_names = Object.keys(palettes)
  palette = palettes[palette_name];
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
    num_fronds = trail_style=="line" ? random([36,48,60]) : random([12,24,30])
    let center = createVector(random(W), random(H));

    let c = new CircularFlower(layer, num_bounds, num_groups, radius, attractors, repellers,
      center, inner_radius, outer_radius, num_fronds, straightness, trail_style)
    c.initialize();
    if(c.state === STATE_UPDATE) {
      layer.objects.push(c);
      count++;
      if(count > 6) { break; }
    }
  }

  layers.push(layer)
  flower_layer = layer
}

function create_slime_mould_layer(){
  let layer = new Layer(1)
  let hide_bg =false;
  let distinct = false;
  let c = new SlimeMould(layer, num_bounds, num_groups, radius, attractors, repellers, hide_bg, distinct, flower_layer.boundaries)
  c.initialize();

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
    layer.update();
  }


}

function createAttractors(){
  let arr = [];
  for(let i = 0; i < 1000; i++){
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
    for(let i = 0; i < 100; i++){
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
