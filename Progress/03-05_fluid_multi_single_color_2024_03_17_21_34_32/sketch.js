let video;
let poseNet;
let poses = [];
let fluid;
let cellSize = 10;
let numCols, numRows;
let isDrawing = true;
let showCamera = true;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);
  background(0);
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
    poses.forEach(pose => {
      let nose = pose.pose.nose;
      let mirroredX = width - nose.x;
      let col = floor(mirroredX / cellSize);
      let row = floor(nose.y / cellSize);
      let index = col + row * numCols;
      fluid[index] = 1;
    });
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
      fill(value * 255);
      noStroke();
      rect(i * cellSize, j * cellSize, cellSize, cellSize);
    }
  }
}

function draw() {
  background(0);
  if (showCamera) {
    push();
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);
    pop();
  }
  updateFluid();
  drawFluid();

  // Blend fluid between different traces
  for (let i = 1; i < numCols - 1; i++) {
    for (let j = 1; j < numRows - 1; j++) {
      let index = i + j * numCols;
      let sum = fluid[index];
      sum += fluid[index - 1];
      sum += fluid[index + 1];
      sum += fluid[index - numCols];
      sum += fluid[index + numCols];
      fluid[index] = sum * 0.2;
    }
  }
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