var request = require('request');

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

module.exports = API;
