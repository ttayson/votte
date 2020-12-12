const express = require('express')
const mongoose = require("mongoose")

require("../models/Candidato")
require("../models/Eleicao")
require("../models/Chapa")

const Candidato =mongoose.model("candidato")
const Eleicao =mongoose.model("eleicao")
const Chapa =mongoose.model("chapa")

const { userLogin }= require("../helpers/userLogin")

//Tratamento do CSV
const neatCsv = require('neat-csv');
const fs = require('fs');

// Upload files
const Resize = require('../helpers/resize');
const UploadCSV = require('../helpers/uploadCSV');
const UploadImg = require('../helpers/uploadImg');
const path = require('path');




const router = express.Router()


router.get('/', userLogin, (req, res) => {
    Eleicao.find({status:0}).populate("candidatos").then((eleicao) =>{
        res.render("admin/index", {eleicao: eleicao})
    })

})

router.get('/emandamento', (req, res) => {
    res.render("admin/emandamento")
})

router.get('/calendar', (req, res) => {
    res.render("admin/calendar")
})

router.get('/finalizadas', (req, res) => {
    res.render("admin/finalizadas")
})

router.get('/eleicao', userLogin,  (req, res) => {
    Eleicao.find().populate("chapa").then((eleicao) =>{
        res.render("admin/eleicao", {eleicao: eleicao})
    })
    
})

router.get('/eleicao/edit/:id', userLogin, (req, res) => {
    Eleicao.findOne({_id:req.params.id}).populate("chapa").then((eleicao) =>{
        Chapa.find().then((chapa) => {
        res.render("admin/editeleicao", {eleicao: eleicao, chapa: chapa})
    })

    }).catch((err)=>{
        console.log("Erro ao procurar eleição")
    })
    
            
})

router.post('/eleicao/edit/del/', userLogin, (req, res) => {
    Eleicao.remove({_id:req.body.id}).then(() =>{
        // res.redirect("/admin/eleicao")
        res.json({ ok: "deletok"})

    }).catch((err)=>{
        console.log("Erro ao procurar eleição")
    })
    
            
})

