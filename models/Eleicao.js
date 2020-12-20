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
    local: {
        type: String,
        require: true
    },
    status: {
        type: Number,
        require: true,
        default: 0
    },
    chapa: [{
        type: Schema.Types.ObjectId,
        ref: "chapa",
        require: true
    }]
    // date: {
    //     type: Date,
    //     default: Date.now()
    // }

})

mongoose.model("eleicao", Eleicao)