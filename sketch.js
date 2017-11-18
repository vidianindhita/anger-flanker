var serial; // variable to hold an instance of the serialport library
var portName = '/dev/cu.usbmodem1411'; // fill in your serial port name here

var videoCrack;
var playing = false;
var xPos = 0;
var yPos = 0;
var zPos = 0;

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
  //videoCrack.loop();
  videoCrack.pause();
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
  if (xPos > 0) {
  	videoCrack.play();
  	playing = true;
  } else {
  	videoCrack.pause();
  	playing = false;
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
   // console.log(data);
    var sensors = split(data, ",");
    console.log(sensors);
    xPos = int(sensors[0]);
    yPos = int(sensors[1]);
    zPos = int(sensors[2]);
    
    //circleSize = int(data);
  }
}

function serialError(err) {
  console.log('Something went wrong with the serial port. ' + err);
}

function portClose() {
  console.log('The serial port closed.');
}