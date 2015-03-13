var gpio = require("pi-gpio");
//REV2
var RED_PIN = 11, GREEN_PIN = 13, BLUE_PIN = 15;
//REV1
//var RED_PIN = 17, GREEN_PIN = 21, BLUE_PIN = 22;



function clearPins(){
	try{
		gpio.close(RED_PIN);
		gpio.close(GREEN_PIN);
		gpio.close(BLUE_PIN);
	}
	catch(err){
		console.log("pins are closed!")
	}
}

function writePin(pin){
	try{
		gpio.open(pin,"output", function(err){
			console.log("pin: " + pin)
			gpio.write(pin,1, function(){
				//gpio.close(pin)
			});
		});
	}
	catch(err){
		console.log("failed to open pin: " + pin)
	}
}

clearPins();

//writePin(RED_PIN);
//writePin(GREEN_PIN);
writePin(BLUE_PIN);
