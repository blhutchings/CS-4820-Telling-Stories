require("dotenv").config()

const express = require("express")
const session = require("express-session")
const flash = require("express-flash")
const methodOverride = require("method-override")
const bodyParser = require("body-parser")
const expressH5P = require('./h5p/expressH5P')

const regestrationRoute = require('./user-registration')
const usersRoute = require('./user-management')
const accountRoute = require('./user-session')
const passwordRoute = require('./user-password')

const passport = require("passport")
const initializePassport = require('./config/passport')
const db = require("./config/database")

initializePassport(
    passport,
    async (email) => await db.User.findFirst({ where: { email } }),
    async (id) => await db.User.findFirst({ where: { id: +id }, include: { UserRole: true } })
)

const server = express()

server.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, // we want to resave the session variable if nothing is changed
    saveUninitialized: false
}))

server.set('views', './views')
server.set('view engine', 'ejs')
server.use('/public', express.static('public'))
server.use(flash())
server.use(methodOverride("_method"))

server.use(passport.initialize())
server.use(passport.session())

// Express H5P setup
server.use(bodyParser.json({ limit: '500mb' }));
server.use(bodyParser.urlencoded({extended: true}));

expressH5P(server)

/**
 * server code, primarily uses Expresses routes, and creates 'mini-apps' for the main functionalities
 * of our application
*/
server.get('/', async(req, res) => {
    res.render("index.ejs")
})

server.use('/registration', regestrationRoute)
server.use('/users', usersRoute)
server.use('/account', accountRoute)
server.use('/password', passwordRoute)

/**
 * start the server and export server module
 */
const PORT = process.env.PORT || '8080';
server.listen(PORT)
console.log(`Server started on port http://localhost:${PORT}...`)

