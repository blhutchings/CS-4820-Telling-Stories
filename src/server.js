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
const { check, validationResult } = require("express-validator")
const server = express()
const sendEmail = require("../utils/email/sendEmail")
const { render } = require("ejs")
    //app.set('views', './src');
server.set('view engine', 'ejs');

const salt = bcrypt.genSaltSync(10);
const JWT_SECRET = process.env.JWT_SECRET
initializePassport(
    passport,
    async email => await db.User.findFirst({ where: { email } }),
    async id => await db.User.findFirst({ where: { id } })
)
const PAGE_SIZE = 8;
server.use('/public', express.static('public'));
// below line of code is to get the form data in req.body
server.use(express.urlencoded({ extended: false }))
server.use(flash())
server.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, // we want to resave the session variable if nothing is changed
    saveUninitialized: false
}))
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
    res.render('registration.ejs', { validationErrors: req.flash('validationErrors') })
})

server.post('/registration', checkNotAuthenticated,
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
        res.status(400).send("password does not match")
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const passwordValidationErrors = errors.array().map(error => error.msg);
            req.flash("validationErrors", passwordValidationErrors)
            res.redirect('/registration'); //todo
            return;
        }

        const { firstName, lastName, email, password } = req.body
        const encryptedPassword = await bcrypt.hashSync(password, salt)
        if (email && encryptedPassword) {
            try {
                const result = await db.User.create({
                    data: { email: email, password: encryptedPassword, firstName: firstName, lastName: lastName }
                })
                // console.log("firstName: " + firstName)
                // console.log("lastName: " + lastName)
                // console.log("email: " + email)
                // console.log("password: " + password)
                console.log(data)
                // Create a new UserRole object and connect it to the newly created User object.
                await db.UserRole.create({
                    data: { role: 'User', user: { connect: { id: result.id } } },
                });

                res.redirect("/login")
            } catch (error) {
                console.log(error)
                req.flash("error", "User is already registered. Please login.");
                //res.redirect("/registration") //todo, results in a 302 status redirection code
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

server.get('/users', checkAuthenticated, async(req, res) => {
    const page = parseInt(req.query.page) || 1
    const skip = (page - 1) * PAGE_SIZE
    const limit = PAGE_SIZE

    const count = await db.user.count()
    const totalPages = Math.ceil(count / PAGE_SIZE)

    try {
        const user = await db.User.findFirst({
            where: { id: req.user.id },
            include: { role: true },
        })

        //console.log(user)

        if (!user || user.role[0].role !== "Admin") {
            // req.flash("error", "You do not have access to view users.")
            res.render("unauthorized.ejs")
            return
        }


        const users = await db.user.findMany({
            skip: skip,
            take: limit,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
            },
        });

        console.log("users length is " + count)
        res.render("users.ejs", { users, page, totalPages });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

server.post('/users/:id/delete', async(req, res) => {
    const userId = parseInt(req.params.id);
    console.log(userId)
    try {
        // Find the user by ID
        const user = await db.user.findUnique({
            where: {
                id: userId,
            },
        });
        console.log(user);
        if (!user) {
            return res.status(404).send('User not found');
        }
        // Delete the user
        await db.user.delete({
            where: {
                id: userId,
            },
        });

        // Redirect to the list of users
        res.redirect('/users');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

server.get('/users/:id/edit', async(req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const user = await db.user.findUnique({
            where: {
                id: userId
            },
            include: {
                role: true
            }
        });
        console.log(user)
        if (!user) {
            return res.status(404).send('User not found');
        }

        res.render('edit-user', {
            user: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

server.post('/users/:id/edit', async(req, res) => {
    const { firstName, lastName, email, role } = req.body;
    const userId = parseInt(req.params.id);

    try {
        const updatedUser = await db.user.update({
            where: {
                id: userId
            },
            data: {
                firstName: firstName,
                lastName: lastName,
                email: email
            }
        });
        const updatedUserRole = await db.userRole.update({
            where: {
                id: userId
            },
            data: {
                role: role,
            },
        });

        req.flash('success', 'User updated successfully!');
        res.redirect('/users');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Failed to update user.');
        res.redirect('/users');
    }
});



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

module.exports = server