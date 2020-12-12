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
    matricula: {
        type: Number,
        require: true
    },
    ativo: {
        type: Number,
        default: 1
    },
    senha: {
        type: String,
        require: true  
    }
})

mongoose.model("eleitor", Eleitor)