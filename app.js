require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const session = require("express-session");
const passport = require("passport");
const flash = require("express-flash");
const PORT = process.env.PORT || 3000;
const User = require('./models/user');
const path = require('path');
var methodOverride = require('method-override')

//Requiring all the Schema models
require('./models/interest');
require('./models/event');

// const customMiddleware = (req,res,next)=>{
//     console.log("In Middleware");
//     next();
// }

//Setting the view Engine
app.set('view engine','ejs');

//Database Connection
mongoose.connect(process.env.MONGOURI);

mongoose.connection.on('connected',()=>{
    console.log("Database connection On");
});
mongoose.connection.on('error',(err)=>{
    console.log("Error Connecting: ", err);
});

//Middleware
// app.use(customMiddleware);
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


const {checkAuthenticated, checkNotAuthenticated} = require("./middleware/authMiddleware");
const initPassport = require('./passport-config');
initPassport(passport, (name) => {
    return User.findOne({ name });
});


// session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//Route Requests
app.use(require('./routes/auth'));
app.use(require('./routes/interest'));
app.use(require('./routes/event'));
app.use(require('./routes/profile'));
app.use((req,res,next)=>{
    res.render('404')
});
//App Listening on port
app.listen(PORT, ()=>{
    console.log("Server running on port", PORT)
});
