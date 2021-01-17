const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const Chapa = new Schema({
    nome: {
        type: String,
        require:true
    },
    numero: {
        type: Number,
        require: true
    },
    descricao: {
        type: String,
        require: false
    },
    imageName: {
        type: String,
        require: false
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

mongoose.model("chapa", Chapa)
