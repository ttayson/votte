//MOdulos
const express = require('express')
const handlebars = require('express-handlebars')
const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')

const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('connect-flash')
const path = require('path')

const passport = require('passport')
require("./config/Auth")(passport)

const admin = require("./routes/admin")
const guest = require("./routes/guest")

//Cron
const { result }= require("./helpers/result")
const cron = require("node-cron");

// Banco de Dados
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()


cron.schedule("* * * * *", () => result());

const hbs = handlebars.create({
    defaultLayout: 'main', 
    extname: 'hbs',
    handlebars: allowInsecurePrototypeAccess(Handlebars)
  });


//Configurações
    //session
    app.use(session({
        secret: "aplicativovotta",
        resave: true,
        saveUninitialized: true
    }))

    app.use(passport.initialize())
    app.use(passport.session())

    app.use(flash())

    //middleware

    app.use((req, res, next) =>{
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null
        next()
    })

    //body parser
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())

    //IP
    app.set('trust proxy', true)
    
    //Handlebars

    app.engine('hbs', hbs.engine); 
    app.set('view engine', 'hbs');
    app.set('views', 'views');
    // app.engine('handlebars', handlebars({defaultLayout: 'main'}))
    // app.set('view engine', 'handlebars');

    //mongoose
    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://'+process.env.DB_USER+':'+process.env.DB_PASS+'@mongo/'+process.env.DB_NAME, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    }).then(() => {
        console.log("Mongo Conectado")    
    }).catch((err) => {
        console.log("Erro ao se conectar ao banco:"+err)        
    });
    //Public
    app.use(express.static(path.join(__dirname,"public")))


// Rotas

app.use("/admin", admin)
app.use("/", guest)


const PORT = 3000
app.listen(PORT, () =>{
    console.log('Servidor Rodando!!')
})
