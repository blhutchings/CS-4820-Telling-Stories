const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt")


function initialize(passport, getUserByEmail, getUserWithRoles) {

    // Function to authenticate users
    const authenticateUsers = async (email, password, done) => {
        // Get users by email
        const user = await getUserByEmail(email)
        if (user == null) {
            return done(null, false, { message: "User is not registered" })
        }
        try {
            bcrypt.compare(password, user.password, function (err, result) {
                if (err) {
                    console.log(err);
                }
                if (result) {
                    // OK
                    return done(null, user)
                } else {
                    // Wrong password
                    return done(null, false, { message: "Wrong credential(s)" })
                }
            })
        } catch (e) {
            return done(e)
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUsers))

    passport.serializeUser((user, done) => {
        done(null, user.id);
    })

    passport.deserializeUser(async (id, done) => {
        const user = (await getUserWithRoles(id));
        user.UserRole = user.UserRole?.map(role => role.role) || [];
        user['id'] = `${user.id}`; // Needs to be a string
        user['name'] = user.firstName + ' ' + user.lastName;
        if (user.UserRole.includes("Admin")) {
            user['canInstallRecommended'] = true;
            user['canUpdateAndInstallLibraries'] = true;
            user['canCreateRestricted'] = true;
        } else {
            user['canInstallRecommended'] = true;
            user['canUpdateAndInstallLibraries'] = false;
            user['canCreateRestricted'] = false;
        }
        user['type'] = "local";
        return done(null, user);
    })
}

module.exports = initialize