var express = require('express');
var router = express.Router();
var bcrypt = require("bcrypt")
var {checkAuth} = require("../middleware/checkAuth.js");
var jwt = require("jsonwebtoken");

var User = require("../models/user.js");
var Diplome = require("../models/diplome.js");

function createToken(user) {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, "sampapp", {
        expiresIn: 86400 // 86400 expires in 24 hours
      });
}

/* GET users listing. */
router.get('/', checkAuth, function(req, res, next) {
  switch (req.user.role) {
    case "patient":
      res.redirect("/patient")
      break;
    case "medecin":
      res.redirect("/medecin");
      break;
    case "infirmier":
      res.redirect("/infirmier");
      break;
    case "labo":
      res.redirect("/labo");
      break;
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
      Diplome.create({
        diplome: req.body.diplome,
        annediplome: req.body.annediplome
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
          token: createToken(user)
        });
      } else {
        res.status(400).json({error_msg: "Mot de passe non valide"});
      }
    });
  }
});

module.exports = router;
