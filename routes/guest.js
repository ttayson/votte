const express = require('express')
const mongoose = require("mongoose")

require("../models/Candidato")
require("../models/Eleicao")
require("../models/Chapa")

const Candidato =mongoose.model("candidato")
const Eleicao =mongoose.model("eleicao")
const Chapa =mongoose.model("chapa")


const router = express.Router()


router.get('/', (req, res) => {
        res.render("guest/index", {layout: "basic"});
        // res.json({ ok: "Teste"})
})



module.exports = router