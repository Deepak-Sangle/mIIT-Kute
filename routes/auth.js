const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {JWT_SECURE} = require('../keys');
const passport = require("passport");
const { checkNotAuthenticated, checkAuthenticated, isVerify } = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');
// import { toast } from 'toast-notification-alert'

const router = express.Router();
const User = require('../models/user');
const Event = require('../models/event');

const confirmEmail = require('../nodemailer-config');

router.get('/', checkAuthenticated, async (req,res)=>{
    let allevents = await Event.find();
    var registeredevents = [];
    const user_emailid = req.user.email;
    allevents.forEach((event)=>{
        if(event.members.includes(user_emailid)){
            registeredevents.push({event : true});
        }
        else{
            registeredevents.push({event : false});
        }
    });
    res.render('homepage', {allevents, registeredevents, user_emailid});
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
                res.redirect('/signin');
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
    res.render('signin');
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
    res.redirect('/signin');
})

router.get('/verifying', (req,res)=>{
    res.render('verifying');    
});

module.exports = router;
