const express = require('express')
const mongoose = require("mongoose")

require("../models/Candidato")
require("../models/Eleicao")
require("../models/Chapa")
require("../models/User")
require("../models/Eleitor")
require("../models/Voto")

const Candidato = mongoose.model("candidato")
const Eleicao = mongoose.model("eleicao")
const Chapa = mongoose.model("chapa")
const User = mongoose.model("user")
const Eleitor = mongoose.model("eleitor")
const Voto = mongoose.model("voto")
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

router.get('/rmg', (req, res) => {
        Eleicao.findOne({ local: "RMG"}).lean().populate("chapa").then((eleicao) =>{
         
        if (eleicao) {
                
                if (eleicao.status == 1){

                        var ids = []

                        for ( item in eleicao.chapa) {
                                ids.push({_id: eleicao.chapa[item]._id})
                        }
                        Chapa.find({_id:ids}).populate("candidatos").then((chapa) =>{

                                res.render("guest/votar", {layout: "basic", eleicao: eleicao, chapa: chapa})
                       
                        })

                }else if (eleicao.status == 2) {
                        res.render("guest/pausada", {layout: "basic", eleicao: eleicao})
                }else if (eleicao.status == 3) {
                        res.render("guest/indisponivel", {layout: "basic", eleicao: eleicao})
                }
        }else{
                res.render("guest/indisponivel", {layout: "basic", eleicao: eleicao})   
        }   
        
        })
        // res.json({ ok: "Teste"})
})

router.get('/adc', (req, res) => {
        Eleicao.findOne({ local: "ADC"}).lean().populate("chapa").then((eleicao) =>{
         
        if (eleicao) {
                
                if (eleicao.status == 1){

                        var ids = []

                        for ( item in eleicao.chapa) {
                                ids.push({_id: eleicao.chapa[item]._id})
                        }
                        Chapa.find({_id:ids}).populate("candidatos").then((chapa) =>{

                                res.render("guest/votar", {layout: "basic", eleicao: eleicao, chapa: chapa})
                       
                        })

                }else if (eleicao.status == 2) {
                        res.render("guest/pausada", {layout: "basic", eleicao: eleicao})
                }else if (eleicao.status == 3) {
                        res.render("guest/indisponivel", {layout: "basic", eleicao: eleicao})
                }
        }else{
                res.render("guest/indisponivel", {layout: "basic", eleicao: eleicao})   
        }   
        
        })
        // res.json({ ok: "Teste"})
})

router.post('/votar', async (req, res) => {
        await Eleitor.findOne({matricula:req.body[2]}).then((eleitor)=>{
                if(eleitor){
                        if(eleitor.local == req.body[4]){
                                if(eleitor.senha == req.body[3]){
                                        Eleicao.findOne({_id:req.body[1]}).then(async (eleicao) =>{
                                                Voto.findOne().and([{ eleitor: eleitor._id }, { eleicao: req.body[1] }]).then(async (voto) =>{
                                                        if(voto){
                                                                res.json({ erro: "votado"})    
                                                        }else{
                                                                
                                                                if(eleicao.status == 1){
                                                                        const novoVoto = {
                                                                                ip: req.ip,
                                                                                chapa: req.body[0],
                                                                                eleitor: eleitor._id,
                                                                                eleicao: req.body[1],
                                                                                local: req.body[4],
                                                                                valido: 1
                                                                        }
                                        
                                                                        await new Voto(novoVoto).save().then(() => {
                                                                                res.json({ ok: "valido"})
                                                                                console.log("Voto computado")
                                                                        }).catch((err) => {
                                                                                console.log("Erro ao Salvar no Banco (Voto)"+err)
                                                                        });
                                                                                                        
                                                                }

                                                        }

                                                })
                                        })
                                }else{
                                        res.json({ erro: "inexistente"})
                                } 
                        }else{
                                res.json({ erro: "localerro"})
                        }  
                }else{
                        res.json({ erro: "inexistente"})
                }  
        }).catch((err) =>{
                console.log("erro na validação de voto "+err) 
        })
        
        var ip = req.ip

        // res.json({ ok: "Teste"})
})

router.get("/cadastrar", (req, res) => {
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