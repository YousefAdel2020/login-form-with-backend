const LocalStrategy = require("passport-local").Strategy;
const bycrypt = require('bcrypt');

const f = (passport, con) => {
    passport.use(new LocalStrategy({
            usernameField: 'email'
        },
        (username, password, done) => { //username and password in body of login
            con.query(
                `SELECT username,email,password FROM users WHERE email='${username}'`,
                (err, result) => { //check if the username is in database
                    if (err) {
                        return done(err);
                    } else if (!result[0]) {
                        return done(null, false);
                    } else {
                        //if it in database check if the password is equal
                        bycrypt.compare(password, result[0].password, (err, bool) => {
                            if (err) return done(err);
                            else {
                                if (!bool) {
                                    return done(null, false);
                                } else {
                                    return done(null, result[0]);
                                }
                            }
                        });
                    }
                }
            );
        }));

    passport.serializeUser((user, done) => {

        done(null, user.username);
    });
    passport.deserializeUser((username, done) => {

        con.query(
            `SELECT username,email,password FROM users WHERE username='${username}'`, (err, result) => {
                if (err) {
                    return done(err);
                } else if (!result[0]) {
                    return done(null, false);
                } else {


                    return done(null, result[0]);

                }
            }
        );


    });



};
module.exports = f;