const express = require('express')
const mongoose = require("mongoose")

require("../models/Candidato")
require("../models/Eleicao")
require("../models/Chapa")
require("../models/User")

const Candidato = mongoose.model("candidato")
const Eleicao = mongoose.model("eleicao")
const Chapa = mongoose.model("chapa")
const User = mongoose.model("user")
const passport = require("passport")
const bcrypt = require("bcryptjs")

const { userLogin }= require("../helpers/userLogin")


const router = express.Router()


router.get('/login', (req, res) => {
        res.render("guest/login", {layout: "basic"});
        // res.json({ ok: "Teste"})
})

router.post("/login", (req, res, next) => {
        // Rota de Login
        passport.authenticate("local", {
                successRedirect: "/admin",
                failureRedirect: "/login",
                failureFlash: true

        })(req, res, next)
})

router.get('/votar', (req, res) => {
        Eleicao.find({status:0}).lean().populate("chapa").then((eleicao) =>{
                var ids = []

                for ( item in eleicao[0]["chapa"]) {
                        ids.push({_id: eleicao[0]["chapa"][item]['_id']})
                }

                Chapa.find({_id:ids}).populate("candidatos").then((chapa) =>{
                   res.render("guest/votar", {layout: "basic", eleicao: eleicao, chapa: chapa})
                })

        })
        // res.json({ ok: "Teste"})
})

router.post('/votar', (req, res) => {
        var ip = req.ip
        console.log(ip)
        console.log(req.body[3])
        res.json({ ok: "Teste"})
})




router.get("/cadastrar", (req, res) => {
        console.log("teste")
        const user = {
                nome: 'Talles Tayson',
                login: "ttayson",
                email: 'tallestayson@gmail.com',
                senha: '123456'
            }

            bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(user.senha, salt, (erro, hash) => {
                            if(erro){
                                    console.log("Erro ao salvar usuário")
                            }else{
                                
                                user.senha = hash
                                
                                new User(user).save().then(() => {
                                        console.log("Usuário Cadastrado")
                                        res.redirect("/login")
                                    }).catch((err) => {
                                        console.log("Erro ao Salvar no Banco (User)")
                                    });
                            }

                    })
            })
        

})

module.exports = router