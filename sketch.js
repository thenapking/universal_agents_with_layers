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

function setup() {
  createCanvas(W, H);

  pixelDensity(2);
  createBoundaries();
  createSlimeGroupBoundaries()
  attractors = createAttractors();
  repellers = createRepellers();
  createSlimeGroup();

  palette_names = Object.keys(palettes)
  palette = palettes[palette_name];
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

  let active = 0
  for (let group of groups) {
    group.update();
    group.draw();
    if(group.active) active++;
  }

  if(active < 3){
    createSlimeGroup();
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

let slime_group_boundaries = [];
function createSlimeGroupBoundaries(){
  for(let i = 0; i < 7; i++){
    let x = random(W);
    let y = random(H);
    let center = createVector(x, y);
    let radius = 300
    let boundary = new Boundary("circle", {center: center, radius: radius, mode: "contain"});
    slime_group_boundaries.push(boundary);
  }
}

function createSlimeGroup(){
  groups = []
  for(let boundary of slime_group_boundaries){

    let speed = 8;

    let sensor_angle = 0.01; 
    let rotation_angle = 0.18;
    let sensor_dist = 60;
    let kill_dist = speed*0.5 - 0.01;
    let poop_interval = 2;


    let slime_group = new SlimeGroup(48, boundary.center, boundary.radius, [boundary], attractors, repellers, sensor_angle, rotation_angle, sensor_dist, kill_dist, speed, poop_interval) 
    slime_group.initialize();
    groups.push(slime_group);
  }
}

function keyPressed(){
  if(key == 's'){
    save("slime.png");
  }
  
  if (key.toLowerCase() === "-" || key.toLowerCase() === "=") {  
    change_palette(key)
  } 
}
