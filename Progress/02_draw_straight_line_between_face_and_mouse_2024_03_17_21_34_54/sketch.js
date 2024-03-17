let video;
let poseNet;
let pose;

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
  }
}

function modelLoaded() {
  console.log('poseNet ready');
}

function draw() {
  image(video, 0, 0, width, height);

  if (pose) {
    let nose = pose.nose;
    let d = dist(nose.x, nose.y, pmouseX, pmouseY);
    if (d > 30) {
      line(nose.x, nose.y, pmouseX, pmouseY);
    }
    pmouseX = nose.x;
    pmouseY = nose.y;
  }
}