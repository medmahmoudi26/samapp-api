var express = require('express');
var router = express.Router();
var crypto = require("crypto");
var nodemailer = require("nodemailer");

var User = require("../models/user.js");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post("/forgot", function (req,res) {
  if (req.isAuthenticated()) {
    req.flash("error_msg", "vous etes déja connecté");
    res.redirect("/user/profile");
  } else {
    User.findOne({email: req.body.email}, function (err, user) {
      if (err) {
        res.status(400).json({error: err});
      } else if (user) {
        crypto.randomBytes(20, function (err, buf) {
          var token = buf.toString('hex');
          user.update({
            $set:{
              resetPasswordToken: token,
              resetPasswordExpires: Date.now() + 360000 // 1 hour
            }
          }, function (error, saved) {
            if (error) {
              res.status(400).json({error: error});
            } else if (saved) {
              var mailOptions = {
                to: user.email,
                from: 'easytraveltechera@gmail.com',
                subject: 'Password Reset',
                text: 'http://'+req.headers.host+'/user/reset/'+token+'\n\n'
              }
              transporter.sendMail(mailOptions, function (err) {
                if (err) console.log('Reset mail failed => '+err);
                console.log('Reset email sent');
                res.json({success_msg: "Email envoyé"})
              });
            }
          });
        });
      } else {
        res.status(400).json({error_msg: "utilisateur non trouvé"});
      }
    });
  }
});

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '',
    pass: ''
  }
});

module.exports = router;