router.post('/eleicao/edit/', userLogin, (req, res) => {
    Eleicao.findOne({_id:req.body.id}).then((eleicao) =>{
        Chapa.find().then((chapa) => {

        var erros = []

        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            erros.push({text: "Nome para eleição inválido"})
        }

        if(!req.body.cargo || typeof req.body.cargo == undefined || req.body.cargo == null){
            erros.push({text: "Nome para o cargo inválido"})
        }

        if(!req.body.chapa || typeof req.body.chapa == undefined || req.body.chapa == null){
            erros.push({text: "Selecione pelo menos um candidato"})
        }
        
        if(erros.length > 0){
            res.render("admin/editeleicao", {erros: erros, eleicao: eleicao, chapa: chapa})

        }else{


                eleicao.nome = req.body.nome
                eleicao.cargo = req.body.cargo
                eleicao.descricao = req.body.descricao
                eleicao.chapa = req.body.chapa

        
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

router.get('/novaeleicao', userLogin, (req, res) => {
    Chapa.find().then((chapa) => {
        res.render("admin/novaeleicao", {chapa: chapa})
    })
})

router.get('/eleicao/status/:id', userLogin, (req, res) => {
    Eleicao.findOne({_id:req.params.id}).then((eleicao) =>{
        if (eleicao.status == 0) {
            res.json({ info: "Não iniciada"})
        }else if (eleicao.status == 1){
            res.json({ info: "Iniciada"})
        }else if (eleicao.status == 2){
            res.json({ info: "Pausada"})
        }else if (eleicao.status == 4){
            res.json({ info: "Finalizada"})
        }

    })
})

router.post('/novaeleicao/add', userLogin, (req, res) => {
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({text: "Nome para eleição inválido"})
    }

    if(!req.body.cargo || typeof req.body.cargo == undefined || req.body.cargo == null){
        erros.push({text: "Nome para o cargo inválido"})
    }

    if(!req.body.chapa || typeof req.body.chapa == undefined || req.body.chapa == null){
        erros.push({text: "Selecione pelo menos uma chapa"})
    }
    
    if(erros.length > 0){
        res.render("admin/novaeleicao", {erros: erros})
    }else{

        const novaEleicao = {
            nome: req.body.nome,
            cargo: req.body.cargo,
            descricao: req.body.descricao,
            candidatos: req.body.candidatos
        }
    
        new Eleicao(novaEleicao).save().then(() => {
            console.log("Eleição cadastrada com Sucesso")
            res.redirect("/admin/eleicao")
        }).catch((err) => {
            console.log("Erro ao Salvar no Banco (Candidato)")
        });

    }
    
})

router.get('/candidato', userLogin, (req, res) => {
    Candidato.find().then((candidato) =>{
        res.render("admin/candidato", {candidato: candidato})
    })
    
})

router.post('/candidato/del', userLogin, (req, res) => {
    Candidato.remove({_id:req.body.id}).then(() => {
        // res.redirect("/admin/eleicao")
        res.json({ ok: "deletok"})

    }).catch((err)=>{
        console.log("Erro ao procurar eleição")
    })
})

router.get('/candidato/edit/:id', userLogin, (req, res) => {
    Candidato.findOne({_id:req.params.id}).then((candidato) =>{
        res.render("admin/candidatoedit", {candidato: candidato})
    }).catch((err)=>{
        console.log("Erro ao procurar candidato")
    })
})

router.post('/candidato/edit', userLogin, (req, res) => {
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

router.get('/novocandidato', userLogin, (req, res) => {
        res.render("admin/novocandidato")
     
})

router.post("/novocandidato/add", userLogin, (req, res) => {
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

router.get("/chapas", userLogin, (req, res) => {
    Chapa.find().populate("candidatos").then((chapa) =>{
        res.render("admin/chapas", {chapa: chapa})
    })
})

router.get("/novachapa", (req, res) => {
    Candidato.find().then((candidatos) => {
        res.render("admin/novachapa", {candidatos: candidatos})
    })    
})

router.post('/novachapa/add', UploadImg.single('image'), async (req, res) => {
    // upload and resize image
    const imagePath = path.join(__dirname, '../public/images');
    const fileUpload = new Resize(imagePath);

    if (!req.file) {
    req.flash("error", "Please provide an image")
    }
    const filename = await fileUpload.save(req.file.buffer);

    // return res.status(200).json({ name: filename })
    
    
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({text: "Nome para chapa inválido"})
    }

    if(!req.body.candidatos || typeof req.body.candidatos == undefined || req.body.candidatos == null){
        erros.push({text: "Selecione pelo menos um candidato"})
    }

    if(!req.body.numero || typeof req.body.numero == undefined || req.body.numero == null){
        erros.push({text: "Nome para chapa inválido"})
    }

    if(erros.length > 0){
        res.render("admin/novachapa", {erros: erros})
    }else{

        const novaChapa = {
            imageName: filename,
            nome: req.body.nome,
            numero: req.body.numero,
            descricao: req.body.descricao,
            candidatos: req.body.candidatos
        }
    
        new Chapa(novaChapa).save().then(() => {
            console.log("Chapa cadastrada com Sucesso")
            res.redirect("/admin/chapas")
        }).catch((err) => {
            console.log("Erro ao Salvar no Banco (Chapa)")
        });

    }
    
})

router.get('/chapas/edit/:id', userLogin, (req, res) => {
    Chapa.findOne({_id:req.params.id}).populate("candidatos").then((chapa) =>{
        Candidato.find().then((candidatos) => {
        res.render("admin/chapaedit", {chapa: chapa, candidatos: candidatos})
    })

    }).catch((err)=>{
        console.log("Erro ao procurar a chapa")
    })
})

router.post('/chapas/edit', UploadImg.single('image'), userLogin, async (req, res) => {
    var filename = null

    if (req.file){
        const imagePath = path.join(__dirname, '../public/images');
        const fileUpload = new Resize(imagePath);
        // req.flash("error", "Please provide an image")
        console.log("entoru aqui")
        filename = await fileUpload.save(req.file.buffer);
    }



    Chapa.findOne({_id:req.body.id}).then((chapa) =>{
        Candidato.find().then((candidatos) => {
            if (!req.file){
                filename = chapa.imageName
                console.log(filename)
            }
        
     
        var erros = []

        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            erros.push({text: "Nome para eleição inválido"})
        }

        if(!req.body.numero || typeof req.body.numero == undefined || req.body.numero == null){
            erros.push({text: "Número Inválido"})
        }


        if(!req.body.candidatos || typeof req.body.candidatos == undefined || req.body.candidatos == null){
            erros.push({text: "Selecione pelo menos um candidato"})
        }
        
        if(erros.length > 0){
            res.render("admin/chapaedit", {erros: erros, chapa: chapa, candidatos: candidatos})

        }else{
                chapa.imageName = filename
                chapa.nome = req.body.nome
                chapa.numero = req.body.numero
                chapa.descricao = req.body.descricao
                chapa.candidatos = req.body.candidatos

        
                chapa.save().then(() => {
                    console.log("Chapa editada com Sucesso")
                    res.redirect("/admin/chapas")
            }).catch((err) => {
                    console.log("Erro ao Salvar no Banco (Chapa)")
            });

        }
    
    })

    })
    
})

router.post('/chapas/edit/del', userLogin, (req, res) => {
    Chapa.remove({_id:req.body.id}).then(() =>{
        // res.redirect("/admin/eleicao")
        res.json({ ok: "deletok"})

    }).catch((err)=>{
        console.log("Erro ao procurar chapa")
    })
    
            
})

router.get('/eleitor', (req, res) => {

    fs.readFile('./uploads/file.csv', async (err, data) => {
        if (err) {
          console.error(err)
          return
        }
        const eleitor = await neatCsv(data)

        
      })

      res.render("admin/eleitor")
        
      
    
})

router.post('/eleitor', UploadCSV.single('file'), (req, res) => {
    
    res.redirect('/admin/eleitor')
 
})

router.get('/logout', (req, res) => {
    
    req.logout()
    req.flash("error", "Logout necessário")
    res.redirect('/login')
 
})



module.exports = router