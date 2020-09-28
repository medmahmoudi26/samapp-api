var express = require('express');
var router = express.Router();
var bcrypt = require("bcrypt")
var jwt = require("jsonwebtoken");
var passport = require("passport")

var User = require("../models/user.js");
var Diplome = require("../models/diplome.js");

function createToken(user) {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, "sampapp", {
        expiresIn: 86400 // 86400 expires in 24 hours
      });
}

/* GET users listing. */
router.get('/', passport.authenticate("jwt", {session: false}), function(req, res, next) {
  switch (req.user.role) {
    case "patient":
      res.json({role : "/patient"});
    case "medecin":
      res.json({role : "medecin"});
    case "infirmier":
      res.json({role : "infirmier"});
    case "labo":
      res.json({role : "labo"})
    case "admin":
      res.json({role : "admin"})
    default:
      res.json({error: "Role inconnu"});
  }
});

router.post('/register', function (req, res) {
  var hashedPass = bcrypt.hashSync(req.body.password, 10);
  User.create({
    name: req.body.name,
    surname: req.body.surname,
    email: req.body.email,
    password: hashedPass,
    cin: req.body.cin,
    birthdate: req.body.birthdate,
    address: req.body.address,
    city: req.body.city,
    role: req.body.role,
    active: (req.body.role == "patient")
  }, function (error, user) {
    if (error) res.status(500).json({error: error});
    else {
      uploadpath = __dirname+'/../public/images/'+id+image.name
      image.mv(uploadpath, function (err) {
        if (err) console.log(err);
      });
      var t = new Date();
      Diplome.create({
        userId: req.user._id,
        diplome: req.body.diplome,
        annediplome: req.body.annediplome,
        filediplome: t.getTime()+req.files.diplome.name
      }, function (error, diplome) {
        if (error) res.json(500).json({error: error});
        else res.json({success_msg: "Compte crée"})
      });
    }
  });
});

router.post('/login', function (req, res) {
  if (!req.body.email || !req.body.password) {
    res.status(400).json({error_msg: "Vous devez taper votre email et mot de passe"});
  }
  else {
    User.findOne({email: req.body.email, active: true}, function (err, user) {
      if (err) {
        res.status(400).json({error_msg: err});
        console.log(err);
      }
      else if (!user) {
        res.status(400).json({error_msg: "Utilisateur n'existe pas"});
        console.log("User no exist");
      }

      else if (bcrypt.compareSync(req.body.password, user.password)) {
        res.status(200).json({
          token: createToken(user),
          user: user
        });
      } else {
        res.status(400).json({error_msg: "Mot de passe non valide"});
      }
    });
  }
});

router.post('updateuser', passport.authenticate("jwt", {session: false}), function (req, res) {
  User.findOneAndUpdate({_id: req.user._id}, {$set {
    name      : req.body.name,
    surname   : req.body.surname,
    cin       : req.body.cin,
    birthdate : req.body.birthdate,
    address   : req.body.address,
    city      : req.body.city,
    latitude  : req.body.latitude,
    longitude : req.body.longitude
  }}, {new: true}, function (error, user) {
    if (error) res.status(500).json({error_msg: error});
    eles {
      res.json(user)
    }
  })
})

router.post('/requestInfirmier', passport.authenticate("jwt", {session: false}), function (req, res) {
  User.find({role: "infirmier", connected: true}, function (error, infirmiers) { // long et lat
    if (error) res.status(500).json({error_message: error})
    else {
      res.json(infirmiers);
    }
  });
});

router.get('/status', passport.authenticate("jwt", {session: false}), function (req, res) {
  User.findOne({_id: req.user._id}, function (error, user) {
    if (error) res.status(500).json(error);
    else {
      if (user.conencted) {
        user.update({connected: false});
        res.json({success_msg: "status updated"})
      }
      else {
        user.update({connected: true});
        res.json({success_msg: "status updated"});
      }
    }
  })
})

module.exports = router;
