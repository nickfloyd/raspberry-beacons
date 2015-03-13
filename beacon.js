var http, gpio
var intervalInMills = 100000, setStatusBeacon, insightsRequest, query, fullPath;
var RED_PIN = 11, GREEN_PIN = 13, BLUE_PIN = 15;

gpio = require("pi-gpio");
http = require('http');

query = "?nrql=SELECT%20count(exception)%20FROM%20NewRelic_AzurePortal_APM_Requests%20WHERE%20application%20LIKE%20'NR-Stamp%25'%20AND%20exception%20IS%20NOT%20NULL%20SINCE%201%20day%20ago%20limit%2050";
fullPath = '/v1/accounts/429813/query' + query

insightsRequest = {
  host: 'staging-insights-api.newrelic.com',
  port: 80,
  path: fullPath,
  method: 'GET',
  headers: {
    'Accept:': 'application/json',
    'X-Query-Key': 'HrurPdQHISZ4ESs8iydk34u7tKHv1zXE'
  }
};

function closePinIfOpen(pin){

    	gpio.close(pin, function(err){
		if(err) console.log(pin + " cannot be  closed!")
	});
		
}

function clearPins(){
  try{
	closePinIfOpen(RED_PIN);
	closePinIfOpen(GREEN_PIN);
	closePinIfOpen(BLUE_PIN);
  }
  catch(err){
    console.log("pins are closed!")
  }
}



function writePin(pin){
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


setStatusBeacon = function() {
  console.log('Updating...');
  return http.get(insightsRequest, function(res){
    console.log("Status code from response: " + res.statusCode);
    
    var data, results;
    
    res.on('data', function (chunk) {
      if(chunk) {
        data += chunk;
      }
    });

    return res.on('end', function() {
      data = data.replace("undefined","")
      results = JSON.parse(data).results[0].count;
      
      clearPins();
      
      if(results > 0){
        writePin(RED_PIN);  
      }
      else{
        writePin(GREEN_PIN); 
      }
      console.log("Results: " + results);
    });

  }).on('error', function(e) {
      console.log("Got error: ", e);
      writePin(BLUE_PIN); 
});

};

setStatusBeacon();

setInterval(setStatusBeacon, intervalInMills);