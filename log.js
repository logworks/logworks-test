var API = require('./new-api');
var Entry = require('./entry');

var apiUrl = process.env.API_URL+"/v1";
module.exports = Log;

class Log {
  constructor(log) {
    this.api = new API(apiUrl);
    this.entries = [];
    if (log) {
      this.id = log.id;
    }
  }
  create() {
    return this.api.logs.create().then(log => {
      this.id = log.id;
    });
  }
  show() {
    return this.api.logs.show(this.id).then(log => {
      this.entries = log.entries.map(e => new Entry(this.id,e));
    });
  }
  addEntry(type, data) {
    var entry = new Entry(this.id);
    return entry.create(type, data).then(entry => {
      this.entries.push(new Entry(this.id, entry));
    });
  }
}

