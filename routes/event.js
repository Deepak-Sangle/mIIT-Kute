const express = require('express');
const mongoose = require('mongoose');
const { SUPER_USER_ID } = require('../keys');
const { checkAuthenticated } = require('../middleware/authMiddleware');
const requireLogin = require('../middleware/requireLogin');

const router = express.Router();
const Event = require('../models/event');

router.get('/allevents',(req,res)=>{
    Event.find()
        .then((post)=>{
            res.json({Event: post});
        })
        .catch((err)=> console.log(err));
});

router.post('/createevent', requireLogin, (req,res)=>{
    const {name,location,detail,interest,startAt,endAt} = req.body;
    if(!name || !location || !detail || !interest || !startAt || !endAt) {
        return res.status(422).json({Error: "Error: Add all fields"});
    }
    // if(req.user._id!=SUPER_USER_ID){
    //     return res.json({Error: "You are not Super User"});
    // }
    const event = new Event({
        name,location,detail,interest,startAt,endAt
    });
    event.save()
        .then((result)=>{
            res.json({Status: "Succesfully created new event"});
        })
        .catch((err)=> console.log(err));

});

router.put('/joinevent/:id', checkAuthenticated, isAlreadyExist, async (req,res)=>{
    const email = req.user.email;
    const event = await Event.findByIdAndUpdate(req.params.id, {
        $push : {
            members : email
        }
    });
    res.redirect('/');
});

router.get('/search', (req,res)=>{
    res.render('search');
});

router.get('/myevents', checkAuthenticated, async (req,res)=>{
    const allevents = await Event.find();
    var events = [];
    const user = req.user.email;
    allevents.forEach((event)=>{
        if(event.members.includes(user)){
            events.push(event);
        }
    });
    res.render('myevents', {events});
});

async function isAlreadyExist(req, res, next) {
    const checkingEvent = await Event.findById(req.params.id);
    const isExist = checkingEvent.members.includes(req.user.email);
    if(isExist) {
        //Need to remove the req.user.email element from event.members array 
        const abc = await Event.findByIdAndUpdate(req.params.id, {
            $pull : {
                members : req.user.email
            }
        });
        res.redirect('/');
    }
    else {
        return next();
    }
}

module.exports = router;