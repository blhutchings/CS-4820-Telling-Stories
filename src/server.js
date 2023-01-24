if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

const express = require("express")
const db = require("./config/database")
const bcrypt = require("bcryptjs")
const { Prisma } = require("@prisma/client")
const initializePassport = require("./config/passport")
const flash = require("express-flash")
const session = require("express-session")
const { application } = require("express")
const passport = require("passport")
const server = express()
    //app.set('views', './src');
    //app.set('view engine', 'ejs');

initializePassport(
    passport,
    async email => await db.user.findFirst({ where: { email } }),
    async id => await db.user.findFirst({ where: { id } })
)

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


async function main() {
    const PORT = 8080

    server.listen(PORT, function() {
        console.log(`Server started on port ${PORT}...`)
    })
}

server.get('/', async(req, res) => {
    res.render("index.ejs")
})

server.get('/login', (req, res) => {
    res.render('login.ejs')
})
server.post('/login', passport.authenticate("local", {

    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}))
server.get('/registration', (req, res) => {
    res.render('registration.ejs')
})

server.post('/registration', async(req, res) => {
    console.log(req.body)
    const salt = bcrypt.genSaltSync(10);
    const encryptedPassword = bcrypt.hashSync(req.body.password.toString().trim(), salt)

    console.log("Encrypted password is: " + encryptedPassword)

    const { firstName, lastName, email } = req.body
    console.log(firstName, lastName, email, encryptedPassword)
    if (email && encryptedPassword) {
        try {
            //db.promise().query(`INSERT INTO user (email, password, firstName, lastName) VALUES('${email}','${encryptedPassword}','${firstName}','${lastName}')`)
            const result = await db.user.create({
                data: { email: email, password: encryptedPassword, firstName: firstName, lastName: lastName }
            })
            console.log(result);
            //res.status(201).send({ message: "User is created" })
            res.redirect("/login")
        } catch (error) {
            console.log(error)
            res.redirect("/registration")
        } finally {
            await db.$disconnect();
        }

    }
})
main();