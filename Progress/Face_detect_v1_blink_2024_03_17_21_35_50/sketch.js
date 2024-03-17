let video;
let faceApi;
let detections = [];

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  faceApi = ml5.faceApi(video, modelReady);
}

function modelReady() {
  console.log('Model Loaded');
  faceApi.detect(gotResults);
}

function gotResults(err, result) {
  if (err) {
    console.log(err);
    return;
  }
  detections = result;
  faceApi.detect(gotResults);
}

function draw() {
  background(255); // Set a white background or choose a random color for the background
  image(video, 0, 0, width, height);
  if (detections) {
    drawDetections(detections);
  }
}

function drawDetections(detections) {
  for (let i = 0; i < detections.length; i++) {
    const alignedRect = detections[i].alignedRect;
    const x = alignedRect._box._x;
    const y = alignedRect._box._y;
    const boxWidth = alignedRect._box._width;
    const boxHeight = alignedRect._box._height;
    
    // Generate two random high contrast colors
    const faceColor = color(random(255), random(255), random(255));
    const backgroundColor = color(random(255), random(255), random(255));
    
    // Set the face area to the faceColor
    fill(faceColor);
    noStroke();
    rect(x, y, boxWidth, boxHeight);
    
    // Create a gradient edge
    drawGradientEdge(x, y, boxWidth, boxHeight, faceColor, backgroundColor);
  }
}

function drawGradientEdge(x, y, boxWidth, boxHeight, faceColor, backgroundColor) {
  const gradientSteps = 10; // Number of steps in the gradient
  for (let i = 0; i < gradientSteps; i++) {
    let inter = map(i, 0, gradientSteps, 0, 1);
    let c = lerpColor(faceColor, backgroundColor, inter);
    noFill();
    stroke(c);
    strokeWeight(2);
    rect(x - i, y - i, boxWidth + i*2, boxHeight + i*2); // Gradually increase the size to create a gradient effect
  }
}
