const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = mongoose.model("User");

function initPassport(passport, getUserbyName) {

    const authenticateUser = async (name, password, done) => {
        const user = await getUserbyName(name);
        if (user == null) {
            return done(null, false, { message: "No user registered with this email" })
        }

        try {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                return done(null, user);
            }
            else {
                return done(null, false, { message: "Wrong username or password" });
            }

        } catch (error) {
            return done(error);
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'name' }, authenticateUser))

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
}

module.exports = initPassport;