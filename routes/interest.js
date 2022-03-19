const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const Interest = mongoose.model("Interest");
const { checkAuthenticated } = require('../middleware/authMiddleware');


router.post('/createinterest', checkAuthenticated, async (req,res)=>{
    const allsuggestion = await Interest.find(); 
    const {title, body} = req.body;
    const interest = new Interest({
        title,
        body,
        likes: 0
    });
    interest.save()
        .then((result)=>{
            res.render('community', {allsuggestion});
        })
        .catch((err)=> console.log(err));
});

router.get('/community', async (req,res)=>{
    const allsuggestion = await Interest.find(); 
    res.render('community', {allsuggestion});
});

router.post('/liked/:id', async (req,res)=>{
    const interst = await Interest.findByIdAndUpdate(req.params.id, {
        $inc : {
            likes : 1
        }
    });
    res.redirect('back');
})

module.exports = router;
