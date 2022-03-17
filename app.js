require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const session = require("express-session");
const passport = require("passport");
const flash = require("express-flash");
const PORT = 3000;
const User = require('./models/user');

//Requiring all the Schema models
// require('./models/user');
require('./models/interest');
require('./models/event');

// const customMiddleware = (req,res,next)=>{
//     console.log("In Middleware");
//     next();
// }

//Database Connection
mongoose.connect(process.env.MONGOURI);

mongoose.connection.on('connected',()=>{
    console.log("Database connection On");
})
mongoose.connection.on('error',(err)=>{
    console.log("Error Connecting: ", err);
})

//Middleware
// app.use(customMiddleware);
app.use(express.json());

const {checkAuthenticated, checkNotAuthenticated} = require("./middleware/authMiddleware");
const initPassport = require('./passport-config');
initPassport(passport, (name) => {
    return User.findOne({ name });
});


// session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());



//Route Requests
app.use(require('./routes/auth'));
app.use(require('./routes/interest'));
app.use(require('./routes/event'));

//App Listening on port
app.listen(PORT, ()=>{
    console.log("Server running on port", PORT)
})
