const express = require('express');
const router = express.Router();
const User = require('../models/user');

const { checkNotAuthenticated, checkAuthenticated, isVerify } = require('../middleware/authMiddleware');

router.get('/myprofile', checkAuthenticated, (req,res)=>{
    const userdata = {
        name: req.user.name, 
        email: req.user.email,
        roll: req.user.roll,
        Name: req.user.Name,
        interest1: req.user.interest1,
        interest2: req.user.interest2,
        interest3: req.user.interest3,
        interest4: req.user.interest4,
        interest5: req.user.interest5
    };
    res.render('profile', {userdata});
});

router.put('/editprofile', checkAuthenticated, async (req,res)=>{
    const {Name, roll, interest1, interest2, interest3, interest4, interest5 } = req.body;
    const userdata = {
        name: req.user.name,
        email: req.user.email,
        roll: roll,
        Name: Name,
        interest1: interest1,
        interest2: interest2,
        interest3: interest3,
        interest4: interest4,
        interest5: interest5
    }
    const usser = await User.findByIdAndUpdate(req.user._id, {
        $set :{
            roll : roll,
            interest1 : interest1,
            interest2 : interest2,
            interest3 : interest3,
            interest4 : interest4,
            interest5 : interest5
        }
    });
    res.render('profile', {userdata});
});



router.get('/editprofile', checkAuthenticated, (req,res)=>{
    const userdata = {
        name: req.user.name, 
        email: req.user.email,
        roll: req.user.roll,
        Name: req.user.Name,
        interest1: req.user.interest1,
        interest2: req.user.interest2,
        interest3: req.user.interest3,
        interest4: req.user.interest4,
        interest5: req.user.interest5
    };
    res.render('editprofile', {userdata});
})

module.exports = router;
