const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema ({
  name          : {type: String, required: true},
  surname       : {type: String, required: true},
  email         : {type: String, required: true, unique:true},
  password      : {type: String, required: true},
  cin           : {type: String, required: true},
  birthdate     : {type: String, required: true},
  address       : {type: String, required: true},
  city          : {type: String, required: true},
  role          : {type: String, required: true},
  active        : {type: Boolean, required: true},
  latitude      : Numbre,
  longitude     : Numbre,
  connected     : {type: Boolean, default: false},
  resetPasswordCode: String,
  resetPasswordExpires: Date
});

module.exports = mongoose.model('user',UserSchema);
