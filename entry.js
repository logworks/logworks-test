var API = require('logworks');
var apiUrl = process.env.API_URL+"/v1";

class Entry {
  constructor(logid, entry) {
    this.api = new API(apiUrl);
    if (logid) this.logid = logid;
    if (entry) {
      this.id = entry.id;
      this.type = entry.type;
      this.data = entry.data;
    }
  }
  create(type, data) {
    return this.api.entries.create(this.logid, {'type':type, 'data':data}).then(entry => {
      this.id = entry.id;
      this.type = entry.type;
      this.data = entry.data;
    });
  }
  edit(type, data) {
    return this.api.entries.edit(this.logid, this.id, {'type':type, 'data':data}).then(entry => {
      this.type = entry.type;
      this.data = entry.data;
    });
  }
  del() {
    return this.api.entries.del(this.logid, this.id)
  }
}

module.exports = Entry;
