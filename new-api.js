var request = require('request');

module.exports = function(apiUrl) {
  this.logs = {};
  this.entries = {};

  this.logs.create = function() {
    return new Promise((resolve, reject) => {
      console.log(apiUrl);
      request.post({url:apiUrl}, function(e, r, b) {
        if (e) reject(e);
        else resolve(JSON.parse(b));
      });
    });
  }
  this.logs.show = function(logid) {
    return new Promise((resolve, reject) => {
      request.get(apiUrl+"/"+logid, (e, r, b) => {
        if (e) reject(e);
        else resolve(JSON.parse(b));
      });
    });
  }

  this.entries.create = function(logid, entry) {
    var type = entry.type;
    var data = entry.data;
    return new Promise((resolve, reject) => {
      request.post({url: apiUrl+"/"+logid, form: {"type":type, "data":data}}, (e, r, b) => {
        if (e) reject(e);
        else resolve(JSON.parse(b));
      });
    });
  }
  this.entries.edit = function(logid, entryid, entry) {
    var type = entry.type;
    var data = entry.data;
    return new Promise((resolve, reject) => {
      request.put({url: apiUrl+"/"+logid+"/"+entryid, form: {"type":type, "data":data}}, (e, r, b) => {
        if (e) reject(e);
        else resolve(JSON.parse(b));
      });
    });
  }
  this.entries.del = function(logid, entryid) {
    return new Promise((resolve, reject) => {
      request.del(apiUrl+"/"+logid+"/"+entryid, (e, r, b) => {
        if (e) reject(e);
        else resolve(JSON.parse(b));
      });
    });
  }
}
