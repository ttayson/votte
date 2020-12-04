const localstrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

require("../models/User")

const Usuario = mongoose.model("user")

module.exports = function(passport){

  passport.use(new localstrategy({usernameField: "login"}, (login, password, done) => {

    Usuario.findOne({login: login}).then((usuario) => {
      
      if(!usuario){
        return done(null, false, {message: "Essa conta não existe"})
      }
      bcrypt.compare(password, usuario.senha, (erro, batem) =>{
        if(batem){
          return done(null, usuario)
        }else{
          return done(null, false, {message: "Senha incorreta"})
        }
      })
    }).catch((err) => {
      
    });

  }))

passport.serializeUser((usuario, done) =>{
  done(null, usuario.id)
})
passport.deserializeUser((id, done) =>{
  Usuario.findById(id, (err, user) => {
    done(err, user)
  })
})

}
