var express = require('express');
var router = express.Router();
var bcrypt = require("bcrypt")
var {checkAdmin} = require("../middleware/checkAdmin.js");
var jwt = require("jsonwebtoken");

var User = require("../models/user.js");

function createToken(user) {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, "sampapp", {
        expiresIn: 86400 // 86400 expires in 24 hours
      });
}

router.get("/", checkAdmin, function (req, res) {
  res.json({user: req.user});
});

router.get("/approve/:id", checkAdmin, function (req, res) {
  User.findByIdAndUpdate(req.params.id, {$set: {active: true}}, function (error, user) {
    if (error) res.status(500).json({error: error});
    else res.json({success_msg: "account activated"});
  });
});

module.exports = router;
