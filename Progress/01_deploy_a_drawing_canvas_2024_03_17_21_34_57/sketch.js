function setup() {
  createCanvas(400, 400);
  background(255);
  strokeWeight(2);
}

function draw() {
  if (mouseIsPressed) {
    line(mouseX, mouseY, pmouseX, pmouseY);
  }
}