const express = require('express')
const mongoose = require("mongoose")

require("../models/Candidato")
require("../models/Eleicao")
require("../models/Chapa")
require("../models/User")
require("../models/Eleitor")
require("../models/Voto")
require("../models/Result")

const Candidato = mongoose.model("candidato")
const Eleicao = mongoose.model("eleicao")
const Chapa = mongoose.model("chapa")
const User = mongoose.model("user")
const Eleitor = mongoose.model("eleitor")
const Voto = mongoose.model("voto")
const Resultado = mongoose.model("resultado")
const passport = require("passport")
const bcrypt = require("bcryptjs")

const { userLogin }= require("../helpers/userLogin")


const router = express.Router()

router.get('/', userLogin, (req, res) => {
        res.render("admin/index");
})

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
        Eleicao.find({status: 1}).sort({nome:1}).then((eleicao) =>{
                Resultado.find({status: 3}).then((resultado) =>{

                        res.render("guest/lista2", {layout: "basic", eleicao: eleicao, resultado: resultado});
                
                })
        })

        // res.json({ ok: "Teste"})
})

router.get('/resultado', (req, res) => {
        Resultado.find({status: 3}).then((resultado) =>{

                res.render("guest/resultado", {layout: "basic", resultado: resultado});

        })
        // res.json({ ok: "Teste"})
})

router.get('/votar/:_id', (req, res) => {
        Eleicao.findOne({ _id: req.params._id}).lean().populate("chapa").then((eleicao) =>{

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
                }else if (eleicao.status == 0 || eleicao.status == 3) {
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
                        // Traca de Local desativada
                        if((eleitor.local == req.body[4]) || (req.body[4] == "geral")){
                                if(eleitor.senha == req.body[3]){
                                // if((eleitor.matricula == req.body[3] && eleitor.situacao == "ativo") || (eleitor.nascimento == req.body[3] && eleitor.situacao == "aposentado")){
                                        Eleicao.findOne().and([{_id:req.body[1]}, {local: req.body[4]}]).then(async (eleicao) =>{
                                                if(eleicao){
                                                        Voto.findOne().and([{ eleitor: eleitor._id }, { eleicao: eleicao._id }]).then(async (voto) =>{
                                                                if(voto){
                                                                        res.json({ erro: "votado"})    
                                                                }else{
                                                                        if(eleicao.status == 1){
                                                                                if(req.body[0] == 2 || req.body[0] == 3){
                                                                                        const novoVoto = {
                                                                                                ip: req.ip,
                                                                                                chapa: null,
                                                                                                eleitor: eleitor._id,
                                                                                                eleicao: req.body[1],
                                                                                                local: req.body[4],
                                                                                                valido: req.body[0],
                                                                                                situcaoEleitor: eleitor._id
                                                                                        }

                                                                                        await new Voto(novoVoto).save().then(() => {
                                                                                                res.json({ ok: "valido"})
                                                                                                console.log("Voto Anulado/Branco")
                                                                                        }).catch((err) => {
                                                                                                console.log("Erro ao Salvar no Banco (Voto)"+err)
                                                                                        });
                                                                                        
                                                                                }else{
                                                                                        
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

                                                                }

                                                        })
                                                }else{
                                                        res.json({ erro: "localerro"})
                                                }
                                        })
                                }else{
                                        res.json({ erro: "inexistente"})
                        } 
                        }else{
                                res.json({ erro: "localerro"})
                        }  
                }else{
                        res.json({ erro: "ncadastrado"})

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
