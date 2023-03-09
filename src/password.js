
/**
 * modular dependcies
 * todo: may have to import db var as well
 */
const express = require("express")
const router = express.Router()
const { check, validationResult } = require("express-validator")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const sendEmail = require("../utils/email/sendEmail") 
const db = require("./config/database")


/**
 * config
 */
const SALT = bcrypt.genSaltSync(10);
const JWT_SECRET = process.env.JWT_SECRET



/**
 * working code, handles requests to root route /password, handles both 'forgot-password' and 'reset-password'
 * renamed to 'forgot' and 'reset' respectivly 
 */
router.get('/forgot', async(req, res) => { //rnamed from /forgot-password, now accessible via /password/forgot
    res.render('forgotPassword.ejs')
})

router.post('/forgot', async(req, res) => {
    const { email } = req.body

    const user = await db.User.findFirst({ where: { email } })

    if (!user) {
        req.flash("error", "Email is not registered")
        res.redirect("/password/forgot")
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
            const resetLink = `localhost:8080/password/reset/${user.id}/${token}`//TODO: change local host to domain name
            console.log(resetLink)
            const resetEmailPayload = {
                name: user.firstName,
                link: resetLink
            }
            sendEmail(user.email, "Reset Password", resetEmailPayload, "views/partial/_emailPasswordResetRequest.ejs")
            req.flash("success", "A password reset link has been sent to your email.")
            res.redirect("/password/forgot")
            //res.redirect('/reset-password')
        } catch (error) {
            console.log(error)
        }

    }
})

router.get('/reset/:id/:token', async(req, res) => { //renamed from /reset-password/:id/:token, now accessible via /password/reset/:id/:token
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

router.post('/reset/:id/:token',
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





module.exports = router