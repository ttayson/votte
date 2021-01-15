const mongoose = require("mongoose")
const Schema = mongoose.Schema


const Eleitor = new Schema({
    nome: {
        type: String,
        require:true
    },
    email: {
        type: String,
        require: false
    },
    local: {
        type: String,
        require: true
    },
    matricula: {
        type: Number,
        require: true,
        unique: true        
    },
    cpf: {
        type: Number,
        require: true,
        unique: true
    },
    telefone: {
        type: Number,
        require: false
    },
    ativo: {
        type: Number,
        default: 1
    },
    situacao: {
        type: String,
        require: true
    },
    nascimento: {
        type: String,
        require: true
    },
    senha: {
        type: String,
        require: true  
    }
})

mongoose.model("eleitor", Eleitor)