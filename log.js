var API = require('./api');
var Entry = require('./entry');

class Log {
  constructor(log) {
    this.api = new API();
    this.entries = [];
    if (log) {
      this.id = log.id;
    }
  }
  create() {
    return this.api.createLog().then(log => {
      this.id = log.id;
    });
  }
  show() {
    return this.api.showLog(this.id).then(log => {
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

module.exports = Log;
