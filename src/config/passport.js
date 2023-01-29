const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt")


function initialize(passport, getUserByEmail, getUserById) {
    // Function to authenticate users
    const authenticateUsers = async(email, password, done) => {
        // Get users by email
        const user = await getUserByEmail(email)
        console.log(user)
        if (user == null) {
            return done(null, false, { message: "User is not registered" })
        }
        try {
            bcrypt.compare(password, user.password, function(err, result) {
                if (err) {
                    console.log(err);
                }
                if (result) {
                    console.log("passwords matched!");
                    return done(null, user)
                } else {
                    console.log("wrong password")
                    return done(null, false, { message: "Wrong credential(s)" })
                }
            })
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
    passport.deserializeUser(async(id, done) => {
        console.log("---------> Deserialize Id")
        console.log(id)
        const user = await getUserById(id)
        return done(null, user)
    })
}

module.exports = initialize