const mongoose = require("mongoose")
const Schema = mongoose.Schema


const Voto = new Schema({
    ip: {
        type: String,
        require:true
    },
    chapa: [{
        type: Schema.Types.ObjectId,
        ref: "chapa",
        require: true
    }],
    eleitor: [{
        type: Schema.Types.ObjectId,
        ref: "eleitor",
        require: true
    }],
    eleicao: [{
        type: Schema.Types.ObjectId,
        ref: "eleicao",
        require: true
    }],
    ntentativas: {
        type: Number,
        default: 0
    },
    valido: {
        type: Number,
        default: 0
    },
    local: {
        type: String,
        require: true
    },  
    date: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model("voto", Voto)