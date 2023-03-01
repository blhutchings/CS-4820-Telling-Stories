/**
 * modular dependencies
 */
const express = require("express")
const router = express.Router()
const passport = require("passport")
const auth = require('./authenticate')


/**
 * routes that handle basic account functionality such as logging in and logging out, also redirects 
 * the user to their 'homepage' when they successfully login
 */
router.get('/homepage', auth.checkAuthenticated, async(req, res) => { //todo: rename to account/homepage? user/create?

    console.log("USER ID IS " + req.user.id)
    res.render("create.ejs", { name: req.user.firstName })
})


router.get('/login', auth.checkNotAuthenticated, (req, res)=>{ //
    res.render('login.ejs')
})

router.post('/login', auth.checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/account/homepage",
    failureRedirect: "/account/login",
    failureFlash: true
}))


router.delete("/logout", (req, res) => {
    req.logout(req.user, err => {
        if (err) return next(err)
        res.redirect("/")
    })
})






module.exports = router