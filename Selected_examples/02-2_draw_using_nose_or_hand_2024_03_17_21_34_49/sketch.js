let video;
let poseNet;
let pose;
let isDrawing = false;
let path = [];
let trackingPart = 'nose';

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
    let trackingPoint;
    if (trackingPart === 'nose') {
      trackingPoint = pose.nose;
    } else if (trackingPart === 'leftHand') {
      trackingPoint = pose.leftWrist;
    } else if (trackingPart === 'rightHand') {
      trackingPoint = pose.rightWrist;
    }

    if (trackingPoint) {
      let mirroredX = width - trackingPoint.x;
      path.push({ x: mirroredX, y: trackingPoint.y });

      beginShape();
      for (let i = 0; i < path.length; i++) {
        vertex(path[i].x, path[i].y);
      }
      endShape();
    }
  }
}

function keyPressed() {
  if (key === 'n' || key === 'N') {
    trackingPart = 'nose';
    path = [];
    console.log('Tracking nose');
  } else if (key === 'l' || key === 'L') {
    trackingPart = 'leftHand';
    path = [];
    console.log('Tracking left hand');
  } else if (key === 'r' || key === 'R') {
    trackingPart = 'rightHand';
    path = [];
    console.log('Tracking right hand');
  }
}