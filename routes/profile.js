const express = require('express');
const router = express.Router();
const User = require('../models/user');

const { checkNotAuthenticated, checkAuthenticated, isVerify } = require('../middleware/authMiddleware');

router.get('/myprofile', checkAuthenticated, (req,res)=>{
    const userdata = {
        name: req.user.name, 
        email: req.user.email,
        roll: req.user.roll,
        interest: req.user.interest
    };
    res.render('profile', {userdata});
});

router.post('/myprofile', checkAuthenticated, async (req,res)=>{
    const {roll, interest } = req.body;
    const userinfo = {
        name: req.user.name,
        email: req.user.email,
        roll: roll,
        interest: interest
    }
    const usser = await User.findByIdAndUpdate(req.user._id, {
        $set :{
            roll : roll,
            interest : interest
        }
    });
    res.render('profile', {userinfo});
});

module.exports = router;
