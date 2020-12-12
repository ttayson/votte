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

    }
})

mongoose.model("voto", Voto)