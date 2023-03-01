exports.checkAuthenticated = function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect("/account/login")
}

exports.checkNotAuthenticated = function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/account/homepage")
    }
    next()
}