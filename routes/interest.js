const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const Interest = mongoose.model("Interest");
const { checkAuthenticated, isVerify } = require('../middleware/authMiddleware');

router.get('/createinterest', checkAuthenticated, isVerify, async (req,res)=>{
    res.render('create_interest');
});

router.post('/createinterest', checkAuthenticated, isVerify, async (req,res)=>{
    const allsuggestion = await Interest.find(); 
    const {title, body} = req.body;
    const interest = new Interest({
        title,
        body,
        likes: 0,
        whoSuggested: req.user.name
    });
    interest.save()
        .then((result)=>{
            res.redirect('/community');
        })
        .catch((err)=> console.log(err));
});

router.get('/community', checkAuthenticated, isVerify, async (req,res)=>{
    const allsuggestion = await Interest.find();
    const user_emailid = req.user.email;
    res.render('community', {allsuggestion, user_emailid});
});

router.put('/liked/:id', checkAuthenticated ,isVerify, async (req,res)=>{
    const checkingInterest = await Interest.findById(req.params.id);
    const user_emailid = req.user.email;
    const isExist = checkingInterest.whoLiked.includes(user_emailid);
    if(!isExist){
        const interst = await Interest.findByIdAndUpdate(req.params.id, {
            $inc : {
                likes : 1
            },
            $push : {
                whoLiked : user_emailid
            }
        });
    }
    else{
        const interst = await Interest.findByIdAndUpdate(req.params.id, {
            $inc : {
                likes : -1
            },
            $pull : {
                whoLiked : user_emailid
            }
        });
    }
    res.redirect('back');
});

router.get('/deleteinterest', checkAuthenticated, isVerify, async (req,res)=>{
    const allsuggestion = await Interest.find();
    const user_emailid = req.user.email;
    res.render('delete_interest', {allsuggestion,user_emailid});
});

router.delete('/deleteinterest/:id', checkAuthenticated,isVerify, async (req,res)=>{
    const interest = await Interest.findByIdAndDelete(req.params.id);
    res.redirect('/deleteinterest');
});

module.exports = router;
