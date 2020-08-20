const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DiplomeSchema = new Schema ({
  diplome: {type: String},
  annediplome: {type: String}
});

module.exports = mongoose.model('diplome',DiplomeSchema);
