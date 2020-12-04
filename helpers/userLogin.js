
module.exports = {
  userLogin: function(req, res, next){
    if(req.isAuthenticated()){
      return next()
    }
    req.flash("error", "Login necessário")
    res.redirect("/login")
  }
}