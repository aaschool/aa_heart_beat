let video;
let poseNet;
let poses = [];
let fluid;
let cellSize = 10;
let numCols, numRows;
let isDrawing = true;
let showCamera = true;
let faceColors = [];
let leftWristColor, rightWristColor;
let showInstructions = true;
let isFrozen = false;

function setup() {
  createCanvas(600, 600);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);
  background(0);
  numCols = floor(width / cellSize);
  numRows = floor(height / cellSize);
  fluid = new Array(numCols * numRows).fill(0);
  leftWristColor = getRandomColor();
  rightWristColor = getRandomColor();
}

function gotPoses(detectedPoses) {
  poses = detectedPoses;
}

function modelLoaded() {
  console.log('PoseNet ready');
}

function updateFluid() {
  if (isDrawing && !isFrozen) {
    poses.forEach((pose, index) => {
      let nose = pose.pose.nose;
      let leftWrist = pose.pose.leftWrist;
      let rightWrist = pose.pose.rightWrist;

      if (nose.confidence > 0.5) {
        let mirroredX = width - nose.x;
        let col = floor(mirroredX / cellSize);
        let row = floor(nose.y / cellSize);
        let fluidIndex = col + row * numCols;
        if (!faceColors[index]) {
          faceColors[index] = getRandomColor();
        }
        fluid[fluidIndex] = { color: faceColors[index], strength: 1 };
      }

      if (leftWrist.confidence > 0.5) {
        let mirroredX = width - leftWrist.x;
        let col = floor(mirroredX / cellSize);
        let row = floor(leftWrist.y / cellSize);
        let fluidIndex = col + row * numCols;
        fluid[fluidIndex] = { color: leftWristColor, strength: 1 };
      }

      if (rightWrist.confidence > 0.5) {
        let mirroredX = width - rightWrist.x;
        let col = floor(mirroredX / cellSize);
        let row = floor(rightWrist.y / cellSize);
        let fluidIndex = col + row * numCols;
        fluid[fluidIndex] = { color: rightWristColor, strength: 1 };
      }
    });
  }

  if (!isFrozen) {
    let newFluid = new Array(numCols * numRows).fill(0);
    for (let i = 1; i < numCols - 1; i++) {
      for (let j = 1; j < numRows - 1; j++) {
        let index = i + j * numCols;
        let sum = fluid[index].strength || 0;
        let r = fluid[index].color ? red(fluid[index].color) * fluid[index].strength : 0;
        let g = fluid[index].color ? green(fluid[index].color) * fluid[index].strength : 0;
        let b = fluid[index].color ? blue(fluid[index].color) * fluid[index].strength : 0;
        let count = fluid[index].color ? 1 : 0;

        // Check neighboring cells
        let neighbors = [
          fluid[index - 1],
          fluid[index + 1],
          fluid[index - numCols],
          fluid[index + numCols]
        ];

        neighbors.forEach(neighbor => {
          if (neighbor.color) {
            sum += neighbor.strength;
            r += red(neighbor.color) * neighbor.strength;
            g += green(neighbor.color) * neighbor.strength;
            b += blue(neighbor.color) * neighbor.strength;
            count++;
          }
        });

        if (count > 0) {
          newFluid[index] = {
            color: color(r / sum, g / sum, b / sum),
            strength: sum / count * 0.99
          };
        }
      }
    }
    fluid = newFluid;
  }
}

function drawFluid() {
  for (let i = 0; i < numCols; i++) {
    for (let j = 0; j < numRows; j++) {
      let index = i + j * numCols;
      let value = fluid[index];
      if (value.color) {
        fill(value.color);
        noStroke();
        rect(i * cellSize, j * cellSize, cellSize, cellSize);
      } else {
        fill(0);
        noStroke();
        rect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
  }
}

function getRandomColor() {
  let r = floor(random(255));
  let g = floor(random(255));
  let b = floor(random(255));
  return color(r, g, b);
}

function drawInstructions() {
  if (showInstructions) {
    textSize(16);
    textAlign(LEFT);
    fill(255);
    text("Commands:", 10, 30);
    text("Space: Toggle Drawing", 10, 50);
    text("C: Clear Canvas", 10, 70);
    text("S: Save Artwork", 10, 90);
    text("V: Toggle Camera", 10, 110);
    text("R: Randomize Colors", 10, 130);
    text("I: Toggle Instructions", 10, 150);
    text("F: Freeze/Unfreeze Fluid", 10, 170);
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
  drawInstructions();
}

function keyPressed() {
  if (key === ' ') {
    isDrawing = !isDrawing;
  } else if (key === 'c') {
    fluid = new Array(numCols * numRows).fill(0);
    faceColors = [];
  } else if (key === 's') {
    saveCanvas('fluid-artwork', 'png');
  } else if (key === 'v') {
    showCamera = !showCamera;
  } else if (key === 'r') {
    faceColors = [];
    leftWristColor = getRandomColor();
    rightWristColor = getRandomColor();
  } else if (key === 'i') {
    showInstructions = !showInstructions;
  } else if (key === 'f') {
    isFrozen = !isFrozen;
  }
}

function toggleDrawing() {
  isDrawing = !isDrawing;
}

function clearCanvas() {
  fluid = new Array(numCols * numRows).fill(0);
  faceColors = [];
}

function saveArtwork() {
  saveCanvas('fluid-artwork', 'png');
}

function toggleCamera() {
  showCamera = !showCamera;
}

function randomizeColors() {
  faceColors = [];
  leftWristColor = getRandomColor();
  rightWristColor = getRandomColor();
}

function toggleInstructions() {
  showInstructions = !showInstructions;
}

function toggleFreeze() {
  isFrozen = !isFrozen;
}
