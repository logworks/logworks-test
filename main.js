var request = require('request');

var maxLogSize = process.env.MAX_LOG_SIZE;
var apiUrl = process.env.API_URL+"/v1";


class API {
  constructor() {
    this.url = apiUrl;
  }
  createLog() {
    return new Promise((resolve, reject) => {
      request.post({url:this.url}, function(e, r, b) {
        if (e) reject(e);
        else resolve(JSON.parse(b));
      });
    });
  }
  showLog(logurl) {
    return new Promise((resolve, reject) => {
      request.get(this.url+"/"+logurl, (e, r, b) => {
        if (e) reject(e);
        else resolve(JSON.parse(b));
      });
    });
  }
  createEntry(logid, type, data) {
    return new Promise((resolve, reject) => {
      request.post({url: this.url+"/"+logid, form: {"type":type, "data":data}}, (e, r, b) => {
        if (e) reject(e);
        else resolve(JSON.parse(b));
      });
    });
  }
  editEntry(logid, entryid, type, data) {
   return new Promise((resolve, reject) => {
    request.put({url: this.url+"/"+logid+"/"+entryid, form: {"type":type, "data":data}}, (e, r, b) => {
      if (e) reject(e);
      else resolve(JSON.parse(b));
    });
   });
  }
  deleteEntry(logid, entryid) {
    return new Promise((resolve, reject) => {
      request.del(this.url+"/"+logid+"/"+entryid, (e, r, b) => {
        if (e) reject(e);
        else resolve(JSON.parse(b));
      });
    });
  }
}

class Entry {
  constructor(logid, entry) {
    this.api = new API();
    if (logid) this.logid = logid;
    if (entry) {
      this.id = entry.entryid;
      this.type = entry.type;
      this.data = entry.data;
    }
  }
  create(type, data) {
    return this.api.createEntry(this.logid, type, data).then(entry => {
      this.id = entry.entryid;
      this.type = entry.type;
      this.data = entry.data;
    });
  }
  edit(type, data) {
    return this.api.editEntry(this.logid, this.id, type, data).then(entry => {
      this.type = entry.type;
      this.data = entry.data;
    });
  }
  del() {
    return this.api.deleteEntry(this.logid, this.id)
  }
}

class Log {
  constructor(log) {
    this.api = new API();
    this.entries = [];
    if (log) {
      this.url = log.logurl;
      this.id = log.logid;
    }
  }
  create() {
    return this.api.createLog().then(log => {
      this.url = log.logurl;
      this.id = log.logid;
    });
  }
  show() {
    return this.api.showLog(this.url).then(entries => {
      this.entries = entries.map(e => new Entry(this.id,e));
    });
  }
  addEntry(type, data) {
    var entry = new Entry(this.id);
    return entry.create(type, data).then(entry => {
      this.entries.push(new Entry(this.id, entry));
    });
  }
}

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
        else resolve();
      });
    });
  });
}

var startTest = function () {
  var logsize = randomLogSize();
  var log = new Log();
  log.create().then(function() {
    testAddEntries(log, logsize)
      //.then(testEditEntries).then(testDeleteEntries)
    .then(function(log) {
      console.log("WORKS for log size: "+logsize+" (logid: "+log.id+", logurl: "+logurl+")");
    }, function(err) {
      console.log("FAILED for log size: "+logsize+" (logid: "+log.id+", logurl: "+logurl+")");
    });
  });
}

//setInterval(function(){startTest()}, 1000);
startTest();
