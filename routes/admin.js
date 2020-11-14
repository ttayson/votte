const express = require('express')
const mongoose = require("mongoose")

require("../models/Candidato")
require("../models/Eleicao")

const Candidato =mongoose.model("candidato")

const Eleicao =mongoose.model("eleicao")



const router = express.Router()


router.get('/', (req, res) => {
    res.render("admin/index")
})

router.get('/emandamento', (req, res) => {
    res.render("admin/emandamento")
})

router.get('/calendar', (req, res) => {
    res.render("admin/calendar")
})

router.get('/calendar', (req, res) => {
    res.render("admin/calendar")
})

router.get('/finalizadas', (req, res) => {
    res.render("admin/finalizadas")
})

router.get('/eleicao', (req, res) => {
    Eleicao.find().populate("candidatos").then((eleicao) =>{
        res.render("admin/eleicao", {eleicao: eleicao})
    })
    
})

router.get('/eleicao/edit/:id', (req, res) => {
    Eleicao.findOne({_id:req.params.id}).populate("candidatos").then((eleicao) =>{
        Candidato.find().then((candidato) => {
        res.render("admin/editeleicao", {eleicao: eleicao, candidato: candidato})
    })

    }).catch((err)=>{
        console.log("Erro ao procurar eleição")
    })
    
            
})

router.post('/eleicao/edit/del/', (req, res) => {
    Eleicao.remove({_id:req.body.id}).then(() =>{
        res.redirect("/admin/eleicao")
        console.log("Eleição removida")
    }).catch((err)=>{
        console.log("Erro ao procurar eleição")
    })
    
            
})


router.post('/eleicao/edit/', (req, res) => {
    Eleicao.findOne({_id:req.body.id}).then((eleicao) =>{
        Candidato.find().then((candidato) => {

        var erros = []

        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            erros.push({text: "Nome para eleição inválido"})
        }

        if(!req.body.cargo || typeof req.body.cargo == undefined || req.body.cargo == null){
            erros.push({text: "Nome para o cargo inválido"})
        }

        if(!req.body.candidatos || typeof req.body.candidatos == undefined || req.body.candidatos == null){
            erros.push({text: "Selecione pelo menos um candidato"})
        }
        
        if(erros.length > 0){
            res.render("admin/editeleicao", {erros: erros, eleicao: eleicao, candidato: candidato})

        }else{

            console.log(eleicao)


                eleicao.nome = req.body.nome
                eleicao.cargo = req.body.cargo
                eleicao.descricao = req.body.descricao
                eleicao.candidatos = req.body.candidatos

        
                eleicao.save().then(() => {
                    console.log("Eleição editada com Sucesso")
                    res.redirect("/admin/eleicao")
            }).catch((err) => {
                    console.log("Erro ao Salvar no Banco (Eleição)")
            });

        }
    
    })

    })
            
})

router.get('/novaeleicao', (req, res) => {
    Candidato.find().then((candidatos) => {
        res.render("admin/novaeleicao", {candidatos: candidatos})
    })
})

router.post('/novaeleicao/add', (req, res) => {
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({text: "Nome para eleição inválido"})
    }

    if(!req.body.cargo || typeof req.body.cargo == undefined || req.body.cargo == null){
        erros.push({text: "Nome para o cargo inválido"})
    }
    
    if(erros.length > 0){
        res.render("admin/novaeleicao", {erros: erros})
    }else{

        const novaEleicao = {
            nome: req.body.nome,
            cargo: req.body.cargo,
            descricao: req.body.descricao,
            candidatos: req.body.canditados
        }
    
        new Eleicao(novaEleicao).save().then(() => {
            console.log("Eleição cadastrada com Sucesso")
            res.redirect("/admin/eleicao")
        }).catch((err) => {
            console.log("Erro ao Salvar no Banco (Candidato)")
        });

    }
    
})

router.get('/candidato', (req, res) => {
    Candidato.find().then((candidato) =>{
        res.render("admin/candidato", {candidato: candidato})
    })
    
})

router.post('/candidato/del', (req, res) => {
    Candidato.remove({_id:req.body.id}).then(() => {
        res.redirect("/admin/candidato")
        console.log("Candidato exluído")
    }).catch((err)=>{
        console.log("Erro ao procurar candidato")
    })
})


router.get('/candidato/edit/:id', (req, res) => {
    Candidato.findOne({_id:req.params.id}).then((candidato) =>{
        res.render("admin/candidatoedit", {candidato: candidato})
    }).catch((err)=>{
        console.log("Erro ao procurar candidato")
    })
})

router.post('/candidato/edit', (req, res) => {
    Candidato.findOne({_id:req.body.id}).then((candidato) =>{
        var erros = []

        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            erros.push({text: "Nome Inválido"})
        }
    
        if(!req.body.matricula || typeof req.body.matricula == undefined || req.body.matricula == null){
            erros.push({text: "Matrícula Inválida"})
        }
    
        if(!req.body.cargo || typeof req.body.cargo == undefined || req.body.cargo == null){
            erros.push({text: "Cargo Inválido"})
        }
        
        if(erros.length > 0){
            res.render("admin/candidatoedit", {erros: erros, candidato: candidato})

        }else{

                candidato.nome = req.body.nome
                candidato.matricula = req.body.matricula
                candidato.cargo = req.body.cargo
                candidato.descricao = req.body.descricao
                
        candidato.save().then(() =>{
            console.log("Edição de candidato Realizada")
            res.redirect("/admin/candidato")
            
        }).catch((err) => {
            console.log("Erro ao editar candidato")
        })
        
        }
    })
    
})

router.get('/novocandidato', (req, res) => {
        res.render("admin/novocandidato")
     
})

router.post("/novocandidato/add", (req, res) => {
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({text: "Nome Inválido"})
    }

    if(!req.body.matricula || typeof req.body.matricula == undefined || req.body.matricula == null){
        erros.push({text: "Matrícula Inválida"})
    }

    if(!req.body.cargo || typeof req.body.cargo == undefined || req.body.cargo == null){
        erros.push({text: "Cargo Inválido"})
    }
    
    if(erros.length > 0){
        res.render("admin/novocandidato", {erros: erros})
    }else{

        const novoCandidato = {
            nome: req.body.nome,
            matricula: req.body.matricula,
            cargo: req.body.cargo,
            descricao: req.body.descricao,
        }
    
        new Candidato(novoCandidato).save().then(() => {
            console.log("Candidato Salvo com Sucesso")
            res.redirect("/admin/candidato")
        }).catch((err) => {
            console.log("Erro ao Salvar no Banco (Candidato)")
        });

    }
    



})

module.exports = router