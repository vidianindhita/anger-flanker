// Variables for serial connection
var serial; // variable to hold an instance of the serialport library
var portName = '/dev/cu.usbmodem1411'; // fill in your serial port name here

// Variable for array of videos
var stateVideo = 1;
var videos = [];
var indexVideo = 0;

// Variable for sensor inputs
var valueSensorTouchLeft = 0;
var valueSensorTouchRight = 0;
var valueSensorDistance = 0;

// Cloud Texts
var textbox = []; // array of Jitter objects
var x, y;
var paragraph;
var data;
let other = true;

// Mic Input
var mic;


// Preload function to load texts from JSON
function preload(){
  data = loadJSON("phrases.json"); 
}

// Setup function
// to setup serial communication, load video, load data, and setup mic input
function setup() {
  
  // Create canvas for p5js canvas
  createCanvas(displayWidth, displayHeight);

  // Initialize serial communication
  serial = new p5.SerialPort(); // make a new instance of the serialport library
  serial.on('list', printList); // set a callback function for the serialport list event
  serial.on('connected', serverConnected); // callback for connecting to the server
  serial.on('open', portOpen); // callback for the port opening
  serial.on('data', serialEvent); // callback for when new data arrives
  serial.on('error', serialError); // callback for errors
  serial.on('close', portClose); // callback for the port closing

  //serial.list(); // list the serial ports
  serial.open(portName); // open a serial port

  // Load video
  //videoCrack = createVideo("assets/video/Crack.mp4");
  for (var i = 0; i < 4; i++) {
    videos[i] = createVideo("assets/video/crack"+[i+1]+".mov");
    videos[i].hide();
  }

  //videoCrack.pause();

  // Load data from JSON
  textSize(28);
  data = data.phrases;
  // print(data);
  
  // Create objects for jittered textboxes
  for (var i = 0; i < 9; i++) {
    textbox.push( new Jitter(data[i])  );
  }

  // Initialize sound input
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

  background(255, 255, 255);

  //sensorsInput();
  //console.log(valueSensorTouchRight, valueSensorTouchLeft);

  sensorsInput();

  if (stateVideo === 1) {

  } else {
  	playTheVideo();
  }

  // Draw jittered textboxes
  
  drawJitteredText();

  // Draw "Shout Louder" Text
  push();
  shoutLouder();
  pop();

}

function playTheVideo() {

  //sensorsInput();
  
  image(videos[indexVideo],0,0,windowWidth,windowHeight);


  var isPlaying = videos[indexVideo].currentTime > 0 && !videos[indexVideo].paused && !video[indexVideo].ended 
    && video[indexVideo].readyState > 2;

    if (!isPlaying) {
      videos[indexVideo].play();
      videos[indexVideo].onended(videoOver); //when video ends, call videoOver to return to first screen
    }
}

function sensorsInput() {
  //console.log(valueSensorTouchLeft, valueSensorTouchRight, valueSensorDistance);
  //console.log(indexVideo);

    if (stateVideo === 1 && indexVideo < videos.length - 1) {


        if (valueSensorTouchLeft > 0 || valueSensorTouchRight > 0 || (valueSensorDistance < 40 && valueSensorDistance > 30)) {
        //accepted
        //pick random video from array
        // for (var i = 0; i <= videos.length; i++) {
        //  indexVideo += 1;
        // }

        // indexVideo = 0;

        // if (indexVideo < videos.length) {
        //  indexVideo = indexVideo+1;
        // }

        indexVideo = indexVideo+1; 
        console.log(indexVideo);
        console.log(videos.length);
        stateVideo = 2;
     } 

    }
}

function videoOver() {
    console.log("stopping video now"); 
    videos[indexVideo].stop();
    videos[indexVideo].hide();
    stateVideo = 1;
}

function shoutLouder() {
  micLevel = mic.getLevel();

  //console.log(micLevel);

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

function drawJitteredText() {
  for (var i = 0; i < textbox.length; i++) {
    textbox[i].move();
    textbox[i].display();
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
    //console.log(data);
    var sensors = split(data, ",");
    
    valueSensorTouchLeft = int(sensors[0]);
    valueSensorTouchRight = int(sensors[1]);
    valueSensorDistance = int(sensors[2]);
  }
}

function serialError(err) {
  console.log('Something went wrong with the serial port. ' + err);
}

function portClose() {
  console.log('The serial port closed.');
}