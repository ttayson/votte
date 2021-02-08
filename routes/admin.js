const express = require('express')
const mongoose = require("mongoose")

require("../models/Candidato")
require("../models/Eleicao")
require("../models/Chapa")
require("../models/Eleitor")
require("../models/Voto")
require("../models/Result")


const Candidato =mongoose.model("candidato")
const Eleicao =mongoose.model("eleicao")
const Chapa =mongoose.model("chapa")
const Eleitor =mongoose.model("eleitor")
const Voto =mongoose.model("voto")
const Resultado =mongoose.model("resultado")

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
    Resultado.find({ status: 1 }).then((resultado) =>{
        res.render("admin/index", {resultado: resultado})
    })
    
})


router.get('/finalizadas', userLogin, (req, res) => {
        Resultado.find({status: 2}).populate("eleicao").then((finalizadas) =>{
            res.render("admin/finalizadas", {finalizadas: finalizadas })
        })

})
    
router.get('/eleicao', userLogin, (req, res) => {
    Eleicao.find({ status: { $ne: 3 }}).populate("chapa").then((eleicao) =>{
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
        
        if(!req.body.local || typeof req.body.local == undefined || req.body.local == null){
            erros.push({text: "Nome para o local inválido"})
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
                eleicao.local = req.body.local.toLowerCase()
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
            res.json({ info: 0})
        }else if (eleicao.status == 1){
            res.json({ info: 1})
        }else if (eleicao.status == 2){
            res.json({ info: 2})
        }else if (eleicao.status == 3){
            res.json({ info: 3})
        }

    })
})

router.post('/eleicao/status', userLogin, (req, res) => {
   Eleicao.findOne({_id:req.body.id}).then((eleicao) =>{
        
                eleicao.status = req.body.resp

                eleicao.save().then(() => {
                    if(req.body.resp == 3){

                        Resultado.updateOne({ eleicao: req.body.id},{ $set: { "status": 2}}).then(()=>{
                            console.log("Aputação Finalizada")
                          }).catch((err) =>{
                              console.log(err)
                          })

                    }

                    console.log("Eleição editada")
                    res.json({ info: req.body.resp})

                }).catch((err) => {
                        console.log("Erro ao Salvar no Banco (Edit Eleição)")
                });
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

    if(!req.body.local || typeof req.body.local == undefined || req.body.local == null){
        erros.push({text: "Nome para o local inválido"})
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
            local: req.body.local.toLowerCase(),
            descricao: req.body.descricao,
            chapa: req.body.chapa
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

router.get("/novachapa", userLogin, (req, res) => {
    Candidato.find().then((candidatos) => {
        res.render("admin/novachapa", {candidatos: candidatos})
    })    
})

router.post('/novachapa/add', UploadImg.single('image'), userLogin, async (req, res) => {
    // upload and resize image
    var filename = null

    if (req.file){
        const imagePath = path.join(__dirname, '../public/images');
        const fileUpload = new Resize(imagePath);
        // req.flash("error", "Please provide an image")
        console.log("entoru aqui")
        filename = await fileUpload.save(req.file.buffer);
    }
    
    
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
            erros.push({text: "Nome para chapa inválido"})
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

router.get('/eleitor',  (req, res) => {
    Eleitor.find().then((eleitor) => {
      res.render("admin/eleitor", {eleitor: eleitor} )

    })

router.post('/eleitor/pass',  (req, res) => {
    Eleitor.findOne({_id: req.body.id}).then((eleitor) => {
        const NewPass = random(1000, 9999)
        function random(low, high) {
            return Math.floor(Math.random() * (high - low + 1) + low)
        }

        Eleitor.updateOne({ _id: req.body.id},{ $set: { "senha": NewPass}}).then(()=>{
            console.log("Senha Eleitor Atualizada")
            res.json({ ok: "passok", Pass: NewPass})
          }).catch((err) =>{
              console.log("Erro na Atualização de Senha do Eleitor"+ err)
          })

    })

    })
        
      
    
})

router.post('/eleitor', UploadCSV.single('file'), userLogin, (req, res) => {

    fs.readFile('./uploads/file.csv', async (err, data) => {
        if (err) {
          console.error(err)
          return
        }
        const eleitor = await neatCsv(data)

        for (item in eleitor) {
            
            const novoEleitor = {
                nome: eleitor[item]["nome"],
                email: eleitor[item]["email"],
                cpf: eleitor[item]["cpf"],
                matricula: eleitor[item]["matricula"],
                telefone: eleitor[item]["telefone"],
                local: eleitor[item]["local"].toLowerCase(),
                senha: eleitor[item]["senha"],
                situacao: eleitor[item]["situacao"].toLowerCase(),
                nascimento: eleitor[item]["nascimento"],
            }
        
            await new Eleitor(novoEleitor).save().then(() => {
                console.log("Eleitor cadastrada com Sucesso")
            }).catch((err) => {
                console.log("Erro ao Salvar no Banco (Eleitor)")
            });

        }
      })
      
    
    res.redirect('/admin/eleitor')
 
})

router.get('/logout', (req, res) => {
    
    req.logout()
    req.flash("error", "Logout realizado")
    res.redirect('/login')
 
})



module.exports = router