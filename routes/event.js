const express = require('express');
const mongoose = require('mongoose');
const { SUPER_USER_ID } = require('../keys');
const { checkAuthenticated, isVerify } = require('../middleware/authMiddleware');
const requireLogin = require('../middleware/requireLogin');
const multer = require('multer');
const router = express.Router();
const Event = require('../models/event');
const User = require('../models/user');

const storage = multer.diskStorage({
    destination: function(req,file,cb) {
        cb(null, "./public/img/uploads");
    },
    filename: function (req,file,cb){
        cb(null, Date.now()+file.originalname);
    }
});

const fileFilter = (req, file, cb)=>{
    if(file.mimetype==='image/jpeg' || file.mimetype==='image/png'){
        cb(null, true);
    }
    else {
        cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    limits : {
        fieldSize : 1024*1024*10
    },
    fileFilter: fileFilter
});


router.get('/allevents',(req,res)=>{
    Event.find()
        .then((post)=>{
            res.json({Event: post});
        })
        .catch((err)=> console.log(err));
});

router.get('/createevent', checkAuthenticated, isVerify, (req,res)=>{
    res.render('create');
});

router.post('/createevent', upload.single('event-dp'),checkAuthenticated, isVerify,(req,res)=>{
    const {name,location,detail,interest,startAt,endAt} = req.body;
    let event;
    if(req.file != undefined) {
        newpath = req.file.destination.replace('./public','')+'/'+req.file.filename;
        event = new Event({
            name,location,detail,interest,startAt,endAt,img:newpath
        });
    }
    else {
        event = new Event({
            name,location,detail,interest,startAt,endAt
        });
    }
    event.save()
        .then((result)=>{
            res.redirect('/');   
        })
        .catch((err)=> console.log(err));
});

router.get('/find-event', checkAuthenticated, searchFunction, isVerify,(req, res) => {
    let allevents = [];
    let registeredevents = [];
    let user_emailid = ""
    res.render('search', {allevents, registeredevents, user_emailid, isAvailable:true});
});

router.put('/joinevent/:id', checkAuthenticated, isAlreadyExist, isVerify, async (req,res)=>{
    const email = req.user.email;
    const event = await Event.findByIdAndUpdate(req.params.id, {
        $push : {
            members : email
        }
    });
    res.redirect('/');
});

router.get('/myevents', checkAuthenticated, isVerify, async (req,res)=>{
    const allevents = await Event.find();
    var events = [];
    const user_emailid = req.user.email;
    allevents.forEach((event)=>{
        if(event.members.includes(user_emailid)){
            events.push(event);
        }
    });
    res.render('myevents', {events, user_emailid});
});

router.get('/editevent', checkAuthenticated,isVerify, async(req,res)=>{
    let allevents = await Event.find();
    const user_emailid = req.user.email;
    res.render('edit', {allevents,user_emailid} );
    return ;
});

router.put('/editevent/:id', upload.single('event-dp'), checkAuthenticated,isVerify, async (req,res)=>{
    const {name,startAt,endAt,detail,location} = req.body;
    let event = await Event.findByIdAndUpdate(req.params.id, {
        $set:{
            name : name,
            startAt : startAt,
            endAt : endAt,
            detail : detail,
            location : location
        }
    });
    if(req.file != undefined){
        newpath = req.file.destination.replace('./public','')+'/'+req.file.filename
        event = await Event.findByIdAndUpdate(req.params.id, {
            $set: {
                img : newpath
            }
        });        
    }
    res.redirect('/editevent');
});

router.get('/deleteevent', checkAuthenticated,isVerify, async(req,res)=>{
    let allevents = await Event.find();
    const user_emailid = req.user.email;
    res.render('delete', {allevents,user_emailid} );
});

router.delete('/deleteevent/:id', checkAuthenticated,isVerify, async(req,res)=>{
    let event = await Event.findByIdAndDelete(req.params.id);
    res.redirect('/deleteevent');
});

router.get('/viewevent/:id', checkAuthenticated,isVerify,async(req,res)=>{
    const event = await Event.findById(req.params.id);
    const participants = [];
    let isJoin = 0;
    if(event.members.includes(req.user.email)) {
        isJoin = 1;
    }
    else {
        isJoin = 0;  
    }
    for(let i=0;i<event.members.length;i++){
        const user = await User.findOne({email : event.members[i]})
        if(user !=undefined) participants.push(user.name);
    }
    res.render('view_event', {event, participants, isJoin : isJoin });
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

async function searchFunction(req, res, next) {
    if(req.query.search) {
        const user_emailid = req.user.email;
        // console.log(req.query.type);
        let allevents = []
        if(req.query.type=="text"){
            allevents = await Event.find({ name: { $regex: req.query.search, $options: '$i' } });
        }
        else if(req.query.type=="location"){
            allevents = await Event.find({ location: { $regex: req.query.search, $options: '$i' } });
        }
        else if(req.query.type=="time"){
            allevents = await Event.find({ startAt: { $regex: req.query.search, $options: '$i' } });
        }
        // else{
        //     allevents = await Event.find({ participants: { $regex: '^((?!req.query.search).)*$', $options: '$i' } });
        // }
        if(!allevents.length){
            res.render('search', {allevents, user_emailid, isAvailable: false});
        }
        else{
            res.render('search', {allevents, user_emailid, isAvailable: true});
        }
    }
    else return next();
}

module.exports = router;