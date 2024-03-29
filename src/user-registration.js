/**
 * modular dependcies
 * todo: might have to import our db config into this file as well
 */
const express = require("express")
const router = express.Router()
const { check, validationResult } = require("express-validator")
const bcrypt = require("bcrypt")
const auth = require('./authentication')
const db = require("./config/database")

/**
 * config
 */
const SALT = bcrypt.genSaltSync(10);


/**
 * code to handle any requests to the 'registration' route
 */
router.get('/', auth.checkNotAuthenticated, (req, res) => {
    res.render('registration.ejs', { validationErrors: req.flash('validationErrors') })
})

router.post('/', auth.checkNotAuthenticated,
    check('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            console.log('passwords dont match')
            throw new Error('Passwords do not match');
        }
        return true;
    }),

    check('password')
        .notEmpty().withMessage("Password field can not be empty")
        .isLength({ min: 8 }).withMessage('Password must be 8 characters long')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must include a special character')
        .matches(/[A-Z]/).withMessage('Password must include an uppercase letter'),

    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const passwordValidationErrors = errors.array().map(error => error.msg);
            req.flash("validationErrors", passwordValidationErrors) //todo, currenlty breaking registration page
            res.redirect('/registration');
            return;
        }

        const { firstName, lastName, email, password } = req.body
        const encryptedPassword = bcrypt.hashSync(password, SALT)

        if (email && encryptedPassword) {
            try {
                // Create User
                await db.User.create({
                    data: {
                        email: email,
                        password: encryptedPassword,
                        firstName: firstName,
                        lastName: lastName,
                        UserRole: {
                            create: {
                                role: 'User'
                            }
                        }
                    }
                })

                req.flash("passwordReset", "User created. Please login.");
                res.redirect("/account/login")
            } catch (error) {
                console.error(error)
                req.flash("error", "User is already registered. Please login.");
                res.redirect("/registration")
            }
        }
    })


module.exports = router