var API = require('logworks');
var baseApiUrl = process.env.API_URL || "https://logworksapi.herokuapp.com";
var apiUrl = baseApiUrl + "/v1";
var LogWorks = new API(apiUrl);
var maxLogSize = process.env.MAX_LOG_SIZE || 10;

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

var testCreateLog = function() {
  return new Promise((resolve, reject) => {
    var data = {};
    data.title = randomString();
    data.description = randomString();
    LogWorks.logs.create(data).then(function(log) {
      var savedData = log.get('data').toJS();
      if ((data.title !== savedData.title) || (savedData.description !== data.description)) {
        console.log("Title or description wasn't saved");
        reject();
      }
      resolve(log);
    });
  });
}

var testEditLog = function(log) {
  return new Promise((resolve, reject) => {
    var data = log.get('data').toJS();
    data.title = randomString();
    data.description = randomString();
    LogWorks.logs.edit(log.get('id'),data).then(function(r) {
      LogWorks.logs.show(log.get('url')).then(function(updatedLog) {
        var updatedData = updatedLog.get('data').toJS();
        if ((updatedData.title !== data.title) || (updatedData.description !== data.description)) {
          console.log("Title or description wasn't updated");
          reject();
        }
        resolve(log);
      });
    });
  });
}

var testAddEntries = function(log, count) {
  return new Promise((resolve, reject) => {
    var entrydata = [];
    for (let i=0; i<count; i++) {
      entrydata.push(randomString());
    }
    var promiseArr = entrydata.map(d => LogWorks.entries.create(log.get('id'),{type:"text", data:d}));
    Promise.all(promiseArr).then(res => {
      return LogWorks.logs.show(log.get('url'));
    }).then(log => {
      var promiseArr = log.get('entries').map(entryid => {
        return LogWorks.entries.show(log.get('id'), entryid).then(entry => {
          if (entrydata.indexOf(entry.get('data')) == -1) {
            console.log("Something missing?");
            reject();
          }
        });
      })
      return Promise.all(promiseArr).then(res => {
        resolve(log);
      });
    });
  });
}

var testEditEntries = function(log) {
  return new Promise((resolve, reject) => {
    var logid = log.get('id');
    var promiseArr = log.get('entries').map(entryid => LogWorks.entries.edit(logid, entryid, {type: 'text', data: 'foo'}));
    Promise.all(promiseArr).then(res => {
      return LogWorks.logs.show(log.get('url'));
    }).then(log => {
      var promiseArr = log.get('entries').map(entryid => {
        return LogWorks.entries.show(log.get('id'), entryid).then(entry => {
          if (entry.get('data') != "foo") {
            console.log("Somebody didn't get edited");
            reject();
          }
        });
      });
      return Promise.all(promiseArr).then(res => {
        resolve(log);
      });
    });
  })
}

var testDeleteEntries = function(log) {
  return new Promise((resolve, reject) => {
    var promiseArr = log.get('entries').map(entryid => LogWorks.entries.del(log.get('id'), entryid));
    Promise.all(promiseArr).then(res => {
      return LogWorks.logs.show(log.get('url'));
    }).then(log => {
      if (log.get('entries').size != 0) {
        console.log("Somebody didn't get deleted");
        reject();
      }
      else resolve(log);
    });
  });
}

var testDeleteLog = function(log) {
  return new Promise((resolve, reject) => {
    LogWorks.logs.del(log.get('id')).then(res => {
      return LogWorks.logs.show(log.get('url'));
    }).then(log => {
      console.log(log);
      console.log("Log didn't get deleted");
      reject();
    }).catch(err => {
      resolve(log);
    });
  });
}

var startTest = function () {
  var logsize = randomLogSize();
  testCreateLog().then(testEditLog).then(log => {
    return testAddEntries(log, logsize);
  }).then(testEditEntries).then(testDeleteEntries).then(testDeleteLog).then(log => {
    console.log("WORKS for log size: "+logsize+" (logid: "+log.get('id')+")");
  }).catch(err => {
    console.log("FAILED for log size: "+logsize+" (logid: "+log.get('id')+")");
  });
}

setInterval(function(){startTest();}, 1000);
