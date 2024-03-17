let video;
let faceApi;
let detections = [];
let faceColors = [];
let backgroundColor, targetBackgroundColor;
let lerpAmt = 0; // Amount to interpolate between colors

function setup() {
  createCanvas(600, 400);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide(); // Hide the video element
  faceApi = ml5.faceApi(video, { withLandmarks: true, withDescriptors: false }, modelReady);
  backgroundColor = color(random(255), random(255), random(255));
  targetBackgroundColor = color(random(255), random(255), random(255));
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
  if (faceColors.length !== detections.length) {
    faceColors = detections.map(() => color(random(255), random(255), random(255), 150)); // Semi-transparent for blending
  }
  faceApi.detect(gotResults);
}

function draw() {
  push(); // Save the current drawing state
  translate(width, 0); // Move the origin to the right side of the canvas
  scale(-1, 1); // Flip the canvas horizontally

  // Smoothly transition the background color
  if (lerpAmt < 1) {
    lerpAmt += 0.01; // Adjust the speed of color transition here
  } else {
    lerpAmt = 0;
    backgroundColor = targetBackgroundColor;
    targetBackgroundColor = color(random(255), random(255), random(255));
  }
  background(lerpColor(backgroundColor, targetBackgroundColor, lerpAmt));
  
  if (detections && detections.length > 0) {
    drawDetectionsMirrored(detections);
  }

  pop(); // Restore the original drawing state
}

function drawDetectionsMirrored(detections) {
  for (let i = 0; i < detections.length; i++) {
    const alignedRect = detections[i].alignedRect;
    // Adjust for mirroring: Flip the x-coordinate around the center of the canvas
    const x = width - (alignedRect._box._x + alignedRect._box._width);
    const y = alignedRect._box._y;
    const boxWidth = alignedRect._box._width;
    const boxHeight = alignedRect._box._height;
    
    // Draw rectangles around detected faces with assigned colors
    fill(faceColors[i]);
    noStroke();
    rect(x, y, boxWidth, boxHeight);
  }
}