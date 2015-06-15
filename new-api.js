var request = require('request');

module.exports = function(url) {
  this.url = url;
  this.logs = {};
  this.entries = {};

  this.logs.create = function() {
    console.log(this.url);
    return new Promise((resolve, reject) => {
      request.post({url:this.url}, function(e, r, b) {
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
      request.post({url: this.url+"/"+logid, form: {"type":type, "data":data}}, (e, r, b) => {
        if (e) reject(e);
        else resolve(JSON.parse(b));
      });
    });
  }
  this.entries.edit = function(logid, entryid, entry) {
    var type = entry.type;
    var data = entry.data;
    return new Promise((resolve, reject) => {
      request.put({url: this.url+"/"+logid+"/"+entryid, form: {"type":type, "data":data}}, (e, r, b) => {
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
