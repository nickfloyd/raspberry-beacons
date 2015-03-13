var http, gu, setStatusBeacon
http = require('http');
gu = require('./gpio_utils')

// node beacon.js HrurPdQHISZ4ESs8iydk34u7tKHv1zXU 429813 staging-insights-api.newrelic.com
var insightsApiKey = !process.argv[2] ? throw ({'error':'Please supply an New Relic Insights query key'}) : process.argv[2]; //ex.HrurPdQHISZ4ESs8iydk34u7tKHv1zXU
var newrelicAccountId = !process.argv[3] ? throw ({'error':'Please supply an New Relic account Id'}) : process.argv[3]; //ex.429813
var insightsHost = !process.argv[4] ? "insights-api.newrelic.com" : process.argv[4]; //ex.staging-insights-api.newrelic.com

//RGB pins for a rev 2 raspberry pi (rev 1 are RED_PIN = 17, GREEN_PIN = 27, BLUE_PIN = 22;)
var RED_PIN = 11, GREEN_PIN = 13, BLUE_PIN = 15;

//Service polling ineterval in Milliseconds
var intervalInMills = 100000;
//NRQL query URL encoded from https://insights.newrelic.com/accounts/[Your_Account]/manage/api_keys
var query = "SELECT%20count(exception)%20FROM%20NewRelic_AzurePortal_APM_Requests%20WHERE%20application%20LIKE%20'NR-Stamp%25'%20AND%20exception%20IS%20NOT%20NULL%20SINCE%201%20day%20ago%20limit%2050";
var fullPath = "/v1/accounts/" + newrelicAccountId + "/query?nrql=" + query

var insightsRequest = {
  host: '' + insightsHost + '',
  port: 80,
  path: fullPath,
  method: 'GET',
  headers: {
    'Accept:': 'application/json',
    'X-Query-Key': '' + insightsApiKey + ''
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
      //TODO: determine why undefined is in the data stream
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
      console.log("error: ", e);
      gu.writePin(BLUE_PIN); 
});

};

setStatusBeacon();

setInterval(setStatusBeacon, intervalInMills);