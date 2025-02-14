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
let circular_flower_layer;
function setup() {
  createCanvas(W, H);

  pixelDensity(2);
  createBoundaries();
  attractors = createAttractors();
  repellers = createRepellers();

  create_layers()

  palette_names = Object.keys(palettes)
  palette = palettes[palette_name];
}

let c;
function create_layers(){
  
  let level_id = 0;
  let num_bounds = 1;
  let num_groups = 1;
  let radius = 100;
  
  let num_fronds = 48;
  let straightness = 60;
  let separation_distance = 60;
  let max_time = 100;

  for(let i = 0; i < 6; i++){
    let inner_radius = random(30,40);
    let outer_radius = random(100,200);
    let center = createVector(random(W), random(H));

    c = new CircularFlower(level_id, num_bounds, num_groups, radius, attractors, repellers,
      center, inner_radius, outer_radius, num_fronds, straightness, separation_distance, max_time)
    c.initialize();
    layers.push(c);
  }
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
    stroke(255,0,0)
    layer.update();
    layer.draw();
  }

  // noLoop();

  // if(active < 3){
  //   createSensorGroup();
  // }
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

// function createSensorGroupBoundaries(){
//   for(let i = 0; i < 7; i++){
//     let x = random(W);
//     let y = random(H);
//     let center = createVector(x, y);
//     let radius = 300
//     let boundary = new Boundary("circle", {center: center, radius: radius, mode: "contain"});
//     slime_group_boundaries.push(boundary);
//   }
// }

// function createSensorGroup(){
//   groups = []
//   for(let boundary of slime_group_boundaries){

//     let speed = 8;

//     let sensor_angle = 0.01; 
//     let rotation_angle = 0.18;
//     let sensor_dist = 60;
//     let kill_dist = speed*0.5 - 0.01;
//     let poop_interval = 2;


//     let slime_group = new SensorGroup(48, boundary.center, boundary.radius, [boundary], attractors, repellers, sensor_angle, rotation_angle, sensor_dist, kill_dist, speed, poop_interval) 
//     slime_group.initialize();
//     groups.push(slime_group);
//   }
// }

function keyPressed(){
  if(key == 's'){
    save("slime.png");
  }
  
  if (key.toLowerCase() === "-" || key.toLowerCase() === "=") {  
    change_palette(key)
  } 
}
