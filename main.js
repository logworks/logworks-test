var Entry = require('./entry');
var Log = require('./log');

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
    Promise.all(entrydata.map(d => log.addEntry("text",d))).then(function(r) {
      log.show().then(function(r) {
        //check entries & log
        for (let i=0; i<log.entries.length; i++) {
          if (entrydata.indexOf(log.entries[i].data) == -1) {
            console.log("Something missing?");
            reject();
          }
        }
        resolve(log);
      });
    });
  });
}

var testEditEntries = function(log) {
  return new Promise((resolve, reject) => {
    var type = "text";
    var data = "foo";
    Promise.all(log.entries.map(e => e.edit(type,data))).then(function() {
      log.show().then(function() {
        for (let i=0; i<log.entries.length; i++) {
          if (log.entries[i].data != data) {
            console.log("Somebody didn't get edited");
            reject();
          }
        }
        resolve(log);
      });
    });
  });
}

var testDeleteEntries = function(log) {
  return new Promise((resolve, reject) => {
    Promise.all(log.entries.map(e => e.del())).then(function() {
      log.show().then(function() {
        if (log.entries.length != 0) {
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
  var log = new Log();
  log.create().then(function() {
    testAddEntries(log, logsize).then(testEditEntries).then(testDeleteEntries).then(function(log) {
      console.log("WORKS for log size: "+logsize+" (logid: "+log.id+")");
    }, function(err) {
      console.log("FAILED for log size: "+logsize+" (logid: "+log.id+")");
    });
  });
}

setInterval(function(){startTest();}, 1000);
