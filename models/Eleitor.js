const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Eleitor = new Schema({
  nome: {
    type: String,
    require: false,
  },
  email: {
    type: String,
    require: false,
  },
  local: {
    type: String,
    require: true,
  },
  matricula: {
    type: Number,
    require: true,
    unique: true,
  },
  cpf: {
    type: Number,
    require: true,
    unique: true,
  },
  telefone: {
    type: String,
    require: false,
  },
  ativo: {
    type: Number,
    default: 1,
  },
  situacao: {
    type: String,
    require: false,
  },
  nascimento: {
    type: String,
    require: false,
  },
  senha: {
    type: String,
    require: true,
  },
});

mongoose.model("eleitor", Eleitor);
