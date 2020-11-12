const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const Eleicao = new.Schema({
    nome: {
        type: String,
        require:true
    },
    descricao: {
        type: String,
        require: true
    }
    // date: {
    //     type: Date,
    //     default: Date.now()
    // }

})

mongoose.model("eleicao", Eleicao)