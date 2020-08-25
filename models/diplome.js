const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DiplomeSchema = new Schema ({
  diplome: {type: String, required: true},
  annediplome: {type: String, required: true},
  filediplome: {type: String, required: true}
});

module.exports = mongoose.model('diplome',DiplomeSchema);
