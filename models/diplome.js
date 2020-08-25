const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DiplomeSchema = new Schema ({
  userId  : {type: String, required: true},
  diplome: {type: String, required: true},
  annediplome: {type: String, required: true},
  filediplome: {type: String, required: true}
});

module.exports = mongoose.model('diplome',DiplomeSchema);
