var User        = require('../models/user');
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt  = require('passport-jwt').ExtractJwt;

var opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: "sampapp"
}

module.exports = new JwtStrategy(opts, function (jwt_payload, done) {
    User.findById(jwt_payload.id, function (err, user) {
        if (err) {
            console.log(err);
            return done(err, false);
        }
        if (user) {
            console.log(user);
            return done(null, user);
        } else {
            console.log("Error",user);
            return done(null, false);
        }
    });
});
