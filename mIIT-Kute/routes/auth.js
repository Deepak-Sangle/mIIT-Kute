const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {JWT_SECURE} = require('../keys');
const requireLogin = require('../middleware/requireLogin');
const passport = require("passport");
const { checkNotAuthenticated, checkAuthenticated, isVerify } = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');

const router = express.Router();
const User = require('../models/user');

const confirmEmail = require('../nodemailer-config');

router.get('/', checkAuthenticated,  (req,res)=>{
    console.log("Inside Router request of /")
    res.send("Something");
    
});

router.post('/signup', checkNotAuthenticated, async (req, res) => {
    const characters = 'fjlkadslk9nvouhfjnwrqjofan2rfnv879524hfhhvhgjl;54[j}91!fdslkarurowvnpcroipsejo';
    let token = '';
    for (let i = 0; i < 25; i++) {
        token += characters[Math.floor(Math.random() * characters.length )];
    }
    const { name, email, password } = req.body;

    User.findOne({email:email})
        .then((savedUser)=>{
            if(savedUser){
                res.redirect('/signin');
                console.log("HEHE")
                // res.status(422).send("User Already Exists");
                return ;
            }
            else{
                try {
                    console.log("WHY")
                    const hashedPassword = bcrypt.hash(password, 12);
                    const user = new User({
                        name,
                        email,
                        password: hashedPassword,
                        confirmationCode: token
                    });
                    user.save((err) => {
                        if (err) {
                            res.status(500).send({ message: err });
                        return;
                    }
                    // res.send({
                    //     message: "User was registered successfully! Please check your email",
                    // });
                    confirmEmail(
                        user.name,
                        user.email,
                        token
                        );
                    });
                } 
                catch (error) {
                    console.log(error);
                    res.redirect('/signup');
                }
            }
        })
        .catch((err)=> console.log(err));
});

// router.post('/signin', (req,res)=>{
//     const {name, password} = req.body;
//     if(!name || !password){
//         res.statusCode=422;
//         return res.status(422).send("Error: Add all fields");
//     }
//     User.findOne({name:name})
//         .then((savedUser)=>{
//             if(!savedUser){
//                 return res.status(422).send("User Doesn't Exists");
//             }
//             bcrypt.compare(password,savedUser.password)
//                 .then((doMatched)=>{
//                     if(doMatched){
//                         const token = jwt.sign({_id: savedUser._id}, JWT_SECURE);
//                         console.log(token);
//                         res.json({Success: "Sign In Succesfully"});
//                     }
//                     else{
//                         res.status(422).json({Error: "Wrong Password"});
//                     }
//                 });
//         })
//         .catch((err)=> console.log(err));
// });

router.get("/signin", checkNotAuthenticated, (req, res) => {
    res.send("signin page")
});

router.post('/signin', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/signin',
    failureFlash: false
}))

router.get("/api/auth/confirm/:code", (req, res) => {
    User.findOne({
        confirmationCode: req.params.code,
    })
        .then((user) => {
            if (!user) {
                console.log("!user");
                return res.status(404).send({ message: "User Not found." });
            }
            user.status = "Active";
            user.save((err) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
            });
            res.redirect('/');
        })
        .catch((e) => console.log("error", e));
})

router.get('/delete', (req,res)=>{
    res.send("Deleted");
    User.deleteMany({});
})

module.exports = router;
