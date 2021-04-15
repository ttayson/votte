//MOdulos
const express = require("express");
const handlebars = require("express-handlebars");
const Handlebars = require("handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");

const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");

const passport = require("passport");
require("./config/Auth")(passport);

const admin = require("./routes/admin");
const guest = require("./routes/guest");

//Cron
const { result } = require("./helpers/result");
const cron = require("node-cron");

// Banco de Dados
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

cron.schedule("* * * * *", () => result());

const hbs = handlebars.create({
  defaultLayout: "main",
  extname: "hbs",
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  helpers: {
    rendervoto: (data, eleicaoID) => {
      if (data.numero == 100) {
        return new Handlebars.SafeString(
          '<br><div class="teste btn" style="width: auto;"><time><h4 style="margin: 10px">' +
            data.nome +
            '</h4><h1></h1></time><p></p><input type="radio" name="' +
            eleicaoID +
            '" value="' +
            data._id +
            '"></div>'
        );
      } else if (data.numero == 200) {
        return new Handlebars.SafeString(
          '<div class="teste btn" style="width: auto;"><time><h4 style="margin: 10px">' +
            data.nome +
            '</h4><h1></h1></time><p></p><input type="radio" name="' +
            eleicaoID +
            '" value="' +
            data._id +
            '"></div>'
        );
      } else if (data.numero > 10) {
        return new Handlebars.SafeString(
          '<div class="teste btn" style="display: inline-grid;">' +
            data.nome +
            '</p><input type="radio" name="' +
            eleicaoID +
            '" value="' +
            data._id +
            '"></div>'
        );
      } else if (data.candidatos[2] != undefined) {
        return new Handlebars.SafeString(
          '<div class="teste btn"><time><h4>Chapa</h4><h1>' +
            data.numero +
            '</h1></time><div class="row" style="display: inline-grid; width: inherit;"><p style="white-space: normal;">' +
            data.nome +
            '</p><p style="white-space: normal; font-size: 1.1rem; text-align: left; padding-left: 7%;"><b>' +
            data.candidatos[0].cargo +
            ": " +
            data.candidatos[0].nome +
            "<br>" +
            data.candidatos[1].cargo +
            ": " +
            data.candidatos[1].nome +
            "<br>" +
            data.candidatos[2].cargo +
            ": " +
            data.candidatos[2].nome +
            '</b></p></div><input type="radio" name="' +
            eleicaoID +
            '" value="' +
            data._id +
            '"></div>'
        );
      } else {
        return new Handlebars.SafeString(
          '<div class="teste btn"><time><h4>Chapa</h4><h1>' +
            data.numero +
            '</h1></time><div class="row" style="display: inline-grid; width: inherit;"><p style="white-space: normal;">' +
            data.nome +
            '</p><p style="white-space: normal; font-size: 1.1rem; text-align: left; padding-left: 7%;"><b>' +
            data.candidatos[0].cargo +
            ": " +
            data.candidatos[0].nome +
            "<br>" +
            data.candidatos[1].cargo +
            ": " +
            data.candidatos[1].nome +
            '</b></p></div><input type="radio" name="' +
            eleicaoID +
            '" value="' +
            data._id +
            '"></div>'
        );
      }
    },
  },
});

//Configurações
//session
app.use(
  session({
    secret: "aplicativovotta",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//middleware

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

//body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//IP
app.set("trust proxy", true);

//Handlebars

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views");
// app.engine('handlebars', handlebars({defaultLayout: 'main'}))
// app.set('view engine', 'handlebars');

//mongoose
mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://'+process.env.DB_USER+':'+process.env.DB_PASS+'@ttayson.cf/'+process.env.DB_NAME, {
mongoose
  .connect(
    "mongodb://" +
      process.env.DB_USER +
      ":" +
      process.env.DB_PASS +
      "@" +
      process.env.DOMAIN +
      ":" +
      process.env.DB_PORT +
      "/" +
      process.env.DB_NAME +
      "?authSource=admin",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    }
  )
  .then(() => {
    console.log("Mongo Conectado");
  })
  .catch((err) => {
    console.log("Erro ao se conectar ao banco:" + err);
  });
//Public
app.use(express.static(path.join(__dirname, "public")));

// Rotas

app.use("/admin", admin);
app.use("/", guest);

const PORT = 3000;
app.listen(PORT, () => {
  console.log("Servidor Rodando!!");
});
