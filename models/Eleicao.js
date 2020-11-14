const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const Eleicao = new Schema({
    nome: {
        type: String,
        require:true
    },
    cargo: {
        type: String,
        require: true
    },
    descricao: {
        type: String,
        require: false
    },
    status: {
        type: Number,
        require: true,
        default: 0
    },
    candidatos: [{
        type: Schema.Types.ObjectId,
        ref: "candidato",
        require: true
    }]
    // date: {
    //     type: Date,
    //     default: Date.now()
    // }

})

mongoose.model("eleicao", Eleicao)