let fetch = require('node-fetch');
let base64url = require('base64-url');
let Promise = require('bluebird');
let API = require('logworks');
let baseApiUrl = process.env.API_URL || "https://2p0tufq4kg.execute-api.us-east-1.amazonaws.com";
let apiUrl = baseApiUrl + "/v1";
let LogWorks = new API(apiUrl, fetch, Promise);
let maxLogSize = process.env.MAX_LOG_SIZE || 10;

function randomString() {
  let randomb64string = crypto.randomBytes(6).toString('base64');
  return base64url.escape(randomb64string);
}

function randomLogSize() {
  return getRandomInt(1, maxLogSize);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function testGetToken(label) {
  return LogWorks.generateToken(label).then((token) => {
    if (!token.id || !token.secret) {
      console.log("Token wasn't generated");
      Promise.reject();
    }
    return token;
  });
}

function testCreateLog(label, token) {
  let data = {title: randomString(), description: randomString()};
  return LogWorks.logs.create(label, token, data).then((log) => {
    let savedData = log.get('data').toJS();
    if ((data.title !== savedData.title) || (savedData.description !== data.description)) {
      console.log("Title or description wasn't saved");
      Promise.reject();
    }
    return log;
  });
}

function testEditLog(label, token, log) {
  var data = log.get('data').toJS();
  data.title = randomString();
  data.description = randomString();
  return LogWorks.logs.edit(label, token, log.get('id'),data).then(() => {
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

function testGenerateSignedURL(label, token, log) {
  return LogWorks.logs.generateSignedURL(label, token, log.get('id')).then((response) => {
    let resObj = response.toJS();
    if ((resObj.success !== 'true') || (!resObj.url)) {
      console.log("Couldn't generate signed url");
      Promise.reject();
    }
    else return log;
  });
}

function testAddEntries(label, token, log, count) {
  var entrydata = [];
  for (let i=0; i<count; i++) {
    entrydata.push(randomString());
  }
  let promiseArr = entrydata.map(d => LogWorks.entries.create(label, token, log.get('id'),{type:"text", data:d}));
  return Promise.all(promiseArr).then(() => {
    return LogWorks.logs.show(log.get('url'));
  }).then((log) => {
    let promiseArr = log.toJS().entries.map(key => LogWorks.entries.show(log.get('id'), key));
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

function testEditEntries(label, token, log) {
  let logid = log.get('id');
  let entry = {type: 'text', data: 'foo'};
  let ids = log.toJS().entries.map(key => key.split('?')[0]);
  let promiseArr = ids.map(entryid => LogWorks.entries.edit(label, token, logid, entryid, entry));
  return Promise.all(promiseArr).then(() => {
    return LogWorks.logs.show(log.get('url'));
  }).then((log) => {
    let promiseArr = log.toJS().entries.map(key => LogWorks.entries.show(log.get('id'), key));
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

function testDeleteEntries(label, token, log) {
  let ids = log.toJS().entries.map(key => key.split('?')[0]);
  let promiseArr = ids.map(entryid => LogWorks.entries.del(label, token, log.get('id'), entryid));
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

function testDeleteLog(label, token, log) {
  let logid = log.get('id');
  return LogWorks.logs.del(label, token, logid).then(() => {
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
  var token = '';
  let logsize = randomLogSize();
  let label = randomString();
  testGenerateToken(label).then((t) => {
    token = t;
    return testCreateLog(label, token);
  }).then((log) => {
    logid = log.get('id');
    return testEditLog(label, token, log);
  }).then(log => testGenerateSignedURL(label, token, log)
    .then(log => testAddEntries(label, token, log, logsize))
    .then(log => testEditEntries(label, token, log))
    .then(log => testDeleteEntries(label, token, log))
    .then(log => testDeleteLog(label, token, log)).then(() => {
      console.log("WORKS for log size: "+logsize+" (logid: "+logid+")");
    }).catch((err) => {
      console.log("FAILED for log size: "+logsize+" (logid: "+logid+") Error: "+err);
    });
}
setInterval(startTest, 1000);
