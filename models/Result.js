const mongoose = require("mongoose")
const Schema = mongoose.Schema


const Resultado = new Schema({
    nome: {
        type: String,
        require:true,
    },
    eleicao: [{
        type: Schema.Types.ObjectId,
        ref: "eleicao",
        require: true,
        unique: true
    }],
    local: {
        type: String,
        require: true
    },
    status: {
        type: Number,
        require: true
    },
    cargo: {
        type: String,
        require: true
    },
    votos: {
        type: Array,
        require: false
    }
})

mongoose.model("resultado", Resultado)