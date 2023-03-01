
/**
 * modular dependancies
 */
const express = require("express")
const server = express()
const render  = require("ejs")
const flash = require("express-flash")
const session = require("express-session")
const bcrypt = require("bcrypt")
const passport = require("passport")
const jwt = require("jsonwebtoken")
const { check, validationResult } = require("express-validator")
const methodOverride = require("method-override")
const sendEmail = require("../utils/email/sendEmail") 
const initializePassport = require("./config/passport")
const db = require("./config/database")

const { Prisma } = require("@prisma/client") //TODO: is this needed/being used here, also see database.js
const { application } = require("express") //TODO: is this being used?




/***
 * Config
 */
const SALT = bcrypt.genSaltSync(10);
const JWT_SECRET = process.env.JWT_SECRET
const PAGE_SIZE = 8;
const PORT = 8080

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


/**
 * start the server and export server module
 */
server.listen(PORT)
console.log(`Server started on port http://localhost:${PORT}...`)
module.exports = server



const auth = require('./authenticate')
const regestrationRoute = require('./registration')
const usersRoute = require('./registration')

/**
 * code
 */

server.get('/', async(req, res) => {
    res.render("index.ejs")
})

server.get('/create', auth.checkAuthenticated, async(req, res) => { //todo: rename to user/homepage? user/create?

    console.log("USER ID IS " + req.user.id)
    res.render("create.ejs", { name: req.user.firstName })
})

//testing
const accountRoute = require("./account")
const ip = require('../utils/getPublicIp')

//server.use('/login', accountRoute)
server.get('/login', auth.checkNotAuthenticated, (req, res)=>{ //
    res.render('login.ejs')
})


server.use('/registration', regestrationRoute)
server.use('/users', usersRoute)

ip()





//end of testing
server.post('/login', auth.checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/create",
    failureRedirect: "/login",
    failureFlash: true
}))


server.delete("/logout", (req, res) => {
    req.logout(req.user, err => {
        if (err) return next(err)
        res.redirect("/")
    })
})

server.get('/forgot-password', async(req, res) => {
    res.render('forgotPassword.ejs')
})

server.post('/forgot-password', async(req, res) => {
    const { email } = req.body

    const user = await db.User.findFirst({ where: { email } })

    if (!user) {
        req.flash("error", "Email is not registered")
        res.redirect("/forgot-password")
            //res.send('User is not registered')
    }

    //user exists and now creating a one time link that is valid for only 15 minutes
    else {
        const secret = JWT_SECRET + user.password
        try {
            const payload = {
                email: user.email,
                id: user.id
            }
            const token = jwt.sign(payload, secret, { expiresIn: '15m' })
            const resetLink = `localhost:8080/reset-password/${user.id}/${token}`//TODO: change local host to domain name
            console.log(resetLink)
            const resetEmailPayload = {
                name: user.firstName,
                link: resetLink
            }
            sendEmail(user.email, "Reset Password", resetEmailPayload, "views/partial/_emailPasswordResetRequest.ejs")
            req.flash("success", "A password reset link has been sent to your email.")
            res.redirect("/forgot-password")
                //res.redirect('/reset-password')
        } catch (error) {
            console.log(error)
        }

    }
})

server.get('/reset-password/:id/:token', async(req, res) => {
    const { id, token } = req.params
        //res.send(req.params)
    const user = await db.User.findFirst({ where: { id: parseInt(id) } })
    if (!user) {
        console.log("invalid id")
        return;
    }
    // We have a valid user
    else {
        const secret = JWT_SECRET + user.password
        try {
            const payload = jwt.verify(token, secret)
            res.render("resetPassword.ejs", { id: id, token: token, validationErrors: req.flash('validationErrors') })
        } catch (error) {
            console.log(error)
        }
    }

})

server.post('/reset-password/:id/:token',
    check('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),

    check('password')
    .notEmpty().withMessage("Password field can not be empty")
    .isLength({ min: 8 }).withMessage('Password must be 8 characters long')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must include a special character')
    .matches(/[A-Z]/).withMessage('Password must include an uppercase letter'),

    async(req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const passwordValidationErrors = errors.array().map(error => error.msg);
            req.flash("validationErrors", passwordValidationErrors)
            res.redirect(`/reset-password/${req.params.id}/${req.params.token}`);
            return;
        }
        const { id, token } = req.params
        const { password, confirmPassword } = req.body
        const user = await db.User.findFirst({ where: { id: parseInt(id) } })
        if (!user) {
            console.log("invalid id")
            return;
        } else {
            console.log(user)
            const secret = JWT_SECRET + user.password
            try {
                const payload = jwt.verify(token, secret)
                const hash = await bcrypt.hash(password, SALT)
                await db.User.update({
                    where: {
                        id: parseInt(id),
                    },
                    data: {
                        password: hash,
                    },
                })
                return res.redirect('/login')

            } catch (error) {
                console.log(error)
            }
        }

    })




