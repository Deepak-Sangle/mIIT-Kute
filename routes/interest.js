const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const Interest = mongoose.model("Interest");

const requireLogin = require('../middleware/requireLogin');

router.post('/createinterest', requireLogin,(req,res)=>{
    const {title, body} = req.body;
    if(!title || !body){
        return res.status(422).json({Error: "Error: Add all fields"});
    }
    const interest = new Interest({
        title,
        body,
        postedBy: req.user._id
    });
    interest.save()
        .then((result)=>{
            res.json({Success: "Interest Saved Succesfully"});
        })
        .catch((err)=> console.log(err));
})

module.exports = router;
