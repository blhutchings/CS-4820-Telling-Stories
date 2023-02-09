if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

const express = require("express")
const db = require("./config/database")
const bcrypt = require("bcrypt")
const { Prisma } = require("@prisma/client")
const initializePassport = require("./config/passport")
const flash = require("express-flash")
const session = require("express-session")
const { application } = require("express")
const passport = require("passport")
const methodOverride = require("method-override")
const jwt = require("jsonwebtoken")
const server = express()
    //app.set('views', './src');
    //app.set('view engine', 'ejs');

const salt = bcrypt.genSaltSync(10);
initializePassport(
    passport,
    // email => users.find(u => u.email === email),
    // id => users.find(u => u.id === id)
    async email => await db.User.findFirst({ where: { email } }),
    async id => await db.User.findFirst({ where: { id } })
)
server.use('/public', express.static('public'));
// below line of code is to get the form data in req.body
server.use(express.urlencoded({ extended: false }))
server.use(flash())
server.use(session({
    //secret: process.env.SESSION_SECRET,
    secret: "sami1234",
    resave: false, // we want to resave the session variable if nothing is changed
    saveUninitialized: false
}))
server.use(passport.initialize())
server.use(passport.session())
server.use(methodOverride("_method")) //https://stackoverflow.com/questions/23643694/whats-the-role-of-the-method-override-middleware-in-express-4 
server.use(express.json()) // enables our server to parse incoming requests with JSON payloads, read here: https://www.geeksforgeeks.org/express-js-express-json-function/

async function main() {
    const PORT = 8080

    server.listen(PORT, function() {
        console.log(`Server started on http://localhost:${PORT}...`)
    })
}
server.get('/', async(req, res) => {
    res.render("index.ejs")
})

server.get('/create', checkAuthenticated, async(req, res) => {

    console.log(req.user.email)
    res.render("create.ejs", { name: req.user.firstName })
})

server.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})
server.post('/login', checkNotAuthenticated, passport.authenticate("local", {

    successRedirect: "/create",
    failureRedirect: "/login",
    failureFlash: true
}))
server.get('/registration', checkNotAuthenticated, (req, res) => {
    res.render('registration.ejs')
})

server.post('/registration', checkNotAuthenticated, async(req, res) => {
    const { firstName, lastName, email, password } = req.body
    //console.log(req.body) //debugging
    const encryptedPassword = await bcrypt.hashSync(password, salt)
    if (email && encryptedPassword) {
        try {
            const result = await db.User.create({
                data: { email: email, password: encryptedPassword, firstName: firstName, lastName: lastName }
            })
            res.redirect("/login")
        } catch (error) {
            console.log(error)
            req.flash("error", "User is already registered. Please login.");
            res.redirect("/registration")
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

/*

THIS IS MY CURRENT WORK


*/
const nodemailer = require("nodemailer")
//check if const and let are correct

server.post('/forgot-password', async(req, res) => {
    const { email } = req.body
    console.log(req.body)

    const userInfo = await db.User.findFirst({ where: { email } })
    console.log(userInfo)
    if (!userInfo) {
        req.flash("error", "There is no account associated with that email")
        res.redirect("/forgot-password")
            //res.send('User is not registered')
    }
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    })
    let mailOptions = {
        from: process.env.EMAIL,
        to: process.env.EMAIL, //user email you are sending to
        subject: "testing swe app",
        html: "<h1>hello!!1!</h1>"
    }
    transporter.sendMail(mailOptions, (err, info) => {
        if(err){
            console.log(err)
        }else{
            console.log("email was sent!")
        }
    })

    

})

server.get('/reset-password', async(req, res) => {
    res.render("forgotPassword.ejs")
})

server.post('/reset-password', async(req, res) => {
    res.render("forgotPassword.ejs")
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect("/login")
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/create")
    }
    next()
}
main();