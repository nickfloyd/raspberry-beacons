var gpio = require("pi-gpio");
var RED_PIN = 11, GREEN_PIN = 13, BLUE_PIN = 15;

function closePinIfOpen(pin){
  gpio.close(pin, function(err){
  	if(err) console.log(pin + " cannot be  closed!")
  });
}

exports.clearPins = function(){
  try{
	closePinIfOpen(RED_PIN);
	closePinIfOpen(GREEN_PIN);
	closePinIfOpen(BLUE_PIN);
  }
  catch(err){
    console.log("pins are closed!")
  }
}



exports.writePin = function(pin){
  try{
    gpio.open(pin,"output", function(err){
      console.log("pin: " + pin)
      gpio.write(pin, 1, function(){
      });
    });
  }
  catch(err){
    console.log("failed to open pin: " + pin)
  }
}
