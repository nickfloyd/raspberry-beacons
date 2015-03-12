var http, fs, gpio
var intervalInMills, setStatusBeacon, insightsRequest, query;
var RED_PIN = 11, GREEN_PIN = 13, BLUE_PIN = 15;

gpio = require("pi-gpio");
http = require('http');
fs = require('fs');

intervalInMills = 300000;
query = "SELECT%20exception%2C%20subscription%2C%20method%2C%20application%20FROM%20NewRelic_AzurePortal_APM_Requests%20WHERE%20application%20LIKE%20'NR-Stamp%25'%20AND%20exception%20IS%20NOT%20NULL%20SINCE%2024%20hours%20ago%20limit%2050";

insightsRequest = {
  host: 'https://staging-insights-api.newrelic.com',
  port: 80,
  path: '/v1/accounts/429813/query' + query,
  method: 'GET',
  headers: {
    'X-Query-Key': 'HrurPdQHISZ4ESs8iydk34u7tKHv1zXE',
  }
};

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
      });
    });
  }
  catch(err){
    console.log("failed to open pin: " + pin)
  }
}

setStatusBeacon = function() {
  console.log('Updating...');
  return http.get(insightsRequest, function(resp) {
    var data;
    data = [];

    resp.setEncoding('utf8');
    resp.on('data', function(chunk) {
      return data.push(chunk);
    });
    return resp.on('end', function() {
      var errors;

      clearPins();

      errors = JSON.parse(data);
      if(!errors){
        writePin(GREEN_PIN);  
      }
      else{
        writePin(RED_PIN); 
      }
      console.log("Errors found: " + errorsExist);
  
    });
  });
};

setStatusBeacon();

setInterval(setStatusBeacon, intervalInMills);