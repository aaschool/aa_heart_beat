let video;
let poseNet;
let poses = [];
let fluid;
let cellSize = 10;
let numCols, numRows;
let isDrawing = true;
let showCamera = true;
let canvasColor = [0, 0, 0];
let fluidColor = [0, 0, 0];

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);
  colorMode(HSB, 360, 100, 100);
  background(canvasColor[0], canvasColor[1], canvasColor[2]);
  numCols = floor(width / cellSize);
  numRows = floor(height / cellSize);
  fluid = new Array(numCols * numRows).fill(0);
}

function gotPoses(detectedPoses) {
  poses = detectedPoses;
}

function modelLoaded() {
  console.log('PoseNet ready');
}

function updateFluid() {
  if (isDrawing) {
    for (let i = 0; i < poses.length; i++) {
      let pose = poses[i].pose;
      let nose = pose.nose;
      let mirroredX = width - nose.x;
      let col = floor(mirroredX / cellSize);
      let row = floor(nose.y / cellSize);
      let index = col + row * numCols;
      fluid[index] = 1;
    }
  }

  let newFluid = new Array(numCols * numRows).fill(0);
  for (let i = 1; i < numCols - 1; i++) {
    for (let j = 1; j < numRows - 1; j++) {
      let index = i + j * numCols;
      let sum = fluid[index];
      sum += fluid[index - 1];
      sum += fluid[index + 1];
      sum += fluid[index - numCols];
      sum += fluid[index + numCols];
      newFluid[index] = sum * 0.2;
    }
  }
  fluid = newFluid;
}

function drawFluid() {
  for (let i = 0; i < numCols; i++) {
    for (let j = 0; j < numRows; j++) {
      let index = i + j * numCols;
      let value = fluid[index];
      let hue = fluidColor[0];
      let saturation = fluidColor[1];
      let brightness = value * fluidColor[2];
      fill(hue, saturation, brightness);
      noStroke();
      rect(i * cellSize, j * cellSize, cellSize, cellSize);
    }
  }
}

function draw() {
  background(canvasColor[0], canvasColor[1], canvasColor[2]);

  if (showCamera) {
    push();
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);
    pop();
  }

  updateFluid();
  drawFluid();
}

function keyPressed() {
  if (key === ' ') {
    isDrawing = !isDrawing;
  } else if (key === 'c') {
    fluid = new Array(numCols * numRows).fill(0);
  } else if (key === 's') {
    saveCanvas('fluid-artwork', 'png');
  } else if (key === 'v') {
    showCamera = !showCamera;
  }
}

function mouseMoved() {
  let hue = map(mouseX, 0, width, 0, 360);
  let saturation = map(mouseY, 0, height, 0, 100);
  let brightness = 100;
  canvasColor = [hue, saturation, brightness];
  fluidColor = [hue, saturation, brightness];
}