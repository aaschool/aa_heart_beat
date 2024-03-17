llnet video;
let poseNet;
let pose;
let isDrawing = false;
let path = [];

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);

  background(255);
  strokeWeight(2);
}

function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    if (!isDrawing) {
      isDrawing = true;
    }
  } else {
    isDrawing = false;
  }
}

function modelLoaded() {
  console.log('PoseNet ready');
}

function draw() {
  background(255);

  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  if (pose && isDrawing) {
    let nose = pose.nose;
    let mirroredX = width - nose.x;
    path.push({ x: mirroredX, y: nose.y });

    beginShape();
    for (let i = 0; i < path.length; i++) {
      vertex(path[i].x, path[i].y);
    }
    endShape();
  }
}