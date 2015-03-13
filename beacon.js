var http, gpio, gu
var intervalInMills = 100000, setStatusBeacon, insightsRequest, query, fullPath;
var RED_PIN = 11, GREEN_PIN = 13, BLUE_PIN = 15;

gpio = require("pi-gpio");
http = require('http');
gu = require('./gpio_utils')

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
      
      gu.clearPins();
      
      if(results > 0){
        gu.writePin(RED_PIN);  
      }
      else{
        gu.writePin(GREEN_PIN); 
      }
      console.log("Results: " + results);
    });

  }).on('error', function(e) {
      console.log("Got error: ", e);
      gu.writePin(BLUE_PIN); 
});

};

setStatusBeacon();

setInterval(setStatusBeacon, intervalInMills);