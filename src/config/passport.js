const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcryptjs")


function initialize(passport, getUserByEmail, getUserById) {
    // Function to authenticate users
    const authenticateUsers = async(email, password, done) => {
        // Get users by email
        const user = await getUserByEmail(email)
        console.log("User password is " + typeof password)
        if (user == null) {
            console.log("user null;;;lllll")
            return done(null, false, { message: "User is not registered" })
        }
        try {
            // bcrypt.compare(password, user.password, function(err, result) {
            //         if (err) {
            //             console.log(err);
            //             return done(null, false, { message: "Wrong credential(s)" })
            //         } else {
            //             console.log("passwords match!");
            //             return done(null, user)
            //         }
            //     })
            const isMatch = await bcrypt.compare(password.trim(), user.password)
            if (isMatch) {
                return done(null, user)
            } else {
                console.log("wrong password")
                console.log("password--> " + password)
                console.log("db password--> " + user.password)
                return done(null, false, { message: "Wrong credential(s)" })
            }
        } catch (e) {
            console.log(e);
            return done(e)
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUsers))
    passport.serializeUser((user, done) => {
        console.log(`---------------> Serialize User`)
        console.log(user)
        done(null, user.id)
    })
    passport.deserializeUser((id, done) => {
        console.log("---------> Deserialize Id")
        console.log(id)
        return done(null, getUserById(id))
    })
}

module.exports = initialize