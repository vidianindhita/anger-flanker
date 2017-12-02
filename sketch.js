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
/*function preload(){
  data = loadJSON("phrases.json"); 
}*/

// Setup function
// to setup serial communication, load video, load data, and setup mic input
function setup() {
  
  // Create canvas for p5js canvas
  createCanvas(windowWidth, windowHeight);

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
  //videoCrack = createVideo("assets/video/crack1.mp4");
  for (var i = 0; i < 10; i++) {
 

    // videos[i] = document.getElementById("video"+String(indexVideo));
    videos[i] = createVideo("assets/video/crack"+[i]+".mp4");
    // videos[i].play();
    videos[i].hide();
    videos[i].id("video"+String(i));
    // videos[i].onended(videoOver);
    // document.getElementById("video"+String(indexVideo)).addEventListener('ended',videoOver,false);
  }

  // Load data from JSON
  textSize(28);
  loadJSON("phrases.json", dataLoaded); 
  //data = data.phrases;
  // print(data);
  

  // Initialize sound input
  mic = new p5.AudioIn()
  mic.start();

}

function dataLoaded(loadedData) {
  data = loadedData['phrases'];
  console.log(data);
  // Create objects for jittered textboxes
  for (var i = 0; i < 9; i++) {
    textbox.push( new Jitter(data[i])  );
  }
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

  background(0, 0, 0);

  //sensorsInput();
  //console.log(valueSensorTouchRight, valueSensorTouchLeft);

  sensorsInput();

  if (stateVideo === 1) {

  } else {
  	playTheVideo();
  }

  image(videos[indexVideo],0,0,windowWidth,windowHeight);

  // Draw jittered textboxes
  
  drawJitteredText();

  // Draw "Shout Louder" Text
  push();
  shoutLouder();
  pop();

}

let prevPlaying = -1;
function playTheVideo() {

  //sensorsInput();

  
  // image(videos[indexVideo],0,0,windowWidth,windowHeight);
  // console.log(videos[indexVideo]);
  let tempv = document.getElementById("video"+String(indexVideo)) ;
  // console.log(tempv.currentTime, tempv.paused, tempv.ended, tempv.readyState);
  var isPlaying = tempv.currentTime > 0 && !tempv.paused && !tempv.ended 
    && tempv.readyState > 2;
  
  console.log(indexVideo, isPlaying);

  // var isPlaying = videos[indexVideo].currentTime > 0 && !videos[indexVideo].paused && !video[indexVideo].ended 
  //   && video[indexVideo].readyState > 2;

    if (!isPlaying && indexVideo != prevPlaying) {
      videos[indexVideo].play();
      prevPlaying = indexVideo;
      stateVideo = 1;
    }

}

let lastMeasurement = 0;
function sensorsInput() {
  //console.log(valueSensorTouchLeft, valueSensorTouchRight);
  //console.log(indexVideo);
    if (stateVideo === 1 && indexVideo < videos.length - 1) {
        // console.log("checking sensor and old video stopped");


        if ((valueSensorTouchLeft > 0 || valueSensorTouchRight > 0) && lastMeasurement == 0) {
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
          lastMeasurement = 1;
       } else if(valueSensorTouchLeft <= 0 && valueSensorTouchRight <= 0) {
          lastMeasurement = 0;
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

  if (micLevel < 2 && micLevel > 0.5) {

    fill(255);
    textSize(75);
    text("SCREAM LOUDER!",width/4, constrain(height-micLevel*height*1, -0, height));
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

// function pushTextInterval() {
//   if(other && (frameCount % 120 == 0)){
//     sendTextUp();
//     other = false;
//   }else{
//     other = true;
//   }

//   clear();
// }

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
  //pushTextInterval();
  for (var i = 0; i < textbox.length; i++) {
    textbox[i].move();
    textbox[i].display();
  }
}


// Jitter class
class Jitter {
  constructor(phrase){

    this.x = random(100, width-100);
    //starting point
    this.y = height+40;
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
        this.y = height+50;
        this.available = true;
        
      }
    }
  }

  display() {
    //console.log(this.x, this.y, this.w);
    fill(255, 255, 255, 20);
    rect(this.x+20, this.y-20, this.w+100, this.h+20,20);
    fill(255,255,255);
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
    // valueSensorDistance = int(sensors[2]);
  }
}

function serialError(err) {
  console.log('Something went wrong with the serial port. ' + err);
}

function portClose() {
  console.log('The serial port closed.');
}
