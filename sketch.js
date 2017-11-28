// Variables for serial connection
var serial; // variable to hold an instance of the serialport library
var portName = '/dev/cu.usbmodem1411'; // fill in your serial port name here

// Variable for array of videos
var videoCrack = [];
var indexVideo = 0;

var playing = false;
var xPos = 0;
var yPos = 0;
var zPos = 0;

// Cloud Texts
var textbox = []; // array of Jitter objects
var x, y;
var paragraph;
var data;
let other = true;

// Mic Input
var mic;

// Count the video and touched variable when the sensor is touched
// let touched = false; 
// let vidCounter = 0;

// let playingVid = false;

function preload(){
  data = loadJSON("phrases.json"); 
}

function setup() {
  // put setup code here
  createCanvas(0,0);

  serial = new p5.SerialPort(); // make a new instance of the serialport library
  serial.on('list', printList); // set a callback function for the serialport list event
  serial.on('connected', serverConnected); // callback for connecting to the server
  serial.on('open', portOpen); // callback for the port opening
  serial.on('data', serialEvent); // callback for when new data arrives
  serial.on('error', serialError); // callback for errors
  serial.on('close', portClose); // callback for the port closing

  //serial.list(); // list the serial ports
  serial.open(portName); // open a serial port

  videoCrack = createVideo("assets/video/Crack.mp4");

  videoCrack.pause();

  textSize(28);
  data = data.phrases;
  // print(data);
  createCanvas(displayWidth, displayHeight);
  // Create objects
  for (var i = 0; i < 9; i++) {
    textbox.push( new Jitter(data[i])  );
  }

  mic = new p5.AudioIn()
  mic.start();

}

// get the list of ports:
function printList(portList) {
  // portList is an array of serial port names
  for (var i = 0; i < portList.length; i++) {
    // Display the list the console:
    console.log(i + " " + portList[i]);
  }
}

function draw() {
  // put drawing code here

  if (xPos > 0 || yPos > 0 || (zPos < 40 && zPos > 30)) {
  	videoCrack.play();
  	playing = true;
  } else {
  	videoCrack.pause();
  	playing = false;
  }

  background(255, 255, 255, 0);
  for (var i = 0; i < textbox.length; i++) {
    textbox[i].move();
    textbox[i].display();
  }

  push();
  shoutLouder();
  pop();

}

function shoutLouder() {
  micLevel = mic.getLevel();

  console.log(micLevel);

  if (micLevel < 1 && micLevel > 0.1) {

    fill(255);
    textSize(15);
    text("SHOUT LOUDER!",width/2, constrain(height-micLevel*height*1, -0, height));

  }
  
}

function mousePressed(){
  //interval between hits
  if(other){
    sendTextUp();
    other = false;
  }else{
    other = true;
  }

  clear();
}

function sendTextUp(){
  let availableText = [];
  for (var i = 0; i < textbox.length; i++) {
    if(textbox[i].available){
      availableText.push(i);
    }
  }
  if(availableText.length > 0){
    let ran = int(random(0, availableText.length));

    textbox[availableText[ran]].go();
  }
}


// Jitter class
class Jitter {
  constructor(phrase){
    this.x = random(100, width-150);
    //starting point
    this.y = height;
    this.phrase = phrase.phrase;
    //character size
    this.w = 10 * this.phrase.length ;
    this.h = 25;
    this.speed = 1;
    this.available = true;
  }

  move() {
    this.x += random(-this.speed, this.speed);
    this.y += random(-this.speed, this.speed);
    if(!this.available){
      this.y -= 2;
      if(this.y < 0){
        this.x = random(100, width-150);
        this.y = height;
        this.available = true;
        
      }
    }
  }

  display() {
    rect(this.x, this.y, this.w, this.h,20);
    text(this.phrase, this.x + this.w/4, this.y + this.h/2);
  }
  
  go(){
    this.available = false;   
  }
}

function serverConnected() {
  console.log('connected to server.');
}

function portOpen() {
  console.log('the serial port opened.')
}

function serialEvent() {
  var data = serial.readLine();

  if (data.length > 0) {
    console.log(data);
    var sensors = split(data, ",");
    
    xPos = int(sensors[0]);
    yPos = int(sensors[1]);
    zPos = int(sensors[2]);
    //console.log(touched, xPos, vidCounter);
    
    //circleSize = int(data);
  }
}

function serialError(err) {
  console.log('Something went wrong with the serial port. ' + err);
}

function portClose() {
  console.log('The serial port closed.');
}