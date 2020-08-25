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
    res.status(400).json({error_msg: "Utilisateur déja authetifié"});
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

router.get('/reset/:token', function (req,res) {
  User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now() } }, function (error, user) {
    if (error) {
      res.status(500).json({error_msg: error});
    } else if (!user) {
      res.status(500).json({error_msg: "Utilisateur non trouvé"})
    } else {
      res.send({success_msg: "Valid token"})
    }
  });
});

router.post('/reset/:token', function (req,res) {
  if (req.isAuthenticated()) {
    res.json(400).json({error_msg: "Utilisateur déja authentifié"});
  } else {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (error, user) {
      if (error) {
        res.status(500).json({error_msg: error});
      } else if (!user) {
        res.status(500).json({error_msg: "Utilisateur non trouvé"})
      } else {
        if (req.body.password === req.body.confirm) {
          var hashedpass = bcrypt.hashSync(req.body.password, 10);
          User.findOneAndUpdate({_id: user._id}, {$set:{
            password: hashedpass,
            resetPasswordToken: undefined,
            resetPasswordExpires: undefined
          }}, {new: true}, function (error, user) {
            if (error) {
              res.status(500).json({error_msg: error});
            }
            req.login(user, function (err) {
              var mailOptions = {
                to: user.email,
                from: 'easytraveltechera@gmail.com',
                subject: 'Votre mot de passe est changé',
                text: "le mot de passe de votre compte "+user.email+" est changé"
              }
              transporter.sendMail(mailOptions, function (error, sent) {
                if (error) console.log("Error sending reset confirmation mail => "+error);
                else if (sent) console.log("Confirmation reset mail sent");
              });
            });
            res.json({success_msg: "Mot de passe est correctement changé"})
          });
        } else {
          res.status(500).json({error_msg: "confirmer votre mot de passe correctement"});
        }
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
