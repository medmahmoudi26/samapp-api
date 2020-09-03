module.exports = {
  checkAuth: function (req,res,next) {
    if (req.user.active && req.user.role == "admin") {
      return next()
    } else {
      res.status(403).json({error_msg: "You are not logged in"});
    }
  }
}
