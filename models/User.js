const mongoose = require("mongoose")
const Schema = mongoose.Schema


const User = new Schema({
    nome: {
        type: String,
        require:true
    },
    email: {
        type: String,
        require: true
    },
    login: {
        type: String,
        require: true
    },
    isadmin: {
        type: Number,
        default: 0
    },
    senha: {
        type: String,
        require: true  
    }
})

mongoose.model("user", User)