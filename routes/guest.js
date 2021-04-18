const express = require("express");
const mongoose = require("mongoose");

require("../models/Candidato");
require("../models/Eleicao");
require("../models/Chapa");
require("../models/User");
require("../models/Eleitor");
require("../models/Voto");
require("../models/Result");

const Candidato = mongoose.model("candidato");
const Eleicao = mongoose.model("eleicao");
const Chapa = mongoose.model("chapa");
const User = mongoose.model("user");
const Eleitor = mongoose.model("eleitor");
const Voto = mongoose.model("voto");
const Resultado = mongoose.model("resultado");
const passport = require("passport");
const bcrypt = require("bcryptjs");

const { userLogin } = require("../helpers/userLogin");

const router = express.Router();

router.get("/", (req, res) => {
  const difference = res.locals.StartTime - +new Date();
  const difference2 = res.locals.EndTime - +new Date();
  if (difference <= 0 && difference2 > 0) {
    res.render("guest/entrar", {
      layout: "basic",
      EndTime: res.locals.EndTime,
      StartTime: res.locals.StartTime,
    });
  } else if (difference <= 0 && difference2 < 0) {
    res.redirect("/entrar");
  } else {
    res.render("guest/contagem", {
      layout: "basic",
      StartTime: res.locals.StartTime,
    });
  }
});

router.get("/login", (req, res) => {
  res.render("guest/login", { layout: "basic" });
  // res.json({ ok: "Teste"})
});

