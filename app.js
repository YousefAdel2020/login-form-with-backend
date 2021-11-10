const express = require('express');
const bodyparser = require('body-parser');
const path = require('path');
const mysql = require('mysql');
const bycrypt = require('bcrypt');
const session = require('express-session');
const passport = require('passport');
const mysqlstore = require('express-mysql-session')(session);
const localstrategy = require('passport-local').Strategy;
const dotenv = require('dotenv').config();
const { port, host, user, password, database } = require('./config/config');
const initializePassport = require('./config/passport-config');

const con = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: database
});

con.connect((err) => {
    if (err)
        console.log(err);
    else {
        console.log("connected!!!!!!!!!!");
        /*
        con.query("CREATE DATABASE login", (err, result) => {
            if (err)
                console.log(err);
            else {
                console.log('create database');
            }
        });
        

        con.query("CREATE TABLE users(username varchar(255) primary key,email varchar(255),password varchar(255))", (err, result) => {
            if (err)
                console.log(err);
            else {
                console.log('create table');
            }
        });

*/

    }
});



const app = express();



initializePassport(passport, con); //pass passport and con to passport-config file


app.use(session({
    name: 'sessionid',
    secret: 'thesecret',
    saveUninitialized: false, //do not create session for not logged in users
    resave: false, //do not save session if unmodify
    store: new mysqlstore({
        host: host,
        user: user,
        password: password,
        database: database
    }),

    cookie: {
        secure: false,
        httpOnly: false, //if true it will disallow javascript from reading cookie data
        expires: new Date(Date.now() + (60 * 60 * 1000)) //3 sec
    }


}));




app.use(passport.initialize());
app.use(passport.session());



app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'yousef')));
app.set("view engine", "ejs");




app.get("/signin", (req, res) => {

    console.log('sign in');
    res.render('sign in');

});
app.get("/signup", (req, res) => {

    console.log(req.user);
    console.log('sign up');
    res.render('sign up');

});

app.get("/home", (req, res) => {
    /*if (req.isAuthenticated())
        res.render('page', { data: { loggedIn: true, username: result[0].username } });
    else*/
    res.render('page', { data: { username: req.user ? req.user.username : null } });

});




app.get("/logout", (req, res) => {
        req.logOut();
        res.redirect('/home');
    })
    /*
    app.post('/signin', (req, res) => {

        console.log(req.body);

        con.query(`SELECT username,email,password FROM users WHERE email='${req.body.email}'`, (err, result) => {
            if (err)
                console.log(err);
            else {
                bycrypt.compare(req.body.password, result[0].password, (err, bool) => {
                    if (err)
                        console.log(err);
                    else {
                        if (bool) { res.send(`hello ${result[0].username}`); } else
                            res.send('the password is wrong');

                    }


                });

            }
        });



    });
    */

app.post('/signin',
    passport.authenticate('local', {
        successRedirect: '/home',
        failureRedirect: '/signin'
    }));

app.post('/signup', (req, res) => {

    console.log(req.body);
    bycrypt.hash(req.body.password, 13, (err, hash) => {
        con.query(`INSERT INTO users (username, email, password) values ('${req.body.username}', '${req.body.email}', '${hash}')`, (err, result) => {
            if (err)
                console.log(err);
            else
                console.log('data inserted!');
        });
        res.redirect("/signin");

    });


});



app.listen(port);