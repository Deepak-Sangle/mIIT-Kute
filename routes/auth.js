const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require("passport");
const { checkNotAuthenticated, checkAuthenticated, isVerify } = require('../middleware/authMiddleware');
const router = express.Router();
const User = require('../models/user');
const Event = require('../models/event');
const confirmEmail = require('../nodemailer-config');

require("dotenv").config();

router.get('/', checkAuthenticated, isVerify,async (req,res)=>{
    if(req.user.confirmationCode==process.env.SECRET_ADMIN){
        res.render('secret');
        return;
    }
    let allevents = await Event.find();
    const user_emailid = req.user.email;
    res.render('homepage', {allevents, user_emailid});
});

router.get('/signup', checkNotAuthenticated, (req,res)=>{
    res.render('signup');
});

router.post('/signup', async (req, res) => {
    const characters = 'fjlkadslk9nvouhfjnwrqjofan2rfnv879524hfhhvhgjl;54[j}91!fdslkarurowvnpcroipsejo';
    let token = '';
    for (let i = 0; i < 25; i++) {
        token += characters[Math.floor(Math.random() * characters.length )];
    }
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
        name,
        email,
        password: hashedPassword,
        confirmationCode: token
    });
    User.findOne({email:email})
        .then((savedUser)=>{
            if(savedUser){
                res.render('signin',{isRedirected: true});
                // res.status(422).send("User Already Exists");
                return ;
            }
            else{
                user.save((err) => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }
                    confirmEmail(
                        user.name,
                        user.email,
                        user.confirmationCode
                    );
                    res.redirect('/verifying');
                });         
            }
        })
        .catch((err)=> console.log(err));
});

router.get("/signin", checkNotAuthenticated, (req, res) => {
    res.render('signin',{isRedirected: false});
});

router.post('/signin', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/signin',
    failureFlash: true
}));

router.get("/api/auth/confirm/:code", (req, res) => {
    User.findOne({
        confirmationCode: req.params.code,
    })
        .then((user) => {
            if (!user) {
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
});

router.delete('/signout', (req, res) => {
    req.logOut();
    res.render('signin', {isRedirected: false});
})

router.get('/verifying', (req,res)=>{
    res.render('verifying');    
});

// router.get('/forgot', checkNotAuthenticated, (req,res)=>{
//     res.render('forgot');
// });

// router.post('/forgot', checkNotAuthenticated, (req,res)=>{
//     res.render('verifying');
// });

module.exports = router;
