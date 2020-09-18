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
          var code = createCode(6);
          user.update({
            $set:{
              resetPasswordCode: code,
              resetPasswordExpires: Date.now() + 360000 // 1 hour
            }
          }, function (error, saved) {
            if (error) {
              res.status(400).json({error: error});
            } else if (saved) {
              var mailOptions = {
                to: user.email,
                from: 'noreply@sampapp.com',
                subject: 'Password Reset Code',
                text: code
              }
              transporter.sendMail(mailOptions, function (err) {
                if (err) console.log('Reset mail failed => '+err);
                console.log('Reset email sent');
                res.json({success_msg: "Email envoyé"})
              });
            }
          });
      } else {
        res.status(400).json({error_msg: "utilisateur non trouvé"});
      }
    });
  }
});

router.post('/verifyCode', function (req, rse) {
  if (req.isAuthenticated()) {
    res.json(400).json({error_msg: "Utilisateur déja authentifié"})
  } else {
    User.findOne({resetPasswordCode: req.body.code, resetPasswordExpires: { $gt: Date.now() }}, function (error, user) {
      if (error) console.log(error);
      else if (user){
        res.status(200).json({user: user});
      }
      else {
        res.status(403).json({error_msg: "Utlisateur n'existe pas"});
      }
    });
  }
});

router.post('/reset', function (req,res) {
  if (req.isAuthenticated()) {
    res.json(400).json({error_msg: "Utilisateur déja authentifié"});
  } else {
    User.findOne({ resetPasswordCode: req.body.code, resetPasswordExpires: { $gt: Date.now() } }, function (error, user) {
      if (error) {
        res.status(500).json({error_msg: error});
      } else if (!user) {
        res.status(500).json({error_msg: "Utilisateur non trouvé"})
      } else {
        if (req.body.password === req.body.confirm) {
          var hashedpass = bcrypt.hashSync(req.body.password, 10);
          User.findOneAndUpdate({_id: user._id}, {$set:{
            password: hashedpass,
            resetPasswordCode: undefined,
            resetPasswordExpires: undefined
          }}, {new: true}, function (error, user) {
            if (error) {
              res.status(500).json({error_msg: error});
            }
            req.login(user, function (err) {
              var mailOptions = {
                to: user.email,
                from: 'noreply@sampapp.com',
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

function createCode(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

var transporter = nodemailer.createTransport({
  host: 'server33.web-hosting.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: 'noreply@sampapp.com',
    pass: '^[m&-wh!qcD?'
  }
});

module.exports = router;
