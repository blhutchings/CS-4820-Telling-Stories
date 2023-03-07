
/**
 * modular dependancies
*/
const express = require("express")
const server = express()
//const render  = require("ejs") //todo, not sure if this is needed in this file
const flash = require("express-flash")
const session = require("express-session")
const passport = require("passport")
//const { check, validationResult } = require("express-validator") //todo, not sure if this is needed in this file
const methodOverride = require("method-override")
//const sendEmail = require("../utils/email/sendEmail") //todo, not sure if this is needed in this file
const rateLimit = require('express-rate-limit')

const { Prisma } = require("@prisma/client") //TODO: is this needed/being used here, also see database.js
const { application } = require("express") //TODO: is this being used?



const ip = require('../utils/getPublicIp')
const auth = require('./authenticate')
const regestrationRoute = require('./registration')
const usersRoute = require('./users')
const accountRoute = require('./account')
const passwordRoute = require('./password')
const initializePassport = require("./config/passport")
const db = require("./config/database")
server.set('view engine', 'ejs');



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
const limiter = rateLimit({
    windowMs: 1*60*1000, //1 minute
    max: 10
})
//server.use(limiter) //todo, enable, currently disabled to test something
server.set('views', './views')
server.set('view engine', 'ejs')
server.use('/public', express.static('public')) //TODO: may be expressed/condensed as app.use(express.static('public')) see here: https://expressjs.com/en/starter/static-files.html
server.use(express.urlencoded({ extended: false }))
server.use(flash())
server.use(passport.initialize())
server.use(passport.session())
server.use(methodOverride("_method"))
async function main() {
    const PORT = 8080

    server.listen(PORT, function() {
        console.log(`Server started on port ${PORT}...`)
    })

}
server.get('/', async(req, res) => {
    res.render("index.ejs")
})

server.get('/create', checkAuthenticated, async(req, res) => {

    console.log("USER ID IS " + req.user.id)
    res.render("content-create.ejs", { name: req.user.firstName })

})

server.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})
server.post('/login', checkNotAuthenticated, passport.authenticate("local", {

    successRedirect: "/homepage",
    failureRedirect: "/login",
    failureFlash: true
}))
server.get('/registration', checkNotAuthenticated, (req, res) => {
    res.render('registration.ejs', { validationErrors: req.flash('validationErrors') })
})


server.post('/registration', checkNotAuthenticated,
    check('confirmPassword').custom((value, { req }) => {

        
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true
   
    }),

    check('password')
    .notEmpty().withMessage("Password field can not be empty")
    .isLength({ min: 8 }).withMessage('Password must be 8 characters long')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must include a special character')
    .matches(/[A-Z]/).withMessage('Password must include an uppercase letter'),

    async(req, res) => {
          res.status(400).send("password does not match")
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const passwordValidationErrors = errors.array().map(error => error.msg);
            console.log(passwordValidationErrors) //debugging purposes
            req.flash("error", passwordValidationErrors) //previously  req.flash("validationErrors", passwordValidationErrors)
            res.redirect('/registration');

            return;
        }

        const { firstName, lastName, email, password } = req.body
        const encryptedPassword = await bcrypt.hashSync(password, salt)
        if (email && encryptedPassword) {
            try {
                const result = await db.User.create({
                    data: { email: email, password: encryptedPassword, firstName: firstName, lastName: lastName }
                })
                console.log("firstName: " + firstName)
                console.log("lastName: " + lastName)
                console.log("email: " + email)
                console.log("password: " + password)
                // Create a new UserRole object and connect it to the newly created User object.
                await db.UserRole.create({
                    data: { role: 'User', user: { connect: { id: result.id } } },
                });

                res.redirect("/login")
            } catch (error) {
                console.log(error)
                req.flash("error", "User is already registered. Please login.");
                res.redirect("/registration")//todo, results in a 302 status redirection code

            } finally {
                await db.$disconnect();
            }

        }
    })

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
                const hash = await bcrypt.hash(password, salt)
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

    server.get('/homepage', async(req, res) => {
        res.render('homepage.ejs')
    })


server.get('/users', checkAuthenticated, async(req, res) => {
    const page = parseInt(req.query.page) || 1
    const skip = (page - 1) * PAGE_SIZE
    const limit = PAGE_SIZE

    const count = await db.user.count()
    const totalPages = Math.ceil(count / PAGE_SIZE)

//ip() //posts our public IP to the console












