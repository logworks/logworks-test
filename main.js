let fetch = require('node-fetch');
let Promise = require('bluebird');
let API = require('logworks');
let baseApiUrl = process.env.API_URL || "https://2p0tufq4kg.execute-api.us-east-1.amazonaws.com";
let apiUrl = baseApiUrl + "/v1";
let LogWorks = new API(apiUrl, fetch, Promise);
let maxLogSize = process.env.MAX_LOG_SIZE || 10;

function randomString() {
  let crypto = require('crypto');
  let shasum = crypto.createHash('sha1');
  shasum.update(Math.random().toString());
  return shasum.digest('hex');
}

function randomLogSize() {
  return getRandomInt(1, maxLogSize);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function testCreateLog() {
  let data = {title: randomString(), description: randomString()};
  return LogWorks.logs.create(data).then((log) => {
    let savedData = log.get('data').toJS();
    if ((data.title !== savedData.title) || (savedData.description !== data.description)) {
      console.log("Title or description wasn't saved");
      Promise.reject();
    }
    return log;
  });
}

function testEditLog(log) {
  var data = log.get('data').toJS();
  data.title = randomString();
  data.description = randomString();
  return LogWorks.logs.edit(log.get('id'),data).then(() => {
    return LogWorks.logs.show(log.get('url'));
  }).then((updatedLog) => {
    let updatedData = updatedLog.get('data').toJS();
    if ((updatedData.title !== data.title) || (updatedData.description !== data.description)) {
      console.log("Title or description wasn't updated");
      Promise.reject();
    }
    return updatedLog;
  });
}

function testGenerateSignedURL(log) {
  return LogWorks.logs.generateSignedURL(log.get('id')).then((response) => {
    let resObj = response.toJS();
    if ((resObj.success !== 'true') || (!resObj.url)) {
      console.log("Couldn't generate signed url");
      Promise.reject();
    }
    else return log;
  });
}

function testAddEntries(log, count) {
  var entrydata = [];
  for (let i=0; i<count; i++) {
    entrydata.push(randomString());
  }
  let promiseArr = entrydata.map(d => LogWorks.entries.create(log.get('id'),{type:"text", data:d}));
  return Promise.all(promiseArr).then(() => {
    return LogWorks.logs.show(log.get('url'));
  }).then((log) => {
    let promiseArr = log.toJS().entries.map(entryid => LogWorks.entries.show(log.get('id'), entryid));
    return Promise.all(promiseArr).then((response) => {
      response.forEach((entry) => {
        if (entrydata.indexOf(entry.get('data')) === -1) {
          console.log("Something missing?");
          Promise.reject();
        }
      });
      return log;
    });
  });
}

function testEditEntries(log) {
  let logid = log.get('id');
  let promiseArr = log.toJS().entries.map(entryid => LogWorks.entries.edit(logid, entryid, {type: 'text', data: 'foo'}));
  return Promise.all(promiseArr).then(() => {
    return LogWorks.logs.show(log.get('url'));
  }).then((log) => {
    let promiseArr = log.toJS().entries.map(entryid => LogWorks.entries.show(log.get('id'), entryid));
    return Promise.all(promiseArr).then((response) => {
      response.forEach((entry) => {
        if (entry.get('data') != "foo") {
          console.log("Somebody didn't get edited");
          Promise.reject();
        }
      });
      return log;
    });
  })
}

function testDeleteEntries(log) {
  let promiseArr = log.toJS().entries.map(entryid => LogWorks.entries.del(log.get('id'), entryid));
  return Promise.all(promiseArr).then(() => {
    return LogWorks.logs.show(log.get('url'));
  }).then((log) => {
    if (log.get('entries').size != 0) {
      console.log("Somebody didn't get deleted");
      Promise.reject();
    }
    else return log;
  });
}

function testDeleteLog(log) {
  let logid = log.get('id');
  return LogWorks.logs.del(logid).then(() => {
    return LogWorks.logs.show(log.get('url'));
  }).then((log) => {
    if (log.get('id') === logid) {
      console.log("Log didn't get deleted");
      Promise.reject();
    }
    else return "success";
  }).catch(err => {
    return "success";
  });
}

function startTest() {
  var logid = '';
  let logsize = randomLogSize();
  testCreateLog().then((log) => {
    logid = log.get('id');
    return log;
  }).then(testEditLog).then(testGenerateSignedURL).then((log) => {
    return testAddEntries(log, logsize);
  }).then(testEditEntries).then(testDeleteEntries).then(testDeleteLog).then(() => {
    console.log("WORKS for log size: "+logsize+" (logid: "+logid+")");
  }).catch((err) => {
    console.log("FAILED for log size: "+logsize+" (logid: "+logid+") Error: "+err);
  });
}
setInterval(startTest, 1000);
