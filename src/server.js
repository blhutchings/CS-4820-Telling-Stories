
/**
 * modular dependancies
 */
const express = require("express")
const server = express()
//const render  = require("ejs")
const flash = require("express-flash")
const session = require("express-session")
const passport = require("passport")
//const { check, validationResult } = require("express-validator")
const methodOverride = require("method-override")
//const sendEmail = require("../utils/email/sendEmail") 
const initializePassport = require("./config/passport")
const db = require("./config/database")

const { Prisma } = require("@prisma/client") //TODO: is this needed/being used here, also see database.js
const { application } = require("express") //TODO: is this being used?




/***
 * Config
 */
if (process.env.NODE_ENV !== "production") {//checks if we are in prod envoirment
    require("dotenv").config()
}
initializePassport(
    passport,
    async email => await db.User.findFirst({ where: { email } }),
    async id => await db.User.findFirst({ where: { id } })
)
server.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, // we want to resave the session variable if nothing is changed
    saveUninitialized: false
}))
server.set('views', './views')
server.set('view engine', 'ejs')
server.use('/public', express.static('public')) //TODO: may be expressed/condensed as app.use(express.static('public')) see here: https://expressjs.com/en/starter/static-files.html
server.use(express.urlencoded({ extended: false }))
server.use(flash())
server.use(passport.initialize())
server.use(passport.session())
server.use(methodOverride("_method"))
const ip = require('../utils/getPublicIp')
const auth = require('./authenticate')
const regestrationRoute = require('./registration')
const usersRoute = require('./users')
const accountRoute = require('./account')
const passwordRoute = require('./password')




/**
 * start the server and export server module
 */
const PORT = 8080
server.listen(PORT)
console.log(`Server started on port http://localhost:${PORT}...`)
module.exports = server



/**
 * server code, primiarly uses Expresses routes, and creates 'mini-apps' for the main functionalities
 * of our application
 */
server.get('/', async(req, res) => {
    res.render("index.ejs")
})

server.use('/registration', regestrationRoute)
server.use('/users', usersRoute)
server.use('/account', accountRoute)
server.use('/password', passwordRoute)

//ip() //posts our public IP to the console












