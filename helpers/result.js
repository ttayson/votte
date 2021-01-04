module.exports = {
  result: function(){

const mongoose = require('mongoose')

require("../models/Eleicao")
require("../models/Voto")
require("../models/Result")


const Eleicao =mongoose.model("eleicao")
const Voto =mongoose.model("voto")
const Resultado =mongoose.model("resultado")

  Eleicao.find().or([{ status: 1 }, { status: 2 }]).populate("chapa").then(async (eleicao) =>{
    
    var _id = []
    for ( item in eleicao) {
        _id.push(eleicao[item]._id)
    }  
        // Voto.find({ eleicao: { "$in" : _id }}).then((voto) =>{
         
        for ( item in eleicao) {
          
          await Resultado.find({eleicao: eleicao[item]._id}).then(() =>{
              const resultado = {
                nome: eleicao[item].nome,
                eleicao: eleicao[item]._id,
                cargo: eleicao[item].cargo,
                status: 1
              }
                                            
              Resultado(resultado).save().then(() => {
                    console.log("Resultado cadastrada com Sucesso")
                }).catch((err) => {
                    console.log("Erro ao Salvar no Banco ")
                });


          })

          Resultado.updateOne({ eleicao: eleicao[item]._id},{ $pull: { votos: { voto: { $gte: 0}}}}).then((teste)=>{
            console.log("Limpado")
          })

            for ( x in eleicao[item].chapa) {
      
                var accounts = await Voto.find().and([{ eleicao: eleicao[item]._id}, {chapa: eleicao[item].chapa[x]}]).then(async(voto) =>{
                  var votos = voto.length
      
                            if (votos > 0){

                                await Resultado.updateOne({ eleicao: eleicao[item]._id},{ $push: { votos: { $each: [ {chapa: eleicao[item].chapa[x].nome, voto: votos}]}}}).then((teste)=>{
                                  console.log("Escrito")
                                })

                                
                                // Resultado.updateOne({ eleicao: eleicao[item]._id},{ $addToSet: { chapa: eleicao[item].chapa[x].nome}}).then((teste)=>{
                                //   console.log("Escrito chapa")
                                // })

                            }
      
                })
            }
            
          } 
  })
    
  }
}