var request = require('request');

module.exports = function(url) {
  this.url = url;
  this.logs = {};
  this.entries = {};

  this.logs.create = function() {
    return new Promise((resolve, reject) => {
      request.post({uri:this.url}, function(e, r, b) {
        console.log(b);
        console.log(e);
        console.log(r);
        if (e) reject(e);
        else resolve(JSON.parse(b));
      });
    });
  }
  this.logs.show = function(logid) {
    return new Promise((resolve, reject) => {
      request.get(this.url+"/"+logid, (e, r, b) => {
        if (e) reject(e);
        else resolve(JSON.parse(b));
      });
    });
  }

  this.entries.create = function(logid, entry) {
    var type = entry.type;
    var data = entry.data;
    return new Promise((resolve, reject) => {
      request.post({uri: this.url+"/"+logid, form: {"type":type, "data":data}}, (e, r, b) => {
        if (e) reject(e);
        else resolve(JSON.parse(b));
      });
    });
  }
  this.entries.edit = function(logid, entryid, entry) {
    var type = entry.type;
    var data = entry.data;
    return new Promise((resolve, reject) => {
      request.put({uri: this.url+"/"+logid+"/"+entryid, form: {"type":type, "data":data}}, (e, r, b) => {
        if (e) reject(e);
        else resolve(JSON.parse(b));
      });
    });
  }
  this.entries.del = function(logid, entryid) {
    return new Promise((resolve, reject) => {
      request.del(this.url+"/"+logid+"/"+entryid, (e, r, b) => {
        if (e) reject(e);
        else resolve(JSON.parse(b));
      });
    });
  }
}
