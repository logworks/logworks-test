var API = require('./api');

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

module.exports = Entry;
