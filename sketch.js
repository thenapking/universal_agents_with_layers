let groups = [];
let boundaries = [];
let numGroups = 9;
let minSize = 20;
let maxSize = 35;
let minSize_c = 2;
let maxSize_c = 45;
let noiseScale = 0.025;
let STATE_INIT = 0;
let STATE_SEED = 1;
let STATE_GROW = 2;
let STATE_DONE = 3;
let current_state = STATE_INIT;
let NUM_SEEDS = 1600

const CIRCLE_SPACING = 1.4;

let plants=[];

let W = 1000;
let H = 1200;
let CELL_SIZE = 50
let r = 5; // segment length, proportional w
let k = 5
let max_dist = 60 // proportional to r and w
let min_dist = 10
let max_a = 0.01

let palette_names, palette_name = "Pumpkin", palette;



function setup() {
  createCanvas(W, H);
  createBoundaries();
  createEllipseGroups();
  createCircularGroups();

  // palette_names = Object.keys(palettes)
  // palette = palettes[palette_name];
}

function draw() {
  background(0);
  stroke(255);
  fill(0);

  

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

function createBoundaries(){
  let spacingFactor = 1.15;
  let attempts = 0;

  while(boundaries.length < numGroups && attempts < 20 * numGroups){
    let border = 0.2
    let x = random(width*border, width*(1-border));
    let y = random(height*border, height*(1-border));
    let center = createVector(x,y);
    let radius = random(60, 90);
    let valid = true;
    for (let other of boundaries) {
      let d = p5.Vector.dist(center, other.center);
      if (d < (radius + other.radius) * spacingFactor) {
        valid = false;
        break;
      }
    }
    if (valid) {
      let boundary = {center: center, radius: radius};
      boundaries.push(boundary);
    }
    attempts++;
  }
}

function createPlant(){
  for(let i = 0; i < 4; i++){
    console.log(`Creating plant ${i}`)
    plant = new Plant()
    let y = i<2 ? 0 : height
    let x = i%2==0 ? width*0.2 : width*0.8
    plant.initialize(x, y)
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
    // plant.draw_attractors()
    plant.draw_segments(false)
  }

  for(let plant of plants){
    // plant.draw_segments(true)
  }
}

function keyPressed(){
  if(key == 's'){
    save("canopy.svg");
  }
  
  if (key.toLowerCase() === "-" || key.toLowerCase() === "=") {  
    change_palette(key)
  } 
}

function change_palette(key){
  let palette_index = palette_names.indexOf(palette_name)

  if (key === "=") {
    palette_index += 1;
  } else {
    palette_index -= 1;
  }
  palette_index = constrain(palette_index, 0, palette_names.length-1) 
  palette_name = palette_names[palette_index]
  palette = palettes[palette_name];
  console.log(`Palette: ${palette_name}`)
  redraw();
}


let palettes = {
  "Pumpkin": {bg: "#F9AF1C", strength: "1", pen: "#0D2529", other_pen: "#FFFFFF" },
  "Gola": {bg: "#FFA21E", strength: "3", pen:"#22629D", other_pen: "#FFFFFF" },
  "Almond BG": { bg: "#F07500", strength: "1", pen:"#343549", other_pen: "#FFFFFF" },
  "Pumpkin II": {bg: "#F9AF1C", strength: "1", pen: "#F5E8D7", other_pen: "#000000" },
  "Cherry": {bg: "#BE1340", strength: "1", pen: "#F8ECE7", other_pen: "#000000"},
  "Burnt Orange": {bg: "#F77331", strength: "2.5", pen: "#F8ECE7", other_pen: "#000000"},
  "Console II":{bg: "#ED4404", strength: "1", pen: "#3B4552", other_pen: "#FFFFFF" },
  "Nightshade": {bg: "#0D1929", strength: "3", pen: "#FFFFFF", other_pen: "#000000"},
  "Monochrome": {bg: "#000000", strength: "2", pen: "#FFFFFF", other_pen: "#000000"},
  "Whale": {bg: "#003049", strength: "3", pen: "#F7F2EF", other_pen: "#000000"},
  "Light Smoke": {bg: "#2E2A40", strength: "2", pen: "#F5F5F7", other_pen: "#000000"},
  "Grind Blue Grey":{bg: "#253B56", strength: "3", pen: "#E6EAEE", other_pen: "#000000" },
  "Neutral": {bg: "#193541", strength: "3", pen: "#F5F3EE", other_pen: "#000000"},
  "Fire": {bg: "#31456A", strength: "1", pen: "#FF9833", other_pen: "#000000" },
  "Pink Dusk Inverse": {bg: "#08142C", strength: "2", pen: "#ffaba2", other_pen: "#000000"},
  "Prussian": {bg: "#1E3049", strength: "3", pen: "#FDF0D5", other_pen: "#000000"},
  "Computer Manual": {bg: "#2E3F47", strength: "2", pen: "#FBF4D7", other_pen: "#000000"},
  "Hand Bill": {bg: "#32404A", strength: "3", pen: "#F4D8B9", other_pen: "#000000"},
  "Almond": {bg: "#343549", strength: "2", pen: "#F6E9DF", other_pen: "#000000"},
  "Military Grey": {bg: "#86999D", strength: "2", pen: "#F5E6C5", other_pen: "#000000"},
  "Console": {bg: "#8399b4", strength: "3", pen: "#FFFFFF", other_pen: "#000000"},
  "Warm Grey": {bg: "#CDDBE8", strength: "2", pen: "#A62A4F", other_pen: "#FFFFFF"},
  "Vosper": {bg: "#229bb9", strength: "2", pen: "#FFFFFF", other_pen: "#000000"},
  "Vosper Inverse": {bg: "#77C4D1", strength: "1", pen: "#FFFFFF", other_pen: "#000000"},
  "Hi Contrast": {bg: "#65C3CF", strength: "2", pen: "#DD1B1C", other_pen: "#FFFFFF" },
  "Dream Building": {bg: "#40A5AF", strength: "3", pen: "#FDFAEB", other_pen: "#000000"},
  "KPM": {bg: "#6D8049", strength: "3", pen: "#F7EECD", other_pen: "#000000"},
  "Aesop Green":{bg: "#7F865C", strength: "3", pen: "#FDFDF8", other_pen: "#000000" },
  "West Coast": {bg: "#B5D6C5", strength: "2", pen: "#D75931", other_pen: "#FFFFFF"},
  "Grey Grass and Pumpkin": {bg: "#A9B6A4", strength: "2", pen: "#f9b815", other_pen: "#000000"},
  "Engraved Limestone":{bg: "#b8c4c2", strength: "3", pen: "#ffc907", other_pen: "#000000" },
  "Grey Grass": {bg: "#A9B6A4", strength: "2", pen: "#FAF3E2", other_pen: "#000000"},
  "Garden Catalogue": {bg:"#457E55", strength: "2", pen: "#FDF0DD", other_pen: "#000000" },
  "Brazil": {bg: "#2C8F3D", strength: "2", pen: "#EEC219", other_pen: "#000000" },
  "System I":{bg: "#003A11", strength: "3", pen: "#E2EDBB", other_pen: "#000000" },
  "Seashell": {bg: "#3A5970", strength: "2", pen: "#F1F0F2", other_pen: "#000000"},
  "Porcelain": {bg: "#293F92", strength: "3", pen: "#F2F0F0", other_pen: "#000000"},
  "Lavender": {bg: "#22629D", strength: "2", pen: "#FCF2F0", other_pen: "#000000"},
  "Lara": {bg: "#3272BD", strength: "2", pen: "#F7F2F2", other_pen: "#000000"},
  "Sandy Pool": {bg: "#1C6AA8", strength: "2", pen: "#F3E3BF", other_pen: "#000000"},
  "Cornflour": {bg: "#8EC8EC", strength: "2", pen: "#201C59", other_pen: "#FFFFFF"},
  "Grind Caramel":{bg: "#CA996D", strength: "3", pen: "#3C352E", other_pen: "#FFFFFF"}, 
  "Caffeine":{bg: "#a67b56", strength: "3", pen: "#ffffff", other_pen: "#000000" },
  "Grind":{bg: "#F6DEE2", strength: "3", pen: "#282522", other_pen: "#FFFFFF" },
  "Pink Dusk": {bg: "#F2A299", strength: "2", pen: "#08142C", other_pen: "#FFFFFF"},
  "Candy Floss": {bg: "#F8BCC8", strength: "1", pen: "#FAF3E9", other_pen: "#000000" },
  "Boy Girl": {bg: "#FFC2C9", strength: "3", pen: "#1B4D8C", other_pen: "#FFFFFF"},
  "Dairy": {bg: "#FCE0C4", strength: "2", pen: "#19141B", other_pen: "#FFFFFF"},
  "Aesop":{bg: "#F7E5C0", strength: "3", pen: "#1D1812", other_pen: "#FFFFFF" },
  "Almond Paper": {bg: "#F6E9DF", strength: "2", pen: "#343549", other_pen: "#FFFFFF"},
  "Prussian Ink": {bg: "#FDF0D5", strength: "2", pen: "#1E3049", other_pen: "#FFFFFF"},
  "Cosmetics":{bg: "#FFFEF0", strength: "3", pen: "#2D2D2D", other_pen: "#FFFFFF" },
  "Japanese": {bg: "#FFF8F5", strength: "1", pen: "#193541", other_pen: "#FFFFFF"},
  "Whale Ink": {bg: "#F7F2EF", strength: "1", pen: "#003049", other_pen: "#FFFFFF"},
  "Light Smoke Ink": {bg: "#F5F5F7", strength: "1", pen: "#2E2A40", other_pen: "#FFFFFF"},
  "Lavender Ink": {bg: "#FCF2F0", strength: "1", pen: "#22629D", other_pen: "#FFFFFF"},
  "Lara Ink": {bg: "#F7F2F2", strength: "1", pen: "#3272BD", other_pen: "#FFFFFF"},
  "Navy Ink": {bg: "#F8F4F9", strength: "2.5", pen: "#293F92", other_pen: "#FFFFFF"},
  "Neutral Ink": {bg: "#F5F3EE", strength: "1", pen: "#193541", other_pen: "#FFFFFF"},
  "Harbour": {bg: "#EEE7E6", strength: "2", pen: "#245590", other_pen: "#FFFFFF"},
  "Soft Peach": {bg: "#F7ECE4", strength: "2", pen: "#5272BD", other_pen: "#FFFFFF"},
  "Seashell Ink": {bg: "#F1F0F2", strength: "2", pen: "#3A5970", other_pen: "#FFFFFF"},
  "Light Cherry": {bg: "#F8ECE7", strength: "2.5", pen: "#BE1340", other_pen: "#FFFFFF"},
  "Burnt Orange Ink": {bg: "#F8ECE7", strength: "2.5", pen: "#F77331", other_pen: "#FFFFFF"}
};
