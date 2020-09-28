const mongosoe = require('mongosoe');
var Schema = mongoose.Schema;

var LaboSchema = new Schema ({
  name: {type: String, required: true},
  address: {type: String, required: true},
  infirmiers: [String]
});

module.exports = mongoose.model('labo', LaboSchema);
