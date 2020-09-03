var express = require('express');
var router = express.Router();
var bcrypt = require("bcrypt")
var {checkAdmin} = require("../middleware/checkAdmin.js");
var jwt = require("jsonwebtoken");
var nodemailer = require("nodemailer");

var User = require("../models/user.js");

function createToken(user) {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, "sampapp", {
        expiresIn: 86400 // 86400 expires in 24 hours
      });
}

router.get("/", passport.authenticate("jwt", {session: false}), checkAdmin, function (req, res) {
  User.find({active: false}, function (error, non_active) {
    if (error) res.status(500).json({error_msg: error});
    else res.json({user: req.user, non_active: non_active});
  })
});

router.get("/approve/:id", passport.authenticate("jwt", {session: false}), checkAdmin, function (req, res) {
  User.findByIdAndUpdate(req.params.id, {$set: {active: true}}, function (error, user) {
    if (error) res.status(500).json({error: error});
    else {
      var mailOptions = {
        to: user.email,
        from: 'noreply@sampapp.com',
        subject: 'Compte activé',
        text: "Votre demande est approuvée"
      }
      transporter.sendMail(mailOptions, function (err) {
        if (err) console.log('Reset mail failed => '+err)
        console.log('Reset email sent');
        res.json({success_msg: "Email envoyé"})
      });
    }
  });
});

router.get("/refuse/:id", passport.authenticate("jwt", {session: false}), checkAdmin, function (req, res) {
  User.findOne({_id: req.params.id, active: false}, function (error, user) {
    if (error) res.status(500).json({error: error});
    else {
      user.remove(function (error) {
        if (error) res.json(500).json({error_msg: error});
        else res.json({success_msg: "account deleted"});
      });
    }
  });
});

var transporter = nodemailer.createTransport({
  service: 'sampapp',
  auth: {
    user: 'noreply',
    pass: '^[m&-wh!qcD?'
  }
});

module.exports = router;
