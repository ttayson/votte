const mongoose = require("mongoose")
const Schema = mongoose.Schema


const Candidato = new Schema({
    nome: {
        type: String,
        require:true
    },
    cargo: {
        type: String,
        require: true
    },
    matricula: {
        type: Number,
        require: true
    },
    descricao: {
        type: String,
        require: false  
    }
})

mongoose.model("candidato", Candidato)