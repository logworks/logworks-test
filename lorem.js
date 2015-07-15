var loremIpsum = require('lorem-ipsum')
var API = require('logworks');
var logID = process.env.LOG_ID || "tRRN0f7jtJlC";
var baseApiUrl = process.env.API_URL || "https://logworksapi.herokuapp.com";
var apiUrl = baseApiUrl + "/v1";
var LogWorks = new API(apiUrl);
var maxLogSize = process.env.MAX_LOG_SIZE || 10;

var units = ['words', 'sentences', 'paragraphs'];

var randomString = function() {
  return loremIpsum({
    count: getRandomInt(1, 7),
    units: units[getRandomInt(0,3)],
    sentenceLowerBound: 5,
    sentenceUpperBound: 15,
    paragraphLowerBound: 3,
    paragraphUpperBound: 7,
    format: 'plain'
  });
}

var getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

var addEntry = function(data) {
  LogWorks.entries.create(logID, {type:"text", data:data});
}

var startTest = function () {
  var logSize = getRandomInt(1, maxLogSize);
  var entryData = [];
  for (let i=0; i < logSize; i++) {
    console.log("Added entry: "+i);
    addEntry(randomString());
  }
  console.log("Added "+logSize+" entries to "+logID);
}

startTest();
