const express = require('express');
const mongoose = require('mongoose');
const { SUPER_USER_ID } = require('../keys');
const requireLogin = require('../middleware/requireLogin');

const router = express.Router();
const Event = mongoose.model("Event");

router.get('/allevents',(req,res)=>{
    Event.find()
        .then((post)=>{
            res.json({Event: post});
        })
        .catch((err)=> console.log(err));
});

router.get('/myevents', (req,res)=>{
    //Need To do this
});

router.post('/createevent', requireLogin, (req,res)=>{
    const {name,location,detail,interest,startAt,endAt} = req.body;
    if(!name || !location || !detail || !interest || !startAt || !endAt) {
        return res.status(422).json({Error: "Error: Add all fields"});
    }
    if(req.user._id!=SUPER_USER_ID){
        return res.json({Error: "You are not Super User"});
    }
    const event = new Event({
        name,location,detail,interest,startAt,endAt
    });
    event.save()
        .then((result)=>{
            res.json({Status: "Succesfully created new event"});
        })
        .catch((err)=> console.log(err));

});

router.post('/joinevent', requireLogin, (req,res)=>{
    const {_id} = req.body;
    Event.find({_id: _id})
        .then((event)=>{
            if(event[0]==undefined){
                return res.json({Error: "Event not present"});
            }
            const index =event[0].members.indexOf(req.user._id);
            if(index==-1){
                // event[0].members.push(req.user._id);
                res.json({Success: "Event Added"});
            }
            else{
                // event[0].members.splice(req.user._id);
                //Need to update the array
                res.json({Success: "Event Removed"});
            }
        })
        .catch((err)=> console.log(err));
});

module.exports = router;