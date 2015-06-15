var request = require('request');

var API = function(url) {
  this.url = url;
}
API.logs = {};
API.logs.create = function() {
  return new Promise((resolve, reject) => {
    request.post({url:this.url}, function(e, r, b) {
      if (e) reject(e);
      else resolve(JSON.parse(b));
    });
  });
}
API.logs.show = function(logid) {
  return new Promise((resolve, reject) => {
    request.get(this.url+"/"+logid, (e, r, b) => {
      if (e) reject(e);
      else resolve(JSON.parse(b));
    });
  });
}
API.entries = {};
API.entries.create = function(logid, entry) {
  var type = entry.type;
  var data = entry.data;
  return new Promise((resolve, reject) => {
    request.post({url: this.url+"/"+logid, form: {"type":type, "data":data}}, (e, r, b) => {
      if (e) reject(e);
      else resolve(JSON.parse(b));
    });
  });
}
API.entries.edit = function(logid, entryid, entry) {
  var type = entry.type;
  var data = entry.data;
  return new Promise((resolve, reject) => {
    request.put({url: this.url+"/"+logid+"/"+entryid, form: {"type":type, "data":data}}, (e, r, b) => {
      if (e) reject(e);
      else resolve(JSON.parse(b));
    });
  });
}
API.entries.del = function(logid, entryid) {
  return new Promise((resolve, reject) => {
    request.del(this.url+"/"+logid+"/"+entryid, (e, r, b) => {
      if (e) reject(e);
      else resolve(JSON.parse(b));
    });
  });
}

module.exports = API;