router.post("/login", (req, res, next) => {
  // Rota de Login
  passport.authenticate("local", {
    successRedirect: "/admin",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
});

router.get("/entrar", (req, res) => {
  const difference = res.locals.EndTime - +new Date();
  const difference2 = res.locals.StartTime - +new Date();
  if (difference > 0 && difference2 < 0) {
    res.render("guest/entrar", {
      layout: "basic",
      EndTime: res.locals.EndTime,
    });
  } else if (difference > 0 && difference2 > 0) {
    res.redirect("/");
  } else {
    res.render("guest/EndTime", {
      layout: "basic",
    });
  }
});
router.post("/entrar", (req, res) => {
  const difference = res.locals.EndTime - +new Date();
  const difference2 = res.locals.StartTime - +new Date();
  if (difference <= 0 || difference2 >= 0) {
    res.json({ erro: "inexistente" });
    return;
  }

  Eleitor.findOne({ matricula: req.body[0].mat }).then((eleitor) => {
    if (eleitor) {
      Voto.find({ eleitor: eleitor._id }) //check geral, para elição única

        .then(async (voto) => {
          if (voto.length > 0) {
            res.json({ erro: "votado" });
          } else {
            res.json({ local: eleitor.local, mat: eleitor.matricula });
          }
        });
    } else {
      res.json({ erro: "ncadastrado" });
    }
  });

  // Eleicao.find({ status: 1 })
  //   .sort({ nome: 1 })
  //   .lean()
  //   .populate({ path: "chapa", options: { sort: { numero: 1 } } })
  //   .then((eleicao) => {
  //     res.render("guest/voto", {
  //       layout: "basic",
  //       eleicao: eleicao,
  //     });
  //   });
});

router.get("/voto/:local/:mat", (req, res) => {
  const difference = res.locals.EndTime - +new Date();
  const difference2 = res.locals.StartTime - +new Date();
  if (difference <= 0 || difference2 >= 0) {
    res.redirect("/");
    return;
  }

  Eleicao.find({
    $and: [
      { status: 1 },
      {
        $or: [{ local: "geral" }, { local: req.params.local }],
      },
    ],
  })
    .sort({ nome: 1 })
    .lean()
    .populate({
      path: "chapa",
      populate: { path: "candidatos" },
      options: { sort: { numero: 1 } },
    })
    .then((eleicao) => {
      if (eleicao.length == 3) {
        res.render("guest/voto1", {
          layout: "basic",
          eleicao: eleicao,
          EndTime: res.locals.EndTime,
        });
      } else {
        res.render("guest/voto", {
          layout: "basic",
          eleicao: eleicao,
          EndTime: res.locals.EndTime,
        });
      }
    });
});

router.post("/votte", async (req, res) => {
  const difference = res.locals.EndTime - +new Date();
  const difference2 = res.locals.StartTime - +new Date();
  if (difference <= 0 || difference2 >= 0) {
    res.json({ erro: "inexistente" });
    return;
  }
  await Eleitor.findOne({ matricula: req.body[1] })
    .then(async (eleitor) => {
      if (eleitor) {
        // Traca de Local desativada
        var error = [];
        for (i in req.body[0]) {
          await Eleicao.findOne()
            .and([
              { _id: req.body[0][i].name },
              { chapa: req.body[0][i].value },
            ])
            .then((checkLocal) => {
              if (checkLocal) {
                if (req.body[0].length == 3) {
                  if (
                    eleitor.local != "roe" &&
                    eleitor.local != "rse" &&
                    eleitor.local != "rsc" &&
                    eleitor.local != "rao"
                  ) {
                    console.log("local correto 2");
                  } else {
                    error.push({ error: "erro" });
                  }
                } else {
                  if (
                    checkLocal.local == eleitor.local ||
                    checkLocal.local == "geral"
                  ) {
                    console.log("local correto");
                  } else {
                    error.push({ error: "erro" });
                  }
                }
              } else {
                console.log("dados Incorretos");
                error.push({ error: "erro" });
              }
            });
        }
        if (error.length > 0) {
          res.json({ erro: "localerro" });
          return;
        }

        if (eleitor.senha == req.body[2]) {
          var countCheckVoto = 0;
          var countVoto = 0;
          var countVotoValid = 0;
          var novoVoto;
          for (item in req.body[0]) {
            countVotoValid = 0;

            await Eleicao.findOne()
              .and([
                { _id: req.body[0][item].name },
                { chapa: req.body[0][item].value },
              ])
              .then(async (eleicao) => {
                if (eleicao) {
                  await Voto.findOne()
                    .and([{ eleitor: eleitor._id }, { eleicao: eleicao._id }])
                    .then(async (voto) => {
                      if (voto) {
                        countCheckVoto += 1;
                        return;
                      } else {
                        if (eleicao.status == 1) {
                          countVotoValid += 1;
                          novoVoto = {
                            ip: req.ip,
                            chapa: req.body[0][item].value,
                            eleitor: eleitor._id,
                            eleicao: eleicao._id,
                            local: eleitor.local,
                            valido: 1,
                          };
                        } else {
                          res.json({ erro: "inexistente" });
                        }
                      }
                    });
                } else {
                  res.json({ erro: "dadosincorretos" });
                }
              });
            if (countVotoValid != 0) {
              await new Voto(novoVoto)
                .save()
                .then(() => {
                  countVoto += 1;
                  console.log("Voto computado");
                })
                .catch((err) => {
                  console.log("Erro ao Salvar no Banco (Voto)" + err);
                });
            }
          }

          if (countCheckVoto >= 3) {
            res.json({ erro: "votado" });
          } else if (countVoto >= 3) {
            res.json({ ok: "valido" });
          }
        } else {
          res.json({ erro: "inexistente" });
        }
      } else {
        res.json({ erro: "ncadastrado" });
      }
    })
    .catch((err) => {
      console.log("erro na validação de voto " + err);
    });
});

// router.get("/votar", (req, res) => {
//   Eleicao.find({ status: 1 })
//     .sort({ nome: 1 })
//     .then((eleicao) => {
//       Resultado.find({ status: 3 }).then((resultado) => {
//         res.render("guest/lista2", {
//           layout: "basic",
//           eleicao: eleicao,
//           resultado: resultado,
//         });
//       });
//     });

// });

router.get("/resultado", (req, res) => {
  Resultado.find({ status: 3 }).then((resultado) => {
    if (resultado.length == 7) {
      res.render("guest/resultado", { layout: "basic", resultado: resultado });
    } else {
      res.render("guest/resultado", { layout: "basic" });
    }
  });
});

// router.get("/votar/:_id", (req, res) => {
//   Eleicao.findOne({ _id: req.params._id })
//     .lean()
//     .populate("chapa")
//     .then((eleicao) => {
//       if (eleicao) {
//         if (eleicao.status == 1) {
//           var ids = [];

//           for (item in eleicao.chapa) {
//             ids.push({ _id: eleicao.chapa[item]._id });
//           }
//           Chapa.find({ _id: ids })
//             .populate("candidatos")
//             .then((chapa) => {
//               res.render("guest/votar", {
//                 layout: "basic",
//                 eleicao: eleicao,
//                 chapa: chapa,
//               });
//             });
//         } else if (eleicao.status == 2) {
//           res.render("guest/pausada", { layout: "basic", eleicao: eleicao });
//         } else if (eleicao.status == 0 || eleicao.status == 3) {
//           res.render("guest/indisponivel", {
//             layout: "basic",
//             eleicao: eleicao,
//           });
//         }
//       } else {
//         res.render("guest/indisponivel", { layout: "basic", eleicao: eleicao });
//       }
//     });
//   // res.json({ ok: "Teste"})
// });

// router.post("/votar", async (req, res) => {
//   await Eleitor.findOne({ matricula: req.body[2] })
//     .then((eleitor) => {
//       if (eleitor) {
//         // Traca de Local desativada
//         if (eleitor.local == req.body[4] || req.body[4] == "geral") {
//           if (eleitor.senha == req.body[3]) {
//             // if((eleitor.matricula == req.body[3] && eleitor.situacao == "ativo") || (eleitor.nascimento == req.body[3] && eleitor.situacao == "aposentado")){
//             Eleicao.findOne()
//               .and([{ _id: req.body[1] }, { local: req.body[4] }])
//               .then(async (eleicao) => {
//                 if (eleicao) {
//                   Voto.findOne()
//                     .and([{ eleitor: eleitor._id }, { eleicao: eleicao._id }])
//                     .then(async (voto) => {
//                       if (voto) {
//                         res.json({ erro: "votado" });
//                       } else {
//                         if (eleicao.status == 1) {
//                           if (req.body[0] == 2 || req.body[0] == 3) {
//                             const novoVoto = {
//                               ip: req.ip,
//                               chapa: null,
//                               eleitor: eleitor._id,
//                               eleicao: req.body[1],
//                               local: req.body[4],
//                               valido: req.body[0],
//                               situcaoEleitor: eleitor._id,
//                             };

//                             await new Voto(novoVoto)
//                               .save()
//                               .then(() => {
//                                 res.json({ ok: "valido" });
//                                 console.log("Voto Anulado/Branco");
//                               })
//                               .catch((err) => {
//                                 console.log(
//                                   "Erro ao Salvar no Banco (Voto)" + err
//                                 );
//                               });
//                           } else {
//                             const novoVoto = {
//                               ip: req.ip,
//                               chapa: req.body[0],
//                               eleitor: eleitor._id,
//                               eleicao: req.body[1],
//                               local: req.body[4],
//                               valido: 1,
//                             };

//                             await new Voto(novoVoto)
//                               .save()
//                               .then(() => {
//                                 res.json({ ok: "valido" });
//                                 console.log("Voto computado");
//                               })
//                               .catch((err) => {
//                                 console.log(
//                                   "Erro ao Salvar no Banco (Voto)" + err
//                                 );
//                               });
//                           }
//                         }
//                       }
//                     });
//                 } else {
//                   res.json({ erro: "localerro" });
//                 }
//               });
//           } else {
//             res.json({ erro: "inexistente" });
//           }
//         } else {
//           res.json({ erro: "localerro" });
//         }
//       } else {
//         res.json({ erro: "ncadastrado" });
//       }
//     })
//     .catch((err) => {
//       console.log("erro na validação de voto " + err);
//     });

//   var ip = req.ip;
// });

// router.get("/cadastrar", (req, res) => {
//   const user = {
//     nome: "Talles Tayson",
//     login: "ttayson",
//     email: "tallestayson@gmail.com",
//     senha: "",
//   };

//   bcrypt.genSalt(10, (erro, salt) => {
//     bcrypt.hash(user.senha, salt, (erro, hash) => {
//       if (erro) {
//         console.log("Erro ao salvar usuário");
//       } else {
//         user.senha = hash;

//         new User(user)
//           .save()
//           .then(() => {
//             console.log("Usuário Cadastrado");
//             res.redirect("/login");
//           })
//           .catch((err) => {
//             console.log("Erro ao Salvar no Banco (User)");
//           });
//       }
//     });
//   });
// });

module.exports = router;
