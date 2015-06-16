var API = require('logworks');
var apiUrl = process.env.API_URL+"/v1";
var LogWorks = new API(apiUrl);
var maxLogSize = process.env.MAX_LOG_SIZE;

var randomString = function() {
  var crypto = require('crypto')
  , shasum = crypto.createHash('sha1');
  shasum.update(Math.random().toString());
  return shasum.digest('hex');
}

var randomLogSize = function() {
  return getRandomInt(1, maxLogSize);
}

var getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

var testAddEntries = function(log, count) {
  return new Promise((resolve, reject) => {
    var entrydata = [];
    for (let i=0; i<count; i++) {
      entrydata.push(randomString());
    }
    //Add entries
    Promise.all(entrydata.map(d => LogWorks.entries.create(log.get('id'),{type:"text", data:d}))).then(function(r) {
      LogWorks.logs.show(log.get('id')).then(function(log) {
        //check entries & log
				log.get('entries').forEach(function(entry) {
          if (entrydata.indexOf(entry.get('data')) == -1) {
            console.log("Something missing?");
            reject();
					}
				});
				resolve(log);
      });
    });
  });
}

var testEditEntries = function(log) {
  return new Promise((resolve, reject) => {
    Promise.all(log.get('entries').map(e => LogWorks.entries.edit(log.get('id'),e.get('id'),{type:"text", data:"foo"}))).then(function() {
      LogWorks.logs.show(log.get('id')).then(function(log) {
				log.get('entries').forEach(function(entry) {
          if (entry.get('data') != "foo") {
            console.log("Somebody didn't get edited");
            reject();
          }
        });
        resolve(log);
      });
    });
  });
}

var testDeleteEntries = function(log) {
  return new Promise((resolve, reject) => {
    Promise.all(log.get('entries').map(e => LogWorks.entries.del(log.get('id'),e.get('id')))).then(function() {
      LogWorks.logs.show(log.get('id')).then(function(log) {
        if (log.get('entries').size != 0) {
          console.log("Somebody didn't get deleted");
          reject();
        }
        else resolve(log);
      });
    });
  });
}

var startTest = function () {
  var logsize = randomLogSize();
	LogWorks.logs.create().then(function(log) {
    testAddEntries(log, logsize).then(testEditEntries).then(testDeleteEntries).then(function(log) {
      console.log("WORKS for log size: "+logsize+" (logid: "+log.get('id')+")");
    }, function(err) {
      console.log("FAILED for log size: "+logsize+" (logid: "+log.get('id')+")");
    });
  });
}

setInterval(function(){startTest();}, 1000);
