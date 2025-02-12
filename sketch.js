let groups = [];
let boundaries = [];
let numGroups = 5;
let minSize = 20;
let maxSize = 35;
let minSize_c = 1;
let maxSize_c = 40;
let noiseScale = 0.025;
let STATE_INIT = 0;
let STATE_SEED = 1;
let STATE_GROW = 2;
let STATE_DONE = 3;
let current_state = STATE_INIT;
let NUM_SEEDS = 600

const CIRCLE_SPACING = 1.4;

let plants=[];

let W = 1000;
let H = 1200;
let CELL_SIZE = 50
let r = 5; // segment length, proportional w
let k = 20
let max_dist = 60 // proportional to r and w
let min_dist = 10
let max_a = 0.01
let BRANCH_CUTOFF = 2

let palette_names, palette_name = "Pumpkin", palette;

function setup() {
  createCanvas(W, H);
  createBoundaries();
  createEllipseGroups();
  createCircularGroups();

  pixelDensity(2);

  palette_names = Object.keys(palettes)
  palette = palettes[palette_name];
}

function draw() {
  background(palette.bg);
  stroke(palette.pen);
  fill(palette.bg);
  strokeWeight(1.5);

  for (let group of groups) {
    group.draw();
  }

  updateState();
}

function updateState(){
  switch(current_state){
    case STATE_INIT:
      let active = 0;

      for (let group of groups) {
        active += group.update();
      }

      if (active === 0) {
        console.log("All agents have come to rest.");
        current_state = STATE_SEED;
      }

      break;
    case STATE_SEED:
      console.log("Creating plant");
      createPlant();
      current_state = STATE_GROW;

      break;
    case STATE_GROW:
      updatePlant();

      break;
    case STATE_DONE:

      noLoop();
      break;
  }
}



function createPlant(){
  // let kill_dist = 20
  // let initial_radius = 5
  // let max_angle = 0.01

  let kill_dist = 10
  let initial_radius = 15
  let max_angle = 0.5

  for(let i = 0; i < 1; i++){
    console.log(`Creating plant ${i}`)
    let y = i<2 ? 0 : height
    let x = i%2==0 ? width*0.2 : width*0.8

    let xc = i%2==0 ? 0 : width
    let yc = i<2 ? height*0.075 : height*0.925
    let boundary = new Boundary("circle", {center: createVector(xc, yc), radius: W*0.8, mode: "contain"})
    plant = new Plant(boundary, kill_dist, max_angle)
    
    plant.initialize(x, y, initial_radius)

    for(let obj of circular_group.agents){
      plant.add_attractor(obj.pos.x, obj.pos.y, obj)
    }
    plant.create_trunk()
    plants.push(plant)
  }
}

function updatePlant(){
  for(let plant of plants){
    plant.grow()
    plant.draw_attractors()
    // noFill()
    // plant.draw_boundary()
    fill(palette.bg)
    stroke(palette.pen)
    // plant.draw_segments(false)
  }

  for(let plant of plants){
    fill(palette.bg)
    stroke(palette.pen)
    plant.draw_segments(true)
    // plant.draw_bezier()
  }
}

function keyPressed(){
  if(key == 's'){
    save("canopy.png");
  }
  
  if (key.toLowerCase() === "-" || key.toLowerCase() === "=") {  
    change_palette(key)
  } 
}