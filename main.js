var request = require('request');

var maxLogSize = process.env.MAX_LOG_SIZE;
var apiUrl = process.env.API_URL+"/v1";


class API {
  constructor() {
    this.url = apiUrl;
  }
  createLog() {
    return new Promise((resolve, reject) => {
      request.post(this.url, {}, (e, r, b) => {
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
      request.post(this.url+"/"+logid, {"type":type, "data":data}, (e, r, b) => {
        if (e) reject(e);
        else resolve(JSON.parse(b));
      });
    });
  }
  editEntry(logid, entryid, type, data) {
   return new Promise((resolve, reject) => {
    request.put(this.url+"/"+logid+"/"+entryid, {"type":type, "data":data}, (e, r, b) => {
      if (e) reject(e);
      else resolve(JSON.parse(b));
    });
   });
  }
  deleteEntry(logid, entryid) {
    return new Promise((resolve, reject) => {
      request.del(this.url+"/"+logid+"/"+entryid, {}, (e, r, b) => {
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
    if log {
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

var startTest = function () {
  var logSize = randomLogSize();
  var entrydata = [];
  for (let i=0; i<logSize; i++) {
    entrydata.push(randomString());
  }
  var log = new Log();
  log.create().then(function() {
    //Add entries
    Promise.all(entrydata.map(d => log.addEntry("text",d)).then(function(r) {
      log.show().then(function(r) {
        //check entries & log
        for (let i=0; i<log.entries.length; i++) {
          if (log.entries[i].data != entriesdata[i]) console.log("Some problem in order? Something missing?");
        }
      }).then(function(r) {
        //edit entries to all have same data
        Promise.all(log.entries.map(e => e.edit("text", "foo"))).then(function(r) {
          log.show().then(function(r) {
            //check if it worked & log
            for (let i=0; i<log.entries.length; i++) {
              if (log.entries[i].data != "foo") console.log("Somebody didn't get edited");
            }
          }).then(function(r) {
            //delete entries one by one
            Promise.all(log.entries.map(e => e.del())).then(function(r) {
              log.show().then(function(r) {
                //check if log is empty
                if (log.lentries.length != 0) console.log("Something didn't get deleted");
                else console.log("Works for log size: "+logsize);
              });
            });
          });
        });
      });
    });
  });
}

setInterval(function(){startTest()}, 1000);
